# 🦁 Jungle Safari - Smart Zoo Management System

A comprehensive, mobile-first web application designed for zookeepers, veterinarians, administrators, and forest officers to monitor and manage animal care in real-time.

![Jungle Safari](https://img.shields.io/badge/Version-1.0.0-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Overview

Jungle Safari is a sophisticated zoo management platform that enables field staff to efficiently track animal health, feeding schedules, medical treatments, and daily observations. Built with a nature-inspired design featuring vibrant emerald, teal, orange, and amber gradients, the app provides an intuitive, touch-optimized interface for real-world zoo operations.

## ✨ Key Features

### 🎯 Core Functionality
- **📝 Daily Logging** - Voice recording with waveform animations for quick field notes
- **🏥 Health Monitoring** - Real-time health assessments with mood, appetite, and movement tracking
- **🚨 SOS Emergency Alerts** - Quick access emergency notification system
- **🔐 Role-Based Access Control** - Four distinct user roles with custom permissions
- **🌍 Bilingual Support** - Full English and Hindi language support
- **🌙 Dark Mode** - Eye-friendly dark theme support

### 💊 Advanced Features
- **Medication & Treatment Tracker** - Comprehensive prescription and dosage management
- **📦 Inventory Management** - Track food supplies, medical items, and equipment
- **✅ Task Management** - Assign and monitor daily tasks across teams
- **📊 Export Utilities** - Generate CSV and PDF reports
- **🔔 Push Notifications** - Real-time alerts and updates
- **📸 Media Upload** - Image and video documentation support

## 👥 User Roles

### 🦺 Zookeeper
- Daily animal observations
- Voice note recording
- Health assessments
- Task completion
- Access to assigned animals

### 👨‍⚕️ Vet Doctor
- Medical prescriptions
- Health reports review
- Treatment history
- Medication tracking
- All animal health data access

### 👔 Admin
- User management
- System oversight
- Animal database management
- Access control configuration
- Comprehensive reporting

### 🌲 Forest Officer
- Feeding records management
- Cost tracking
- Supply inventory
- Budget reporting
- Export functionality

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom component library + shadcn/ui
- **Animations**: Motion (Framer Motion)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Recharts
- **Toast Notifications**: Sonner
- **Form Handling**: React Hook Form + Zod validation

## 📁 Project Structure

```
jungle-safari/
├── App.tsx                          # Main application entry
├── components/
│   ├── AdminDashboard.tsx           # Admin control panel
│   ├── ZookeeperDashboard.tsx       # Zookeeper interface
│   ├── VetDashboard.tsx             # Veterinarian interface
│   ├── OfficerDashboard.tsx         # Forest officer interface
│   ├── DailyLogEntry.tsx            # Daily observation logger
│   ├── AnimalProfile.tsx            # Animal detail view
│   ├── AnimalCard.tsx               # Animal list card component
│   ├── MedicationTracker.tsx        # Medical treatment management
│   ├── InventoryManagement.tsx      # Supply tracking
│   ├── TaskManagement.tsx           # Task assignment system
│   ├── UserManagement.tsx           # User administration
│   ├── SOSModal.tsx                 # Emergency alert system
│   ├── SettingsScreen.tsx           # App settings
│   ├── LandingPage.tsx              # Animated splash screen
│   ├── LoginScreen.tsx              # Authentication
│   ├── NotificationsManager.tsx     # Push notification handler
│   ├── mockData.ts                  # Sample data & translations
│   ├── ui/                          # Reusable UI components
│   └── figma/
│       └── ImageWithFallback.tsx    # Image loading component
├── utils/
│   ├── exportUtils.ts               # CSV/PDF export functions
│   └── supabase/
│       └── info.tsx                 # Backend configuration
├── styles/
│   └── globals.css                  # Global styles & design tokens
├── public/
│   └── sw.js                        # Service worker for PWA
└── supabase/
    └── functions/
        └── server/                  # Backend server functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Abhi241-bot/JungleSafariUI1.git
cd JungleSafariUI1
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🔑 Demo Credentials

### Zookeeper
- **Name**: Rajesh Kumar
- **Password**: zoo123

### Admin
- **Name**: Priya Sharma
- **Password**: admin123

### Vet Doctor
- **Name**: Dr. Anjali Verma
- **Password**: vet123

### Forest Officer
- **Name**: Vikram Singh
- **Password**: officer123

## 🎨 Design System

### Color Palette
- **Primary Green**: Emerald tones for zookeeper features
- **Medical Blue**: Cyan/Blue for veterinary functions
- **Admin Amber**: Warm orange/amber for administration
- **Officer Purple**: Purple tones for forest officer tools
- **Accent Colors**: Teal, orange, and nature-inspired gradients

### Typography
- Clean, readable fonts optimized for mobile
- Large touch targets (minimum 44px)
- High contrast for outdoor visibility

### Animations
- Smooth transitions with Motion
- Micro-interactions for user feedback
- Loading states and skeleton screens

## 📱 Mobile-First Design

- ✅ Touch-optimized interface
- ✅ Responsive layouts for all screen sizes
- ✅ Gesture-based navigation
- ✅ Offline-capable with service workers
- ✅ Progressive Web App (PWA) ready

## 🔮 Future Enhancements

- [ ] Firebase integration for real-time sync
- [ ] Offline data persistence
- [ ] Advanced analytics dashboard
- [ ] QR code animal identification
- [ ] GPS-based location tracking
- [ ] Multi-zoo support
- [ ] Data visualization improvements
- [ ] Enhanced reporting capabilities

## 📄 Documentation

- [NEW_FEATURES.md](./NEW_FEATURES.md) - Detailed feature documentation
- [Attributions.md](./Attributions.md) - Asset credits and licenses
- [guidelines/Guidelines.md](./guidelines/Guidelines.md) - Development guidelines

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Abhishek**
- GitHub: [@Abhi241-bot](https://github.com/Abhi241-bot)

## 🙏 Acknowledgments

- shadcn/ui for the beautiful component library
- Lucide for the icon set
- Unsplash for placeholder images
- The open-source community

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ for wildlife conservation and zoo management**

🦁 🐯 🐘 🦒 🦓 🐻 🦌 🦘
