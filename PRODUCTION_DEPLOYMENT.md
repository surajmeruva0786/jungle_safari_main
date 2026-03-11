# 🚀 Jungle Safari - Production Deployment Guide

## Overview

This guide will help you deploy the Jungle Safari application to production. The application consists of two parts:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Flask + Python

---

## Prerequisites

Before deploying, ensure you have:
- ✅ All code tested and working locally
- ✅ Environment variables configured
- ✅ Database seeded with initial data
- ✅ Git repository set up
- ✅ Accounts on deployment platforms

---

## Part 1: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

**Why Vercel?**
- Free tier available
- Automatic HTTPS
- Easy GitHub integration
- Fast global CDN
- Zero configuration for Vite

**Steps:**

1. **Prepare for Deployment**
   ```bash
   # Test production build locally
   npm run build
   npm run preview
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click "Deploy"

4. **Configure Environment Variables** (if needed for frontend)
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add any frontend-specific variables

5. **Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

**Your frontend is now live!** 🎉

---

### Option B: Deploy to Netlify

**Steps:**

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

   Or use the Netlify web interface:
   - Drag and drop the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

---

### Option C: GitHub Pages

**Note**: GitHub Pages is static only, good for demo but not ideal for production.

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/jungle-safari",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

---

## Part 2: Backend Deployment

### Option A: Deploy to Railway (Recommended)

**Why Railway?**
- Free tier with $5 credit
- Easy Python deployment
- Environment variables management
- Automatic HTTPS
- Database hosting available

**Steps:**

1. **Create `requirements.txt`**
   ```bash
   pip freeze > requirements.txt
   ```

   Or manually create:
   ```txt
   flask==3.0.0
   flask-cors==4.0.0
   python-dotenv==1.0.0
   google-cloud-firestore==2.14.0
   google-generativeai==0.3.2
   cloudinary==1.36.0
   requests==2.31.0
   pydantic==2.5.0
   langchain==0.1.0
   deepgram-sdk==3.0.0
   ```

2. **Create `Procfile`**
   ```
   web: python backend_api.py
   ```

3. **Update `backend_api.py` for Production**
   ```python
   import os
   
   if __name__ == '__main__':
       port = int(os.environ.get('PORT', 5000))
       app.run(host='0.0.0.0', port=port)
   ```

4. **Deploy to Railway**
   - Go to [railway.app](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Python and deploy

5. **Configure Environment Variables**
   - In Railway dashboard, go to Variables
   - Add all variables from your `.env`:
     ```
     GEMINI_API_KEY=your_key
     DEEPGRAM_API_KEY=your_key
     CLOUDINARY_CLOUD_NAME=your_name
     CLOUDINARY_API_KEY=your_key
     CLOUDINARY_API_SECRET=your_secret
     ```
   
   - **For Firebase**: Upload service account JSON
     - Create a variable `GOOGLE_APPLICATION_CREDENTIALS_JSON`
     - Paste the entire JSON content
     - Update `backend_api.py` to handle JSON string:
     ```python
     import json
     import tempfile
     
     # In initialization code:
     creds_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
     if creds_json:
         with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
             f.write(creds_json)
             os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = f.name
     ```

6. **Update CORS Settings**
   ```python
   # In backend_api.py
   CORS(app, origins=[
       "http://localhost:3000",
       "https://your-frontend-domain.vercel.app"
   ])
   ```

7. **Get Your Backend URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this URL

---

### Option B: Deploy to Render

**Steps:**

1. **Create `render.yaml`**
   ```yaml
   services:
     - type: web
       name: jungle-safari-api
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: python backend_api.py
       envVars:
         - key: PYTHON_VERSION
           value: 3.11.0
   ```

2. **Deploy**
   - Go to [render.com](https://render.com/)
   - Click "New Web Service"
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy

---

### Option C: Google Cloud Run

**For advanced users who want to use Google Cloud:**

1. **Create `Dockerfile`**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["python", "backend_api.py"]
   ```

2. **Deploy**
   ```bash
   gcloud run deploy jungle-safari-api \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

---

## Part 3: Connect Frontend to Backend

### Update Frontend API URL

1. **Create Environment Variable**
   
   In Vercel/Netlify, add:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

2. **Update Frontend Code**
   
   In your components, replace:
   ```typescript
   const API_BASE_URL = 'http://127.0.0.1:5000';
   ```
   
   With:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
   ```

