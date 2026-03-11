# 🦁 Jungle Safari Zoo Management System

> A comprehensive, AI-powered zoo management application designed for Indian zoos, featuring bilingual support (English/Hindi), audio transcription, and intelligent animal monitoring.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The **Jungle Safari Zoo Management System** is a modern, full-stack web application built to streamline zoo operations in India. It provides zookeepers and administrators with powerful tools to monitor animal health, manage enclosures, and maintain comprehensive records—all through an intuitive, mobile-friendly interface.

### Key Highlights

- 📊 **Per-Animal Status Alarms**: Individual morning and evening log tracking for every animal
- 🔔 **Deadline Notifications**: Automated reminders at 11 AM and 4 PM with recurring 30-minute alerts
- 🆘 **Emergency SOS**: Single-tap emergency alert system for forest and zoo incidents
- 📱 **Mobile-First Design**: Responsive UI optimized for field use
- 🔒 **Role-Based Access**: Specialized dashboards for Admin, Zookeepers, Vets, and Forest Officers
- 📸 **Media Management**: Upload and store photos/videos via Cloudinary
- 📈 **Analytics Dashboard**: Real-time insights and statistics

---

## ✨ Features

### For Zookeepers

- **Animal Monitoring**
  - Record daily observations via audio or text
  - Track feeding, health, behavior, and reproductive status
  - **Per-Animal Log Alarms**: Visual indicators (Checkmarks/Clocks) for morning/evening status
  - **Log Deadlines**: Automated 11 AM and 4 PM reminders with recurring alerts
  - Upload photos and videos
  - View historical logs with calendar interface

- **Emergency & Communication**
  - **SOS Alert System**: Instant emergency notifications to all departments
  - **Messaging Interface**: Secure communication between zookeepers and vets
  - **Hospital Records**: Direct access to animal medical history and reports

### For Administrators

- **Dashboard Analytics**
  - Total animals, active logs, health alerts
  - Species distribution charts
  - Recent activity feed
  - System health monitoring

- **Animal Management**
  - Add/edit/delete animals
  - Assign zookeepers
  - View complete animal profiles
  - Export reports

- **User Management**
  - Create zookeeper accounts
  - Manage permissions
  - Track user activity
  - Reset passwords

- **System Configuration**
  - Configure AI models
  - Manage API keys
  - Set up notifications
  - Customize workflows

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Media Recording**: react-media-recorder
- **Charts**: Recharts
- **3D Graphics**: Three.js with React Three Fiber

### Backend

- **Framework**: Flask (Python)
- **Database**: Google Cloud Firestore
- **AI/ML**: Google Gemini 1.5 Flash
- **Audio Transcription**: Deepgram API, Groq Whisper (fallback)
- **Media Storage**: Cloudinary
- **Authentication**: Firebase Auth
- **CORS**: Flask-CORS

### DevOps & Deployment

- **Hosting**: Render (Backend), Vercel (Frontend)
- **Version Control**: Git & GitHub
- **CI/CD**: Automatic deployment via GitHub integration
- **Monitoring**: UptimeRobot
- **Environment**: dotenv for configuration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React SPA)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │   Add Log    │  │  Log History │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Flask API)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth Routes │  │ Animal Routes│  │  Log Routes  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Firestore  │ │ Google Gemini│ │  Cloudinary  │
│   Database   │ │   AI Model   │ │ Media Storage│
└──────────────┘ └──────────────┘ └──────────────┘
         ▲               ▲
         │               │
         └───────────────┘
              Deepgram/Groq
           Audio Transcription
```

### Data Flow

1. **User Input**: Zookeeper records audio observation or enters text
2. **Transcription**: Audio sent to Deepgram/Groq for Hindi/English transcription
3. **AI Extraction**: Transcribed text sent to Google Gemini for structured data extraction
4. **Storage**: Structured data + media saved to Firestore + Cloudinary
5. **Display**: Frontend fetches and displays logs with collapsible sections

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.9+
- Firebase project with Firestore enabled
- API keys for:
  - Google Gemini
  - Deepgram (optional)
  - Groq (optional)
  - Cloudinary

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhi241-bot/jungle-safari.git
   cd jungle-safari
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (see Environment Variables section)
   ```

