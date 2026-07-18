# 🔒 SmartCRM Security Guide

## מדריך אבטחה - SmartCRM

---

## 1. Authentication & Authorization

### JWT Secret Management ⚠️ CRITICAL

**Status**: ✅ IMPLEMENTED

The application uses JWT (JSON Web Tokens) for secure authentication.

```javascript
// Token is generated with a secret key
jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
```

**⚠️ PRODUCTION REQUIREMENTS:**

1. **Generate a strong JWT_SECRET** on Render:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set on Render Dashboard:**
   - Go to: https://dashboard.render.com/web/srv-d9djfntaeets739c1qu0/settings
   - Click "Environment Variables" tab
   - Add: `JWT_SECRET=<your-generated-secret>`
   - Click "Save Changes"

3. **Token Expiration:**
   - Normal login: 7 days
   - Remember Me: 30 days

---

## 2. Password Security

### Password Hashing ✅ IMPLEMENTED

- **Algorithm**: bcryptjs (salting + hashing)
- **Cost Factor**: 10 rounds (industry standard)
- **Status**: All passwords stored as hashes

```javascript
const hashedPassword = bcrypt.hashSync(password, 10);
```

### Password Requirements

- **Minimum Length**: 6 characters (local), suggest 8+ in production
- **No Character Restrictions**: Supports Hebrew, special chars, etc.

**Recommendations for Production:**
- Enforce minimum 8+ characters
- Require uppercase, numbers, special characters
- Add password strength meter in frontend

---

## 3. API Security

### Rate Limiting ✅ IMPLEMENTED

**Login Endpoint Protection:**
```
- Limit: 5 attempts per 15 minutes per IP
- Message: Hebrew error message on limit reached
- Resets after 15 minutes
```

**Status**: Applied to `/api/auth/login`

### CORS Configuration ✅ IMPLEMENTED

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Production Setting:**
- Must set `FRONTEND_URL=https://yourdomain.com` on Render

### Security Headers ✅ IMPLEMENTED

Using `helmet` package:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS): 1 year

---

## 4. Input Validation ✅ IMPLEMENTED

### Username Validation
- Type: String
- Length: 1-50 characters
- Trimmed before database query

### Password Validation
- Type: String
- Length: 6-100 characters
- Bcrypt compatible

### Email Validation
- Uses `validator` package
- Checks email format
- Case-insensitive storage

### Reset Token Validation
- Random 32-byte hex tokens
- Expiration: 1 hour
- One-time use only (marked as `used=1` after use)

---

## 5. Error Handling & Information Disclosure

### Secure Error Messages ✅ IMPLEMENTED

**Development Mode:**
- Shows error details for debugging
- Use: `NODE_ENV=development`

**Production Mode:**
- Generic error messages: "שגיאה בשרת"
- No detailed stack traces exposed
- Set: `NODE_ENV=production` on Render

### Special Case: Login Errors

```json
// Don't reveal if user exists or password is wrong
{ "success": false, "error": "שם משתמש או סיסמה לא נכונים" }
```

### Password Reset: Email Enumeration Protection

```json
// Same response whether email exists or not
{ "success": true, "message": "אם הדוא״ל רשום, קישור איפוס יישלח לו" }
```

---

## 6. Database Security

### SQL Injection Prevention ✅ IMPLEMENTED

Using prepared statements with `better-sqlite3`:
```javascript
const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
stmt.get(userId)  // ✅ Safe - parameterized
```

**Never use string concatenation:**
```javascript
// ❌ WRONG - SQL Injection vulnerability
db.prepare(`SELECT * FROM users WHERE id = ${userId}`)
```

### Database Schema Security

- Foreign keys enabled: `PRAGMA foreign_keys = ON`
- Auto-cleanup: `ON DELETE CASCADE`
- Timestamps: Created and updated tracking

---

## 7. Secrets Management

### Never Commit These Files

Add to `.gitignore` (✅ ALREADY DONE):
```
.env
.env.local
*.db
*.sqlite
```

### Environment Variables on Render

**Required for Production:**
1. `JWT_SECRET` - Strong random secret
2. `FRONTEND_URL` - Your production domain
3. `EMAIL_HOST` - SMTP server (Gmail, SendGrid, etc.)
4. `EMAIL_USER` - Email account
5. `EMAIL_PASSWORD` - App-specific password
6. `NODE_ENV` - Set to `production`

**How to Set:**
1. Go to: https://dashboard.render.com
2. Select your web service
3. Click "Settings" tab
4. Scroll to "Environment" section
5. Click "Add Environment Variable"
6. Enter key and value
7. Click "Save Changes"

---

## 8. Default Admin Credentials ⚠️ IMPORTANT

### Current Status

**Default User Created:**
- Username: `admin`
- Password: `admin123`

