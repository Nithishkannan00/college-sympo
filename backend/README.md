# STRUCTURA'26 — Backend Setup Guide (Google Apps Script + Google Sheets)

This backend runs completely on Google Apps Script (serverless, zero cost) connected to Google Sheets as the database.

---

## 🚀 Quick Setup Instructions

### 1. Create Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet named `STRUCTURA_26_DATABASE`.
2. Click **Extensions** > **Apps Script**.

### 2. Add Code
1. Erase any default code in `Code.gs` and paste the entire contents of [backend/Code.gs](file:///c:/Users/Asus/Desktop/college-sympo/backend/Code.gs).
2. Select the function `setupSheet` from the dropdown and click **Run**. (Grant the requested permissions). This will generate the formatted table header columns.

### 3. Deploy as Web App
1. Click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Set:
   - **Description**: `STRUCTURA 26 API Production`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
4. Click **Deploy** and copy the **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).

### 4. Connect to Frontend
1. Open `js/app.js` in your project.
2. Replace `CONFIG.GAS_WEB_APP_URL` with your copied Web App URL:
   ```javascript
   const CONFIG = {
     GAS_WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
     ...
   };
   ```

---

## 🔒 Server-Side Validations Implemented in `Code.gs`
1. **Capacity Limit Lock**: Caps total active registrations at **30**. If a row is deleted or modified in Google Sheets, the active count automatically updates and reopens registration.
2. **College Code Restriction**: Immediately rejects host college code `8204` with official notice.
3. **Mobile & Email Uniqueness**: Enforces valid 10-digit Indian phone numbers and ensures uniqueness.
4. **Team Name Uniqueness**: Ensures unique team names across Paper Presentation and Structura Quest.
5. **Auto-Mailer**: Sends instant confirmation receipt to participant containing ONLY event information, member list, and unique registration code (`STR26-XXXX`).

---

## 🌐 Deploying Frontend to Vercel
1. Push this repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Framework Preset: **Other / Static HTML**.
4. Click **Deploy**!
