# 🏥 MediChain - Smart Medical Records Management System

![MediChain](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green.svg)

A comprehensive, secure, full-stack web application for managing medical records, prescriptions, appointments, and healthcare communication built with the MERN stack. MediChain enables patients to upload and manage their medical records securely, while doctors can access patient data, manage appointments, prescribe medications, and communicate with patients.

---

## ✨ Key Features

### 👩‍⚕️ For Patients
- 🔐 **Secure Authentication** - JWT-based authentication with optional 2FA
- 📤 **Upload Medical Reports** - Support for PDFs and images (up to 10MB)
- 📁 **Document Management** - View, download, and delete uploaded reports
- 📄 **PDF Export** - Export complete medical history to PDF
- 🔑 **Share Code System** - Generate unique codes to share data with doctors
- 💊 **Prescriptions** - View and manage doctor prescriptions
- 📅 **Appointments** - Book, view, and manage appointments with doctors
- 📊 **Health Metrics** - Track weight, blood pressure, heart rate, and blood sugar
- 🚨 **Emergency Contacts** - Manage emergency contact information
- 💬 **Messaging** - Direct communication with doctors
- ⭐ **Doctor Reviews** - Rate and review healthcare providers
- 🔔 **Notifications** - Real-time updates for appointments, prescriptions, and messages
- 📈 **Analytics** - Visual insights into health metrics and reports
- 🔒 **Two-Factor Authentication** - Enhanced account security
- 📋 **Activity Logs** - Track account activity and actions
- 🌙 **Dark Mode** - Eye-friendly theme option

### 🩺 For Doctors
- ✅ **Account Verification** - Admin-approved doctor accounts with ratings
- 🔍 **Patient Access** - View patient records using share codes
- 📝 **Add Medical Notes** - Document observations and recommendations
- 💊 **Prescriptions** - Create and manage patient prescriptions
- 📅 **Appointment Management** - View and manage patient appointments
- 💬 **Patient Communication** - Direct messaging with patients
- ⭐ **Reviews & Ratings** - View patient feedback and ratings
- 📊 **Patient Overview** - Complete medical history access
- 🏷️ **Status Management** - Mark reports as reviewed, pending, or urgent

### 🧑‍💻 For Admins
- 👥 **User Management** - View and manage all users
- ✔️ **Doctor Verification** - Approve or reject doctor registrations
- 📊 **Analytics Dashboard** - System-wide statistics and insights
- 🗂️ **Report Oversight** - Monitor all medical records
- 📋 **Audit Logs** - Complete system activity tracking
- 🔧 **System Configuration** - Full administrative controls

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling with custom animations
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Lucide React** - Extensive icon library
- **Vite** - Lightning-fast build tool
- **Code Splitting** - Lazy loading for optimized performance

### Backend
- **Node.js v22** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM with validation
- **GridFS** - Large file storage system
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing
- **NodeMailer** - Email service
- **Multer** - File upload handling
- **Speakeasy** - TOTP for 2FA
- **QRCode** - 2FA QR code generation
- **PDFKit** - PDF generation
- **Compression** - Gzip response compression

### Security
- **Helmet** - HTTP headers security
- **CORS** - Cross-origin protection
- **Rate Limiting** - DDoS protection
- **Input Validation** - Injection prevention
- **2FA Support** - Two-factor authentication
- **Audit Logging** - Complete activity tracking

---

## 📁 Project Structure

