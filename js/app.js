/**
 * ===============================================================
 * STRUCTURA'26 — Master Interactive Engine (Cinematic Edition)
 * Department of Civil Engineering | AAMEC
 * ===============================================================
 */

const CONFIG = {
  GAS_WEB_APP_URL: '', // Connect deployed Google Apps Script Web App URL here
  MAX_ACTIVE_REGISTRATIONS: 30,
  SYMPOSIUM_DATE_ISO: '2026-10-10T09:00:00+05:30',
  PPT_TOPICS: [
    "Bio - Concrete Revolution",
    "Digital twin Infrastructure - monitoring for Smart Civil Structures",
    "UAV - LIDAR Topographic Modeling",
    "vision AI for Civil Infrastructure",
    "Microplastics in water Resources - An emerging Environmental threat",
    "Sustainable 3D-printed construction"
  ]
};

const AppState = {
  formData: {
    fullName: '',
    collegeName: '',
    collegeCode: '',
    department: '',
    year: '',
    email: '',
    mobile: '',
    techEvents: [],
    structuraQuestSelected: false,
    pptTeamName: '',
    pptTeamSize: '1',
    pptMembers: [],
    pptTopic: '',
    questTeamName: '',
    questMembers: [],
    registrationCode: '',
    timestamp: '',
    status: 'ACTIVE'
  },
  dbKey: 'structura26_official_records_v5'
};

