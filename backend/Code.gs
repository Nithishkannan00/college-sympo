/**
 * ============================================================
 * STRUCTURA'26 — GOOGLE APPS SCRIPT BACKEND ENGINE
 * Department of Civil Engineering | AAMEC
 * ============================================================
 * 
 * 8-Column Google Sheet Schema:
 * 1. Registration Code
 * 2. Team Name
 * 3. Member 1 Details
 * 4. Member 2 Details
 * 5. Member 3 Details
 * 6. Events
 * 7. PPT Topic
 * 8. Registration Date
 * 
 * Each Member Details field format:
 * Full Name | College Name with Location | College Code | Department | Year | Email | Mobile
 */

const CONFIG = {
  MAX_ACTIVE_REGISTRATIONS: 30,
  HOST_COLLEGE_CODE: "8204",
  SHEET_NAME: "Registrations",
  EVENT_NAME: "STRUCTURA'26",
  EVENT_DATE: "10.10.2026 — Saturday",
  OFFICIAL_EMAIL: "structuraaamec@gmail.com",
  COLLEGE_NAME: "Anjalai Ammal Mahalingam Engineering College, Kovilvenni"
};

/**
 * Initialize / Configure Google Sheet with the exact 8-column header structure
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  const headers = [
    "Registration Code",
    "Team Name",
    "Member 1 Details",
    "Member 2 Details",
    "Member 3 Details",
    "Events",
    "PPT Topic",
    "Registration Date"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#0F172A")
    .setFontColor("#FF5500");
  sheet.setFrozenRows(1);
}

/**
 * Helper: Format individual member profile into standard pipe-delimited string:
 * Full Name | College Name with Location | College Code | Department | Year | Email | Mobile
 */
function formatMemberDetails(mem) {
  if (!mem || !mem.fullName) return "";
  return [
    mem.fullName || "",
    mem.collegeName || "",
    mem.collegeCode || "",
    mem.department || "",
    mem.year || "",
    mem.email || "",
    mem.mobile || ""
  ].map(v => String(v).trim()).join(" | ");
}

/**
 * Helper: Parse formatted member string back into an object
 */
function parseMemberDetails(str) {
  if (!str) return null;
  const parts = String(str).split(" | ").map(s => s.trim());
  return {
    fullName: parts[0] || "",
    collegeName: parts[1] || "",
    collegeCode: parts[2] || "",
    department: parts[3] || "",
    year: parts[4] || "",
    email: parts[5] || "",
    mobile: parts[6] || ""
  };
}

/**
 * Handle POST Requests from Web App Form & Actions
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Concurrency protection against race conditions on max 30 registrations
    
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (err) {
        contents = e.parameter || {};
      }
    } else if (e && e.parameter) {
      contents = e.parameter;
    }
    
    const action = contents.action || "register";
    
    if (action === "checkRegistration") {
      return handleCheckRegistration(contents.registrationCode);
    }
    
    return handleRegister(contents);
    
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
 * Registration Handler
 */
