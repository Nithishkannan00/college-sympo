/**
 * ============================================================
 * STRUCTURA'26 — GOOGLE APPS SCRIPT BACKEND ENGINE
 * Department of Civil Engineering | AAMEC
 * ============================================================
 * 
 * Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script.
 * 2. Paste this entire Code.gs file.
 * 3. Run setupSheet() once to initialize sheet headers.
 * 4. Deploy as Web App -> Execute as: "Me", Who has access: "Anyone".
 * 5. Copy the deployed Web App URL and paste it into CONFIG.GAS_WEB_APP_URL in js/app.js.
 */

const CONFIG = {
  MAX_ACTIVE_REGISTRATIONS: 30,
  HOST_COLLEGE_CODE: "8204",
  SHEET_NAME: "Registrations",
  EVENT_NAME: "STRUCTURA'26",
  EVENT_DATE: "10.10.2026 (Saturday)"
};

/**
 * Initialize Google Sheet with structured headers
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  const headers = [
    "Registration Code",
    "Timestamp",
    "Full Name",
    "College Name",
    "College Location",
    "College Code",
    "Department",
    "Year",
    "Email",
    "Mobile",
    "Selected Technical Events",
    "PPT Team Name",
    "PPT Team Size",
    "PPT Members",
    "PPT Topic",
    "Structura Quest Selected",
    "Structura Quest Team Name",
    "Structura Quest Members",
    "Status"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0047FF").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}

/**
 * Handle POST Requests from Web App Form
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Prevent race condition on max 30 registrations
    
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    }
    
    // 1. Check Active Registration Capacity Limit (Max 30)
    const rows = sheet.getDataRange().getValues();
    let activeCount = 0;
    const existingMobiles = new Set();
    const existingTeamNames = new Set();
    const existingCodes = new Set();
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const status = row[18]; // Status column
      if (status === "ACTIVE" || !status) {
        activeCount++;
        if (row[9]) existingMobiles.add(String(row[9]).trim());
        if (row[11]) existingTeamNames.add(String(row[11]).trim().toLowerCase());
        if (row[16]) existingTeamNames.add(String(row[16]).trim().toLowerCase());
      }
      if (row[0]) existingCodes.add(String(row[0]).trim());
    }
    
    if (activeCount >= CONFIG.MAX_ACTIVE_REGISTRATIONS) {
      return createJsonResponse({
        success: false,
        error: "Registration closed. Maximum limit of 30 active registrations has been reached."
      });
    }
    
    // 2. Server-side Validations
    // College Code 8204 Block
    if (String(data.collegeCode).trim() === CONFIG.HOST_COLLEGE_CODE) {
      return createJsonResponse({
        success: false,
        error: "Students from Anjalai Ammal Mahalingam Engineering College are not eligible to register for STRUCTURA'26."
      });
    }
    
    // Mobile Validation
    const mobile = String(data.mobile).trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return createJsonResponse({
        success: false,
        error: "Invalid mobile number. Must be a 10-digit Indian number."
      });
    }
    if (existingMobiles.has(mobile)) {
      return createJsonResponse({
        success: false,
        error: "This mobile number is already registered for STRUCTURA'26."
      });
    }
    
    // Technical Events Range
    const techEvents = data.techEvents || [];
    if (techEvents.length < 1 || techEvents.length > 2) {
      return createJsonResponse({
        success: false,
        error: "Must select between 1 and 2 technical events."
      });
    }
    
    // Structura Quest Eligibility
    if (data.structuraQuestSelected && techEvents.length === 0) {
      return createJsonResponse({
        success: false,
        error: "Structura Quest requires at least 1 technical event."
      });
    }
    
    // Team Name Uniqueness
    if (data.pptTeamName && existingTeamNames.has(String(data.pptTeamName).trim().toLowerCase())) {
      return createJsonResponse({
        success: false,
        error: "Team name has already been taken. Please enter a new team name."
      });
    }
    
    if (data.questTeamName && existingTeamNames.has(String(data.questTeamName).trim().toLowerCase()) && data.questTeamName !== data.pptTeamName) {
      return createJsonResponse({
        success: false,
        error: "Team name has already been taken. Please enter a new team name."
      });
    }
    
    // 3. Generate Unique Code
    let code = data.registrationCode;
    if (!code || existingCodes.has(code)) {
      code = generateUniqueCode(existingCodes);
    }
    
    const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    
    // 4. Append row to Google Sheet
    sheet.appendRow([
      code,
      timestamp,
      data.fullName,
      data.collegeName,
      data.collegeLocation,
      data.collegeCode,
      data.department,
      data.year,
      data.email,
      mobile,
      techEvents.join(", "),
      data.pptTeamName || "",
      data.pptTeamSize || "",
      (data.pptMembers || []).join(", "),
      data.pptTopic || "",
      data.structuraQuestSelected ? "YES" : "NO",
      data.questTeamName || "",
      (data.questMembers || []).join(", "),
      "ACTIVE"
    ]);
    
    // 5. Send Confirmation Email (Contains ONLY Event details, Member details, Code - NO coordinator phone numbers)
    sendConfirmationEmail(data.email, code, data);
    
    return createJsonResponse({
      success: true,
      registrationCode: code,
      activeCount: activeCount + 1,
      remaining: CONFIG.MAX_ACTIVE_REGISTRATIONS - (activeCount + 1)
    });
    
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET Requests (Lookup Registration / Capacity Check)
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    return createJsonResponse({ success: false, error: "Sheet not initialized" });
  }
  
  const codeParam = e.parameter.code;
  const rows = sheet.getDataRange().getValues();
  
  // Return Capacity Status
  if (!codeParam) {
    let activeCount = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][18] === "ACTIVE" || !rows[i][18]) activeCount++;
    }
    return createJsonResponse({
      success: true,
      activeCount: activeCount,
      maxCapacity: CONFIG.MAX_ACTIVE_REGISTRATIONS,
      remaining: Math.max(0, CONFIG.MAX_ACTIVE_REGISTRATIONS - activeCount)
    });
  }
  
  // Search by Unique Code
  const searchCode = String(codeParam).trim().toUpperCase();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[0]).trim().toUpperCase() === searchCode) {
      return createJsonResponse({
        success: true,
        registration: {
          registrationCode: row[0],
          timestamp: row[1],
          fullName: row[2],
          collegeName: row[3],
          collegeLocation: row[4],
          collegeCode: row[5],
          department: row[6],
          year: row[7],
          email: row[8],
          mobile: row[9],
          techEvents: row[10],
          pptTeamName: row[11],
          pptTeamSize: row[12],
          pptMembers: row[13],
          pptTopic: row[14],
          structuraQuest: row[15],
          questTeamName: row[16],
          questMembers: row[17],
          status: row[18]
        }
      });
    }
  }
  
  return createJsonResponse({
    success: false,
    error: "Registration code not found"
  });
}

/**
 * Helper: Generate Non-sequential Unique Code STR26-XXXX
 */
