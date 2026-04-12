# Kai — AI Integrated Chatbot

Kai is a modern AI-powered chatbot built with **Next.js** that provides an interactive chat experience with authentication, chat history, and email verification.

Designed to mimic real-world AI chat platforms, Kai focuses on clean UI, secure authentication, and persistent conversations.

---

# 🚀 Live Demo

**Try it here:**  
https://ai-integrated-chatbot-eta.vercel.app/login

> ⚠️ Email verification may take time because the project uses **SendGrid free tier**  
> 📩 Sometimes the verification email may appear in **Spam folder**

---

# ✨ Features

- 🤖 AI Chat Interface (ChatGPT-like UI)
- 🔐 User Authentication (Login / Register)
- 📧 Email Verification (SendGrid)
- 💬 Chat History Persistence
- 📁 Sidebar Chat Navigation
- 🌙 Dark Modern UI
- 🔒 Secure Authentication using NextAuth
- 🗄️ Database Storage with Neon
- 🚀 Deployed on Vercel

---

# 🧠 AI Assistant

The chatbot is named **Kai**, designed to:

- Answer questions
- Generate content
- Assist with coding
- Provide explanations
- General conversation

---

# 🛠️ Tech Stack

## Frontend
- Next.js
- React
- Tailwind CSS

## Backend
- Next.js API Routes

## Authentication
- NextAuth.js

## Database
- Neon PostgreSQL

## AI Integration
- Google API Key

## Email Service
- SendGrid (Web API Node)

## Deployment
- Vercel

---

# 📸 Screenshots

## Chat Interface

<img width="100%" alt="Chat UI" src="https://github.com/hemanth2k6/ai_integrated_chatbot/public/chat.jpeg" />

## Register Page

<img width="100%" alt="Register UI" src="https://github.com/hemanth2k6/ai_integrated_chatbot/public/register.jpeg" />

---

# 🏗️ Project Structure


ai_integrated_chatbot
│
├── app
│ ├── login
│ ├── register
│ ├── chat
│
├── components
│ ├── ChatUI
│ ├── Sidebar
│
├── lib
│ ├── auth
│ ├── db
│
├── api
│ ├── auth
│ ├── chat
│
└── .env.local


---

## ⚙️ Environment Variables

Create `.env.local`
NEXTAUTH_SECRET=
NEXTAUTH_URL=

DATABASE_URL=

GOOGLE_API_KEY=

SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=


---

## 📦 Installation

Clone the repository
git clone https://github.com/hemanth2k6/ai_integrated_chatbot.git


Install dependencies
npm install


Run development server
npm run dev


Open
localhost://3000/


---

## 🔐 Authentication Flow

User registers  
↓  
Email verification sent  
↓  
User verifies email  
↓  
Login  
↓  
Start chatting with Kai  

---

## 💡 Why This Project

This project demonstrates:

- Full-stack development
- Authentication systems
- AI integration
- Database management
- Production deployment
- Clean UI/UX

---

## 📈 Future Improvements

- Streaming AI responses
- File upload support
- Voice chat
- Multiple AI models
- Chat export
- Mobile optimization

---

## 👨‍💻 Author

Kalapati Hemanth

GitHub:  
https://github.com/hemanth2k6

---

## ⭐ Support

If you like this project, give it a star on GitHub.

---

## 📄 License

This project is open-source and available under the MIT License.