```
medichain/
├── backend/
│   ├── config/
│   │   └── db.js                      # Database configuration with pooling
│   ├── models/
│   │   ├── User.js                    # User model (Patient/Doctor/Admin)
│   │   ├── Report.js                  # Medical report model
│   │   ├── Remainder.js               # Medicine reminder model
│   │   ├── Notification.js            # Notification model
│   │   ├── EmergencyContact.js        # Emergency contacts model
│   │   ├── Appointment.js             # Appointments model
│   │   ├── HealthMetric.js            # Health metrics model
│   │   ├── ReportComment.js           # Report comments model
│   │   ├── Prescription.js            # Prescriptions model
│   │   ├── Review.js                  # Doctor reviews model
│   │   ├── Message.js                 # Messaging model
│   │   └── AuditLog.js                # Audit trail model
│   ├── controllers/
│   │   ├── authController.js          # Authentication logic
│   │   ├── reportController.js        # Report management
│   │   ├── adminController.js         # Admin functions
│   │   ├── reminderController.js      # Reminder management
│   │   ├── notificationController.js  # Notifications
│   │   ├── emergencyContactController.js
│   │   ├── appointmentController.js   # Appointments
│   │   ├── healthMetricController.js  # Health tracking
│   │   ├── prescriptionController.js  # Prescriptions
│   │   ├── reviewController.js        # Reviews
│   │   ├── messageController.js       # Messaging
│   │   ├── twoFactorController.js     # 2FA management
│   │   ├── auditLogController.js      # Audit logs
│   │   └── pdfController.js           # PDF export
│   ├── routes/
│   │   ├── auth.js                    # Auth routes
│   │   ├── reports.js                 # Report routes
│   │   ├── admin.js                   # Admin routes
│   │   ├── reminders.js               # Reminder routes
│   │   ├── notifications.js           # Notification routes
│   │   ├── emergencyContacts.js       # Emergency contacts
│   │   ├── appointments.js            # Appointment routes
│   │   ├── healthMetrics.js           # Health metrics
│   │   ├── comments.js                # Comments routes
│   │   ├── prescriptions.js           # Prescription routes
│   │   ├── reviews.js                 # Review routes
│   │   ├── messages.js                # Messaging routes
│   │   ├── twoFactor.js               # 2FA routes
│   │   └── auditLogs.js               # Audit log routes
│   ├── middleware/
│   │   ├── auth.js                    # JWT verification & authorization
│   │   ├── upload.js                  # File upload handling
│   │   └── auditLog.js                # Audit logging middleware
│   ├── utils/
│   │   └── sendEmail.js               # Email utilities
│   ├── .env                           # Environment variables
│   ├── server.js                      # Entry point
│   └── package.json                   # Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx             # Navigation bar with dark mode
    │   ├── pages/
    │   │   ├── Login.jsx              # Login page
    │   │   ├── Register.jsx           # Registration
    │   │   ├── PatientDashboard.jsx   # Patient dashboard
    │   │   ├── DoctorDashboard.jsx    # Doctor dashboard
    │   │   ├── AdminDashboard.jsx     # Admin dashboard
    │   │   ├── ReportUpload.jsx       # Upload reports
    │   │   ├── ReportList.jsx         # View reports
    │   │   ├── Reminders.jsx          # Medicine reminders
    │   │   ├── AccessReports.jsx      # Doctor access
    │   │   ├── Profile.jsx            # User profile
    │   │   ├── Notifications.jsx      # Notifications center
    │   │   ├── Analytics.jsx          # Analytics dashboard
    │   │   ├── EmergencyContacts.jsx  # Emergency contacts
    │   │   ├── Appointments.jsx       # Appointment management
    │   │   ├── HealthMetrics.jsx      # Health tracking
    │   │   ├── Prescriptions.jsx      # Prescription management
    │   │   ├── Reviews.jsx            # Doctor reviews
    │   │   ├── Messages.jsx           # Messaging system
    │   │   ├── TwoFactorAuth.jsx      # 2FA settings
    │   │   └── ActivityLogs.jsx       # Activity tracking
    │   ├── context/
    │   │   ├── AuthContext.jsx        # Global auth state
    │   │   └── ThemeContext.jsx       # Theme management
    │   ├── App.jsx                    # Main app with routing
    │   └── main.jsx                   # Entry point
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
```bash
node -v  # v16 or higher (tested on v22.17.1)
npm -v   # v8 or higher
mongod --version  # v5 or higher
```

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/medichain.git
cd medichain
```

