# 🚀 Jungle Safari - Setup Guide for New Developers

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Google Cloud Account** (for Firestore database)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Abhi241-bot/JungleSafariUI1.git
cd JungleSafariUI1
```

---

## Step 2: Set Up Firebase/Firestore

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "Jungle Safari" (or your preferred name)
4. Follow the setup wizard

### 2.2 Enable Firestore Database
1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

### 2.3 Generate Service Account Key
1. Go to Project Settings (gear icon) → "Service Accounts"
2. Click "Generate new private key"
3. Save the JSON file to your project root
4. Rename it to match the name in your code (e.g., `junglesafari1-b4f0d-firebase-adminsdk-fbsvc-957a30b92e.json`)

---

## Step 3: Configure Environment Variables

### 3.1 Create .env File
Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### 3.2 Fill in Required Values

**REQUIRED:**
```env
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key.json
```

**OPTIONAL (for AI features):**
```env
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# Get from: https://console.deepgram.com/
DEEPGRAM_API_KEY=your_deepgram_api_key

# Get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Step 4: Install Dependencies

### 4.1 Install Python Dependencies
```bash
pip install flask flask-cors python-dotenv google-cloud-firestore google-generativeai cloudinary requests pydantic langchain
```

Or use requirements.txt if available:
```bash
pip install -r requirements.txt
```

### 4.2 Install Node.js Dependencies
```bash
npm install
```

---

## Step 5: Seed the Database

Run the database seeding script to populate initial data:

```bash
python seed_database.py
```

You should see output like:
```
✅ Firestore client initialized successfully
🚀 Seeding collection: 'users'...
✅ Finished seeding 'users'.
...
🎉 Database seeding complete!
```

---

## Step 6: Start the Application

### 6.1 Start Backend (Terminal 1)
```bash
python backend_api.py
```

You should see:
```
✅ Firestore client initialized successfully
✅ Cloudinary client initialized successfully
* Running on http://127.0.0.1:5000
```

### 6.2 Start Frontend (Terminal 2)
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

---

## Step 7: Access the Application

1. Open your browser
2. Navigate to `http://localhost:3000/`
3. You should see the Jungle Safari landing page

### Test Login Credentials

**Zookeeper:**
- Name: Rajesh Kumar
- Password: zoo123

**Admin:**
- Name: Priya Sharma
- Password: admin123

**Vet Doctor:**
- Name: Dr. Anjali Verma
- Password: vet123

**Forest Officer:**
- Name: Vikram Singh
- Password: officer123

---

## Troubleshooting

### Backend Won't Start

**Error: "GOOGLE_APPLICATION_CREDENTIALS not found"**
- Solution: Ensure `.env` file exists and has the correct path to your service account JSON

**Error: "Module not found"**
- Solution: Install missing Python packages:
  ```bash
  pip install <package-name>
  ```

### Frontend Won't Start

**Error: "Cannot find module"**
- Solution: Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

**Error: Port 3000 already in use**
- Solution: Kill the process or use a different port:
  ```bash
  # Kill process on port 3000 (Windows)
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Or use different port
  npm run dev -- --port 3001
  ```

### Database Connection Issues

**Error: "Database not connected"**
- Verify Firebase service account JSON path is correct
- Check that Firestore is enabled in Firebase Console
- Ensure you have internet connection

### API Features Not Working

**Voice recording not working:**
- Check that DEEPGRAM_API_KEY is set in `.env`
- Restart backend after adding the key

**AI processing not working:**
- Check that GEMINI_API_KEY is set in `.env`
- Restart backend after adding the key

**Media upload not working:**
- Check that all Cloudinary credentials are set in `.env`
- Restart backend after adding credentials

---

## Development Workflow

### Making Changes

1. **Frontend changes:**
   - Edit files in `src/`
   - Vite will hot-reload automatically
   - Check browser console for errors

2. **Backend changes:**
   - Edit `backend_api.py` or related files
   - Restart the backend server (Ctrl+C, then `python backend_api.py`)

3. **Database schema changes:**
   - Update `seed_database.py`
   - Delete existing data in Firestore Console
   - Re-run seeding script

### Testing

1. **Manual testing:**
   - Test each user role
   - Test CRUD operations
   - Test AI features (if API keys configured)

2. **Check logs:**
   - Frontend: Browser DevTools Console
   - Backend: Terminal running `backend_api.py`

### Committing Changes

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

---

## Project Structure

```
jungle-safari/
├── backend_api.py              # Flask backend server
├── seed_database.py            # Database seeding script
├── zoo_model_1762023720806.py  # AI model for observations
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment template
├── package.json                # Node.js dependencies
├── vite.config.ts              # Vite configuration
├── src/
│   ├── App.tsx                 # Main React component
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   ├── components/             # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── ZookeeperDashboard.tsx
│   │   ├── VetDashboard.tsx
│   │   ├── OfficerDashboard.tsx
│   │   ├── DailyLogEntry.tsx
│   │   ├── AnimalProfile.tsx
│   │   ├── UserManagement.tsx
│   │   ├── InventoryManagement.tsx
│   │   ├── MedicationTracker.tsx
│   │   ├── TaskManagement.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── LandingPage.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── SOSModal.tsx
│   │   ├── mockData.ts
│   │   └── ui/                 # Reusable UI components
│   ├── utils/
│   │   └── exportUtils.ts      # CSV/PDF export utilities
│   └── public/
│       └── sw.js               # Service worker
└── API_DOCUMENTATION.md        # API reference
```

---

## Next Steps

1. **Customize the application:**
   - Update branding and colors
   - Add your own animals and data
   - Customize user roles and permissions

2. **Deploy to production:**
   - See deployment guide (coming soon)
   - Set up CI/CD pipeline
   - Configure production environment variables

3. **Add new features:**
   - Follow the existing code patterns
   - Test thoroughly before committing
   - Update documentation

---

## Getting Help

- **Documentation:** Check `API_DOCUMENTATION.md` for API reference
- **Issues:** Open an issue on GitHub
- **Community:** Join our Discord (link coming soon)

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Happy coding! 🦁🐯🐘🦒**
