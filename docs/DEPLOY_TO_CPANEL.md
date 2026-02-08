# Deploying to cPanel (Node.js)

Follow these steps to deploy your application to a cPanel hosting environment.

## 1. Prepare Your Application

1.  **Database Config**: Your `server.js` is already set up to use Environment Variables for database connections. This is good.
2.  **Zip Your Files**:
    *   Select all files in your project **EXCEPT** `node_modules`, `.git`, and `.env`.
    *   Create a ZIP archive of these files (e.g., `project.zip`).
    *   *Note: Do not upload `node_modules`. We will install dependencies on the server.*

## 2. Prepare the Database (cPanel)

1.  Log in to your cPanel.
2.  Go to **MySQL Database Wizard**.
3.  **Step 1**: Create a new database (e.g., `youruser_ecommerce`).
4.  **Step 2**: Create a new user (e.g., `youruser_admin`).
    *   **IMPORTANT**: Generate a strong password and **COPY IT**. You will need it later.
5.  **Step 3**: Assign the user to the database and check **ALL PRIVILEGES**.
6.  Click **Make Changes**.

## 3. Upload Files

1.  Go to **File Manager** in cPanel.
2.  Navigate to the root of your domain (usually `public_html` or a subdomain folder).
3.  Click **Upload** and select your `project.zip`.
4.  Once uploaded, right-click the zip file and select **Extract**.
5.  Extract the files into the current directory.

## 4. Setup Node.js App

1.  Go to the main cPanel dashboard and search for **"Setup Node.js App"**.
2.  Click **Create Application**.
3.  **Node.js Version**: Select a recommended version (e.g., 18.x or 20.x).
4.  **Application Mode**: Select **Production**.
5.  **Application Root**: Enter the path where you uploaded your files (e.g., `public_html` or `ecommerce`).
6.  **Application URL**: Select your domain.
7.  **Application Startup File**: Enter `server.js`.
8.  Click **Create**.

## 5. Install Dependencies

1.  Once the app is created, scroll down to the "Detected Configuration Files" section.
2.  You should see `package.json`.
3.  Click the **Run NPM Install** button.
    *   *This will read your `package.json` and download all necessary libraries.*

## 6. Configure Environment Variables

1.  In the Node.js App settings page, look for the **Environment Variables** section (sometimes called "Settings").
2.  Add the following variables (use the database details you created in Step 2):
    *   `DB_HOST`: `localhost`
    *   `DB_NAME`: (The database name, e.g., `youruser_ecommerce`)
    *   `DB_USER`: (The database user, e.g., `youruser_admin`)
    *   `DB_PASS`: (The password you copied earlier)
    *   `SESSION_SECRET`: (Enter a random long string for security)
    *   `PORT`: `3000` (Optional, as cPanel often handles this, but good to have)

## 7. Start the Application

1.  Scroll to the top of the Node.js App page.
2.  Click **Restart Application**.
3.  Visit your website URL.

## Troubleshooting

*   **503 Error**: Check the **stderr.log** file in your File Manager (inside `public_html/stderr.log` or similar). It usually contains error messages.
*   **Database Error**: Double-check your database username, password, and database name in the Environment Variables. Note that cPanel often prefixes them with your username (e.g., `username_dbname`).
*   **Images/Assets 404**: Ensure your `uploads` folder exists and has write permissions (755).