5. **Initialize Firebase**
   - Download your Firebase service account JSON
   - Place it in the root directory
   - Update `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

6. **Seed the database** (optional)
   ```bash
   python seed_database.py
   ```

### Running Locally

**Development Mode:**

```bash
# Terminal 1 - Backend
python backend_api.py

# Terminal 2 - Frontend
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Audio Transcription (Optional)
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend API URL
VITE_API_BASE_URL=http://localhost:5000
```

> **Note**: See `.env.example` for a complete template with descriptions.

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://your-backend.onrender.com`

### Authentication

All API requests require a valid user session. Authentication is handled via Firebase Auth tokens.

### Endpoints

#### Animals

```http
GET    /api/animals              # Get all animals
GET    /api/animals/:id          # Get animal by ID
POST   /api/animals              # Create new animal
PUT    /api/animals/:id          # Update animal
DELETE /api/animals/:id          # Delete animal
```

#### Logs

```http
GET    /api/logs                 # Get all logs (with filters)
GET    /api/logs/:id             # Get log by ID
POST   /api/logs                 # Create new log
PUT    /api/logs/:id             # Update log
DELETE /api/logs/:id             # Delete log
POST   /api/transcribe           # Transcribe audio
POST   /api/extract-monitoring   # Extract structured data
```

#### Users

```http
GET    /api/users                # Get all users
GET    /api/users/:id            # Get user by ID
POST   /api/users                # Create new user
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
```

> **Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🌐 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backend_api.py`
   - **Environment**: Python 3.9+
4. Add environment variables from `.env`
5. Deploy

### Frontend (Vercel)

1. Import project from GitHub
2. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable: `VITE_API_BASE_URL`
4. Deploy

> **Detailed Deployment Guide**: See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

---

## 📁 Project Structure

```
jungle-safari/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Dashboard.tsx         # Admin dashboard
│   │   ├── AddLog.tsx            # Log creation form
│   │   ├── LogHistory.tsx        # Log viewing interface
│   │   ├── LogDetailsSections.tsx # Collapsible log display
│   │   ├── ui/                   # Reusable UI components
│   │   └── figma/                # Design system components
│   ├── App.tsx                   # Main app component
│   ├── config.ts                 # Frontend configuration
│   └── main.tsx                  # App entry point
│
├── backend_api.py                # Flask backend server
├── zoo_model_1762023720806.py    # Pydantic models & AI logic
├── seed_database.py              # Database seeding script
│
├── public/                       # Static assets
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies
├── vite.config.ts                # Vite configuration
├── render.yaml                   # Render deployment config
│
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
│
├── API_DOCUMENTATION.md          # API reference
├── SETUP_GUIDE.md                # Setup instructions
├── USER_MANUAL.md                # User guide
├── PRODUCTION_DEPLOYMENT.md      # Deployment guide
└── README.md                     # This file
```

---

## 🎯 Key Features Explained

### 1. Comprehensive Log Questions

The system uses a structured format with 15 questions organized into 2 sections:

**Section A: Daily Animal Health (7 questions)**
1. Feeding & Drinking
2. Health & Physical Condition
3. Behaviour & Activity Level
4. Reproductive Status
5. Mortality / Critical Condition
6. Hygiene, Pest & Safety Check
7. Additional Observations

**Enclosure Report (8 questions)**
1. Overall Cleanliness & Waste Management
2. Water & Sanitation
3. Fencing, Cages & Locking Systems
4. Moat & Physical Barrier Condition
5. Pest, Vector & Hygiene Control
6. Staff Uniform, Attendance & Health
7. Final Safety Verification
8. Remarks / Follow-up Required

### 2. AI-Powered Data Extraction

The system uses Google Gemini 1.5 Flash to:
- Parse audio transcriptions
- Extract 35+ structured fields
- Handle Hindi/English/mixed language
- Provide intelligent defaults
- Validate data consistency

### 3. Collapsible UI Design

Logs are displayed with:
- **Blue Box**: Raw observation text
- **Gray Box**: Metadata (date, signature)
- **Green Section**: Animal Health (collapsible, open by default)
- **Amber Section**: Enclosure Report (collapsible, closed by default)
- **Visual Indicators**: ✓ for yes/normal, ✗ for no/problem

---

### 3. Per-Animal Status Alarms & Smart Deadlines

The system moves beyond global tracking to individual animal monitoring:
- **Individual Clocks/Checkmarks**: Each animal card independently tracks its morning and evening log status.
- **Smart Time Windows**: 
  - **Morning Slot**: Logs submitted before 2 PM update `lastMorningCheck`.
  - **Evening Slot**: Logs submitted after 2 PM update `lastEveningCheck`.
- **Automated Deadlines**:
  - **11:00 AM**: Primary morning log deadline.
  - **4:00 PM**: Primary evening log deadline.
- **Recurring Notifications**: If a deadline is missed, the system triggers a localized warning notification every **30 minutes** until the required logs are submitted.

---

## 🧪 Testing

### Run Tests Locally

```bash
# Frontend tests
npm test

