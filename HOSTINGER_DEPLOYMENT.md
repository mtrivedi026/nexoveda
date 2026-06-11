# Hostinger Deployment Guide for Nexoveda

This guide explains how to deploy the Nexoveda storefront and backend on Hostinger. The codebase is compatible with **both** a single-app deployment and a separated frontend/backend deployment.

---

## Option 1: Single-App Deployment (Recommended & Easiest)
In this mode, both the Next.js frontend and Express/Socket.io backend run together on the same port. You do not need a second Node.js app or custom subdomains.

### Hostinger hPanel Settings:
1. **Application Startup File:** Set to `server.js`
2. **Environment Variables:**
   * `NODE_ENV` = `production`
   * `MONGODB_URI` = `YOUR_MONGODB_ATLAS_CONNECTION_STRING`
   * `JWT_SECRET` = `nexoveda_super_secret_session_key_2026`
   *(Do NOT add `STANDALONE_BACKEND` or `BACKEND_URL` in this mode)*
3. **Build the Application:**
   * Go to the Node.js application console/terminal in Hostinger.
   * Run the command: `npm run build`
4. **Start the App:** Click **Start** or **Restart** on the hPanel.

*Why this works now:* We optimized the custom server startup so it automatically runs Next.js in production mode, keeping memory usage very low and preventing memory limit crashes.

---

## Option 2: Separated Frontend & Backend (For High-Performance/Scaling)
If you want to run the frontend and backend as two completely separate services.

### App 1: Backend API Service (`api.nexoveda.com`)
1. **Application Startup File:** Set to `server.js`
2. **Environment Variables:**
   * `STANDALONE_BACKEND` = `true` *(This runs Express/Socket.io without loading Next.js)*
   * `NODE_ENV` = `production`
   * `MONGODB_URI` = `YOUR_MONGODB_ATLAS_CONNECTION_STRING`
   * `JWT_SECRET` = `nexoveda_super_secret_session_key_2026`
3. **Action:** Click **Install Dependencies**, then click **Start**.

### App 2: Frontend App (`nexoveda.com`)
1. **Application Startup File:** Leave as default / empty (runs standard Next.js start).
2. **Environment Variables:**
   * `BACKEND_URL` = `https://api.nexoveda.com` *(Your Backend subdomain)*
   * `NODE_ENV` = `production`
3. **Action:** Run the `build` script in Hostinger hPanel, then click **Start**.