### ⚠️ SECURITY ISSUE

For production, you MUST:

1. **Change the password immediately** after deployment:
   - Log in with `admin/admin123`
   - Change password in settings

2. **Or modify database.js** to remove default user:
   ```javascript
   // Comment out the admin user creation in db.js
   // Then redeploy
   ```

### Recommended Approach

1. Deploy with default user for initial setup
2. Log in with `admin/admin123`
3. Change password to a strong password
4. Create additional users
5. (Optional) Remove default user from code

---

## 9. Email Security

### Password Reset Flow

1. User requests reset with email
2. 32-byte random token generated
3. Token stored in DB with 1-hour expiry
4. Email sent with reset link
5. Token marked as `used=1` after one-time use

### Gmail Configuration

**Using Gmail App Password (Recommended):**
1. Enable 2-Factor Authentication on Google Account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `EMAIL_PASSWORD`
4. Never use your main Google password

### Alternative Email Services

**SendGrid:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxx...
```

**Custom SMTP:**
Configure with your email provider's SMTP settings

---

## 10. HTTPS & Transport Security

### Current Status

✅ Deployed on Render (free HTTPS)

### What's Protected

- All data in transit is encrypted
- Automatic HTTPS redirect
- HSTS header: 1 year

### What You Should Do

1. Always use `https://` in production
2. Set `FRONTEND_URL` to HTTPS URL on Render
3. Never send credentials over HTTP

---

## 11. Session Management

### Remember Me Feature

```javascript
// Creates session record in database
INSERT INTO sessions (user_id, token, expires_at, device_name)
VALUES (?, ?, ?, ?)
```

- Expiration: 30 days
- Stored in SQLite
- Can be invalidated on logout

### Best Practices

- Rotate tokens periodically
- Store tokens securely in frontend (HttpOnly cookie recommended)
- Validate token on each protected request

---

## 12. Dependency Security

### Current Packages

```json
{
  "express": "^5.2.1",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.3",
  "helmet": "^7.x.x",
  "express-rate-limit": "^7.x.x",
  "validator": "^13.x.x"
}
```

### Vulnerability Checking

```bash
npm audit                    # Check vulnerabilities
npm audit fix                # Auto-fix known issues
npm outdated                 # Check outdated packages
```

---

## 13. Security Checklist for Production

### Before Going Live

- [ ] Generate strong `JWT_SECRET` on production
- [ ] Set `NODE_ENV=production` on Render
- [ ] Configure `FRONTEND_URL` to your domain
- [ ] Set up email configuration (EMAIL_*)
- [ ] Change default admin password
- [ ] Enable HTTPS (automatic on Render)
- [ ] Test login flow end-to-end
- [ ] Test password recovery email
- [ ] Run `npm audit` - fix any vulnerabilities
- [ ] Review `.env.example` is committed (not `.env`)
- [ ] `.gitignore` includes `.env` and `.db` files
- [ ] Set strong CORS origin
- [ ] Review error messages (no stack traces in prod)

### Ongoing Maintenance

- [ ] Monitor Render logs for errors
- [ ] Check npm vulnerabilities monthly
- [ ] Review failed login attempts (add admin dashboard)
- [ ] Rotate JWT_SECRET periodically
- [ ] Keep Node.js updated
- [ ] Update dependencies regularly

---

## 14. File Upload & Static Files Security

### Current Implementation

```javascript
app.use(express.static(publicPath, {
  dotfiles: 'deny',  // Don't serve .env, .git, etc
  index: 'index.html',
  maxAge: '1h'
}));
```

**Security Features:**
- ✅ Dotfiles blocked (`.env`, `.git`, etc.)
- ✅ Cache 1 hour
- ✅ Only serves files in public folder

---

## 15. Future Security Enhancements

### Recommended for Future Versions

1. **Two-Factor Authentication (2FA)**
   - TOTP codes (Google Authenticator)
   - Backup codes

2. **OAuth2 / Social Login**
   - Google login
   - Microsoft login

3. **API Key Authentication**
   - For third-party integrations
   - Rate limiting per key

4. **Audit Logging**
   - Track all login attempts
   - Track password changes
   - Export audit logs

5. **CORS Refinement**
   - Whitelist specific domains
   - Dynamic origin validation

6. **CSP (Content Security Policy)**
   - Stricter script sources
   - Font/image whitelisting

---

## Quick Reference

### Environment Variables to Set

```bash
# On Render Dashboard → Settings → Environment
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<Gmail App Password>
EMAIL_FROM=noreply@myservices.com
```

### Testing Security

```bash
# Test login endpoint
curl -X POST https://smartcrm-3cle.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Check rate limiting (5 attempts in 15 min)
for i in {1..6}; do curl -X POST https://smartcrm-3cle.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'; done
```

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready (after environment setup)
