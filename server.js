require('dotenv').config();
process.env.TZ = 'Asia/Dhaka';
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const express = require('express');
const compression = require('compression');
const session = require('express-session');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Basic Health Check (Placed before heavy middleware for cPanel compatibility)
app.get('/health', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('OK');
});

const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');

let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error('Sharp failed to load:', e.message);
}

const bcrypt = require('bcryptjs');
const saltRounds = 10;

/**
 * Universal Slug Generator
 * Supports any language (Unicode) and Emojis
 */
function generateSlug(text) {
    if (!text) return '';
    return text.toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\t\n\r\/\\?#%&"':*<>|]+/g, '-') // Replace restricted URL characters and spaces
        .replace(/-+/g, '-')                         // Collapse multiple dashes
        .replace(/^-+|-+$/g, '');                    // Trim dashes from start/end
}

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(compression()); // Compress all responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optimize static file serving with caching
const staticOptions = {
    maxAge: '1y',
    immutable: true,
    index: false,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            res.setHeader('Content-Type', 'text/html');
        }
    }
};

// JIT (Just-In-Time) Thumbnail Generation
// Crucial for shared hosting to avoid huge payloads on initial load
app.get('/uploads/thumb-:filename', async (req, res, next) => {
    const filename = req.params.filename;
    const thumbPath = path.join(uploadDir, 'thumb-' + filename);
    const originalPath = path.join(uploadDir, filename);

    // If thumbnail already exists, skip to static middleware
    if (fs.existsSync(thumbPath)) {
        return next();
    }

    // Try to generate thumbnail on the fly if original exists
    if (fs.existsSync(originalPath)) {
        try {
            await sharp(originalPath)
                .resize({ width: 400, withoutEnlargement: true })
                .webp({ quality: 70 })
                .toFile(thumbPath);
            return res.sendFile(thumbPath);
        } catch (err) {
            console.error('Thumbnail Generation Failed:', err);
            return res.sendFile(originalPath); // Fallback to original
        }
    }
    next();
});

