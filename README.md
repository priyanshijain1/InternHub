# InternHub 🚀

InternHub is a full-stack web platform that helps students organize and track their internship applications in one place. Instead of managing scattered spreadsheets, emails, or notes, InternHub provides a centralized dashboard where users can track application progress, maintain their profile, and manage resumes efficiently.

The platform allows users to create an account, build their professional profile, upload resumes, and track internship applications across multiple companies. Each application can be categorized by status (Applied, Interviewing, Offer, Rejected, or Ghosted), helping users maintain a clear overview of their internship search pipeline.

InternHub demonstrates real-world full-stack development concepts including authentication systems, REST API integration, session persistence, and database-driven application management.

---

# ✨ Features

### 📬 Gmail Internship Detection

* Connect Gmail using OAuth
* Scan inbox for internship-related emails
* Automatically detect:

  * Online Assessments (OA)
  * Interviews
  * Offers
  * Rejections
* Updates the application tracker automatically

### 📊 Application Tracker

* Track internship applications
* Update status:

  * Applied
  * Interviewing
  * Offer
  * Rejected
  * Ghosted
* Dashboard statistics and pipeline view

### 🛡 TruthLens – Scam Detection

* Analyze internship listings
* Detect suspicious patterns:

  * Upfront payment requests
  * Unverified domains
  * Unrealistic salary claims
* Community reporting system

### 👤 User Profiles

* Secure authentication
* Resume storage
* Skills & preferences

---

# 🏗 Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend

* FastAPI
* SQLAlchemy
* Gmail API
* Google OAuth

### AI & Analysis

* Gemini API (for advanced email parsing)
* Custom rule-based NLP parser

### Database

* SQLite (development)
* Easily replaceable with PostgreSQL

---

# ⚙️ Backend Setup

## 1️⃣ Clone the Repository

```
git clone https://github.com/yourusername/internhub.git
cd internhub/backend
```

---

## 2️⃣ Create Virtual Environment

```
python -m venv venv
```

Activate it:

### Windows

```
venv\Scripts\activate
```

### Mac/Linux

```
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```
pip install -r requirements.txt
```

If requirements file is missing, install manually:

```
pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install python-dotenv
pip install google-auth
pip install google-auth-oauthlib
pip install google-api-python-client
pip install python-jose
pip install passlib[bcrypt]
pip install google-generativeai
```

---

## 4️⃣ Environment Variables

InternHub requires several environment variables for authentication, database configuration, Gmail integration, and AI-powered email parsing.

Create a `.env` file inside the **backend** directory.

Example `.env` file:

```
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120

DATABASE_URL=sqlite:///./internhub.db

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback

FERNET_SECRET_KEY=your_fernet_secret_key
```

---

## 🔑 Generating Secure Keys

### Generate a JWT Secret Key

Run this in Python:

```
import secrets
print(secrets.token_hex(32))
```

---

### Generate a Fernet Encryption Key

```
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```
---

## 5️⃣ Google OAuth Setup

1. Go to Google Cloud Console
2. Create a project
3. Enable **Gmail API**
4. Create **OAuth Client ID**
5. Add redirect URI:

```
http://localhost:8000/api/gmail/callback
```

Download credentials and configure `.env`.

---

## 6️⃣ Run Backend Server

```
uvicorn main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

Swagger API docs available at:

```
http://127.0.0.1:8000/docs
```

---

# 🎨 Frontend Setup

Navigate to frontend folder:

```
cd ../frontend
```

Install dependencies:

```
npm install
```

Run frontend:

```
npm run dev
```

Frontend will start at:

```
http://localhost:5173
```

---

# 🔐 Gmail Integration Flow

1. User clicks **Connect Gmail**
2. OAuth authentication with Google
3. Backend stores encrypted refresh token
4. InternHub scans inbox for internship updates
5. Tracker automatically updates application status

---

# 🚀 Future Improvements

* Gmail real-time email detection
* AI resume optimization
* Internship recommendation system
* Chrome extension for quick job analysis

---

# ⭐ If you like this project

Consider giving it a star on GitHub!

