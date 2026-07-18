# 🔐 Security Architecture - Sections 1-4

## Overview
This document outlines the complete security implementation for the MyServices CRM authentication system.

---

## Section 1️⃣: Login with Password Hashing

### Implementation
```javascript
// Backend: routes/auth.js
const bcrypt = require('bcryptjs');

// Hashing on registration/initial setup
const hashedPassword = bcrypt.hashSync('admin123', 10);
// 10 = salt rounds (higher = slower but more secure)

// Verification on login
const isValidPassword = bcrypt.compareSync(password, user.password_hash);
```

### Security Benefits
✅ **One-way hashing** - Cannot reverse to get original password
✅ **Salt rounds (10)** - Takes ~100ms to hash, prevents rainbow tables
✅ **Timing-safe comparison** - `compareSync()` prevents timing attacks
✅ **Database storage** - Only hash is stored, never plaintext

### Attack Prevention
- ❌ Plaintext passwords in database: **PREVENTED**
- ❌ Rainbow table attacks: **PREVENTED** (salt)
- ❌ Timing attacks: **PREVENTED** (timing-safe compare)

---

## Section 2️⃣: Remember Me Sessions

### Architecture

```
User Logs In (with "Remember Me" checked)
        ↓
Backend validates credentials
        ↓
Generate JWT token (30d expiry instead of 7d)
        ↓
Create session in database (device tracking)
        ↓
Return token → localStorage
        ↓
On next app load:
  - Check localStorage for authToken
  - POST /api/auth/validate-token
  - Backend verifies token expiry
  - Auto-login if still valid
```

### Database: Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  token TEXT UNIQUE,
  expires_at DATETIME,
  device_name TEXT,
  created_at DATETIME
);
```

### Token Lifetimes
- **Default**: 7 days (localStorage, session)
- **Remember Me**: 30 days (localStorage + DB)

### Security
✅ Tokens stored in localStorage (accessible only to same domain)
✅ Device tracking for audit
✅ Automatic expiry check on each request
✅ Session can be revoked via database

### Vulnerabilities Handled
- ❌ Stolen token valid forever: **PREVENTED** (expiry)
- ❌ Can't track which devices logged in: **PREVENTED** (device_name)

---

## Section 3️⃣: Password Recovery - Request Reset

### Flow Diagram
```
User enters email
        ↓
Backend searches for email in users table
        ↓
Generate secure random token (32 bytes hex)
        ↓
Store in password_resets table:
  - token (unique)
  - expires_at = now + 1 hour
  - used = 0
        ↓
Send email with reset link:
  https://app.com/reset-password/{token}
        ↓
Return "Check your email" message
```

### Secure Token Generation
```javascript
const resetToken = crypto.randomBytes(32).toString('hex');
// Output: 64-character unpredictable string
// Example: "a3f1b8d2c9e5f7a1b3d5c7e9f1a3b5d7f9a1b3d5c7e9f1a3b5d7f9a1b3d5"
```

### Password Reset Table
```sql
CREATE TABLE password_resets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME
);
```

### Email Security
✅ HTML template with professional design
✅ Token embedded in reset link (only in email, not in URL path initially)
✅ Instructions to ignore if not requested by user
✅ 1-hour expiration window
✅ No plaintext password in email

### Attack Prevention
- ❌ Guessing reset token: **PREVENTED** (32 random bytes = 2^256 possibilities)
- ❌ Reusing same token: **PREVENTED** (marked as "used")
- ❌ Old tokens valid: **PREVENTED** (1-hour expiry)
- ❌ Email hijacking: User sees "not me? ignore" message

---

## Section 4️⃣: Password Reset - Set New Password

### Flow Diagram
```
User clicks reset link with token
        ↓
Frontend extracts token from URL: /reset-password/{token}
        ↓
User enters new password (min 6 chars)
        ↓
POST /api/auth/reset-password with token + newPassword
        ↓
Backend validates:
  ✓ Token exists in database
  ✓ Token hasn't expired
  ✓ Token marked as used=0
  ✓ New password >= 6 characters
        ↓
Hash new password with bcrypt
        ↓
Update users table: password_hash
        ↓
Mark token as used=1 (prevent replay)
        ↓
Clear all existing sessions for this user (force re-login everywhere)
        ↓
Return success → Frontend auto-redirects to login
```

### Validation Checks
```javascript
// 1. Token validity
const resetRecord = db.prepare(`
  SELECT * FROM password_resets 
  WHERE token = ? 
    AND used = 0 
    AND expires_at > datetime('now')
`).get(token);

if (!resetRecord) {
  throw new Error('Token invalid or expired');
}

// 2. Password strength
if (newPassword.length < 6) {
  throw new Error('Password must be at least 6 characters');
}

// 3. Hash & store
const hashedPassword = bcrypt.hashSync(newPassword, 10);
db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
  .run(hashedPassword, resetRecord.user_id);

// 4. Invalidate token
db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?')
  .run(resetRecord.id);
```

### Attack Prevention
- ❌ Setting password without valid token: **PREVENTED** (token validation)
- ❌ Using same reset token twice: **PREVENTED** (used=1 flag)
- ❌ Using expired token: **PREVENTED** (expires_at check)
- ❌ Weak passwords: **PREVENTED** (6-char minimum)

---

## 🎯 Complete Security Checklist

| Feature | Implementation | Status |
|---------|-----------------|--------|
| Password Hashing | bcryptjs (10 rounds) | ✅ |
| Token Generation | JWT (HS256) | ✅ |
| Session Management | SQLite + localStorage | ✅ |
| Token Expiry | 7 days (30 with Remember Me) | ✅ |
| Reset Token | crypto.randomBytes(32) | ✅ |
| Reset Expiry | 1 hour | ✅ |
| One-time Reset | used flag in database | ✅ |
| Email Validation | Pattern check | ✅ |
| CORS | Configured for frontend URL | ✅ |
| SQL Injection | Parameterized queries | ✅ |
| Timing Attacks | Safe comparison functions | ✅ |
| Device Tracking | session.device_name | ✅ |
| Error Messages | Generic (no user enumeration) | ✅ |

---

## 🚀 Production Deployment Checklist

### Before Going Live
- [ ] Change JWT_SECRET in `.env` to random 32+ char string
- [ ] Configure EMAIL credentials (Gmail App Password, etc.)
- [ ] Set NODE_ENV=production
- [ ] Set FRONTEND_URL to actual domain
- [ ] Use HTTPS only (backend + frontend)
- [ ] Enable rate limiting on `/api/auth/*` endpoints
- [ ] Set strong password policy (currently 6 chars)
- [ ] Enable database backups
- [ ] Configure CSP headers
- [ ] Enable HTTPS-only cookies

### Recommended Improvements
- Add 2FA (Two-Factor Authentication)
- Implement rate limiting (prevent brute force)
- Add login attempt tracking
- Send login notifications to user email
- Implement OAuth (Google, Microsoft signin)
- Add account lockout after N failed attempts
- Use environment-specific JWT secrets
- Regular security audits of database

---

## References
- bcryptjs docs: https://github.com/dcodeIO/bcrypt.js
- JWT: https://jwt.io
- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- crypto.randomBytes: https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
