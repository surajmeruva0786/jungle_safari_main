# 🦁 Jungle Safari Zoo Management System

> A comprehensive, AI-powered zoo management application designed for modern Indian zoos. It features bilingual support (English/Hindi), voice-to-text logging, and intelligent animal health monitoring.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features by Role](#features-by-role)
- [Tech Stack](#tech-stack)
- [Architecture & AI Data Flow](#architecture--ai-data-flow)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## 🌟 Overview

The **Jungle Safari Zoo Management System** is a modern, full-stack web application built to streamline zoo operations. By breaking down communication barriers and digitizing paper logs, it provides zoo staff with powerful tools to monitor animal health, manage enclosures, and maintain comprehensive records—all through an intuitive, mobile-friendly interface.

### Key Highlights
- 🎙️ **Voice-to-Text Logs**: Zookeepers can record audio observations which are instantly transcribed and organized into structured data points.
- 📊 **Per-Animal Status Alarms**: Individual morning and evening log tracking for every animal.
- 🔔 **Emergency SOS**: Single-tap emergency alert system for forest and zoo incidents that notifies all active staff.
- 📱 **Mobile-First Design**: Responsive UI optimized for field workers using tablets or mobile devices.
- 🌍 **Bilingual Support**: Full English and Hindi translations toggleable in real-time.

---

## ✨ Features by Role

### 🐘 For Zookeepers
- **Daily Animal Monitoring**: Record daily observations via audio or text. Track feeding, health, behavior, and reproductive status.
- **Log Deadlines**: Automated 11 AM and 4 PM reminders with recurring alerts if logs aren't submitted.
- **Media Uploads**: Attach photos and visual evidence to daily reports.

### 🩺 For Vet Doctors
- **Hospital Records**: Direct access to animal medical histories and recent health alerts.
- **Medication Tracker**: Prescribe medications, view ongoing treatments, and track dosages.
- **Shared Logs**: Review detailed, AI-structured health reports escalated by Zookeepers.

### 🌲 For Forest Officers
- **Cost Analytics**: High-level statistical dashboard with feeding cost summaries and monthly estimates.
- **Inventory Management**: Track stock levels for meat, vegetables, and crucial zoo supplies.
- **Exporting**: Export CSV and PDF reports for official record-keeping.

### 👑 For Administrators
- **System Dashboard**: View overall zoological statistics (total animals, active alerts, species distributions).
- **Resource Management**: Add, edit, or remove staff members and animal profiles.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI & Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Backend
- **Framework**: Flask (Python) + Gunicorn
- **Database**: Google Cloud Firestore
- **AI/LLM**: Groq API (Fast, structured extraction from text)
- **Audio Transcription**: Deepgram API (High-accuracy Hindi/English voice-to-text)
- **Media Storage**: Cloudinary

---

## 🧠 Architecture & AI Data Flow

```text
┌────────────────────────┐         ┌────────────────────────┐
│  Zookeeper records     │         │   Flask Backend API    │
│  voice note in Hindi/  │ ──────> │   (Receives audio &    │
│  English on Frontend   │         │    forwards to APIs)   │
└────────────────────────┘         └────────────────────────┘
                                              │
                                              ▼
┌────────────────────────┐         ┌────────────────────────┐
│  Groq LLM extracts     │         │ Deepgram API processes │
│  health metrics &      │ <────── │ speech-to-text and     │
│  structures into JSON  │         │ returns transcript     │
└────────────────────────┘         └────────────────────────┘
            │
            ▼
┌────────────────────────┐
│ Saved to Firestore DB  │
│ & Displayed instantly  │
│ on Vet's Dashboard     │
└────────────────────────┘
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- Firebase Project (with Firestore enabled and a Service Account JSON key)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/jungle-safari.git
   cd jungle-safari
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**
   Duplicate `.env.example` to `.env` and fill in your keys (see next section).

5. **Run the Application**
   You need two terminal windows open:
   
   **Terminal 1 (Backend):**
   ```bash
   python backend_api.py
   # Runs on http://localhost:8080
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

---

## 🔐 Environment Variables

You need a `.env` file in the root directory to run both the frontend and backend. 

```env
# Path to your downloaded Firebase Admin SDK JSON file
GOOGLE_APPLICATION_CREDENTIALS=./jungle-safari-firebase-adminsdk.json

# AI APIs
GROQ_API_KEY=your_groq_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Cloudinary Media Storage (For uploading images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🌐 Deployment

This application is configured for a **100% free** full-stack deployment architecture:
- **Backend**: Hosted on [Render](https://render.com) using a Web Service.
- **Frontend**: Hosted on [Vercel](https://vercel.com) using Vite.

> **For detailed step-by-step instructions on deploying to production, please see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).**

---

## 📁 Project Structure

This project follows a clean, decoupled architecture within a single repository:

```text
jungle_safari_main/
├── src/                          # React Frontend Source Code
│   ├── components/               # All UI components (Dashboards, Modals)
│   │   ├── ui/                   # Reusable base components (Buttons, Inputs)
│   ├── App.tsx                   # Main Routing & State Provider
│   ├── config.ts                 # Frontend settings (API Base URL)
│   └── main.tsx                  # React Entry Point
│
├── backend_api.py                # Primary Flask API Server
├── zoo_model_1762023720806.py    # Backend Logic (Pydantic models, Groq integration)
├── requirements.txt              # Python Dependencies (Flask, gunicorn, etc)
├── package.json                  # Node Dependencies (React, Vite, Tailwind)
├── vite.config.ts                # Frontend Bundler Config
├── .env                          # Environment Variables (Ignored in Git)
├── DEPLOYMENT_GUIDE.md           # Step-by-Step Deployment Instructions
└── README.md                     # You are here!
```

---

<div align="center">

**Made for modern wildlife conservation.** 🌿

</div>