function handleRegister(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  }
  
  const rows = sheet.getDataRange().getValues();
  let activeCount = 0;
  const existingMobiles = new Set();
  const existingTeamNames = new Set();
  const existingCodes = new Set();
  
  // Row 0 is header
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const code = String(row[0] || "").trim();
    if (!code) continue;
    
    activeCount++;
    existingCodes.add(code.toUpperCase());
    
    const teamName = String(row[1] || "").trim().toLowerCase();
    if (teamName) existingTeamNames.add(teamName);
    
    // Extract mobiles from Member 1, 2, 3
    [row[2], row[3], row[4]].forEach(memStr => {
      const mem = parseMemberDetails(memStr);
      if (mem && mem.mobile) existingMobiles.add(String(mem.mobile).trim());
    });
  }
  
  // 1. Check Maximum Capacity (30 Active Registrations)
  if (activeCount >= CONFIG.MAX_ACTIVE_REGISTRATIONS) {
    return createJsonResponse({
      success: false,
      error: "Registration is currently unavailable. Maximum limit reached."
    });
  }
  
  // 2. Validate Member 1 (Lead / Registrant)
  const mem1 = data.member1 || {
    fullName: data.fullName,
    collegeName: data.collegeName,
    collegeCode: data.collegeCode,
    department: data.department,
    year: data.year,
    email: data.email,
    mobile: data.mobile
  };
  
  // College Code 8204 Rejection Check
  if (String(mem1.collegeCode).trim() === CONFIG.HOST_COLLEGE_CODE) {
    return createJsonResponse({
      success: false,
      error: "Students from Anjalai Ammal Mahalingam Engineering College are not eligible to register for STRUCTURA'26."
    });
  }
  
  // Mobile Format & Uniqueness Validation
  const mobile1 = String(mem1.mobile).trim();
  if (!/^[6-9]\d{9}$/.test(mobile1)) {
    return createJsonResponse({
      success: false,
      error: "Mobile number must be a valid 10-digit Indian number."
    });
  }
  if (existingMobiles.has(mobile1)) {
    return createJsonResponse({
      success: false,
      error: "This mobile number is already registered for STRUCTURA'26."
    });
  }
  
  // 3. Technical Events Validation
  const techEvents = data.techEvents || [];
  if (techEvents.length < 1 || techEvents.length > 2) {
    return createJsonResponse({
      success: false,
      error: "Please select 1 or 2 technical events."
    });
  }
  
  // Structura Quest Eligibility
  const isQuestSelected = Boolean(data.structuraQuestSelected);
  if (isQuestSelected && techEvents.length === 0) {
    return createJsonResponse({
      success: false,
      error: "The Structura Quest requires at least 1 technical event to be selected."
    });
  }
  
  const allEventsList = [...techEvents];
  if (isQuestSelected) {
    allEventsList.push("THE STRUCTURA QUEST");
  }
  const eventsString = allEventsList.join(", ");
  
  // 4. Team Name Logic & Validation (Required only for PPT)
  const hasPPT = techEvents.includes("Paper Presentation");
  const masterTeamName = hasPPT ? String(data.pptTeamName || data.teamName || "").trim() : "";
  
  if (hasPPT) {
    if (!masterTeamName) {
      return createJsonResponse({
        success: false,
        error: "Team name is required for Paper Presentation."
      });
    }
    if (existingTeamNames.has(masterTeamName.toLowerCase())) {
      return createJsonResponse({
        success: false,
        error: "Team name has already been taken. Please enter a new team name."
      });
    }
  }
  
  // 5. Member 2 and Member 3 validation
  let mem2 = data.member2 || null;
  let mem3 = data.member3 || null;
  
  // Validate additional member mobiles if present
  if (mem2 && mem2.mobile) {
    const mob2 = String(mem2.mobile).trim();
    if (existingMobiles.has(mob2)) {
      return createJsonResponse({
        success: false,
        error: `Mobile number ${mob2} is already registered for STRUCTURA'26.`
      });
    }
    if (String(mem2.collegeCode).trim() === CONFIG.HOST_COLLEGE_CODE) {
      return createJsonResponse({
        success: false,
        error: "Students from Anjalai Ammal Mahalingam Engineering College are not eligible to register for STRUCTURA'26."
      });
    }
  }
  
  if (mem3 && mem3.mobile) {
    const mob3 = String(mem3.mobile).trim();
    if (existingMobiles.has(mob3)) {
      return createJsonResponse({
        success: false,
        error: `Mobile number ${mob3} is already registered for STRUCTURA'26.`
      });
    }
    if (String(mem3.collegeCode).trim() === CONFIG.HOST_COLLEGE_CODE) {
      return createJsonResponse({
        success: false,
        error: "Students from Anjalai Ammal Mahalingam Engineering College are not eligible to register for STRUCTURA'26."
      });
    }
  }
  
  // 6. Generate Unique Random Non-sequential Registration Code STR26-XXXX
  const code = generateUniqueCode(existingCodes);
  const regDate = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd.MM.yyyy HH:mm:ss");
  
  const m1Str = formatMemberDetails(mem1);
  const m2Str = formatMemberDetails(mem2);
  const m3Str = formatMemberDetails(mem3);
  const pptTopic = hasPPT ? String(data.pptTopic || "").trim() : "";
  
  // 7. Append exact 8-column row into Google Sheets
  sheet.appendRow([
    code,
    masterTeamName,
    m1Str,
    m2Str,
    m3Str,
    eventsString,
    pptTopic,
    regDate
  ]);
  
  // 8. Send Confirmation Emails to all registered members
  const memberList = [mem1, mem2, mem3].filter(m => m && m.email);
  memberList.forEach(m => {
    try {
      sendConfirmationEmail(m.email, code, {
        member: m,
        allMembers: [mem1, mem2, mem3].filter(Boolean),
        eventsString: eventsString,
        pptTopic: pptTopic,
        teamName: masterTeamName,
        regDate: regDate
      });
    } catch (err) {
      console.warn("Email send failed for", m.email, err);
    }
  });
  
  return createJsonResponse({
    success: true,
    registrationCode: code,
    activeCount: activeCount + 1
  });
}

