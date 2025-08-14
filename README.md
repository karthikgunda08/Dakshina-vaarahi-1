
# Dakshin Vaarahi - The Operating System for Architecture

Welcome to the future. This is Dakshin Vaarahi, the definitive, enterprise-grade cloud platform for the Architecture, Engineering, and Construction (AEC) industry. As a Google-backed venture, Dakshin Vaarahi is the end-to-end operating system designed by and for the most destructive, creative, and intelligent minds in the field. This is not a tool; it is a revolution.

## ✨ Core Technology Stack

*   **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO
*   **AI Engine:** Google Gemini API (`gemini-2.5-flash`, `imagen-3.0-generate-002`)
*   **Frontend:** React 18, TypeScript, Vite, Fabric.js
*   **3D Rendering:** Three.js
*   **Styling:** Tailwind CSS
*   **Payments:** Razorpay
*   **Offline Capability:** Progressive Web App (PWA) with Service Worker

---

## 🔥 Code Health & Revolution (Launch Ready)

A system that cannot recognize its own limitations is destined for obsolescence. In the spirit of our unending revolt against inefficiency, this codebase has undergone a significant refactoring to ensure it is stable, maintainable, and launch-ready.

*   **Pristine Dependency Management:** The frontend build process has been perfected. The unconventional and problematic `<script type="importmap">` has been surgically removed from `index.html`. The application now relies exclusively on Vite's industry-standard bundling via `npm install` for optimal performance and maintainability.
*   **Critical Security & Logic Patch (Backend):** The backend controllers have been reviewed and hardened. A critical authorization flaw in the `projectController` has been patched, ensuring that invited collaborators with 'editor' permissions can correctly save projects, enabling true real-time collaboration.
*   **Systematic Review:** The entire application, from state management to error handling across both frontend and backend, has been reviewed for consistency, performance, and adherence to best practices.

The foundation is now stronger than ever. **Our revolt never stops.**

---

## ⚠️ Mission Critical Prerequisite: The Two-Server Architecture

This is a full-stack, enterprise-grade application with a separate frontend and backend. For the system to operate, you **must** have both servers running simultaneously in **two separate terminal windows**.

1.  **Backend (`auraos-backend`):** The "brain" of the operation. A robust Node.js server that commands all business logic, user authentication, database interactions (MongoDB), and secure communication with Google's Gemini API services.
2.  **Frontend (root directory):** The "face" of the revolution. A sophisticated user interface forged with React, TypeScript, and Vite that provides the interactive design canvas and all user-facing components.

---

## 🚀 Part 1: Local Deployment Protocol (Backend First)

This section guides you through running the Dakshin Vaarahi **backend** on your local machine. **This must be done before starting the frontend.**

### Step 1. Open Terminal 1: The Backend Server

Open your first terminal window. This will be dedicated to the backend.

### Step 2. Navigate to the Backend Directory

From the project root, navigate into the `auraos-backend` folder.

```bash
cd auraos-backend
```

### Step 3. Install Backend Dependencies

Run the following command to install all necessary packages for the server.

```bash
npm install
```

### Step 4. Create the Backend Environment File

In the `auraos-backend` directory, create a new file named **exactly** `.env`.

### Step 5. Configure Backend Variables

Copy the following configuration and paste it into your newly created `auraos-backend/.env` file. **You must replace the placeholder values.**

```env
# MongoDB Connection (CRITICAL)
# Get this from your MongoDB Atlas cluster.
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/databaseName"

# Google Gemini API Key (CRITICAL)
# Get this from Google AI Studio.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# JWT Secret (CRITICAL)
# Can be any long, random string. Used for signing authentication tokens.
JWT_SECRET="YOUR_SUPER_SECRET_RANDOM_STRING_FOR_JWT"

# Client URL (CRITICAL)
# This MUST point to the frontend's local URL for CORS to work.
CLIENT_URL="http://localhost:5173"

# Razorpay Keys (Optional, for payments)
# Get these from your Razorpay dashboard.
RAZORPAY_KEY_ID="YOUR_RAZORPAY_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="YOUR_RAZORPAY_WEBHOOK_SECRET"

# Email Service (Optional, for password reset, etc.)
# For development, these can be left blank (emails will be logged to console).
# For production, configure with a real SMTP provider (e.g., SendGrid).
EMAIL_HOST=""
EMAIL_PORT=""
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_FROM=""
```

### Step 6. Launch the Backend Server

Start the Node.js development server with the following command:

```bash
npm run dev
```

The backend is now running. **Leave this terminal window open.**

### Step 7. (Optional) Set Your User as Owner

After you register an account through the UI in the next section, you can grant yourself owner privileges (unlimited credits, access to the admin dashboard). Open a **third** terminal, navigate to `auraos-backend`, and run:

```bash
npm run set-owner -- your-email@example.com
```

---

## 🚀 Part 2: Local Deployment Protocol (Frontend)

This section will guide you through running the Dakshin Vaarahi **frontend**.

### Step 1. Open a New Terminal (Terminal 2)

Use a **new, separate terminal window** for the frontend. Your first terminal should still be running the backend server.

### Step 2. Navigate to the Project Root Directory

Ensure your new terminal is in the project's root directory (the folder containing this `README.md` file).

```bash
# You should be in the main project folder, NOT auraos-backend
# cd .. (if you are still in auraos-backend)
```

### Step 3. Install Frontend Dependencies

Run the following command to install all necessary packages for the frontend. This will download React, Vite, Tailwind, and all other required libraries from `package.json`.

```bash
npm install
```

### Step 4. Create the Frontend Environment File

In the root directory, create a new file named **exactly** `.env.local`.

### Step 5. Configure Frontend Variables

Copy the following configuration into your newly created `.env.local` file.