3. **Redeploy Frontend**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```
   
   Vercel will auto-deploy on push.

---

## Part 4: Security Hardening

### 1. Enable HTTPS (Automatic on Vercel/Railway)

Both Vercel and Railway provide automatic HTTPS certificates.

### 2. Add Password Hashing

**Install bcrypt:**
```bash
pip install bcrypt
```

**Update `backend_api.py`:**
```python
import bcrypt

# When creating user:
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
user_data['password'] = hashed.decode('utf-8')

# When logging in:
if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
    # Login successful
```

### 3. Implement JWT Tokens

**Install PyJWT:**
```bash
pip install pyjwt
```

**Add to `backend_api.py`:**
```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

@app.route('/login', methods=['POST'])
def login():
    # ... authentication logic ...
    
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    
    return jsonify({'token': token, 'user': user})

# Middleware to verify token:
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = get_user_by_id(data['user_id'])
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated
```

### 4. Configure Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // More specific rules:
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 5. Environment Variables Security

**Never commit:**
- `.env` file
- Service account JSON files
- API keys

**Always use:**
- Environment variables on deployment platforms
- Secret management services
- `.gitignore` to exclude sensitive files

---

## Part 5: Monitoring & Maintenance

### 1. Error Tracking

**Add Sentry:**
```bash
pip install sentry-sdk[flask]
```

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
)
```

### 2. Logging

**Configure logging:**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

### 3. Database Backups

**Firestore automatic backups:**
- Go to Firebase Console
- Firestore → Backups
- Schedule daily backups

### 4. Performance Monitoring

**Add caching:**
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/animals')
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_animals():
    # ...
```

---

## Part 6: Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Frontend connected to backend
- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] Password hashing implemented
- [ ] JWT tokens implemented
- [ ] Firestore security rules configured
- [ ] Error tracking set up (Sentry)
- [ ] Database backups scheduled
- [ ] Custom domain configured (if applicable)
- [ ] All user roles tested in production
- [ ] AI features tested (if API keys configured)
- [ ] Mobile responsiveness verified
- [ ] Performance tested (load times < 3s)
- [ ] SEO meta tags added
- [ ] Analytics set up (Google Analytics)

---

## Part 7: Troubleshooting

### Frontend Issues

**Build fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**API calls failing:**
- Check CORS settings in backend
- Verify API_BASE_URL is correct
- Check browser console for errors

### Backend Issues

**Import errors:**
```bash
# Ensure all dependencies in requirements.txt
pip freeze > requirements.txt
```

**Database connection fails:**
- Verify GOOGLE_APPLICATION_CREDENTIALS is set
- Check Firestore security rules
- Ensure service account has correct permissions

**CORS errors:**
- Add frontend domain to CORS origins
- Restart backend after changes

---

## Part 8: Cost Estimation

### Free Tier Limits

**Vercel (Frontend):**
- ✅ Free for personal projects
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites

**Railway (Backend):**
- ✅ $5 free credit/month
- ⚠️ ~$5-10/month after credit

**Firebase (Database):**
- ✅ Free tier: 1GB storage, 50K reads/day
- ⚠️ Pay-as-you-go after limits

**Cloudinary (Media):**
- ✅ Free tier: 25GB storage, 25GB bandwidth
- ⚠️ Paid plans start at $99/month

**Total Estimated Cost:**
- **Free tier**: $0-5/month
- **Light usage**: $10-20/month
- **Production**: $50-100/month

---

## Part 9: Scaling Considerations

### When to Scale

- More than 1000 daily active users
- Database reads > 50K/day
- Media storage > 25GB
- Response times > 3 seconds

### Scaling Options

1. **Frontend**: Vercel auto-scales
2. **Backend**: 
   - Railway: Increase resources
   - Move to Google Cloud Run for auto-scaling
3. **Database**: 
   - Upgrade Firebase plan
   - Add caching layer (Redis)
4. **Media**: 
   - Upgrade Cloudinary plan
   - Use CDN for static assets

---

## Conclusion

Your Jungle Safari application is now ready for production deployment! 🎉

**Quick Start:**
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Configure environment variables
4. Update CORS and API URLs
5. Test all features in production
6. Enable security features
7. Set up monitoring

**Support:**
- Check logs in Vercel/Railway dashboards
- Monitor errors in Sentry
- Review Firebase usage in console

**Good luck with your deployment!** 🦁🐯🐘🦒