/**
 * Handle GET Requests (Lookup Registration by Code)
 */
function doGet(e) {
  const codeParam = (e && e.parameter && (e.parameter.code || e.parameter.registrationCode)) || "";
  const action = (e && e.parameter && e.parameter.action) || "";
  
  if (action === "checkRegistration" || codeParam) {
    return handleCheckRegistration(codeParam);
  }
  
  // Default status check (Capacity info never shown to user, only system health)
  return createJsonResponse({
    success: true,
    service: "STRUCTURA'26 Backend API",
    status: "ONLINE"
  });
}

/**
 * Code-Only Lookup Handler
 */
function handleCheckRegistration(codeQuery) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    return createJsonResponse({ success: false, error: "Database not initialized" });
  }
  
  const code = String(codeQuery || "").trim().toUpperCase();
  if (!code) {
    return createJsonResponse({ success: false, error: "Please provide a registration code." });
  }
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowCode = String(row[0] || "").trim().toUpperCase();
    
    if (rowCode === code) {
      return createJsonResponse({
        success: true,
        registration: {
          registrationCode: row[0],
          teamName: row[1],
          member1: parseMemberDetails(row[2]),
          member2: parseMemberDetails(row[3]),
          member3: parseMemberDetails(row[4]),
          events: row[5],
          pptTopic: row[6],
          registrationDate: row[7]
        }
      });
    }
  }
  
  return createJsonResponse({
    success: false,
    error: "Registration not found for code: " + code
  });
}

/**
 * Generate Unique Random Non-sequential Registration Code STR26-XXXX
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
 * Strictly contains ONLY:
 * - STRUCTURA'26 event details
 * - Selected event(s)
 * - PPT topic if applicable
 * - Member details
 * - Registration code
 * (NO coordinator phone numbers or coordinator details)
 */
function sendConfirmationEmail(recipientEmail, code, details) {
  if (!recipientEmail) return;
  
  const subject = `Registration Successful: STRUCTURA'26 [${code}]`;
  
  let body = `STRUCTURA'26 — REGISTRATION CONFIRMATION\n`;
  body += `A National Level Technical Symposium\n`;
  body += `Department of Civil Engineering | Anjalai Ammal Mahalingam Engineering College, Kovilvenni\n`;
  body += `======================================================================\n\n`;
  
  body += `REGISTRATION CODE: ${code}\n`;
  body += `REGISTRATION DATE: ${details.regDate}\n\n`;
  
  if (details.teamName) {
    body += `TEAM NAME: ${details.teamName}\n\n`;
  }
  
  body += `SELECTED EVENTS:\n`;
  body += `• ${details.eventsString}\n\n`;
  
  if (details.pptTopic) {
    body += `PAPER PRESENTATION TOPIC:\n`;
    body += `• ${details.pptTopic}\n\n`;
  }
  
  body += `REGISTERED PARTICIPANT(S):\n`;
  details.allMembers.forEach((m, idx) => {
    body += `Member ${idx + 1}:\n`;
    body += `  Name: ${m.fullName}\n`;
    body += `  College: ${m.collegeName} (Code: ${m.collegeCode})\n`;
    body += `  Department & Year: ${m.department} | ${m.year} Year\n`;
    body += `  Contact: +91 ${m.mobile} | ${m.email}\n\n`;
  });
  
  body += `IMPORTANT SYMPOSIUM GUIDELINES:\n`;
  body += `• Symposium Date: ${CONFIG.EVENT_DATE}\n`;
  body += `• Registration: FREE\n`;
  body += `• Food will be provided for Inter-College participants only.\n`;
  if (details.pptTopic) {
    body += `• PPT Submissions must be sent before 7th October 2026 to ${CONFIG.OFFICIAL_EMAIL}\n`;
  }
  body += `• You can verify your registration anytime using the "Check Registration" portal on our website.\n\n`;
  
  body += `We look forward to your active participation in STRUCTURA'26!\n`;
  
  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    body: body
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