// Event Modal Content Database
const EVENTS_DATA = {
  'paper-presentation': {
    index: '01',
    category: 'TECHNICAL EVENT',
    title: 'PAPER PRESENTATION',
    bgImage: 'assets/images/event_paper.jpg',
    specs: [
      { lbl: 'TEAM SIZE', val: '1 – 3 Participants' },
      { lbl: 'SLIDES', val: '13 – 15 Slides' },
      { lbl: 'BACKUP', val: 'PPTX + PDF Backup' },
      { lbl: 'DEADLINE', val: '07.10.2026' }
    ],
    description: 'Present groundbreaking civil engineering research, sustainable materials innovation, and modern structural design concepts before our esteemed evaluation committee.',
    rules: [
      'Team Size: 1, 2, or 3 participants (Maximum 3).',
      'Number of Slides: 13–15 slides strictly.',
      'File Name Format: Topic Name_College Name (Submit PPTX + PDF backup).',
      'Fonts: Calibri or Times New Roman (Title: 28–36 pt | Heading: 24–30 pt | Body: 20–26 pt | References: 16–18 pt).',
      'Content Flow: Problem / Need → Innovation → Application → What makes your idea different?',
      'Presentation Standards: Concise diagrams & flowcharts preferred over long text; high contrast; purposeful animation; acknowledge all sources; zero plagiarism.',
      'Official Submission Email: structuraaamec@gmail.com before 7th October 2026.'
    ],
    topicsTitle: '6 OFFICIAL RESEARCH TOPICS (EXACT):',
    topics: CONFIG.PPT_TOPICS
  },
  'autocad': {
    index: '02',
    category: 'TECHNICAL EVENT',
    title: 'AUTOCAD',
    bgImage: 'assets/images/event_autocad.jpg',
    specs: [
      { lbl: 'PARTICIPATION', val: 'Individual (1)' },
      { lbl: 'SOFTWARE', val: 'AutoCAD 2026' },
      { lbl: 'DURATION', val: '45 Minutes' },
      { lbl: 'TOPIC', val: 'Residential Building' }
    ],
    description: 'Precision architectural drafting, structural plan detailing, sectional analysis, and elevation modeling under timed laboratory conditions.',
    rules: [
      'Software Platform: AutoCAD 2026.',
      'Format: Individual Event. 45 Minutes duration.',
      'Topic: Normal Residential Building / Residential Building.',
      'Deliverables: Complete Plan, Elevation, and Sectional View.',
      'Drafting Standards: Proper dimensions, accurate labels, margin/border, Participant name, layers, line types, line weights, and text sizes.',
      'File Name: CADD.2026 (Save periodically throughout the event).',
      'Lab Regulations: Systems allocated randomly. Inform lab coordinator immediately if a crash occurs. Report 10–15 minutes early. No extra time. Malpractice results in disqualification.'
    ]
  },
  'code-cracking': {
    index: '03',
    category: 'TECHNICAL EVENT',
    title: 'CODE CRACKING',
    bgImage: 'assets/images/event_codecracking.jpg',
    specs: [
      { lbl: 'PARTICIPATION', val: 'Individual (1)' },
      { lbl: 'STANDARD', val: 'IS 456:2000' },
      { lbl: 'STAGE 1', val: '25 MCQs (15 Mins)' },
      { lbl: 'STAGE 2', val: 'PPT MCQs (30s/Q)' }
    ],
    description: 'Competitive technical quiz challenging your mastery of Indian Standard code provisions, reinforced concrete design principles, and structural codal formulas.',
    rules: [
      'Scope: Individual technical quiz based on IS 456:2000 code provisions.',
      'STAGE 1: Manual paper MCQ, 25 questions, 15 minutes, closed-book, no references, Options A–D, one answer only.',
      'STAGE 2: PPT-based questions, 30 seconds per question, no extra time.',
      'Advancement: Only shortlisted Stage 1 qualifiers proceed to Stage 2. Winners determined based on Stage 2.',
      'Regulations: Select one option only; multiple answers/corrections/erasures invalid; no mobile phones, smartwatches, or electronic devices; no discussion or copying; Evaluation Committee decision is final.'
    ]
  },
  'structura-quest': {
    index: '04',
    category: 'NON-TECHNICAL EVENT',
    title: 'THE STRUCTURA QUEST',
    bgImage: 'assets/images/event_quest.jpg',
    specs: [
      { lbl: 'TEAM SIZE', val: 'Exactly 2 Members' },
      { lbl: 'ELIGIBILITY', val: '≥ 1 Tech Event Req.' },
      { lbl: 'STAGES', val: '3 Sequential Stages' },
      { lbl: 'LEADERSHIP', val: 'Member 1 (Head)' }
    ],
    description: 'The premier non-technical championship combining cognitive reasoning, logic matrix puzzles, physical agility, and campus navigation across 3 intense stages.',
    rules: [
      'Team Composition: Exactly 2 members (Member 1 is automatically Team Head).',
      'Prerequisite: Can only be selected when at least 1 Technical Event is selected.',
      'STAGE 1 — QUIZ BATTLE: General technical reasoning, visual recognition, and spatial logic.',
      'STAGE 2 — DIZE MISSION: Official challenge formats: Missing Number Matrix • Word Logic Challenge • Odd One Out • Target Tactics • Memory Matrix • Speed Circuit • Cup Code • Dead Cells.',
      'STAGE 3 — TREASURE HUNT: 30 minutes duration; strict clue/checkpoint order; collect tokens; shortest valid completion time wins; no running/pushing/shouting; team members must stay together at all times; tampering/cheating results in disqualification; judges’ decisions are final.'
    ]
  }
};

