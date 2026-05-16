# Quick Start Guide - UAReady Email Validator

## 🚀 Get Started in 2 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
✓ UAReady Email Validator running on http://localhost:3000
✓ Open http://localhost:3000 in your browser
```

### Step 3: Open in Browser
```
http://localhost:3000
```

---

## 💡 Quick Usage

### Web Interface
1. Choose **Email Validator** or **Domain Validator** tab
2. Enter an international email address or domain
3. Click **Validate Email** or **Validate Domain**
4. See instant results with ACE format and standards compliance info

### Test Data to Copy/Paste

**Nepali:**
- Email: राम@नेपाल.नेपाल
- Domain: नेपाल.नेपाल

**Arabic:**
- Email: مثال@ايميل.الامارات
- Domain: ايميل.الامارات

**Chinese:**
- Email: 用户@中文.中国
- Domain: 中文.中国

**Russian:**
- Email: пользователь@пример.рф
- Domain: пример.рф

---

## 🧪 Run Tests

```bash
npm test
```

Runs 20+ test cases validating SMTPUTF8, EAI, and IDNA2008 compliance.

---

## 🔗 API Usage

### Validate Email (cURL)
```bash
curl -X POST http://localhost:3000/api/validate-email \
  -H "Content-Type: application/json" \
  -d '{"email":"राम@नेपाल.नेपाल"}'
```

### Validate Domain (cURL)
```bash
curl -X POST http://localhost:3000/api/validate-domain \
  -H "Content-Type: application/json" \
  -d '{"domain":"नेपाल.नेपाल"}'
```

### Batch Validation (cURL)
```bash
curl -X POST http://localhost:3000/api/validate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["राम@नेपाल.नेपाल", "user@example.com"],
    "domains": ["नेपाल.नेपाल", "example.com"]
  }'
```

---

## 📁 Project Files

```
project/
├── server.js          - Backend (Express + validation logic)
├── public/
│   └── index.html     - Web UI
├── test.js            - Test suite
├── package.json       - Dependencies
├── README.md          - Full documentation
├── PRESENTATION.md    - Hackathon slides
└── QUICK_START.md     - This file
```

---

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Find process using port 3000 and kill it
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

**Module not found?**
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

**CORS errors?**
- Already handled! CORS is enabled in server.js

---

## ✨ Features

✅ Real-time validation  
✅ Support for 6+ scripts  
✅ SMTPUTF8 & EAI compliance  
✅ IDNA2008 encoding  
✅ Clear error messages  
✅ Fast API (<5ms/request)  
✅ Mobile responsive UI

---

## 🎓 Learn More

- Full README: Read [README.md](README.md)
- Presentation: Read [PRESENTATION.md](PRESENTATION.md)
- Standards: https://www.icann.org/ (IDNA info)
- RFC 6531: SMTPUTF8 Email Protocol
- RFC 6532: Email Address Internationalization

---

**Happy Validating!** 🎉