### 2. Setup Backend
```bash
cd backend
npm install
# Edit .env with your configuration
npm run dev  # or node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000 (or 3001 if 3000 is in use)
- Backend API: http://localhost:5000

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medichain

# JWT
JWT_SECRET=abhi
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=abhishek

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## 🎯 New Features in v2.0

### 🔐 Security Enhancements
- **Two-Factor Authentication (2FA)** - TOTP-based 2FA with QR code setup
- **Audit Logging** - Complete activity tracking for all user actions
- **Enhanced Password Security** - Improved password hashing and validation

### 📄 Document Management
- **PDF Export** - Export complete medical records to professionally formatted PDFs
- **Batch Operations** - Export all reports, prescriptions, and health metrics at once
- **Single Report Export** - Export individual reports to PDF

### 💬 Communication
- **Real-time Messaging** - Direct communication between patients and doctors
- **Unread Message Tracking** - Never miss important messages
- **Conversation Management** - Organized message threads

### 📊 Health Tracking
- **Health Metrics** - Track vital signs and measurements
- **Visual Analytics** - Charts and graphs for health trends
- **Prescription Management** - Complete medication tracking
- **Appointment System** - Book and manage appointments (in-person, video, phone)

### ⭐ Reviews & Ratings
- **Doctor Reviews** - Patients can rate and review doctors
- **Rating System** - 5-star rating with detailed feedback
- **Review Categories** - Rate consultation, treatment, bedside manner, and punctuality

### 🎨 UI/UX Improvements
- **Dark Mode** - Eye-friendly dark theme option
- **Responsive Design** - Optimized for all screen sizes
- **Modern Animations** - Smooth transitions and effects
- **Glass Morphism** - Modern UI design patterns

### ⚡ Performance
- **Code Splitting** - Lazy loading for faster initial load
- **Compression** - Gzip compression for API responses
- **Connection Pooling** - Optimized database connections
- **Lean Queries** - Faster MongoDB queries

---

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "shareCode": "A1B2C3D4"
  }
}
```

### Report Endpoints

#### Upload Report (Patient)
```http
POST /api/reports/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": [binary file],
  "title": "Blood Test Report",
  "description": "Routine checkup",
  "reportType": "lab-report",
  "tags": "blood,routine"
}
```

#### Access Reports (Doctor)
```http
POST /api/reports/access
Authorization: Bearer {token}
Content-Type: application/json

{
  "shareCode": "A1B2C3D4"
}

Response:
{
  "success": true,
  "patient": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "reports": [...]
}
```

---

## 🎨 Screenshots

### Patient Dashboard
![Patient Dashboard](https://via.placeholder.com/800x400?text=Patient+Dashboard)

### Doctor Access Portal
![Doctor Portal](https://via.placeholder.com/800x400?text=Doctor+Portal)

### Admin Panel
![Admin Panel](https://via.placeholder.com/800x400?text=Admin+Panel)

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configured origins
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - Server-side validation
- **File Type Validation** - Only PDF, JPG, PNG allowed
- **File Size Limits** - Maximum 10MB per file
- **XSS Protection** - Helmet security headers
- **HTTPS Ready** - Production SSL support

---

## 📧 Email Templates

MediChain includes professional email templates for:
- Welcome emails
- Doctor verification
- Medicine reminders
- Password reset
- Report access notifications

---

## 🧪 Testing

### Test User Accounts

Create test accounts for each role:

**Patient**
```bash
Email: patient@test.com
Password: password123
```

**Doctor**
```bash
Email: doctor@test.com
Password: password123
```

**Admin**
```bash
Email: admin@test.com
Password: password123
```

---

## 🐛 Known Issues & Limitations

- Email reminders require cron job setup
- File downloads may timeout for large files on slow connections
- Maximum 50 reports displayed in admin panel
- Share codes are permanent (no expiration)

---

## 🚀 Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] AI-powered prescription analysis (OpenAI)
- [ ] Video consultation integration
- [ ] Mobile app (React Native)
- [ ] Blockchain for immutable records
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export to PDF functionality
- [ ] Appointment scheduling
- [ ] Insurance integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Medical icons from [Lucide](https://lucide.dev/)

---

## 📞 Support

For issues and questions:
- 📫 Email: support@medichain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/medichain/issues)
- 📖 Docs: [Full Documentation](https://docs.medichain.com)

---

## ⭐ Star this repository

If you found this project helpful, please give it a ⭐!