function generateUniqueCode(existingSet) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = "STR26-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (existingSet.has(code));
  return code;
}

/**
 * Send Confirmation Email
 * Strictly includes ONLY event details, member details, and registration code.
 */
function sendConfirmationEmail(recipientEmail, code, data) {
  if (!recipientEmail) return;
  
  const subject = `Registration Confirmed: STRUCTURA'26 [${code}]`;
  
  let body = `STRUCTURA'26 — OFFICIAL REGISTRATION CONFIRMATION\n`;
  body += `Department of Civil Engineering | Anjalai Ammal Mahalingam Engineering College\n`;
  body += `============================================================\n\n`;
  body += `REGISTRATION CODE: ${code}\n\n`;
  body += `Participant Details:\n`;
  body += `• Name: ${data.fullName}\n`;
  body += `• College: ${data.collegeName} (Location: ${data.collegeLocation}, Code: ${data.collegeCode})\n`;
  body += `• Department: ${data.department} | ${data.year}\n\n`;
  body += `Event Details:\n`;
  body += `• Date: ${CONFIG.EVENT_DATE}\n`;
  body += `• Technical Events: ${(data.techEvents || []).join(', ')}\n`;
  
  if (data.techEvents && data.techEvents.indexOf('Paper Presentation') !== -1) {
    body += `• PPT Team Name: ${data.pptTeamName} (${data.pptTeamSize} Members)\n`;
    body += `• PPT Topic: ${data.pptTopic}\n`;
    body += `• PPT Members: ${(data.pptMembers || []).join(', ')}\n`;
  }
  
  if (data.structuraQuestSelected) {
    body += `• Non-Technical Event: THE STRUCTURA QUEST (Stages: Quiz Battle, Dize Mission, Treasure Hunt)\n`;
    body += `• Quest Team Name: ${data.questTeamName}\n`;
    body += `• Quest Members: ${(data.questMembers || []).join(', ')}\n`;
  }
  
  body += `\nImportant Notes:\n`;
  body += `• Your unique registration code is: ${code}\n`;
  body += `• Food will be provided for Inter-College participants only.\n`;
  body += `• PPT Submissions must be sent before 07.10.2026 to structuraaamec@gmail.com\n\n`;
  body += `Thank you for registering for STRUCTURA'26!`;
  
  MailApp.sendEmail(recipientEmail, subject, body);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