// Local storage helper
function getLocalRecords() {
  try {
    const raw = localStorage.getItem(AppState.dbKey);
    if (!raw) {
      const initial = [
        {
          registrationCode: 'STR26-A8K4',
          timestamp: '2026-09-12 14:32:10',
          fullName: 'Karthikeyan S',
          collegeName: 'National Institute of Technology, Tiruchirappalli',
          collegeCode: '1004',
          department: 'Civil Engineering',
          year: '3rd',
          email: 'karthik.civil@nitt.edu',
          mobile: '9840123456',
          techEvents: ['Paper Presentation', 'AutoCAD'],
          pptTeamName: 'AeroStructures',
          pptTeamSize: '2',
          pptMembers: ['Karthikeyan S (Lead)', 'Praveen Kumar R'],
          pptTopic: 'Sustainable 3D-printed construction',
          structuraQuestSelected: true,
          questTeamName: 'AeroStructures',
          questMembers: ['Karthikeyan S (Lead)', 'Praveen Kumar R'],
          status: 'ACTIVE'
        }
      ];
      localStorage.setItem(AppState.dbKey, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveLocalRecord(rec) {
  const list = getLocalRecords();
  list.push(rec);
  localStorage.setItem(AppState.dbKey, JSON.stringify(list));
}

function getActiveCount() {
  return getLocalRecords().filter(r => r.status === 'ACTIVE').length;
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `STR26-${c}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initCadCanvas('entry-cad-bg');
  initCadCanvas('site-cad-bg');
  initEntryScreen();
  initHeaderNavigation();
  initCountdownTimer();
  initEventModalPopup();
  initGeneralRulesAccordion();
  initRegistrationEngine();
  initCheckRegistrationPortal();
});

/* 1. Subtle Animated Engineering Blueprint Background */
function initCadCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let offset = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    ctx.clearRect(0, 0, width, height);
    
    const gridSize = 65;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;

    for (let x = (offset % gridSize); x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = (offset % gridSize); y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Coordinate cross ticks
    ctx.fillStyle = 'rgba(255, 85, 0, 0.08)';
    for (let x = (offset % gridSize); x < width; x += gridSize * 3) {
      for (let y = (offset % gridSize); y < height; y += gridSize * 3) {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }

    if (!prefersReducedMotion) {
      offset += 0.15;
    }

    requestAnimationFrame(render);
  }
  render();
}

/* 2. Entry Experience Trigger */
function initEntryScreen() {
  const entryLayer = document.getElementById('entry-layer');
  const entryBtn = document.getElementById('build-structura-btn');

  if (entryBtn && entryLayer) {
    entryBtn.addEventListener('click', () => {
      entryLayer.classList.add('unlocked');
    });
  }
}

/* 3. Top Header Navigation (Mobile Drawer & Scroll Observer) */
function initHeaderNavigation() {
  const toggle = document.getElementById('mobile-toggle-btn');
  const panel = document.getElementById('mobile-nav-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
    });
    panel.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => panel.classList.remove('open'));
    });
  }

  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], div[id]');

  window.addEventListener('scroll', () => {
    let cur = '';
    const scrollPos = window.pageYOffset + 140;

    sections.forEach(s => {
      if (scrollPos >= s.offsetTop) {
        cur = s.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${cur}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* 4. Minimal Countdown Timer */
function initCountdownTimer() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetDate = new Date(CONFIG.SYMPOSIUM_DATE_ISO).getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.innerText = '00';
      hoursEl.innerText = '00';
      minutesEl.innerText = '00';
      secondsEl.innerText = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.innerText = String(d).padStart(2, '0');
    hoursEl.innerText = String(h).padStart(2, '0');
    minutesEl.innerText = String(m).padStart(2, '0');
    secondsEl.innerText = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* 5. Event Popup Modal Engine (Smooth Transition • Image Overlay) */
function initEventModalPopup() {
  const modal = document.getElementById('event-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const bannerBg = document.getElementById('modal-banner-bg');
  const badgeEl = document.getElementById('modal-badge');
  const titleEl = document.getElementById('modal-title');
  const contentArea = document.getElementById('modal-content-area');

  if (!modal || !closeBtn || !bannerBg || !contentArea) return;

  // Open Modal on Card Click
  document.querySelectorAll('.event-image-card').forEach(card => {
    card.addEventListener('click', () => {
      const eventId = card.getAttribute('data-event-id');
      const data = EVENTS_DATA[eventId];
      if (!data) return;

      badgeEl.innerText = `${data.index} — ${data.category}`;
      titleEl.innerText = data.title;
      bannerBg.style.backgroundImage = `url('${data.bgImage}')`;

      let specsHtml = '<div class="modal-specs-grid">';
      data.specs.forEach(s => {
        specsHtml += `
          <div class="modal-spec-item">
            <span class="lbl">${s.lbl}</span>
            <span class="val">${s.val}</span>
          </div>
        `;
      });
      specsHtml += '</div>';

      let rulesHtml = '<h4 class="modal-sub-heading">OFFICIAL RULES & PROTOCOLS</h4><ul class="rules-bullet-list">';
      data.rules.forEach(r => {
        rulesHtml += `<li>${r}</li>`;
      });
      rulesHtml += '</ul>';

      let topicsHtml = '';
      if (data.topics && data.topics.length > 0) {
        topicsHtml = `<h4 class="modal-sub-heading">${data.topicsTitle}</h4><div style="background:var(--bg-deep);border:1px solid var(--border-medium);padding:1rem;font-family:var(--font-mono);font-size:0.85rem;line-height:1.6;color:var(--text-primary);">`;
        data.topics.forEach((t, i) => {
          topicsHtml += `<div>${i + 1}. ${t}</div>`;
        });
        topicsHtml += '</div>';
      }

      contentArea.innerHTML = `
        <p style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.6;">
          ${data.description}
        </p>
        ${specsHtml}
        ${rulesHtml}
        ${topicsHtml}
      `;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close handlers
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* 6. General Rules Accordion (Exactly 4 Sets) */
function initGeneralRulesAccordion() {
  const items = document.querySelectorAll('.rule-set-item');

  items.forEach(item => {
    const btn = item.querySelector('.rule-set-header');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* 7. Registration Engine & Validations */
function initRegistrationEngine() {
  const form = document.getElementById('registration-details-form');
  if (!form) return;

  // Inputs
  const nameInp = document.getElementById('reg-fullname');
  const collegeInp = document.getElementById('reg-college');
  const codeInp = document.getElementById('reg-code');
  const codeAlert = document.getElementById('college-block-alert');
  const deptInp = document.getElementById('reg-dept');
  const yearInp = document.getElementById('reg-year');
  const emailInp = document.getElementById('reg-email');
  const mobileInp = document.getElementById('reg-mobile');

  // Event Checkboxes
  const techChecks = document.querySelectorAll('.tech-event-check');
  const questCheck = document.getElementById('chk-event-quest');
  const questWrapper = document.getElementById('quest-check-wrapper');
  const eventErr = document.getElementById('event-select-err');

  // Dynamic Panels
  const pptPanel = document.getElementById('ppt-details-panel');
  const pptTeamNameInp = document.getElementById('ppt-team-name');
  const pptTeamSizeSel = document.getElementById('ppt-team-size');
  const pptTopicSel = document.getElementById('ppt-topic-sel');
  const pptDynamicMembers = document.getElementById('ppt-dynamic-members');

  const questPanel = document.getElementById('quest-details-panel');
  const questTeamNameInp = document.getElementById('quest-team-name');
  const questDynamicMembers = document.getElementById('quest-dynamic-members');

  const submitBtn = document.getElementById('submit-registration-btn');
  const formContainer = document.getElementById('reg-form-container');
  const successPanel = document.getElementById('success-state-panel');

  // Host College Code 8204 Rejection Check
  codeInp.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val === '8204') {
      codeAlert.classList.add('show');
      codeInp.classList.add('err');
    } else {
      codeAlert.classList.remove('show');
      codeInp.classList.remove('err');
    }
  });

  // Technical Events Selection (Min 1, Max 2)
  techChecks.forEach(chk => {
    chk.addEventListener('change', () => {
      const selectedTechs = Array.from(techChecks).filter(c => c.checked).map(c => c.value);

      if (selectedTechs.length > 2) {
        chk.checked = false;
        eventErr.innerText = 'Maximum 2 Technical Events permitted.';
        eventErr.classList.add('show');
        return;
      }

      eventErr.classList.remove('show');
      AppState.formData.techEvents = selectedTechs;
      syncEventDependencies();
    });
  });

  // Structura Quest Selection
  if (questCheck) {
    questCheck.addEventListener('change', () => {
      if (AppState.formData.techEvents.length === 0) {
        questCheck.checked = false;
        eventErr.innerText = 'Select at least 1 Technical Event before choosing The Structura Quest.';
        eventErr.classList.add('show');
        return;
      }
      AppState.formData.structuraQuestSelected = questCheck.checked;
      syncEventDependencies();
    });
  }

  function syncEventDependencies() {
    const techCount = AppState.formData.techEvents.length;

    // Lock/Unlock Structura Quest
    if (techCount === 0) {
      questCheck.disabled = true;
      questCheck.checked = false;
      questWrapper.classList.add('locked');
      AppState.formData.structuraQuestSelected = false;
    } else {
      questCheck.disabled = false;
      questWrapper.classList.remove('locked');
    }

    // Toggle PPT Panel
    const hasPPT = AppState.formData.techEvents.includes('Paper Presentation');
    pptPanel.style.display = hasPPT ? 'block' : 'none';
    if (hasPPT) renderPPTMembers();

    // Toggle Quest Panel
    const hasQuest = AppState.formData.structuraQuestSelected;
    questPanel.style.display = hasQuest ? 'block' : 'none';
    if (hasQuest) renderQuestMembers();
  }

  pptTeamSizeSel.addEventListener('change', () => {
    renderPPTMembers();
    if (AppState.formData.structuraQuestSelected) renderQuestMembers();
  });

  pptTeamNameInp.addEventListener('input', () => {
    if (AppState.formData.structuraQuestSelected && !questTeamNameInp.value.trim()) {
      questTeamNameInp.value = pptTeamNameInp.value;
    }
  });

  nameInp.addEventListener('input', () => {
    if (AppState.formData.techEvents.includes('Paper Presentation')) renderPPTMembers();
    if (AppState.formData.structuraQuestSelected) renderQuestMembers();
  });

  function renderPPTMembers() {
    const size = parseInt(pptTeamSizeSel.value, 10);
    const registrant = nameInp.value.trim() || 'Registrant (Member 1)';

    pptDynamicMembers.innerHTML = `
      <div class="input-grp">
        <label class="input-lbl">Member 1 (Team Head / Lead) <span class="req">*</span></label>
        <input type="text" class="dark-input" value="${registrant}" readonly style="opacity:0.8;cursor:not-allowed;" />
      </div>
    `;

    for (let i = 2; i <= size; i++) {
      const div = document.createElement('div');
      div.className = 'input-grp';
      div.innerHTML = `
        <label class="input-lbl">Member ${i} Full Name <span class="req">*</span></label>
        <input type="text" class="dark-input ppt-dyn-mem" id="ppt-mem-${i}" placeholder="Enter Member ${i} Full Name" />
        <div class="input-err-msg">Member ${i} name is required</div>
      `;
      pptDynamicMembers.appendChild(div);
    }
  }

  function renderQuestMembers() {
    const registrant = nameInp.value.trim() || 'Registrant (Member 1)';
    const hasPPT = AppState.formData.techEvents.includes('Paper Presentation');
    const pptSize = parseInt(pptTeamSizeSel.value, 10);

    questDynamicMembers.innerHTML = `
      <div class="input-grp">
        <label class="input-lbl">Quest Member 1 (Team Head) <span class="req">*</span></label>
        <input type="text" class="dark-input" value="${registrant}" readonly style="opacity:0.8;cursor:not-allowed;" />
      </div>
    `;

    if (hasPPT && pptSize === 2) {
      // Direct reuse if PPT size = 2
      const div = document.createElement('div');
      div.className = 'input-grp';
      div.innerHTML = `
        <label class="input-lbl">Quest Member 2 (Synced from PPT Team) <span class="req">*</span></label>
        <input type="text" class="dark-input" id="quest-synced-mem" placeholder="Synced automatically from PPT Member 2" readonly style="opacity:0.8;" />
      `;
      questDynamicMembers.appendChild(div);

      const pptM2 = document.getElementById('ppt-mem-2');
      if (pptM2) {
        const synced = document.getElementById('quest-synced-mem');
        synced.value = pptM2.value;
        pptM2.addEventListener('input', () => { synced.value = pptM2.value; });
      }
    } else {
      // Collect Member 2
      const div = document.createElement('div');
      div.className = 'input-grp';
      div.innerHTML = `
        <label class="input-lbl">Quest Member 2 Full Name <span class="req">*</span></label>
        <input type="text" class="dark-input" id="quest-mem-2" placeholder="Enter Quest Member 2 Full Name" />
        <div class="input-err-msg">Quest Member 2 name is required</div>
      `;
      questDynamicMembers.appendChild(div);
    }

    if (!questTeamNameInp.value && pptTeamNameInp.value) {
      questTeamNameInp.value = pptTeamNameInp.value;
    }
  }

  // Validation Routine
  function validateAll() {
    let valid = true;

    if (!nameInp.value.trim()) { setErr(nameInp, 'Full name is required'); valid = false; } else clearErr(nameInp);
    if (!collegeInp.value.trim()) { setErr(collegeInp, 'College Name with Location is required'); valid = false; } else clearErr(collegeInp);

    const cCode = codeInp.value.trim();
    if (!cCode || cCode.length > 6) { setErr(codeInp, 'Valid college code required (max 6 digits)'); valid = false; }
    else if (cCode === '8204') { codeAlert.classList.add('show'); valid = false; }
    else clearErr(codeInp);

    if (!deptInp.value.trim()) { setErr(deptInp, 'Department is required'); valid = false; } else clearErr(deptInp);

    if (!yearInp.value || yearInp.value === '') { setErr(yearInp, 'Please select your Year of Study'); valid = false; } else clearErr(yearInp);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInp.value.trim())) { setErr(emailInp, 'Valid email address required'); valid = false; } else clearErr(emailInp);

    const mob = mobileInp.value.trim();
    if (!/^[6-9]\d{9}$/.test(mob)) { setErr(mobileInp, 'Valid 10-digit Indian mobile number required'); valid = false; }
    else {
      const existing = getLocalRecords();
      if (existing.some(r => r.mobile === mob && r.status === 'ACTIVE')) {
        setErr(mobileInp, 'This mobile number is already registered.');
        valid = false;
      } else {
        clearErr(mobileInp);
      }
    }

    // Technical Events Range
    if (AppState.formData.techEvents.length === 0) {
      eventErr.innerText = 'Please select at least 1 Technical Event.';
      eventErr.classList.add('show');
      valid = false;
    } else {
      eventErr.classList.remove('show');
    }

    // Paper Presentation Validation
    const hasPPT = AppState.formData.techEvents.includes('Paper Presentation');
    if (hasPPT) {
      const tName = pptTeamNameInp.value.trim();
      if (!tName) { setErr(pptTeamNameInp, 'Team name is mandatory'); valid = false; }
      else {
        const existing = getLocalRecords();
        if (existing.some(r => r.pptTeamName && r.pptTeamName.toLowerCase() === tName.toLowerCase() && r.status === 'ACTIVE')) {
          setErr(pptTeamNameInp, 'Team name has already been taken. Please enter a new team name.');
          valid = false;
        } else {
          clearErr(pptTeamNameInp);
        }
      }

      if (!pptTopicSel.value) { setErr(pptTopicSel, 'Please select an official PPT topic'); valid = false; } else clearErr(pptTopicSel);

      document.querySelectorAll('.ppt-dyn-mem').forEach(inp => {
        if (!inp.value.trim()) { setErr(inp, 'Participant name required'); valid = false; } else clearErr(inp);
      });
    }

    // Structura Quest Validation
    const hasQuest = AppState.formData.structuraQuestSelected;
    if (hasQuest) {
      const qName = questTeamNameInp.value.trim();
      if (!qName) { setErr(questTeamNameInp, 'Quest Team name is compulsory'); valid = false; }
      else {
        const existing = getLocalRecords();
        if (existing.some(r => r.questTeamName && r.questTeamName.toLowerCase() === qName.toLowerCase() && r.questTeamName !== pptTeamNameInp.value.trim() && r.status === 'ACTIVE')) {
          setErr(questTeamNameInp, 'Team name has already been taken. Please enter a new team name.');
          valid = false;
        } else {
          clearErr(questTeamNameInp);
        }
      }

      const manualM2 = document.getElementById('quest-mem-2');
      if (manualM2 && !manualM2.value.trim()) { setErr(manualM2, 'Quest Member 2 name required'); valid = false; }
      else if (manualM2) clearErr(manualM2);
    }

    return valid;
  }

  submitBtn.addEventListener('click', async () => {
    // 30 Active registrations capacity check
    if (getActiveCount() >= CONFIG.MAX_ACTIVE_REGISTRATIONS) {
      alert('Registration is currently closed as maximum capacity has been reached.');
      return;
    }

    if (!validateAll()) {
      const firstErr = document.querySelector('.input-err-msg.show, .college-rejection-box.show');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = 'PROCESSING REGISTRATION...';

    const code = generateCode();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    AppState.formData.fullName = nameInp.value.trim();
    AppState.formData.collegeName = collegeInp.value.trim();
    AppState.formData.collegeCode = codeInp.value.trim();
    AppState.formData.department = deptInp.value.trim();
    AppState.formData.year = yearInp.value;
    AppState.formData.email = emailInp.value.trim();
    AppState.formData.mobile = mobileInp.value.trim();
    AppState.formData.registrationCode = code;
    AppState.formData.timestamp = timestamp;
    AppState.formData.status = 'ACTIVE';

    const hasPPT = AppState.formData.techEvents.includes('Paper Presentation');
    if (hasPPT) {
      AppState.formData.pptTeamName = pptTeamNameInp.value.trim();
      AppState.formData.pptTeamSize = pptTeamSizeSel.value;
      AppState.formData.pptTopic = pptTopicSel.value;
      const mems = [`${AppState.formData.fullName} (Lead)`];
      document.querySelectorAll('.ppt-dyn-mem').forEach(inp => mems.push(inp.value.trim()));
      AppState.formData.pptMembers = mems;
    }

    if (AppState.formData.structuraQuestSelected) {
      AppState.formData.questTeamName = questTeamNameInp.value.trim();
      const qMems = [`${AppState.formData.fullName} (Lead)`];
      const pptSize = parseInt(pptTeamSizeSel.value, 10);
      if (hasPPT && pptSize === 2) {
        const s = document.getElementById('quest-synced-mem');
        qMems.push(s ? s.value.trim() : 'Member 2');
      } else {
        const m = document.getElementById('quest-mem-2');
        qMems.push(m ? m.value.trim() : 'Member 2');
      }
      AppState.formData.questMembers = qMems;
    }

    saveLocalRecord({ ...AppState.formData });

    if (CONFIG.GAS_WEB_APP_URL) {
      try {
        await fetch(CONFIG.GAS_WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(AppState.formData)
        });
      } catch (e) {
        console.warn('Backend sync:', e);
      }
    }

    formContainer.style.display = 'none';
    successPanel.classList.add('active');
    document.getElementById('success-code-display').innerText = code;
    document.getElementById('success-email-notice').innerText = AppState.formData.email;

    document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
  });

  function setErr(el, msg) {
    el.classList.add('err');
    const parent = el.closest('.input-grp');
    if (parent) {
      let t = parent.querySelector('.input-err-msg');
      if (t) { t.innerText = msg; t.classList.add('show'); }
    }
  }

  function clearErr(el) {
    el.classList.remove('err');
    const parent = el.closest('.input-grp');
    if (parent) {
      const t = parent.querySelector('.input-err-msg');
      if (t) t.classList.remove('show');
    }
  }
}

/* 8. Check Registration Code-Only Lookup */
function initCheckRegistrationPortal() {
  const btn = document.getElementById('lookup-submit-btn');
  const inp = document.getElementById('lookup-code-inp');
  const resultPane = document.getElementById('lookup-result-pane');

  if (!btn || !inp || !resultPane) return;

  btn.addEventListener('click', () => {
    const raw = inp.value.trim().toUpperCase();
    if (!raw) {
      alert('Please enter your unique Registration Code (e.g. STR26-XXXX).');
      return;
    }

    btn.innerText = 'VERIFYING...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerText = 'VERIFY CODE';
      btn.disabled = false;

      const records = getLocalRecords();
      const match = records.find(r => r.registrationCode.toUpperCase() === raw);

      if (!match) {
        resultPane.innerHTML = `
          <div style="background:rgba(239, 68, 68, 0.12);border:1px solid #EF4444;padding:1.75rem;text-align:center;">
            <p style="font-family:var(--font-mono);font-weight:800;color:#F87171;font-size:1rem;">
              ✕ REGISTRATION NOT FOUND
            </p>
            <p style="font-size:0.85rem;color:#FCA5A5;margin-top:0.35rem;">
              No active delegate record matches code <strong>${esc(raw)}</strong>. Please verify the code.
            </p>
          </div>
        `;
        resultPane.classList.add('show');
        return;
      }

      resultPane.innerHTML = `
        <div style="background:var(--bg-surface);border:1px solid var(--border-medium);padding:2rem;box-shadow:0 15px 35px rgba(0,0,0,0.3);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);padding-bottom:1rem;margin-bottom:1.5rem;flex-wrap:wrap;gap:0.75rem;">
            <div>
              <span class="struct-tag orange" style="font-size:0.85rem;">${match.registrationCode}</span>
              <span class="struct-tag" style="background:#10B981;color:#FFF;border-color:#10B981;margin-left:0.5rem;">ACTIVE & VERIFIED</span>
              <h3 style="font-size:1.4rem;font-weight:800;margin-top:0.5rem;">${esc(match.fullName)}</h3>
            </div>
          </div>

          <table class="manifest-table-dark">
            <tr><th>College</th><td>${esc(match.collegeName)} (Code: ${esc(match.collegeCode)})</td></tr>
            <tr><th>Department & Year</th><td>${esc(match.department)} &bull; ${esc(match.year)} Year</td></tr>
            <tr><th>Contact</th><td>+91 ${esc(match.mobile)} &bull; ${esc(match.email)}</td></tr>
            <tr><th>Technical Events</th><td><span class="struct-tag orange">${match.techEvents.join('</span> <span class="struct-tag orange">')}</span></td></tr>
            ${match.techEvents.includes('Paper Presentation') ? `
              <tr><th>PPT Team</th><td><strong>${esc(match.pptTeamName)}</strong> (${match.pptTeamSize} Members)</td></tr>
              <tr><th>PPT Topic</th><td><em>${esc(match.pptTopic)}</em></td></tr>
              <tr><th>PPT Members</th><td>${match.pptMembers.join(', ')}</td></tr>
            ` : ''}
            ${match.structuraQuestSelected ? `
              <tr><th>The Structura Quest</th><td>Team: <strong>${esc(match.questTeamName)}</strong> [${match.questMembers.join(', ')}]</td></tr>
            ` : ''}
            <tr><th>Registration Date</th><td>${match.timestamp}</td></tr>
          </table>
        </div>
      `;
      resultPane.classList.add('show');
      resultPane.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  });
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
