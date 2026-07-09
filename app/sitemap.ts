import { MetadataRoute } from 'next';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

interface DatabaseCategory {
    id: number;
    slug: string;
}

interface DatabaseProduct {
    id: number;
    name: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://store.colorhutbd.xyz';
    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/demo`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }
    ];

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'ecommerce_db'
        });

        // 1. Fetch Categories
        const [categoriesRows] = await connection.query('SELECT id, slug FROM categories');
        const categories = categoriesRows as DatabaseCategory[];
        if (Array.isArray(categories)) {
            categories.forEach((cat) => {
                const catId = cat.id;
                const catSlug = cat.slug;
                if (catId && catSlug) {
                    sitemapEntries.push({
                        url: `${baseUrl}/${catId}/${catSlug}/`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                }
            });
        }

        // 2. Fetch Products
        const [productsRows] = await connection.query('SELECT id, name FROM products');
        const products = productsRows as DatabaseProduct[];
        if (Array.isArray(products)) {
            products.forEach((prod) => {
                const prodId = prod.id;
                const prodName = prod.name;
                if (prodId && prodName) {
                    const cleanTitle = prodName
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    sitemapEntries.push({
                        url: `${baseUrl}/p/${prodId}/${cleanTitle}/`,
                        lastModified: new Date(),
                        changeFrequency: 'daily',
                        priority: 0.9,
                    });
                }
            });
        }

        await connection.end();
    } catch {
        // empty catch to satisfy typescript / unused error variables rule
    }

    return sitemapEntries;
}