// Dynamic Watermark Generation (Freepik Style Grid)
app.get('/api/public/watermark/:filename', async (req, res) => {
    const filename = req.params.filename;
    const originalPath = path.join(uploadDir, filename);

    if (!fs.existsSync(originalPath)) {
        return res.status(404).send('Image not found');
    }

    if (!sharp) {
        return res.sendFile(originalPath);
    }

    try {
        const image = sharp(originalPath);
        const metadata = await image.metadata();
        const width = metadata.width;
        const height = metadata.height;

        // Tighter Grid spacing for smaller text
        const svgWidth = 200;
        const svgHeight = 120;

        // Use fill and fill-opacity for better SVG compatibility
        const svgOverlay = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="wm" width="${svgWidth}" height="${svgHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                    <text 
                        x="${svgWidth / 2}" 
                        y="${svgHeight / 2}" 
                        font-family="sans-serif" 
                        font-size="18" 
                        font-weight="bold" 
                        fill="#000000" 
                        fill-opacity="0.12"
                        text-anchor="middle" 
                        dominant-baseline="middle">
                        COLOR HUT
                    </text>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wm)" />
        </svg>
        `;

        const format = metadata.format || 'jpeg';
        let processedImage = image.composite([{
            input: Buffer.from(svgOverlay),
            top: 0,
            left: 0
        }]);

        // Ensure high quality
        if (format === 'jpeg' || format === 'jpg') {
            processedImage = processedImage.jpeg({ quality: 100, chromaSubsampling: '4:4:4' });
        } else if (format === 'webp') {
            processedImage = processedImage.webp({ quality: 100, lossless: true });
        } else if (format === 'png') {
            processedImage = processedImage.png({ compressionLevel: 0 });
        }

        const bufferedImage = await processedImage.toBuffer();

        res.setHeader('Content-Type', 'image/' + format);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(bufferedImage);

    } catch (err) {
        console.error('Watermark Generation Failed:', err);
        return res.sendFile(originalPath);
    }
});

app.use('/uploads', express.static(uploadDir, staticOptions));
app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/admin', express.static(path.join(__dirname, 'admin'), staticOptions));
app.use('/assets', express.static(path.join(__dirname, 'assets'), staticOptions));

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        httpOnly: true
    }
}));


// Database Connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};
console.log('Attempting DB Connection:', { ...dbConfig, password: '****' });

const db = mysql.createPool({
    ...dbConfig,
    timezone: '+06:00',
    waitForConnections: true,
    connectionLimit: 2, // Ultra-low limit for strict shared hosting (prevents fork errors)
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000, // 10 seconds timeout
    // foundRows: true, // Invalid option in some mysql2 versions
    charset: 'utf8mb4'
});

// ===== ULTRA-FAST SHARED HOSTING CACHE SYSTEM =====
const cache = {
    settings: null,
    categories: null,
    html: {},
    htmlTime: {},
    lastUpdate: 0
};

async function getCachedSettings() {
    if (cache.settings) return cache.settings;
    return new Promise((resolve) => {
        db.query('SELECT * FROM site_settings', (err, results) => {
            const settings = {};
            if (!err && results) results.forEach(row => settings[row.setting_key] = row.setting_value);
            cache.settings = settings;
            resolve(settings);
        });
    });
}

async function getCachedCategories() {
    if (cache.categories) return cache.categories;
    return new Promise((resolve) => {
        const query = `
            SELECT c.id, c.name, c.slug, c.icon, c.position, c.parent_id,
                   GROUP_CONCAT(cp.parent_id) as parent_ids
            FROM categories c
            LEFT JOIN category_parents cp ON c.id = cp.category_id
            WHERE c.is_deleted = FALSE 
            GROUP BY c.id
            ORDER BY c.position ASC, c.name ASC
        `;
        db.query(query, (err, results) => {
            if (!err && results) cache.categories = results;
            resolve(cache.categories || []);
        });
    });
}

async function getCachedHtml(filename) {
    const now = Date.now();
    // Cache HTML for 15 minutes to allow manual edits to reflect eventually
    if (cache.html[filename] && (now - (cache.htmlTime[filename] || 0) < 15 * 60 * 1000)) {
        return cache.html[filename];
    }
    return new Promise((resolve) => {
        const filePath = path.join(__dirname, filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (!err) {
                cache.html[filename] = data;
                cache.htmlTime[filename] = now;
            }
            resolve(data || '');
        });
    });
}

function invalidateCache(type) {
    if (type === 'settings') cache.settings = null;
    if (type === 'categories') cache.categories = null;
    if (type === 'html') { cache.html = {}; cache.htmlTime = {}; }
    if (!type) { // Clear all
        cache.settings = null;
        cache.categories = null;
        cache.html = {};
        cache.htmlTime = {};
    }
}


// Test connection and Init Schema
db.getConnection((err, connection) => {
    if (err) {
        console.error('CRITICAL DATABASE ERROR:', err.message);
        console.log('Continuing server execution... (Check cPanel Env Variables)');
        return;
    }
    console.log('Successfully connected to database');

    // Migration: Support any language & emojis (utf8mb4)
    const migrations = [
        `ALTER DATABASE \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        "ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "ALTER TABLE site_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "ALTER TABLE traffic_logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "ALTER TABLE blogs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        "ALTER TABLE category_parents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        // Multi-category support migration
        "ALTER TABLE products DROP FOREIGN KEY products_ibfk_1", // Common name
        "ALTER TABLE products MODIFY category_id VARCHAR(255)"
    ];

    migrations.forEach(mq => {
        connection.query(mq, (err) => {
            if (err) {
                // Ignore errors if foreign key doesn't exist or table doesn't exist yet
                if (mq.includes('DROP FOREIGN KEY')) {
                    // Try another common name if the first fails
                    connection.query("ALTER TABLE products DROP FOREIGN KEY products_category_id_foreign", () => { });
                }
            }
        });
    });

    // Initialize Schema
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT DEFAULT NULL,
            name VARCHAR(255) NOT NULL UNIQUE,
            slug VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP NULL,
            position INT DEFAULT 0,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )
    `;

    const createProductsTable = `
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            category_id VARCHAR(255),
            description TEXT,
            price DECIMAL(10, 2),
            image TEXT,
            video_url VARCHAR(500),
            status ENUM('Published', 'Draft') DEFAULT 'Draft',
            is_pinned BOOLEAN DEFAULT FALSE,
            views INT DEFAULT 0,
            rating DECIMAL(3, 1) DEFAULT 5.0,
            seo_keywords TEXT,
            position INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP NULL
        )
    `;

    const createSettingsTable = `
        CREATE TABLE IF NOT EXISTS site_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    const createTrafficLogsTable = `
        CREATE TABLE IF NOT EXISTS traffic_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip_address VARCHAR(45),
            source VARCHAR(255),
            path VARCHAR(255),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createCategoryParentsTable = `
        CREATE TABLE IF NOT EXISTS category_parents (
            category_id INT,
            parent_id INT,
            PRIMARY KEY (category_id, parent_id),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    `;

    const createBlogsTable = `
        CREATE TABLE IF NOT EXISTS blogs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            content LONGTEXT NOT NULL,
            excerpt TEXT,
            featured_image TEXT,
            status ENUM('Published', 'Draft') DEFAULT 'Draft',
            author VARCHAR(255) DEFAULT 'Admin',
            seo_keywords TEXT,
            seo_description TEXT,
            views INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at TIMESTAMP NULL
        )
    `;

    const createHeroSlidesTable = `
        CREATE TABLE IF NOT EXISTS hero_slides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image_url VARCHAR(500) NOT NULL,
            position INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    // Add seo_keywords if it doesn't exist (Migration)
    const addSeoKeywordsColumn = `ALTER TABLE products ADD COLUMN seo_keywords TEXT AFTER rating`;

    // Add seo_description if it doesn't exist (Migration)
    const addSeoDescriptionColumn = `ALTER TABLE products ADD COLUMN seo_description TEXT AFTER seo_keywords`;

    // Add position if it doesn't exist (Migration)
    const addPositionColumn = `ALTER TABLE products ADD COLUMN position INT DEFAULT 0`;

    // Add is_pinned if it doesn't exist (Migration)
    const addIsPinnedColumn = `ALTER TABLE products ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE AFTER status`;

    // Add slug if it doesn't exist (Migration)
    const addSlugColumn = `ALTER TABLE products ADD COLUMN slug VARCHAR(255) AFTER name`;

    // Add parent_id if it doesn't exist (Migration)
    const addParentIdColumn = `ALTER TABLE categories ADD COLUMN parent_id INT DEFAULT NULL AFTER id`;

    // Add icon if it doesn't exist (Migration)
    const addIconColumn = `ALTER TABLE categories ADD COLUMN icon TEXT AFTER slug`;

    // Performance Indexes
    const addIndexes = [
        "CREATE INDEX idx_prod_status_deleted ON products(status, is_deleted)",
        "CREATE INDEX idx_prod_slug ON products(slug)",
        "CREATE INDEX idx_cat_slug ON categories(slug)",
        "CREATE INDEX idx_prod_cat ON products(category_id)",
        "CREATE INDEX idx_cat_parent ON categories(parent_id)",
        "CREATE INDEX idx_blog_slug ON blogs(slug)",
        "CREATE INDEX idx_blog_status ON blogs(status, is_deleted)"
    ];

    connection.query(createBlogsTable, (err) => {
        if (err) console.error('Error creating blogs table:', err);
    });

    connection.query(createUsersTable, (err) => {
        if (err) console.error('Error creating users table:', err);
        else {
            console.log('Users table ready');
            // Seed Admin User
            connection.query('SELECT * FROM users WHERE email = ?', ['admin@colorhut.com'], async (err, results) => {
                if (results && results.length === 0) {
                    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
                    connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin User', 'admin@colorhut.com', hashedPassword, 'admin']);
                }
            });

            // Create Categories next
            connection.query(createCategoriesTable, (err) => {
                if (err) console.error('Error creating categories table:', err);
                else {
                    console.log('Categories table ready');
                    connection.query(addParentIdColumn, () => {
                        // Create Products
                        connection.query(createProductsTable, (err) => {
                            if (err) console.error('Error creating products table:', err);
                            else {
                                console.log('Products table ready');
                                connection.query(addSeoKeywordsColumn, () => {
                                    connection.query(addSeoDescriptionColumn, () => {
                                        connection.query(addPositionColumn, () => {
                                            connection.query(addIsPinnedColumn, () => {
                                                connection.query(addSlugColumn, () => {
                                                    // Sync product slugs
                                                    connection.query("SELECT id, name FROM products WHERE slug IS NULL OR slug = ''", (err, rows) => {
                                                        if (!err && rows) {
                                                            rows.forEach(row => {
                                                                const slug = generateSlug(row.name);
                                                                connection.query('UPDATE products SET slug = ? WHERE id = ?', [slug, row.id]);
                                                            });
                                                        }
                                                    });

                                                    // Create Settings & Traffic
                                                    connection.query(createSettingsTable, () => {
                                                        connection.query(createCategoryParentsTable, (err) => {
                                                            if (err) console.error('Error creating category_parents table:', err);

                                                            // Migration: Move existing parent_id relationships to category_parents
                                                            const migrateParents = `
                                                            INSERT IGNORE INTO category_parents (category_id, parent_id)
                                                            SELECT id, parent_id FROM categories WHERE parent_id IS NOT NULL;
                                                        `;
                                                            connection.query(migrateParents, (err) => {
                                                                if (err) console.error('Error migrating category parents:', err);
                                                            });
                                                        });

                                                        connection.query(createTrafficLogsTable, () => {
                                                            connection.query(createHeroSlidesTable, (err) => {
                                                                if (err) console.error('Error creating hero_slides table:', err);

                                                                // Create Meeting Requests Table
                                                                const createMeetingRequestsTable = `
                                                                    CREATE TABLE IF NOT EXISTS meeting_requests (
                                                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                                                        business_type VARCHAR(50),
                                                                        business_name VARCHAR(255),
                                                                        full_name VARCHAR(255),
                                                                        designation VARCHAR(255),
                                                                        whatsapp_number VARCHAR(50),
                                                                        menu_type VARCHAR(50),
                                                                        address TEXT,
                                                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                                                    )
                                                                `;
                                                                connection.query(createMeetingRequestsTable, (err) => {
                                                                    if (err) console.error('Error creating meeting_requests table:', err);
                                                                });

                                                                // Run index migrations
                                                                addIndexes.forEach(idxQuery => {
                                                                    connection.query(idxQuery, (err) => {
                                                                        if (err && !err.message.includes('Duplicate key name')) {
                                                                            // console.error('Index Error:', err.message);
                                                                        }
                                                                    });
                                                                });
                                                                console.log('Database Initialization Complete.');
                                                                // Initial Sitemap Generation
                                                                updateMySitemapFile();
                                                                connection.release();
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
    });
});

// Middleware to regenerate sitemap on every visit
app.use((req, res, next) => {
    // Only trigger for public page visits (not static files or uploads) to avoid excessive processing
    const isPublicPage = req.method === 'GET' && !req.path.includes('.') &&
        !req.path.startsWith('/api') && !req.path.startsWith('/admin') &&
        !req.path.startsWith('/uploads');

    if (isPublicPage) {
        updateMySitemapFile();
    }
    next();
});

/**
 * Update the physical mysitemap.xml file on disk
 */
function updateMySitemapFile() {
    const baseUrl = 'https://store.colorhutbd.xyz';
    const catQuery = "SELECT slug FROM categories WHERE is_deleted = FALSE";
    const prodQuery = "SELECT slug FROM products WHERE status = 'Published' AND is_deleted = FALSE";

    db.query(catQuery, (err, categories) => {
        if (err) return console.error('Sitemap Error (Categories):', err);
        db.query(prodQuery, (err, products) => {
            if (err) return console.error('Sitemap Error (Products):', err);

            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
            xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>\n`;
            xml += `  <url><loc>${baseUrl}/all</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>\n`;

            if (categories) {
                categories.forEach(cat => {
                    if (cat.slug) xml += `  <url><loc>${baseUrl}/${cat.slug}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>\n`;
                });
            }

            if (products) {
                products.forEach(prod => {
                    if (prod.slug) xml += `  <url><loc>${baseUrl}/p/${prod.slug}</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>\n`;
                });
            }

            xml += '</urlset>';

            fs.writeFile(path.join(__dirname, 'public', 'mysitemap.xml'), xml, (err) => {
                if (err) console.error('Failed to write mysitemap.xml to disk:', err);
                else {
                    // console.log('mysitemap.xml successfully generated/overwritten on disk.');
                }
            });
        });
    });
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }

    // For API requests, return 401 instead of redirecting to login page
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    return res.redirect('/admin/login');
}

// Login endpoint
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    const query = 'SELECT * FROM users WHERE email = ? AND role = "admin"';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).send('Invalid credentials');
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.redirect('/admin/dashboard');
    });
});

// Get admin profile
app.get('/api/admin/profile', requireAuth, (req, res) => {
    const adminId = req.session.user.id;
    db.query('SELECT id, name, email FROM users WHERE id = ?', [adminId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }
        res.json(results[0]);
    });
});

// Update admin profile
app.put('/api/admin/profile', requireAuth, async (req, res) => {
    const { email, password } = req.body;
    const adminId = req.session.user.id;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        let query = 'UPDATE users SET email = ?';
        let params = [email];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ? AND role = "admin"';
        params.push(adminId);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Error updating admin profile:', err);
                return res.status(500).json({ error: 'Failed to update profile' });
            }

            // If credentials changed, destroy session to force re-login
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ error: 'Profile updated but session update failed' });
                }
                res.json({ message: 'Profile updated. Please login again with your new credentials.', logout: true });
            });
        });
    } catch (err) {
        console.error('Bcrypt error:', err);
        res.status(500).json({ error: 'Security processing error' });
    }
});

// Get dashboard stats
app.get('/api/admin/dashboard-stats', requireAuth, (req, res) => {
    const queries = {
        totalCategories: 'SELECT COUNT(*) as count FROM categories WHERE is_deleted = FALSE',
        totalProducts: 'SELECT COUNT(*) as count FROM products WHERE is_deleted = FALSE',
        publishedProducts: 'SELECT COUNT(*) as count FROM products WHERE status = "Published" AND is_deleted = FALSE',
        unpublishedProducts: 'SELECT COUNT(*) as count FROM products WHERE status = "Draft" AND is_deleted = FALSE',
        recentProducts: `
            SELECT p.id, p.name, p.status, p.views, p.image, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_deleted = FALSE 
            ORDER BY p.created_at DESC 
            LIMIT 5
        `,
        trendingCategories: `
            SELECT c.name, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_deleted = FALSE
            WHERE c.is_deleted = FALSE
            GROUP BY c.id
            ORDER BY product_count DESC
            LIMIT 3
        `
    };

    const results = {};
    const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
            db.query(queries[key], (err, row) => {
                if (err) reject(err);
                else {
                    results[key] = row;
                    resolve();
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json({
                totalCategories: results.totalCategories[0].count,
                totalProducts: results.totalProducts[0].count,
                publishedProducts: results.publishedProducts[0].count,
                unpublishedProducts: results.unpublishedProducts[0].count,
                recentProducts: results.recentProducts,
                trendingCategories: results.trendingCategories
            });
        })
        .catch(err => {
            console.error('Error fetching dashboard stats:', err);
            res.status(500).json({ error: 'Failed to fetch stats' });
        });
});


// Logout endpoint
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.sendFile(path.join(__dirname, 'admin', 'logout.html'));
});

// ===== PUBLIC API (for customer panel) =====
// Get all categories (public)
app.get('/api/public/categories', async (req, res) => {
    try {
        const categories = await getCachedCategories();
        res.json(categories);
    } catch (err) {
        console.error('Error fetching public categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
    }
});

// Get all published products (public)
app.get('/api/public/products', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId;
    const pinned = req.query.pinned === 'true';

    let query = `
        SELECT p.id, p.name, p.slug, p.category_id, p.price, p.image, p.video_url, p.rating, p.position, p.is_pinned, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'Published' AND p.is_deleted = FALSE
    `;
    const params = [];

    if (categoryId) {
        // Support fetching products from both the main category and its subcategories
        query += ` AND (FIND_IN_SET(?, p.category_id) OR EXISTS (
            SELECT 1 FROM category_parents cp 
            WHERE cp.parent_id = ? AND FIND_IN_SET(cp.category_id, p.category_id)
        ))`;
        params.push(categoryId, categoryId);
    }

    if (pinned) {
        query += ` AND p.is_pinned = TRUE`;
    }

    query += ` ORDER BY p.position ASC, p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching public products:', err);
            return res.status(500).json({ error: 'Failed to fetch products', details: err.message });
        }
        res.json(results);
    });
});

// Get single product (public)
app.get('/api/public/products/:id', (req, res) => {
    const productId = req.params.id;

    // First increment the view count
    db.query('UPDATE products SET views = views + 1 WHERE id = ?', [productId], (err) => {
        if (err) console.error('Error incrementing view count:', err);

        // Then fetch the product details
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ? AND p.status = 'Published' AND p.is_deleted = FALSE
        `;
        db.query(query, [productId], (err, results) => {
            if (err) {
                console.error('Error fetching public product:', err);
                return res.status(500).json({ error: 'Failed to fetch product' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }



            res.json(results[0]);
        });
    });
});

app.get('/api/public/products/slug/:slug', (req, res) => {
    const slug = req.params.slug;

    db.query('UPDATE products SET views = views + 1 WHERE slug = ?', [slug], (err) => {
        if (err) console.error('Error incrementing view count:', err);

        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.slug = ? AND p.status = 'Published' AND p.is_deleted = FALSE
        `;
        db.query(query, [slug], (err, results) => {
            if (err) {
                console.error('Error fetching public product by slug:', err);
                return res.status(500).json({ error: 'Failed to fetch product' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(results[0]);
        });
    });
});

// Get related products (public)
app.get('/api/public/related/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;
    const excludeId = req.query.exclude;

    const query = `
        SELECT p.id, p.name, p.slug, p.image, p.video_url, p.rating, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON FIND_IN_SET(c.id, p.category_id)
        WHERE (FIND_IN_SET(?, p.category_id)) AND p.id != ? AND p.status = 'Published' AND p.is_deleted = FALSE 
        ORDER BY p.position ASC, p.created_at DESC
    `;
    db.query(query, [categoryId, excludeId || 0], (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// ===== BLOG PUBLIC API =====
app.get('/api/public/blogs', (req, res) => {
    const query = "SELECT id, title, slug, excerpt, featured_image, author, created_at FROM blogs WHERE status = 'Published' AND is_deleted = FALSE ORDER BY created_at DESC";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch blogs' });
        res.json(results);
    });
});

app.get('/api/public/blogs/:slug', (req, res) => {
    db.query("UPDATE blogs SET views = views + 1 WHERE slug = ?", [req.params.slug]);
    const query = "SELECT * FROM blogs WHERE slug = ? AND status = 'Published' AND is_deleted = FALSE";
    db.query(query, [req.params.slug], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Blog not found' });
        res.json(results[0]);
    });
});

app.get('/api/public/recent-blogs', (req, res) => {
    const query = "SELECT title, slug, featured_image, created_at FROM blogs WHERE status = 'Published' AND is_deleted = FALSE ORDER BY created_at DESC LIMIT 3";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// ===== HERO SLIDES API =====
app.get('/api/hero-slides', (req, res) => {
    db.query('SELECT * FROM hero_slides WHERE is_active = TRUE ORDER BY position ASC, created_at DESC', (err, results) => {
        if (err) {
            console.error('Error fetching hero slides:', err);
            return res.status(500).json({ error: 'Failed to fetch slides' });
        }
        res.json(results);
    });
});

app.post('/api/hero-slides', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    db.query('INSERT INTO hero_slides (image_url) VALUES (?)', [imageUrl], (err, result) => {
        if (err) {
            console.error('Error adding hero slide:', err);
            return res.status(500).json({ error: 'Failed to add slide' });
        }
        res.json({ id: result.insertId, image_url: imageUrl });
    });
});

app.delete('/api/hero-slides/:id', requireAuth, (req, res) => {
    const slideId = req.params.id;
    db.query('DELETE FROM hero_slides WHERE id = ?', [slideId], (err) => {
        if (err) {
            console.error('Error deleting hero slide:', err);
            return res.status(500).json({ error: 'Failed to delete slide' });
        }
        res.json({ success: true });
    });
});

// ===== CATEGORIES API =====
// Get all categories
app.get('/api/categories', requireAuth, (req, res) => {
    const query = `
        SELECT c.*, 
               GROUP_CONCAT(cp.parent_id) as parent_ids,
               GROUP_CONCAT(p.name SEPARATOR ', ') as parent_names
        FROM categories c 
        LEFT JOIN category_parents cp ON c.id = cp.category_id
        LEFT JOIN categories p ON cp.parent_id = p.id
        WHERE c.is_deleted = FALSE 
        GROUP BY c.id
        ORDER BY c.position ASC, c.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
        res.json(results);
    });
});

// Get single category
app.get('/api/categories/:id', requireAuth, (req, res) => {
    const query = `
        SELECT c.*, GROUP_CONCAT(cp.parent_id) as parent_ids
        FROM categories c
        LEFT JOIN category_parents cp ON c.id = cp.category_id
        WHERE c.id = ?
        GROUP BY c.id
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching category:', err);
            return res.status(500).json({ error: 'Failed to fetch category' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(results[0]);
    });
});

app.post('/api/categories', requireAuth, (req, res) => {
    const { name, parent_ids, icon } = req.body;
    const slug = generateSlug(name);

    const query = 'INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)';
    db.query(query, [name, slug, icon || null], (err, result) => {
        if (err) {
            console.error('Error creating category:', err);
            return res.status(500).json({ error: 'Failed to create category' });
        }

        const newId = result.insertId;
        if (parent_ids && Array.isArray(parent_ids) && parent_ids.length > 0) {
            const parentValues = parent_ids.map(pid => [newId, pid]);
            db.query('INSERT INTO category_parents (category_id, parent_id) VALUES ?', [parentValues], (err) => {
                if (err) console.error('Error saving category parents:', err);
            });
        }

        res.json({ id: newId, name, slug, message: 'Category created successfully' });
        invalidateCache('categories');
        updateMySitemapFile();
    });
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
    const { name, parent_ids, icon } = req.body;
    const slug = generateSlug(name);
    const categoryId = req.params.id;

    const query = 'UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?';
    db.query(query, [name, slug, icon || null, categoryId], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Failed to update category' });
        }

        // Update parents
        db.query('DELETE FROM category_parents WHERE category_id = ?', [categoryId], (err) => {
            if (err) console.error('Error removing old parents:', err);

            if (parent_ids && Array.isArray(parent_ids) && parent_ids.length > 0) {
                const parentValues = parent_ids.map(pid => [categoryId, pid]);
                db.query('INSERT INTO category_parents (category_id, parent_id) VALUES ?', [parentValues], (err) => {
                    if (err) console.error('Error saving new category parents:', err);
                });
            }
        });

        res.json({ message: 'Category updated successfully' });
        invalidateCache('categories');
        updateMySitemapFile();
    });
});

// Reorder categories
app.post('/api/categories/reorder', requireAuth, (req, res) => {
    const { orders } = req.body; // Array of {id, position}
    if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const queries = orders.map(item => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE categories SET position = ? WHERE id = ?', [item.position, item.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(queries)
        .then(() => {
            invalidateCache('categories');
            res.json({ message: 'Categories reordered successfully' });
            updateMySitemapFile();
        })
        .catch(err => {
            console.error('Error reordering categories:', err);
            res.status(500).json({ error: 'Failed to reorder categories' });
        });
});

// Soft delete category
app.delete('/api/categories/:id', requireAuth, (req, res) => {
    db.query('UPDATE categories SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Failed to delete category' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        invalidateCache('categories');
        res.json({ message: 'Category moved to trash successfully' });
        updateMySitemapFile();
    });
});

// Restore category
app.post('/api/categories/:id/restore', requireAuth, (req, res) => {
    db.query('UPDATE categories SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error restoring category:', err);
            return res.status(500).json({ error: 'Failed to restore category' });
        }

        res.json({ message: 'Category restored successfully' });
        updateMySitemapFile();
    });
});

// Permanent delete category
app.delete('/api/categories/:id/permanent', requireAuth, (req, res) => {
    db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error permanently deleting category:', err);
            return res.status(500).json({ error: 'Failed to permanently delete category' });
        }

        res.json({ message: 'Category permanently deleted' });
        updateMySitemapFile();
    });
});

// Reorder products
app.post('/api/products/reorder', requireAuth, (req, res) => {
    const { orders } = req.body; // Array of {id, position}
    if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const queries = orders.map(item => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE products SET position = ? WHERE id = ?', [item.position, item.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(queries)
        .then(() => {
            res.json({ message: 'Products reordered successfully' });
        })
        .catch(err => {
            console.error('Error reordering products:', err);
            res.status(500).json({ error: 'Failed to reorder products' });
        });
});

// Get trash items
app.get('/api/trash', requireAuth, (req, res) => {
    const productsQuery = "SELECT id, name, 'Product' as type, image, deleted_at FROM products WHERE is_deleted = TRUE";
    const categoriesQuery = "SELECT id, name, 'Category' as type, NULL as image, deleted_at FROM categories WHERE is_deleted = TRUE";

    db.query(`${productsQuery} UNION ${categoriesQuery} ORDER BY deleted_at DESC`, (err, results) => {
        if (err) {
            console.error('Error fetching trash:', err);
            return res.status(500).json({ error: 'Failed to fetch trash' });
        }
        res.json(results);
    });
});

// Empty trash
app.delete('/api/trash/empty', requireAuth, (req, res) => {
    db.query('DELETE FROM products WHERE is_deleted = TRUE', (err) => {
        if (err) console.error('Error emptying products trash:', err);
        db.query('DELETE FROM categories WHERE is_deleted = TRUE', (err) => {
            if (err) console.error('Error emptying categories trash:', err);
            res.json({ message: 'Trash emptied successfully' });
        });
    });
});

// ===== PRODUCTS API =====
// Get products with pagination and filtering
app.get('/api/products', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = (page - 1) * limit;
    const isPagination = req.query.page !== undefined;

    const category = req.query.category;
    const status = req.query.status;
    const search = req.query.search;


    let whereClause = 'p.is_deleted = FALSE';
    let params = [];

    if (category && category !== 'all') {
        whereClause += ` AND (FIND_IN_SET(?, p.category_id) OR EXISTS (
            SELECT 1 FROM category_parents cp 
            WHERE cp.parent_id = ? AND FIND_IN_SET(cp.category_id, p.category_id)
        ))`;
        params.push(category, category);
    }
    if (status && status !== 'all') {
        whereClause += ' AND p.status = ?';
        params.push(status);
    }
    if (search) {
        whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`;

    db.query(countQuery, params, (err, countResult) => {
        if (err) {
            console.error('Error counting products:', err);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }

        const total = countResult[0].total;

        const dataQuery = `
            SELECT p.*, (
                SELECT GROUP_CONCAT(name SEPARATOR ', ') 
                FROM categories 
                WHERE FIND_IN_SET(id, p.category_id)
            ) as category_name 
            FROM products p 
            WHERE ${whereClause}
            ORDER BY p.is_pinned DESC, p.position ASC, p.created_at DESC
            ${isPagination ? 'LIMIT ? OFFSET ?' : ''}
        `;

        const dataParams = isPagination ? [...params, limit, offset] : params;

        db.query(dataQuery, dataParams, (err, results) => {
            if (err) {
                console.error('Error fetching products:', err);
                return res.status(500).json({ error: 'Failed to fetch products' });
            }

            if (isPagination) {
                res.json({
                    products: results,
                    total: total,
                    page: page,
                    limit: limit,
                    hasMore: offset + results.length < total
                });
            } else {
                res.json(results);
            }
        });
    });
});

// Get single product
app.get('/api/products/:id', requireAuth, (req, res) => {
    const query = `
        SELECT p.*, (
            SELECT GROUP_CONCAT(name SEPARATOR ', ') 
            FROM categories 
            WHERE FIND_IN_SET(id, p.category_id)
        ) as category_name 
        FROM products p 
        WHERE p.id = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// File Upload endpoint (Multiple with Optimization)
app.post('/api/upload', requireAuth, upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const optimizedFiles = await Promise.all(req.files.map(async (file) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const filename = `opt-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
            const outPath = path.join(uploadDir, filename);

            // Process with Sharp using Iterative Compression
            const targetSizeKB = 100;
            const targetSizeBytes = targetSizeKB * 1024;
            let quality = 90;
            let outputBuffer;

            // Iterative compression loop
            while (true) {
                outputBuffer = await sharp(file.path)
                    .resize({ width: 1000, withoutEnlargement: true })
                    .webp({ quality: quality })
                    .toBuffer();

                if (outputBuffer.length <= targetSizeBytes || quality <= 10) {
                    break;
                }

                quality -= 5;
            }

            // Save the final optimized buffer
            await sharp(outputBuffer).toFile(outPath);

            // Delete original unoptimized file
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });

            return `/uploads/${filename}`;
        }));

        res.json({ imageUrls: optimizedFiles });
    } catch (err) {
        console.error('Image Optimization Error:', err);
        res.status(500).json({ error: 'Failed to process images' });
    }
});

// Create product
app.post('/api/products', requireAuth, (req, res) => {
    const { name, category_id, description, image, video_url, status, is_pinned, rating, seo_keywords, seo_description, position } = req.body;
    const slug = generateSlug(name);
    const catId = category_id === "" ? null : category_id;

    const query = 'INSERT INTO products (name, slug, category_id, description, price, image, video_url, status, is_pinned, rating, seo_keywords, seo_description, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, slug, catId, description, 0, image, video_url, status || 'Draft', is_pinned ? 1 : 0, rating || 5.0, seo_keywords, seo_description, position || 0], (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            return res.status(500).json({ error: 'Failed to create product' });
        }

        res.json({ id: result.insertId, message: 'Product created successfully' });
        updateMySitemapFile();
    });
});

// Update product
app.put('/api/products/:id', requireAuth, (req, res) => {
    const { name, category_id, description, image, video_url, status, is_pinned, rating, seo_keywords, seo_description, position } = req.body;
    const slug = generateSlug(name);
    const catId = category_id === "" ? null : category_id;

    const query = 'UPDATE products SET name = ?, slug = ?, category_id = ?, description = ?, image = ?, video_url = ?, status = ?, is_pinned = ?, rating = ?, seo_keywords = ?, seo_description = ?, position = ? WHERE id = ?';
    db.query(query, [name, slug, catId, description, image, video_url, status, is_pinned ? 1 : 0, rating, seo_keywords, seo_description, position || 0, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Failed to update product' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully' });
        updateMySitemapFile();
    });
});

// Soft delete product
app.delete('/api/products/:id', requireAuth, (req, res) => {
    db.query('UPDATE products SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product moved to trash successfully' });
        updateMySitemapFile();
    });
});

// Restore product
app.post('/api/products/:id/restore', requireAuth, (req, res) => {
    db.query('UPDATE products SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error restoring product:', err);
            return res.status(500).json({ error: 'Failed to restore product' });
        }

        res.json({ message: 'Product restored successfully' });
        updateMySitemapFile();
    });
});

// Permanent delete product
app.delete('/api/products/:id/permanent', requireAuth, (req, res) => {
    db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error permanently deleting product:', err);
            return res.status(500).json({ error: 'Failed to permanently delete product' });
        }

        res.json({ message: 'Product permanently deleted' });
    });
});

// Reorder products
app.post('/api/products/reorder', requireAuth, (req, res) => {
    const { orders } = req.body; // Array of {id, position}
    if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const queries = orders.map(item => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE products SET position = ? WHERE id = ?', [item.position, item.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(queries)
        .then(() => {

            res.json({ message: 'Products reordered successfully' });
        })
        .catch(err => {
            console.error('Error reordering products:', err);
            res.status(500).json({ error: 'Failed to reorder products' });
        });
});

// Get trash items
app.get('/api/trash', requireAuth, (req, res) => {
    const productsQuery = "SELECT id, name, 'Product' as type, image, deleted_at FROM products WHERE is_deleted = TRUE";
    const categoriesQuery = "SELECT id, name, 'Category' as type, NULL as image, deleted_at FROM categories WHERE is_deleted = TRUE";

    db.query(`${productsQuery} UNION ${categoriesQuery} ORDER BY deleted_at DESC`, (err, results) => {
        if (err) {
            console.error('Error fetching trash:', err);
            return res.status(500).json({ error: 'Failed to fetch trash' });
        }
        res.json(results);
    });
});

// Empty trash
app.delete('/api/trash/empty', requireAuth, (req, res) => {
    db.query('DELETE FROM products WHERE is_deleted = TRUE', (err) => {
        if (err) console.error('Error emptying products trash:', err);
        else {
            // Success
        }

        db.query('DELETE FROM categories WHERE is_deleted = TRUE', (err) => {
            if (err) console.error('Error emptying categories trash:', err);
            else {
                // Success
            }

            res.json({ message: 'Trash emptied successfully' });
        });
    });
});

// Helper to inject GTM and Pixel
function injectTrackingScripts(html, settings) {
    let modifiedHtml = html;

    // Meta Pixel
    if (settings.meta_pixel_enabled === 'true' && settings.meta_pixel_id) {
        const pixelScript = `
        <!-- Meta Pixel Code -->
        <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.meta_pixel_id}');
        fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1"
        /></noscript>
        <!-- End Meta Pixel Code -->
        `;
        modifiedHtml = modifiedHtml.replace('</head>', `${pixelScript}</head>`);
    }

    // Google Tag Manager
    if (settings.gtm_enabled === 'true' && settings.gtm_container_id) {
        const gtmHead = `
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtm_container_id}');</script>
        <!-- End Google Tag Manager -->
        `;

        const gtmBody = `
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtm_container_id}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        `;

        modifiedHtml = modifiedHtml.replace('</head>', `${gtmHead}</head>`);

        // Insert GTM Body immediately AFTER the opening <body> tag
        modifiedHtml = modifiedHtml.replace(/(<body[^>]*>)/i, (match) => match + gtmBody);
    }

    return modifiedHtml;
}

// Routes for clean URLs
// Routes for clean URLs
app.get('/', (req, res) => {
    return handle(req, res);
});

app.get('/product', async (req, res) => {
    const productId = req.query.id;
    try {
        const [settings, data] = await Promise.all([
            getCachedSettings(),
            getCachedHtml('product.html')
        ]);
        if (!data) return res.status(500).send('Error loading page');

        if (!productId) {
            const html = injectTrackingScripts(data, settings);
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        }

        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ? AND p.status = 'Published' AND p.is_deleted = FALSE
        `;
        db.query(query, [productId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).send('Product not found');
            }

            const product = results[0];

            // Image handling (extract first image if it's an array)
            let shareImage = 'https://store.colorhutbd.xyz/banner.jpg?v=1';
            try {
                if (product.image) {
                    const images = product.image.startsWith('[') ? JSON.parse(product.image) : [product.image];
                    if (images.length > 0) {
                        let firstImage = images[0];
                        if (!firstImage.startsWith('http')) {
                            const cleanPath = firstImage.startsWith('/') ? firstImage : `/uploads/${firstImage}`;
                            shareImage = `https://store.colorhutbd.xyz${cleanPath}`;
                        } else {
                            shareImage = firstImage;
                        }
                    }
                }
            } catch (e) { }

            const shareUrl = `https://store.colorhutbd.xyz/product?id=${product.id}`;
            const cleanDescription = (product.description || '')
                .replace(/[#*`_]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 160);

            let html = data
                .replace(/{{OG_TITLE}}/g, product.name || 'Product Details')
                .replace(/{{OG_DESCRIPTION}}/g, product.seo_description || cleanDescription || 'Check out this design at Color Hut Studio')
                .replace(/{{OG_IMAGE}}/g, shareImage)
                .replace(/{{OG_URL}}/g, shareUrl)
                .replace(/{{SEO_KEYWORDS}}/g, product.seo_keywords || '');

            html = injectTrackingScripts(html, settings);
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        });
    } catch (e) { res.status(500).send('Error'); }
});

// Admin Routes
app.get('/admin', (req, res) => {
    res.redirect('/admin/dashboard');
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

app.get('/admin/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/dashboard.html'));
});

app.get('/admin/products', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/products.html'));
});

app.get('/admin/categories', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/categories.html'));
});

app.get('/admin/mobile-hero', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/mobile-hero.html'));
});

app.get('/admin/pixel-traffic', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/pixel-traffic.html'));
});

app.get('/admin/trash', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/trash.html'));
});

app.get('/admin/seo', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/seo.html'));
});

app.get('/admin/meeting-requests', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/meeting-requests.html'));
});

// Socket.io for real-time updates
// ===== SETTINGS & TRAFFIC API =====

// Get admin settings
app.get('/api/admin/settings', requireAuth, (req, res) => {
    db.query('SELECT * FROM site_settings', (err, results) => {
        if (err) {
            console.error('Error fetching settings:', err);
            return res.status(500).json({ error: 'Failed to fetch settings' });
        }
        const settings = {};
        results.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    });
});

// Update admin settings
app.post('/api/admin/settings', requireAuth, (req, res) => {
    const settings = req.body;
    const promises = Object.keys(settings).map(key => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?';
            db.query(query, [key, settings[key], settings[key]], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            invalidateCache('settings'); // CLEAR CACHE ON UPDATE
            res.json({ message: 'Settings updated successfully' });
        })
        .catch(err => {
            console.error('Error saving settings:', err);
            res.status(500).json({ error: 'Failed to save settings' });
        });
});

// Get robots.txt
app.get('/api/admin/robots', requireAuth, (req, res) => {
    fs.readFile(path.join(__dirname, 'robots.txt'), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read robots.txt' });
        res.json({ content: data });
    });
});

// Update robots.txt
app.post('/api/admin/robots', requireAuth, (req, res) => {
    const { content } = req.body;
    fs.writeFile(path.join(__dirname, 'robots.txt'), content, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update robots.txt' });
        res.json({ message: 'robots.txt updated successfully' });
    });
});

// Get traffic stats (Admin)
app.get('/api/admin/traffic-stats', requireAuth, (req, res) => {
    const range = req.query.range || '30'; // days
    const dateFilter = `created_at >= DATE_SUB(NOW(), INTERVAL ${parseInt(range)} DAY)`;

    const querySources = `
    SELECT 
        CASE 
            WHEN source IS NULL OR source = '' THEN 'Direct / None'
            WHEN source LIKE '%google%' THEN 'Google / Organic'
            WHEN source LIKE '%facebook%' THEN 'Facebook / Social'
            WHEN source LIKE '%instagram%' THEN 'Instagram / Social'
            WHEN source LIKE '%twitter%' OR source LIKE '%t.co%' THEN 'Twitter / Social'
            ELSE 'Referral / Other'
        END as source_category,
        path,
        ip_address,
        COUNT(*) as sessions,
        MAX(created_at) as last_visit
    FROM traffic_logs 
    WHERE ${dateFilter}
    GROUP BY source_category, path, ip_address
    ORDER BY last_visit DESC
    LIMIT 50
`;

    const queryDaily = `
    SELECT DATE(created_at) as date, COUNT(*) as sessions 
    FROM traffic_logs 
    WHERE ${dateFilter}
    GROUP BY DATE(created_at) 
    ORDER BY date ASC
`;

    Promise.all([
        new Promise((resolve, reject) => db.query(querySources, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => db.query(queryDaily, (err, res) => err ? reject(err) : resolve(res)))
    ])
        .then(([sources, daily]) => {
            res.json({ sources, daily });
        })
        .catch(err => {
            console.error('Error fetching traffic stats:', err);
            res.status(500).json({ error: 'Failed to fetch traffic stats' });
        });
});

// ===== DYNAMIC SITEMAP =====
app.get('/mysitemap.xml', (req, res) => {
    const baseUrl = `https://${req.get('host')}`;

    const catQuery = "SELECT slug FROM categories WHERE is_deleted = FALSE";
    const prodQuery = "SELECT slug FROM products WHERE status = 'Published' AND is_deleted = FALSE";
    Promise.all([
        new Promise((resolve, reject) => db.query(catQuery, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => db.query(prodQuery, (err, res) => err ? reject(err) : resolve(res)))
    ]).then(([categories, products]) => {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>\n`;
        xml += `  <url><loc>${baseUrl}/all</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>\n`;

        categories.forEach(cat => {
            xml += `  <url><loc>${baseUrl}/${cat.slug}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>\n`;
        });

        products.forEach(prod => {
            xml += `  <url><loc>${baseUrl}/p/${prod.slug}</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>\n`;
        });

        xml += '</urlset>';
        res.set('Content-Type', 'application/xml');
        res.send(xml);
    }).catch(err => {
        console.error('Error generating sitemap:', err);
        res.status(500).send('Error generating sitemap');
    });
});

// Public: Get config (Pixel ID)
app.get('/api/public/config', async (req, res) => {
    try {
        const config = await getCachedSettings();
        res.json({
            pixel_id: config.meta_pixel_id || '',
            pixel_enabled: config.meta_pixel_enabled === 'true',
            gtm_id: config.gtm_container_id || '',
            gtm_enabled: config.gtm_enabled === 'true'
        });
    } catch (err) {
        res.status(500).json({});
    }
});

// Public: Track Visit (Buffering for Shared Hosting)
let trafficBuffer = [];
async function flushTraffic() {
    if (trafficBuffer.length === 0) return;
    const items = [...trafficBuffer];
    trafficBuffer = [];

    const query = 'INSERT INTO traffic_logs (ip_address, source, path, user_agent) VALUES ?';
    const values = items.map(i => [i.ip, i.source, i.path, i.userAgent]);

    db.query(query, [values], (err) => {
        if (err) console.error('Traffic Buffer Flush Error:', err);
    });
}
setInterval(flushTraffic, 60000); // Flush every 1 minute

app.post('/api/public/track', (req, res) => {
    const { source, path } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    trafficBuffer.push({ ip, source: source || '', path: path || '', userAgent: userAgent || '' });
    res.sendStatus(200);
});

// Post Meeting Request
app.post('/api/public/meeting-request', (req, res) => {
    const { businessType, businessName, fullName, designation, whatsappNumber, menuType, address } = req.body;
    const query = 'INSERT INTO meeting_requests (business_type, business_name, full_name, designation, whatsapp_number, menu_type, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [businessType, businessName, fullName, designation, whatsappNumber, menuType, address], (err) => {
        if (err) {
            console.error('Error saving meeting request:', err);
            return res.status(500).json({ error: 'Failed to save request' });
        }
        res.json({ message: 'Meeting request submitted successfully' });
    });
});

// Get Meeting Requests (Admin)
app.get('/api/admin/meeting-requests', requireAuth, (req, res) => {
    db.query('SELECT * FROM meeting_requests ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error fetching meeting requests:', err);
            return res.status(500).json({ error: 'Failed to fetch requests' });
        }
        res.json(results);
    });
});

// Delete Meeting Request (Admin)
app.delete('/api/admin/meeting-requests/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    console.log(`Attempting to delete meeting request ID: ${id}`);
    db.query('DELETE FROM meeting_requests WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting meeting request:', err);
            return res.status(500).json({ error: 'Failed to delete request' });
        }
        console.log(`Delete successful. Rows affected: ${result.affectedRows}`);
        res.json({ message: 'Meeting request deleted successfully' });
    });
});

// Cleanup: Move static after explicit routes if needed, 
// but for now, catch-all category route at the end is fine.

// Product Clean URLs

/*
// Category Clean URLs Catch-All
app.get('/:slug', async (req, res, next) => {
    const slug = req.params.slug;

    // Skip if it's a known route or has a file extension
    if (slug.includes('.') || ['admin', 'product', 'api', 'uploads'].includes(slug.split('/')[0])) {
        return next();
    }

    db.query('SELECT * FROM categories WHERE slug = ? AND is_deleted = FALSE', [slug], async (err, results) => {
        if (err || results.length === 0) {
            return next(); // Not a category, let other handlers/static take care of it
        }

        const category = results[0];

        try {
            const [settings, data] = await Promise.all([
                getCachedSettings(),
                getCachedHtml('index.html')
            ]);
            if (!data) return res.status(500).send('Error loading page');

            const titleSuffix = settings.site_title_suffix || ' | Color Hut Studio';
            let html = data.replace(/{{SITE_TITLE}}/g, `${category.name}${titleSuffix}`)
                .replace(/{{SITE_DESCRIPTION}}/g, `Explore our ${category.name} collection at Color Hut Studio.`)
                .replace(/{{SITE_KEYWORDS}}/g, `${category.name}, Color Hut Studio`)
                .replace(/{{SITE_URL}}/g, `${req.protocol}://${req.get('host')}/${category.slug}`)
                .replace(/{{SITE_IMAGE}}/g, `${req.protocol}://${req.get('host')}/logo.png`);

            html = injectTrackingScripts(html, settings);
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (e) { res.status(500).send('Error'); }
    });
});
*/

// Product Clean URLs
app.get('/p/:slug', async (req, res) => {
    const slug = req.params.slug;

    const query = `
        SELECT p.*, (
            SELECT GROUP_CONCAT(name SEPARATOR ', ') 
            FROM categories 
            WHERE FIND_IN_SET(id, p.category_id)
        ) as category_name 
        FROM products p 
        WHERE p.slug = ? AND p.status = 'Published' AND p.is_deleted = FALSE
    `;
    db.query(query, [slug], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Product not found');
        }

        const product = results[0];
        try {
            const [settings, data] = await Promise.all([
                getCachedSettings(),
                getCachedHtml('product.html')
            ]);
            if (!data) return res.status(500).send('Error loading page');

            // Image handling
            let shareImage = 'https://store.colorhutbd.xyz/banner.jpg?v=1';
            try {
                if (product.image) {
                    const images = product.image.startsWith('[') ? JSON.parse(product.image) : [product.image];
                    if (images.length > 0) {
                        let firstImage = images[0];
                        if (!firstImage.startsWith('http')) {
                            const cleanPath = firstImage.startsWith('/') ? firstImage : `/uploads/${firstImage}`;
                            shareImage = `https://store.colorhutbd.xyz${cleanPath}`;
                        } else {
                            shareImage = firstImage;
                        }
                    }
                }
            } catch (e) { }

            const shareUrl = `https://store.colorhutbd.xyz/p/${product.slug}`;
            const cleanDescription = (product.description || '')
                .replace(/[#*`_]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 160);

            // Generate Product Schema
            const productSchema = `
                <script type="application/ld+json">
                {
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  "name": "${product.name}",
                  "image": "${shareImage}",
                  "description": "${product.seo_description || cleanDescription}",
                  "sku": "CH-${product.id}",
                  "brand": {
                    "@type": "Brand",
                    "name": "Color Hut Studio"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "${product.rating || 5}",
                    "reviewCount": "${Math.floor(Math.random() * 50) + 10}"
                  },
                  "offers": {
                    "@type": "Offer",
                    "url": "${shareUrl}",
                    "priceCurrency": "BDT",
                    "price": "${product.price || 0}",
                    "availability": "https://schema.org/InStock"
                  }
                }
                </script>
                `;

            // Generate Breadcrumb Schema
            const breadcrumbSchema = `
                <script type="application/ld+json">
                {
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  "itemListElement": [{
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "${req.protocol}://${req.get('host')}/"
                  },{
                    "@type": "ListItem",
                    "position": 2,
                    "name": "${product.category_name || 'All'}",
                    "item": "${req.protocol}://${req.get('host')}/${product.category_name ? product.category_name.toLowerCase().replace(/ /g, '-') : 'all'}"
                  },{
                    "@type": "ListItem",
                    "position": 3,
                    "name": "${product.name}",
                    "item": "${shareUrl}"
                  }]
                }
                </script>
                `;

            const titleSuffix = settings.site_title_suffix || ' | Color Hut Studio';
            let html = data
                .replace(/{{OG_TITLE}}/g, (product.name || 'Product Details') + titleSuffix)
                .replace(/{{OG_DESCRIPTION}}/g, product.seo_description || cleanDescription || 'Check out this design at Color Hut Studio')
                .replace(/{{OG_IMAGE}}/g, shareImage)
                .replace(/{{OG_URL}}/g, shareUrl)
                .replace(/{{SEO_KEYWORDS}}/g, product.seo_keywords || '')
                .replace(/{{{PRODUCT_SCHEMA}}}/g, productSchema)
                .replace(/{{{BREADCRUMB_SCHEMA}}}/g, breadcrumbSchema);

            html = injectTrackingScripts(html, settings);
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (e) { res.status(500).send('Error'); }
    });
});

app.all('*', (req, res) => {
    return handle(req, res);
});

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
