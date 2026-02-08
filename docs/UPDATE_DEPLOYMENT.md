# How to Update Your Live Website (Without Losing Data)

Since you already have the website running and just want to update the code (e.g., the new Pixel/GTM features), follow these steps.

### ⚠️ Critical Rule:
**NEVER delete your existing database.** As long as you keep your database, your users, products, and categories will remain safe.

## Step 1: Backup (Safety First)
Before touching anything, it is smart to take a quick backup.
1.  Go to **cPanel > File Manager**.
2.  Right-click your project folder (e.g., `public_html`) and select **Compress** to make a zip backup.

## Step 2: Prepare Your New Code
1.  On your computer, select all your project files **EXCEPT**:
    *   `node_modules` (folder)
    *   `.env` (file)
    *   `.git` (folder, if you have it)
2.  **Zip** these files into `update.zip`.

## Step 3: Upload and Overwrite
1.  Go to **cPanel > File Manager**.
2.  Open your application folder (e.g., `public_html`).
3.  Click **Upload** and upload `update.zip`.
4.  Right-click `update.zip` and select **Extract**.
5.  All your old files (`server.js`, `admin/pixel-traffic.html`, etc.) will be replaced with the new versions.

## Step 4: Restart the App
1.  Go to **cPanel > Setup Node.js App**.
2.  Click the **Pencil Icon** (Edit) next to your app.
3.  Click **Restart Application**.

---

## Why Your Data Is Safe

Your new code is smart. It contains this logic:

```javascript
// Example from your server.js
CREATE TABLE IF NOT EXISTS products ...
```

*   **IF NOT EXISTS**: This means "If the table is already there, don't touch it."
*   **New Features**: We added a feature to inject Pixel/GTM scripts. This is just code changing how the page *looks* and *works*. It reads from your existing database.
*   **New Settings**: We added a new place to save GTM settings. When the server restarts, it will see you have a `site_settings` table. If it's missing, it creates it. If it's there, it uses it.

**In Summary:**
*   **Old Database** + **New Code** = **Updated Website with All Old Data**.
*   You do **not** need to change your Environment Variables or Database settings in cPanel. Just overwrite the files and restart.