```env
# This variable points the frontend to your running backend server.
VITE_BACKEND_API_URL="http://localhost:3001/api"

# This is the public key for the Razorpay payment gateway.
VITE_RAZORPAY_KEY_ID="YOUR_RAZORPAY_KEY_ID"
```

### Step 6. Launch the Frontend Application

Start the Vite development server with the following command:

```bash
npm run dev
```

### Step 7: Access the Application ✅

The terminal will provide a local URL, typically `http://localhost:5173`. Open this address in your web browser to access the Dakshin Vaarahi Architectural Cloud.

---

### 🚨 Troubleshooting Common Setup Issues

*   **`'vite' is not recognized...` or `command not found: vite`:**
    *   This error means Step 3 (`npm install` in the **root directory**) was either skipped or did not complete successfully.
    *   **Solution:** Stop the server (Ctrl+C). Delete the `node_modules` folder if it exists. Then, run `npm install` again. Wait for it to finish completely before running `npm run dev`.

*   **"Failed to connect to backend" / CORS Errors:**
    *   This means the frontend cannot communicate with the backend.
    *   **Solution Checklist:**
        1.  Is your backend server still running in Terminal 1?
        2.  Did you `cd auraos-backend` before starting the backend?
        3.  Is the `CLIENT_URL` in `auraos-backend/.env` set **exactly** to `http://localhost:5173`?
        4.  Is the `VITE_BACKEND_API_URL` in your root `.env.local` set **exactly** to `http://localhost:3001/api`?

---

## 🚀 Part 3: Global Launch & Production Deployment 🌐

This section guides you through deploying the Dakshin Vaarahi application to the internet.

### Prerequisites

*   A **GitHub** account with the entire project pushed to a new repository.
*   A **[Vercel](https://vercel.com/)** account (for hosting the frontend).
*   A **[Render](https://render.com/)** account (for hosting the backend Node.js server).
*   A **MongoDB Atlas** account with a database cluster created.
*   Your various API keys (`Gemini`, `Razorpay`) ready.

### Step 1: Prepare your Database (MongoDB Atlas)

1.  **Create a Cluster:** Log into MongoDB Atlas and create a new cluster (the free M0 tier is sufficient).
2.  **Get Connection String:** Once the cluster is active, click "Connect", choose "Drivers", and copy the connection string. Replace `<password>` with the actual password for the database user you created.
3.  **Configure Network Access:** Go to `Network Access` and click "Add IP Address". Select **"Allow Access from Anywhere"** (`0.0.0.0/0`). This is crucial for your hosting provider to connect.

### Step 2: Deploy the Backend Server (Render)

1.  **New Web Service:** In Render, create a "New Web Service".
2.  **Connect GitHub:** Connect your GitHub account and select your project repository.
3.  **Configuration:**
    *   **Name:** Give your service a name (e.g., `dakshin-vaarahi-backend`).
    *   **Root Directory:** Set this to `auraos-backend`. This tells Render to look inside this subfolder.
    *   **Branch:** `main`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
4.  **Add Environment Variables:** Go to the "Environment" tab and add all the key-value pairs from your local `auraos-backend/.env` file.
    *   **`MONGODB_URI`:** Paste the connection string from MongoDB Atlas here.
    *   **`GEMINI_API_KEY`:** Your Google Gemini API key.
    *   **`JWT_SECRET`:** A new, strong random string.
    *   **`CLIENT_URL`:** Leave this blank for now. We will fill it in after deploying the frontend.
    *   Add your `RAZORPAY` and `EMAIL` variables for production.
5.  **Deploy:** Click "Create Web Service".
6.  **Get Backend URL:** Once deployed, Render will provide a public URL (e.g., `https://dakshin-vaarahi-backend-xyz.onrender.com`). Copy this URL.

### Step 3: Deploy the Frontend Application (Vercel)

1.  **New Project:** In Vercel, "Add New..." > "Project".
2.  **Connect GitHub:** Import the same GitHub repository.
3.  **Configuration:**
    *   Vercel should automatically detect this is a Vite project.
    *   **Root Directory:** Leave this as the project root.
4.  **Add Environment Variables:**
    *   Add `VITE_BACKEND_API_URL` and set its value to your **full deployed backend API URL** (e.g., `https://dakshin-vaarahi-backend-xyz.onrender.com/api`).
    *   Add `VITE_RAZORPAY_KEY_ID` with your public Razorpay key.
5.  **Deploy:** Click "Deploy". Vercel will build and deploy your frontend.

### Step 4: Final Configuration & Launch

1.  **Update Backend URL:** Go back to your backend service on Render. In the "Environment" tab, update the `CLIENT_URL` variable to your final frontend URL provided by Vercel (e.g., `https://your-project.vercel.app`). This is **critical** for CORS to work. Render will automatically redeploy.
2.  **Razorpay Webhook:** In your Razorpay dashboard, go to "Settings" > "Webhooks". Add a new webhook with the URL: `https://[YOUR_BACKEND_URL]/api/payments/verify-credit-payment`.

---

## 🔥 Manifesto: The Five Pillars of the Revolution

1.  **The Spark ✨ (Idea to Prompt):** Describe your vision in plain language.
2.  **The Genesis 🧬 (Prompt to Reality):** Your idea is instantly re-engineered into sound blueprints and 3D models.
3.  **The Intelligence 🧠 (Reality to Insight):** Get real-time analysis of structure, sustainability, cost, and market data.
4.  **The Beauty 🖼️ (Insight to Emotion):** Generate photorealistic renders and cinematic walkthroughs that communicate the soul of your project.
5.  **The Empire 🏛️ (Emotion to Legacy):** Bridge the digital and physical with GFC drawings, fabrication files, and supply chain logistics.

**Our Revolt Never Stops.**
