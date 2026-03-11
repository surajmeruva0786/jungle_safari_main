# Deploying Jungle Safari (For Free!)

Your codebase is **100% ready** for deployment right now. You don't need to change any code. 
We will use **Render** for the Python backend and **Vercel** for the React frontend because they are both completely free and easy to use.

---

## Step 1: Push your code to GitHub
Before deploying, your code must be on GitHub.
1. Go to [GitHub](https://github.com) and create a free account if you don't have one.
2. Click **New Repository**. Name it `jungle-safari`. Leave it Public or Private. Do NOT initialize with a README.
3. Open a terminal in your `z:\jungle_safari_main` folder and run these commands (replace `YOUR_USERNAME` with your GitHub username):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/jungle-safari.git
   git push -u origin main
   ```
*(If you already cloned this from a teammate's GitHub, you can just push your latest changes if you have access, or fork it into your own account).*

---

## Step 2: Deploy the Backend (Python) on Render.com

Render is a free host for backend services like Python/Flask.

1. Go to [Render.com](https://render.com) and sign up using your GitHub account.
2. Click **New +** -> **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Connect your GitHub account and select your `jungle-safari` repository.
5. Fill out the form exactly like this:
   * **Name**: `jungle-safari-backend`
   * **Language**: `Python 3`
   * **Branch**: `main`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn backend_api:app`
   * **Instance Type**: `Free`
6. Scroll down to the **Advanced** section and click **Add Environment Variable**. You need to copy EVERYTHING from your local `.env` file into Render (**except** `GOOGLE_APPLICATION_CREDENTIALS`).
   
   ⚠️ **CRITICAL FIREBASE STEP:** 
   Add a variable named `GOOGLE_APPLICATION_CREDENTIALS_JSON`.
   Open your `jungle-safari-main-552fd-....json` file in VS Code, select all, copy the whole JSON content, and paste it as the value for this variable.
   
7. Click **Create Web Service**. 
8. It will take ~3-4 minutes to build. Once you see "Live", copy the URL (e.g., `https://jungle-safari-backend.onrender.com`).

---

## Step 3: Deploy the Frontend (React Vite) on Vercel.com

Vercel is the best free host for Vite/React apps.

1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `jungle-safari` repository from GitHub.
4. Leave the Framework Preset as `Vite`.
5. Open the **Environment Variables** section and add this exactly:
   * **Name**: `VITE_API_URL`
   * **Value**: *Paste the Render backend URL you copied in Step 2 here!* (e.g., `https://jungle-safari-backend.onrender.com`)
6. Click **Deploy**.
7. Wait 1-2 minutes. Vercel will give you a live production link! (e.g., `https://jungle-safari.vercel.app`).

---
🌟 **Done! You now have a fully deployed web application hosted completely for free.** 
Let me know if you run into any errors or if any of the steps are unclear!