# Backend tests
python -m pytest

# Integration tests
npm run test:e2e
```

### Manual Testing Checklist

- [ ] User authentication (login/logout)
- [ ] Animal CRUD operations
- [ ] Audio recording and transcription
- [ ] AI data extraction accuracy
- [ ] Log creation and viewing
- [ ] Image/video upload
- [ ] Calendar navigation
- [ ] Language switching
- [ ] Mobile responsiveness
- [ ] Dark mode

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: PEP 8 (Python)
- **Commits**: Conventional Commits format

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Abhishek** - *Initial work* - [@Abhi241-bot](https://github.com/Abhi241-bot)

---

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Google Gemini** for AI capabilities
- **Deepgram** for audio transcription
- **Cloudinary** for media management
- **Firebase** for backend infrastructure

---

## 📞 Support

For support, email [your-email@example.com] or open an issue on GitHub.

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] **Mobile App**: Native iOS/Android apps
- [ ] **Offline Mode**: PWA with offline sync
- [ ] **Advanced Analytics**: ML-powered insights
- [ ] **Multi-Zoo Support**: Manage multiple locations
- [ ] **Veterinary Integration**: Medical records and prescriptions
- [ ] **Automated Alerts**: SMS/email notifications
- [ ] **Export Reports**: PDF/Excel generation
- [ ] **API Webhooks**: Third-party integrations
- [ ] **Voice Commands**: Hands-free operation
- [ ] **AR Features**: Augmented reality for enclosure planning

---

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: February 2026

### Recent Updates

- ✅ **Per-Animal Log Alarms**: Implemented unique morning/evening tracking for every animal
- ✅ **Deadline Notifications**: Added 11 AM and 4 PM automated reminders with 30-min recursion
- ✅ **Emergency SOS System**: Integrated instant SOS alerting for field incidents
- ✅ **UI Optimization**: Streamlined dashboard by removing redundant widgets
- ✅ Implemented comprehensive log questions (35+ fields)
- ✅ Added collapsible sections for better UX
- ✅ Integrated Groq Whisper as Deepgram fallback
- ✅ Deployed to production (Render + Vercel)

---

## 🔗 Links

- **Live Demo**: [https://jungle-safari.vercel.app](https://jungle-safari.vercel.app)
- **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **User Manual**: [USER_MANUAL.md](./USER_MANUAL.md)
- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **GitHub**: [https://github.com/Abhi241-bot/jungle-safari](https://github.com/Abhi241-bot/jungle-safari)

---

<div align="center">

**Made with ❤️ for Indian Zoos**

⭐ Star this repo if you find it helpful!

</div>