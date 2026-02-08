# Deploying to CyberPanel (Node.js)

Since your application is a Node.js (Express) server, you cannot simply upload the files like a static site. You need to run the Node.js server and expose it through OpenLiteSpeed.

There are two main ways to do this in CyberPanel. **Method 1** is easier if your host has the "Node.js" plugin installed. **Method 2** is the universal way that works on any CyberPanel VPS.

## Prerequisites

1.  **Zip your project**: Select all files (except `node_modules` and `.git`) and zip them into `eStore.zip`.
2.  **Login to CyberPanel**.

---

## Step 1: Create Database

1.  In CyberPanel sidebar, go to **Databases** > **Create Database**.
2.  **Select Website**: Choose your domain.
3.  **Database Name**: e.g., `estore_db`.
4.  **Username**: e.g., `estore_user`.
5.  **Password**: Generate a secure password and **SAVE IT**.
6.  Click **Create Database**.

---

## Step 2: Create Website & Upload Code

1.  **Websites** -> **Create Website**.
2.  Fill in details (Domain, Email, PHP version - choose any, SSL).
3.  Go to **Websites** -> **List Websites**.
4.  Find your site and click **File Manager**.
5.  Go into `public_html`.
6.  **Delete** the default `index.html`.
7.  **Upload** your `eStore.zip`.
8.  Right-click `eStore.zip` -> **Extract**.

---

## Step 3: Deployment (Choose Method)

### Method 1: Using "Setup Node.js App" (Easy)
*Use this if you see "Install Node.js" or "Node.js App" in your website manager.*

1.  Go to **Websites** -> **List Websites** -> **Manage**.
2.  Look for **"Install Node.js"** or similar. If not found, use Method 2.
3.  If found, select the version (18 or 20) and install.
4.  This often just installs the binaries. You may still need to configure the context manually.

### Method 2: Manual with PM2 & Reverse Proxy (Recommended/Universal)
*This is the most robust way to run Node.js on CyberPanel.*

#### A. Install Dependencies (Terminal)
1.  Connect to your VPS via SSH (using Putty or Terminal).
2.  Navigate to your site folder:
    ```bash
    cd /home/yourdomain.com/public_html
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

#### B. Configure Environment Variables
1.  In CyberPanel File Manager (`public_html`), create a file named `.env`.
2.  Paste your environment variables:
    ```env
    DB_HOST=localhost
    DB_USER=your_db_user_created_in_step_1
    DB_PASS=your_db_password
    DB_NAME=your_db_name
    SESSION_SECRET=some_long_secret_string
    PORT=3000
    ```
    *Note: If you have multiple Node apps, change the PORT (e.g., 3001, 3002) to avoid conflicts.*

#### C. Start the App with PM2
1.  In your SSH terminal:
    ```bash
    npm install -g pm2
    pm2 start server.js --name "estore"
    pm2 save
    pm2 startup
    ```
    *(If the app crashes, check logs with `pm2 logs estore`)*

#### D. Configure OpenLiteSpeed Reverse Proxy
Now we tell the web server to send traffic to your Node app on port 3000.

1.  Go to **Websites** -> **List Websites** -> **Manage**.
2.  Scroll down to **Configurations** -> **vHost Conf**.
3.  Add the following **Context** config at the bottom of the file (before the closing `xml/conf` tags, or just append inside the valid block):

    ```conf
    context / {
      type                    proxy
      handler                 estore-app
      addDefaultCharset       off
    }

    extprocessor estore-app {
      type                    proxy
      address                 127.0.0.1:3000
      maxConns                100
      pcKeepAliveTimeout      60
      initTimeout             60
      retryTimeout            0
      respBuffer              0
    }
    ```
    *Make sure the address port (3000) matches your `.env` PORT.*

4.  Click **Save**.
5.  **Restart OpenLiteSpeed** (Top bar > Server Status > LiteSpeed Status > Reboot LiteSpeed).

---

## Updating an Existing Deployment

To update your live site with new changes:

1.  **Prepare Update Zip**: Zip your project files *excluding* `node_modules`, `.env`, `.git`, and the `uploads` folder.
2.  **Upload**: Go to CyberPanel File Manager, upload your zip to `public_html`, and **Extract** (Overwrite all).
3.  **Update Dependencies** (Only if `package.json` changed):
    *   Open Terminal/SSH.
    *   `cd /home/yourdomain.com/public_html`
    *   `npm install`
4.  **Restart**:
    *   **Method 1 Users**: Click "Restart" in the Node.js manager.
    *   **Method 2 Users (PM2)**: Run `pm2 restart estore`.

---

## Troubleshooting

-   **503 Error / Service Unavailable**:
    -   Means the Node.js app is not running or the port is wrong.
    -   Check: `pm2 status`
    -   Check: `curl http://127.0.0.1:3000` (from SSH to see if it responds locally).

-   **Database Error**:
    -   Check `.env` file credentials.
    -   Ensure the DB user has permissions for the DB (CyberPanel does this by default).

-   **Static Files (Images/CSS) issues**:
    -   Express manages static files in this app, so the proxy pass `/` should handle everything.
    -   Ensure `uploads` folder permissions are `755`.
