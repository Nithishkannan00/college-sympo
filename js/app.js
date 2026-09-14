/**
 * ===============================================================
 * STRUCTURA'26 — Master Interactive Engine (Cinematic Edition)
 * Department of Civil Engineering | AAMEC
 * ===============================================================
 */

const CONFIG = {
  // Deployed Google Apps Script Web App Endpoint
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbx1mmdlSF-gvkQ06--A0st5Hvl2gNV30FsaOaTWqXAhS35NDWh2tdIY2W0AhuliqZgy/exec',
  MAX_ACTIVE_REGISTRATIONS: 30,
  HOST_COLLEGE_CODE: '8204',
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
    registrationCode: '',
    teamName: '',
    member1: {
      fullName: '',
      collegeName: '',
      collegeCode: '',
      department: '',
      year: '',
      email: '',
      mobile: ''
    },
    member2: null,
    member3: null,
    techEvents: [],
    structuraQuestSelected: false,
    pptTeamName: '',
    pptTeamSize: '1',
    pptTopic: '',
    registrationDate: '',
    status: 'ACTIVE'
  },
  dbKey: 'structura26_official_records_v6'
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
          teamName: 'AeroStructures',
          member1: {
            fullName: 'Karthikeyan S',
            collegeName: 'National Institute of Technology, Tiruchirappalli',
            collegeCode: '1004',
            department: 'Civil Engineering',
            year: '3rd',
            email: 'karthik.civil@nitt.edu',
            mobile: '9840123456'
          },
          member2: {
            fullName: 'Praveen Kumar R',
            collegeName: 'National Institute of Technology, Tiruchirappalli',
            collegeCode: '1004',
            department: 'Civil Engineering',
            year: '3rd',
            email: 'praveen.civil@nitt.edu',
            mobile: '9840987654'
          },
          member3: null,
          techEvents: ['Paper Presentation', 'AutoCAD'],
          structuraQuestSelected: true,
          events: 'Paper Presentation, AutoCAD, THE STRUCTURA QUEST',
          pptTopic: 'Sustainable 3D-printed construction',
          registrationDate: '12.09.2026 14:32:10',
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
  initEntryScreenCad('entry-cad-bg');
  initCadCanvas('site-cad-bg');
  initEntryScreen();
  initHeaderNavigation();
  initCountdownTimer();
  initEventModalPopup();
  initGeneralRulesAccordion();
  initRegistrationEngine();
  initCheckRegistrationPortal();
  initOrganizerSpotlight();
});

/* ===============================================================
   1A. HIGH-IMPACT ENTRY SCREEN 3D ARCHITECTURAL / STRUCTURAL CAD
       Multi-Tier High-Rise Structural Wireframe & Blueprint Matrix
   =============================================================== */
function initEntryScreenCad(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let time = 0;
  let rotY = 0.35, rotX = 0.22, rotZ = 0.05;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Multi-tier 3D Structural High-Rise Tower & Cantilever Geometry
  const buildingNodes = [];
  const buildingEdges = [];

  const stories = 7;
  const storyHeight = 55;
  const baseWidth = 180;
  const baseDepth = 180;

  // 1. Skyscraper Floor Tiers
  for (let s = 0; s <= stories; s++) {
    const y = (stories / 2 - s) * storyHeight;
    // Taper slightly towards top
    const taper = 1.0 - (s / (stories + 2)) * 0.45;
    const w = (baseWidth * taper) / 2;
    const d = (baseDepth * taper) / 2;

    const baseIdx = buildingNodes.length;

    // 4 Corner Column Nodes
    buildingNodes.push({ ox: -w, oy: y, oz: -d }); // 0: Top-Left
    buildingNodes.push({ ox:  w, oy: y, oz: -d }); // 1: Top-Right
    buildingNodes.push({ ox:  w, oy: y, oz:  d }); // 2: Bottom-Right
    buildingNodes.push({ ox: -w, oy: y, oz:  d }); // 3: Bottom-Left

    // Floor Perimeter Beams
    buildingEdges.push([baseIdx + 0, baseIdx + 1, 'beam']);
    buildingEdges.push([baseIdx + 1, baseIdx + 2, 'beam']);
    buildingEdges.push([baseIdx + 2, baseIdx + 3, 'beam']);
    buildingEdges.push([baseIdx + 3, baseIdx + 0, 'beam']);

    // Interior Cross Girders
    buildingEdges.push([baseIdx + 0, baseIdx + 2, 'interior']);
    buildingEdges.push([baseIdx + 1, baseIdx + 3, 'interior']);

    // Vertical Columns & X-Bracing connecting to previous story
    if (s > 0) {
      const prevIdx = baseIdx - 4;
      for (let c = 0; c < 4; c++) {
        const nextC = (c + 1) % 4;
        // Vertical Column
        buildingEdges.push([prevIdx + c, baseIdx + c, 'column']);
        // Diagonal X-Braces on Facade
        buildingEdges.push([prevIdx + c, baseIdx + nextC, 'brace']);
        buildingEdges.push([prevIdx + nextC, baseIdx + c, 'brace']);
      }
    }
  }

  // 2. Crown Architectural Spire on Top of Tower
  const topCenterIdx = buildingNodes.length;
  const topY = (stories / 2 - stories) * storyHeight - 90;
  buildingNodes.push({ ox: 0, oy: topY, oz: 0 });

  const lastStoryBase = (stories) * 4;
  for (let c = 0; c < 4; c++) {
    buildingEdges.push([lastStoryBase + c, topCenterIdx, 'spire']);
  }

  // 3. Floating Engineering Dimension Annotation Lines
  const dimensionMarkers = [
    { xRatio: 0.15, yRatio: 0.25, len: 140, label: 'ELEV: +145.00m' },
    { xRatio: 0.82, yRatio: 0.65, len: 160, label: 'GRID-AXIS: C-04' },
    { xRatio: 0.22, yRatio: 0.78, len: 120, label: 'SPAN: 42.50m' }
  ];

  // 4. Floating Ambient Technical CAD Particles
  const particles = [];
  const particleCount = 28;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.4,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.5
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    time += 0.015;

    if (!prefersReducedMotion) {
      rotY += 0.0035;
      rotX = 0.22 + Math.sin(time * 0.4) * 0.06;
      rotZ = Math.sin(time * 0.25) * 0.03;
    }

    // A. Background Blueprint Coordinate Grid
    const gridSize = 55;
    const gridOffset = (time * 5) % gridSize;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;

    for (let x = gridOffset; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gridOffset; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Grid Intersections Crosshairs
    ctx.fillStyle = 'rgba(255, 85, 0, 0.25)';
    for (let x = gridOffset; x < width; x += gridSize * 3) {
      for (let y = gridOffset; y < height; y += gridSize * 3) {
        ctx.fillRect(x - 3, y - 0.5, 7, 1);
        ctx.fillRect(x - 0.5, y - 3, 1, 7);
      }
    }

    // B. Receding Isometric Perspective Floor Grid (Civil Ground Datum Plane)
    ctx.strokeStyle = 'rgba(0, 163, 255, 0.05)';
    const groundY = height * 0.78;
    for (let i = -12; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(width * 0.5 + i * 25, groundY - 120);
      ctx.lineTo(width * 0.5 + i * 110, height);
      ctx.stroke();
    }

    // C. Technical Dimensions & Construction Markers
    dimensionMarkers.forEach(dm => {
      const px = width * dm.xRatio;
      const py = height * dm.yRatio;
      ctx.strokeStyle = 'rgba(0, 163, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(px + dm.len, py);
      ctx.stroke();

      // Tick markers
      ctx.beginPath();
      ctx.moveTo(px, py - 4); ctx.lineTo(px, py + 4);
      ctx.moveTo(px + dm.len, py - 4); ctx.lineTo(px + dm.len, py + 4);
      ctx.stroke();

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0, 163, 255, 0.28)';
      ctx.fillText(dm.label, px + 8, py - 6);
    });

    // D. 3D Skyscraper Wireframe Projection & Rendering
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const fov = 520;
    const centerX = width * 0.5;
    const centerY = height * 0.48;

    const projected = buildingNodes.map(n => {
      // Y Rotation
      let x1 = n.ox * cosY - n.oz * sinY;
      let z1 = n.ox * sinY + n.oz * cosY;
      // X Rotation
      let y1 = n.oy * cosX - z1 * sinX;
      let z2 = n.oy * sinX + z1 * cosX;
      // Z Rotation
      let x2 = x1 * cosZ - y1 * sinZ;
      let y2 = x1 * sinZ + y1 * cosZ;
      let z3 = z2 + 620;

      const scale = fov / z3;
      return {
        px: centerX + x2 * scale,
        py: centerY + y2 * scale,
        scale: scale,
        z: z3
      };
    });

    // Draw Wireframe Edges
    buildingEdges.forEach(([i, j, type]) => {
      const p1 = projected[i];
      const p2 = projected[j];

      if (type === 'column' || type === 'spire') {
        ctx.strokeStyle = 'rgba(0, 163, 255, 0.42)';
        ctx.lineWidth = 1.6;
      } else if (type === 'brace') {
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.38)';
        ctx.lineWidth = 1.1;
      } else if (type === 'beam') {
        ctx.strokeStyle = 'rgba(0, 163, 255, 0.32)';
        ctx.lineWidth = 1.3;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 0.8;
      }

      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    });

    // Draw Joint Connection Rivets & Nodes
    projected.forEach(p => {
      ctx.fillStyle = '#FF5500';
      ctx.beginPath();
      ctx.arc(p.px, p.py, Math.max(1.8, p.scale * 3.2), 0, Math.PI * 2);
      ctx.fill();

      // Ambient Node Glow
      ctx.fillStyle = 'rgba(255, 85, 0, 0.22)';
      ctx.beginPath();
      ctx.arc(p.px, p.py, Math.max(3.5, p.scale * 6.5), 0, Math.PI * 2);
      ctx.fill();
    });

    // E. Floating Ambient Technical Particles
    particles.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.y < -20) pt.y = height + 20;
      if (pt.x < -20) pt.x = width + 20;
      if (pt.x > width + 20) pt.x = -20;

      ctx.fillStyle = `rgba(255, 85, 0, ${pt.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // F. Horizontal Blueprint Laser Sweep
    const laserY = (time * 50) % height;
    const laserGrad = ctx.createLinearGradient(0, laserY, width, laserY);
    laserGrad.addColorStop(0, 'rgba(0, 163, 255, 0)');
    laserGrad.addColorStop(0.5, 'rgba(0, 163, 255, 0.12)');
    laserGrad.addColorStop(1, 'rgba(0, 163, 255, 0)');
    ctx.fillStyle = laserGrad;
    ctx.fillRect(0, laserY - 1, width, 2);

    requestAnimationFrame(render);
  }
  render();
}

/* ===============================================================
   1B. MAIN WEBSITE BACKGROUND CAD BLUEPRINT ENGINE
   =============================================================== */
function initCadCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let scrollY = 0;
  let rotX = 0.25, rotY = 0.4, rotZ = 0.1;
  let time = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }, { passive: true });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 3D Space Truss Structural Geometry Nodes (Warren Girder)
  const nodes = [];
  const edges = [];
  const cols = 5;
  const rows = 3;
  const depthLayers = 2;
  const dx = 140, dy = 90, dz = 120;

  for (let z = 0; z < depthLayers; z++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = (x - cols / 2 + 0.5) * dx;
        const py = (y - rows / 2 + 0.5) * dy;
        const pz = (z - depthLayers / 2 + 0.5) * dz;
        nodes.push({ x: px, y: py, z: pz, ox: px, oy: py, oz: pz });
      }
    }
  }

  const getIdx = (x, y, z) => z * (rows * cols) + y * cols + x;

  for (let z = 0; z < depthLayers; z++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = getIdx(x, y, z);
        if (x < cols - 1) edges.push([c, getIdx(x + 1, y, z), 'chord']);
        if (y < rows - 1) edges.push([c, getIdx(x, y + 1, z), 'vertical']);
        if (x < cols - 1 && y < rows - 1) {
          edges.push([c, getIdx(x + 1, y + 1, z), 'diagonal']);
          edges.push([getIdx(x + 1, y, z), getIdx(x, y + 1, z), 'diagonal']);
        }
        if (z < depthLayers - 1) {
          edges.push([c, getIdx(x, y, z + 1), 'cross']);
          if (x < cols - 1) edges.push([c, getIdx(x + 1, y, z + 1), 'cross']);
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    time += 0.012;
    const currentScrollOffset = scrollY * 0.0006;
    
    if (!prefersReducedMotion) {
      rotY += 0.002;
      rotX = 0.2 + Math.sin(time * 0.3) * 0.08 + currentScrollOffset;
      rotZ = Math.cos(time * 0.2) * 0.05;
    }

    // 1. Engineering Blueprint Grid
    const gridSize = 65;
    const gridOffset = (time * 6) % gridSize;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = gridOffset; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gridOffset; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Blueprint Intersection Crosshairs
    ctx.fillStyle = 'rgba(255, 85, 0, 0.18)';
    for (let x = gridOffset; x < width; x += gridSize * 3) {
      for (let y = gridOffset; y < height; y += gridSize * 3) {
        ctx.fillRect(x - 3, y - 0.5, 7, 1);
        ctx.fillRect(x - 0.5, y - 3, 1, 7);
      }
    }

    // 3. Real-time 3D Structural CAD Model
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const fov = 480;
    const centerX = width > 900 ? width * 0.72 : width * 0.5;
    const centerY = height * 0.42;

    const projected = nodes.map(n => {
      let x1 = n.ox * cosY - n.oz * sinY;
      let z1 = n.ox * sinY + n.oz * cosY;
      let y1 = n.oy * cosX - z1 * sinX;
      let z2 = n.oy * sinX + z1 * cosX;
      let x2 = x1 * cosZ - y1 * sinZ;
      let y2 = x1 * sinZ + y1 * cosZ;
      let z3 = z2 + 650;

      const scale = fov / z3;
      return {
        px: centerX + x2 * scale,
        py: centerY + y2 * scale,
        scale: scale,
        z: z3
      };
    });

    // Draw Structural Members (Edges)
    edges.forEach(([i, j, type]) => {
      const p1 = projected[i];
      const p2 = projected[j];

      if (type === 'chord') {
        ctx.strokeStyle = 'rgba(0, 163, 255, 0.22)';
        ctx.lineWidth = 1.6;
      } else if (type === 'diagonal') {
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.25)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 0.9;
      }

      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    });

    // Draw Structural Joint Nodes
    projected.forEach(p => {
      ctx.fillStyle = '#FF5500';
      ctx.beginPath();
      ctx.arc(p.px, p.py, Math.max(1.5, p.scale * 2.8), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 85, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(p.px, p.py, Math.max(3, p.scale * 5.5), 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
}

/* ===============================================================
   2. Entry Experience Trigger
   =============================================================== */
function initEntryScreen() {
  const entryLayer = document.getElementById('entry-layer');
  const entryBtn = document.getElementById('build-structura-btn');

  if (entryBtn && entryLayer) {
    entryBtn.addEventListener('click', () => {
      entryLayer.classList.add('unlocked');
    });
  }
}

/* ===============================================================
   3. Top Header Navigation & Mobile Sliding Drawer (Change 3)
   =============================================================== */
function initHeaderNavigation() {
  const toggle = document.getElementById('mobile-toggle-btn');
  const panel = document.getElementById('mobile-nav-panel');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close-btn');

  function openDrawer() {
    if (panel) panel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  if (panel) {
    panel.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
  }

  // Scroll active link indicator
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

/* ===============================================================
   4. Minimal Countdown Timer
   =============================================================== */
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

/* ===============================================================
   5. Event Popup Modal Engine (Smooth Transition • Image Overlay)
   =============================================================== */
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

/* ===============================================================
   6. General Rules Accordion (Exactly 4 Sets)
   =============================================================== */
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

/* ===============================================================
   7. Registration Engine & Robust Validation
   =============================================================== */
function initRegistrationEngine() {
  const form = document.getElementById('registration-details-form');
  if (!form) return;

  // Member 1 Basic Inputs
  const nameInp = document.getElementById('reg-fullname');
  const emailInp = document.getElementById('reg-email');
  const collegeInp = document.getElementById('reg-college');
  const codeInp = document.getElementById('reg-code');
  const codeAlert = document.getElementById('college-block-alert');
  const deptInp = document.getElementById('reg-dept');
  const yearInp = document.getElementById('reg-year');
  const mobileInp = document.getElementById('reg-mobile');

  // Event Selection Checkboxes
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
  const questDynamicMembers = document.getElementById('quest-dynamic-members');

  const submitBtn = document.getElementById('submit-registration-btn');
  const formContainer = document.getElementById('reg-form-container');
  const successPanel = document.getElementById('success-state-panel');

  // Host College Code 8204 Real-time Check
  codeInp.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val === CONFIG.HOST_COLLEGE_CODE) {
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

  nameInp.addEventListener('input', () => {
    if (AppState.formData.techEvents.includes('Paper Presentation')) renderPPTMembers();
    if (AppState.formData.structuraQuestSelected) renderQuestMembers();
  });

  // Render Additional PPT Members (Complete participant profile: Name, College, Code, Dept, Year, Email, Mobile)
  function renderPPTMembers() {
    const size = parseInt(pptTeamSizeSel.value, 10);
    const registrant = nameInp.value.trim() || 'Registrant (Member 1)';

    let html = `
      <div class="member-sub-card">
        <div class="member-sub-header">MEMBER 1 (TEAM HEAD / LEAD)</div>
        <input type="text" class="dark-input" value="${esc(registrant)}" readonly style="opacity:0.85;cursor:not-allowed;" />
      </div>
    `;

    for (let i = 2; i <= size; i++) {
      html += `
        <div class="member-sub-card" id="ppt-mem-card-${i}">
          <div class="member-sub-header">MEMBER ${i} COMPLETE DETAILS <span class="req">*</span></div>
          <div class="form-grid-2">
            <div class="input-grp">
              <label class="input-lbl">Member ${i} Full Name <span class="req">*</span></label>
              <input type="text" class="dark-input ppt-m-name" id="ppt-mem-${i}-name" placeholder="Full Name" required />
              <div class="input-err-msg">Full name required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Member ${i} Email Address <span class="req">*</span></label>
              <input type="email" class="dark-input ppt-m-email" id="ppt-mem-${i}-email" placeholder="Email Address" required />
              <div class="input-err-msg">Valid email required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Member ${i} College Name with Location <span class="req">*</span></label>
              <input type="text" class="dark-input ppt-m-college" id="ppt-mem-${i}-college" placeholder="College with Location" required />
              <div class="input-err-msg">College required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Member ${i} College Code <span class="req">*</span></label>
              <input type="text" class="dark-input ppt-m-code" id="ppt-mem-${i}-code" maxlength="6" placeholder="College Code" required />
              <div class="input-err-msg">Valid code required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Member ${i} Department <span class="req">*</span></label>
              <input type="text" class="dark-input ppt-m-dept" id="ppt-mem-${i}-dept" placeholder="Department" required />
              <div class="input-err-msg">Department required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Member ${i} Year <span class="req">*</span></label>
              <select class="dark-select ppt-m-year" id="ppt-mem-${i}-year" required>
                <option value="" selected disabled>Select Year</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
              </select>
              <div class="input-err-msg">Year required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Member ${i} Mobile (10-Digit) <span class="req">*</span></label>
              <input type="tel" class="dark-input ppt-m-mobile" id="ppt-mem-${i}-mobile" maxlength="10" placeholder="10-Digit Mobile" required />
              <div class="input-err-msg">Valid mobile required</div>
            </div>
          </div>
        </div>
      `;
    }

    pptDynamicMembers.innerHTML = html;

    // Attach sync listeners if Quest is active
    for (let i = 2; i <= size; i++) {
      const mName = document.getElementById(`ppt-mem-${i}-name`);
      if (mName) {
        mName.addEventListener('input', () => {
          if (AppState.formData.structuraQuestSelected) renderQuestMembers();
        });
      }
    }
  }

  // Render Structura Quest Member Details (Exactly 2 Members)
  function renderQuestMembers() {
    const registrant = nameInp.value.trim() || 'Registrant (Member 1)';
    const hasPPT = AppState.formData.techEvents.includes('Paper Presentation');
    const pptSize = parseInt(pptTeamSizeSel.value, 10);

    let html = `
      <div class="member-sub-card">
        <div class="member-sub-header">QUEST MEMBER 1 (TEAM HEAD)</div>
        <input type="text" class="dark-input" value="${esc(registrant)}" readonly style="opacity:0.85;cursor:not-allowed;" />
      </div>
    `;

    if (hasPPT && (pptSize === 2 || pptSize === 3)) {
      // Auto-synced from PPT Member 2
      const pptM2Name = document.getElementById('ppt-mem-2-name');
      const syncedName = pptM2Name && pptM2Name.value.trim() ? pptM2Name.value.trim() : 'PPT Member 2';

      html += `
        <div class="member-sub-card">
          <div class="member-sub-header">QUEST MEMBER 2 (AUTO-SYNCED FROM PPT MEMBER 2)</div>
          <input type="text" class="dark-input" id="quest-synced-name" value="${esc(syncedName)}" readonly style="opacity:0.85;cursor:not-allowed;" />
          <p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);margin-top:0.4rem;">
            * All participant profile details are automatically linked from PPT Member 2.
          </p>
        </div>
      `;
    } else {
      // Need complete profile for Quest Member 2
      html += `
        <div class="member-sub-card" id="quest-mem2-card">
          <div class="member-sub-header">QUEST MEMBER 2 COMPLETE DETAILS <span class="req">*</span></div>
          <div class="form-grid-2">
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 Full Name <span class="req">*</span></label>
              <input type="text" class="dark-input" id="quest-mem2-name" placeholder="Full Name" required />
              <div class="input-err-msg">Full name required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 Email Address <span class="req">*</span></label>
              <input type="email" class="dark-input" id="quest-mem2-email" placeholder="Email Address" required />
              <div class="input-err-msg">Valid email required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 College with Location <span class="req">*</span></label>
              <input type="text" class="dark-input" id="quest-mem2-college" placeholder="College with Location" required />
              <div class="input-err-msg">College required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 College Code <span class="req">*</span></label>
              <input type="text" class="dark-input" id="quest-mem2-code" maxlength="6" placeholder="College Code" required />
              <div class="input-err-msg">Valid code required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 Department <span class="req">*</span></label>
              <input type="text" class="dark-input" id="quest-mem2-dept" placeholder="Department" required />
              <div class="input-err-msg">Department required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 Year <span class="req">*</span></label>
              <select class="dark-select" id="quest-mem2-year" required>
                <option value="" selected disabled>Select Year</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
              </select>
              <div class="input-err-msg">Year required</div>
            </div>
            <div class="input-grp">
              <label class="input-lbl">Quest Member 2 Mobile (10-Digit) <span class="req">*</span></label>
              <input type="tel" class="dark-input" id="quest-mem2-mobile" maxlength="10" placeholder="10-Digit Mobile" required />
              <div class="input-err-msg">Valid mobile required</div>
            </div>
          </div>
        </div>
      `;
    }

    questDynamicMembers.innerHTML = html;
  }

  // Validation Routine
  function validateAll() {
    let valid = true;

    // Member 1 Validation
    if (!nameInp.value.trim()) { setErr(nameInp, 'Full name is required'); valid = false; } else clearErr(nameInp);
    if (!collegeInp.value.trim()) { setErr(collegeInp, 'College Name with Location is required'); valid = false; } else clearErr(collegeInp);

    const cCode = codeInp.value.trim();
    if (!cCode || cCode.length > 6) { setErr(codeInp, 'Valid college code required (max 6 digits)'); valid = false; }
    else if (cCode === CONFIG.HOST_COLLEGE_CODE) { codeAlert.classList.add('show'); valid = false; }
    else clearErr(codeInp);

    if (!deptInp.value.trim()) { setErr(deptInp, 'Department is required'); valid = false; } else clearErr(deptInp);
    if (!yearInp.value) { setErr(yearInp, 'Please select your Year of Study'); valid = false; } else clearErr(yearInp);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInp.value.trim())) { setErr(emailInp, 'Valid email address required'); valid = false; } else clearErr(emailInp);

    const mob = mobileInp.value.trim();
    if (!/^[6-9]\d{9}$/.test(mob)) { setErr(mobileInp, 'Valid 10-digit Indian mobile number required'); valid = false; }
    else {
      const existing = getLocalRecords();
      const mobTaken = existing.some(r => {
        if (r.status !== 'ACTIVE') return false;
        if (r.member1 && r.member1.mobile === mob) return true;
        if (r.member2 && r.member2.mobile === mob) return true;
        if (r.member3 && r.member3.mobile === mob) return true;
        return false;
      });
      if (mobTaken) {
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
        const teamTaken = existing.some(r => r.teamName && r.teamName.toLowerCase() === tName.toLowerCase() && r.status === 'ACTIVE');
        if (teamTaken) {
          setErr(pptTeamNameInp, 'Team name has already been taken. Please enter a new team name.');
          valid = false;
        } else {
          clearErr(pptTeamNameInp);
        }
      }

      if (!pptTopicSel.value) { setErr(pptTopicSel, 'Please select an official PPT topic'); valid = false; } else clearErr(pptTopicSel);

      const size = parseInt(pptTeamSizeSel.value, 10);
      for (let i = 2; i <= size; i++) {
        const mName = document.getElementById(`ppt-mem-${i}-name`);
        const mEmail = document.getElementById(`ppt-mem-${i}-email`);
        const mCollege = document.getElementById(`ppt-mem-${i}-college`);
        const mCode = document.getElementById(`ppt-mem-${i}-code`);
        const mDept = document.getElementById(`ppt-mem-${i}-dept`);
        const mYear = document.getElementById(`ppt-mem-${i}-year`);
        const mMobile = document.getElementById(`ppt-mem-${i}-mobile`);

        if (mName && !mName.value.trim()) { setErr(mName, 'Full name required'); valid = false; } else if (mName) clearErr(mName);
        if (mEmail && !emailRegex.test(mEmail.value.trim())) { setErr(mEmail, 'Valid email required'); valid = false; } else if (mEmail) clearErr(mEmail);
        if (mCollege && !mCollege.value.trim()) { setErr(mCollege, 'College required'); valid = false; } else if (mCollege) clearErr(mCollege);
        if (mCode && (!mCode.value.trim() || mCode.value.trim() === CONFIG.HOST_COLLEGE_CODE)) {
          setErr(mCode, mCode.value.trim() === CONFIG.HOST_COLLEGE_CODE ? 'Host college not eligible' : 'Code required');
          valid = false;
        } else if (mCode) clearErr(mCode);
        if (mDept && !mDept.value.trim()) { setErr(mDept, 'Department required'); valid = false; } else if (mDept) clearErr(mDept);
        if (mYear && !mYear.value) { setErr(mYear, 'Year required'); valid = false; } else if (mYear) clearErr(mYear);
        if (mMobile && !/^[6-9]\d{9}$/.test(mMobile.value.trim())) { setErr(mMobile, 'Valid 10-digit mobile required'); valid = false; } else if (mMobile) clearErr(mMobile);
      }
    }

    // Structura Quest Standalone Member 2 Validation
    const hasQuest = AppState.formData.structuraQuestSelected;
    const pptSize = parseInt(pptTeamSizeSel.value, 10);
    if (hasQuest && (!hasPPT || pptSize === 1)) {
      const qName = document.getElementById('quest-mem2-name');
      const qEmail = document.getElementById('quest-mem2-email');
      const qCollege = document.getElementById('quest-mem2-college');
      const qCode = document.getElementById('quest-mem2-code');
      const qDept = document.getElementById('quest-mem2-dept');
      const qYear = document.getElementById('quest-mem2-year');
      const qMobile = document.getElementById('quest-mem2-mobile');

      if (qName && !qName.value.trim()) { setErr(qName, 'Full name required'); valid = false; } else if (qName) clearErr(qName);
      if (qEmail && !emailRegex.test(qEmail.value.trim())) { setErr(qEmail, 'Valid email required'); valid = false; } else if (qEmail) clearErr(qEmail);
      if (qCollege && !qCollege.value.trim()) { setErr(qCollege, 'College required'); valid = false; } else if (qCollege) clearErr(qCollege);
      if (qCode && (!qCode.value.trim() || qCode.value.trim() === CONFIG.HOST_COLLEGE_CODE)) {
        setErr(qCode, qCode.value.trim() === CONFIG.HOST_COLLEGE_CODE ? 'Host college not eligible' : 'Code required');
        valid = false;
      } else if (qCode) clearErr(qCode);
      if (qDept && !qDept.value.trim()) { setErr(qDept, 'Department required'); valid = false; } else if (qDept) clearErr(qDept);
      if (qYear && !qYear.value) { setErr(qYear, 'Year required'); valid = false; } else if (qYear) clearErr(qYear);
      if (qMobile && !/^[6-9]\d{9}$/.test(qMobile.value.trim())) { setErr(qMobile, 'Valid 10-digit mobile required'); valid = false; } else if (qMobile) clearErr(qMobile);
    }

    return valid;
  }

  // Submit Handler
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

    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerText = 'PROCESSING REGISTRATION...';

    const now = new Date();
    const regDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Construct Member 1
    const mem1 = {
      fullName: nameInp.value.trim(),
      collegeName: collegeInp.value.trim(),
      collegeCode: codeInp.value.trim(),
      department: deptInp.value.trim(),
      year: yearInp.value,
      email: emailInp.value.trim(),
      mobile: mobileInp.value.trim()
    };

    let mem2 = null;
    let mem3 = null;

    const hasPPT = AppState.formData.techEvents.includes('Paper Presentation');
    const pptSize = parseInt(pptTeamSizeSel.value, 10);
    const hasQuest = AppState.formData.structuraQuestSelected;

    if (hasPPT && (pptSize === 2 || pptSize === 3)) {
      mem2 = {
        fullName: document.getElementById('ppt-mem-2-name').value.trim(),
        email: document.getElementById('ppt-mem-2-email').value.trim(),
        collegeName: document.getElementById('ppt-mem-2-college').value.trim(),
        collegeCode: document.getElementById('ppt-mem-2-code').value.trim(),
        department: document.getElementById('ppt-mem-2-dept').value.trim(),
        year: document.getElementById('ppt-mem-2-year').value,
        mobile: document.getElementById('ppt-mem-2-mobile').value.trim()
      };
    } else if (hasQuest && (!hasPPT || pptSize === 1)) {
      mem2 = {
        fullName: document.getElementById('quest-mem2-name').value.trim(),
        email: document.getElementById('quest-mem2-email').value.trim(),
        collegeName: document.getElementById('quest-mem2-college').value.trim(),
        collegeCode: document.getElementById('quest-mem2-code').value.trim(),
        department: document.getElementById('quest-mem2-dept').value.trim(),
        year: document.getElementById('quest-mem2-year').value,
        mobile: document.getElementById('quest-mem2-mobile').value.trim()
      };
    }

    if (hasPPT && pptSize === 3) {
      mem3 = {
        fullName: document.getElementById('ppt-mem-3-name').value.trim(),
        email: document.getElementById('ppt-mem-3-email').value.trim(),
        collegeName: document.getElementById('ppt-mem-3-college').value.trim(),
        collegeCode: document.getElementById('ppt-mem-3-code').value.trim(),
        department: document.getElementById('ppt-mem-3-dept').value.trim(),
        year: document.getElementById('ppt-mem-3-year').value,
        mobile: document.getElementById('ppt-mem-3-mobile').value.trim()
      };
    }

    const masterTeamName = hasPPT ? pptTeamNameInp.value.trim() : '';
    const pptTopic = hasPPT ? pptTopicSel.value : '';

    const allEventsList = [...AppState.formData.techEvents];
    if (hasQuest) allEventsList.push('THE STRUCTURA QUEST');
    const eventsString = allEventsList.join(', ');

    // Normalize member object with all standard field aliases for GAS backend compatibility
    function normalizeMember(m) {
      if (!m) return null;
      return {
        fullName: m.fullName || m.name || '',
        name: m.fullName || m.name || '',
        collegeName: m.collegeName || m.college || '',
        college: m.collegeName || m.college || '',
        collegeCode: m.collegeCode || m.code || '',
        code: m.collegeCode || m.code || '',
        department: m.department || m.dept || '',
        dept: m.department || m.dept || '',
        year: m.year || '',
        email: m.email || '',
        mobile: m.mobile || m.phone || '',
        phone: m.mobile || m.phone || ''
      };
    }

    const payload = {
      action: 'register',
      teamName: masterTeamName,
      member1: normalizeMember(mem1),
      member2: normalizeMember(mem2),
      member3: normalizeMember(mem3),
      technicalEvents: AppState.formData.techEvents,
      techEvents: AppState.formData.techEvents,
      structuraQuestSelected: hasQuest,
      events: eventsString,
      pptTeamName: masterTeamName,
      pptTeamSize: String(pptSize),
      pptTopic: pptTopic,
      registrationDate: regDate,
      status: 'ACTIVE'
    };

    try {
      if (!CONFIG.GAS_WEB_APP_URL) {
        alert('Registration Web App URL is not configured.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const res = await resp.json();

      if (res && res.success && res.registrationCode) {
        const backendCode = res.registrationCode;
        payload.registrationCode = backendCode;

        // Save backend-verified record to local mirror
        saveLocalRecord(payload);

        // Transition UI to Success State
        formContainer.style.display = 'none';
        successPanel.classList.add('active');
        document.getElementById('success-code-display').innerText = backendCode;
        document.getElementById('success-email-notice').innerText = mem1.email;

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;

        document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
      } else {
        // Backend returned failure / validation rejection
        const errorMsg = (res && (res.error || res.message)) ? (res.error || res.message) : 'Registration could not be completed. Please check your details.';
        alert(errorMsg);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      alert('Unable to connect to the registration server. Please check your internet connection and try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });

  function setErr(el, msg) {
    el.classList.add('err');
    const parent = el.closest('.input-grp');
    if (parent) {
      const t = parent.querySelector('.input-err-msg');
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

/* ===============================================================
   8. Check Registration Code-Only Lookup
   =============================================================== */
function initCheckRegistrationPortal() {
  const btn = document.getElementById('lookup-submit-btn');
  const inp = document.getElementById('lookup-code-inp');
  const resultPane = document.getElementById('lookup-result-pane');

  if (!btn || !inp || !resultPane) return;

  btn.addEventListener('click', async () => {
    const raw = inp.value.trim().toUpperCase();
    if (!raw) {
      alert('Please enter your unique Registration Code (e.g. STR26-XXXX).');
      return;
    }

    btn.innerText = 'VERIFYING...';
    btn.disabled = true;

    let match = null;

    // 1. Attempt live fetch from Google Apps Script Web App
    if (CONFIG.GAS_WEB_APP_URL) {
      try {
        const resp = await fetch(CONFIG.GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'checkRegistration',
            registrationCode: raw
          })
        });
        const json = await resp.json();
        if (json && json.success && json.registration) {
          match = json.registration;
        }
      } catch (e) {
        console.warn('Live lookup sync:', e);
      }
    }

    // 2. Fallback to local mirror cache if offline / not found live
    if (!match) {
      const localRecords = getLocalRecords();
      match = localRecords.find(r => r.registrationCode && r.registrationCode.toUpperCase() === raw);
    }

    setTimeout(() => {
      btn.innerText = 'VERIFY CODE';
      btn.disabled = false;

      if (!match) {
        resultPane.innerHTML = `
          <div style="background:rgba(239, 68, 68, 0.12);border:1px solid #EF4444;padding:1.75rem;text-align:center;">
            <p style="font-family:var(--font-mono);font-weight:800;color:#F87171;font-size:1rem;">
              ✕ REGISTRATION NOT FOUND
            </p>
            <p style="font-size:0.85rem;color:#FCA5A5;margin-top:0.35rem;">
              No active delegate record matches code <strong>${esc(raw)}</strong>. Please verify your code.
            </p>
          </div>
        `;
        resultPane.classList.add('show');
        return;
      }

      function parseOrFormatMember(mem, defaultLabel) {
        if (!mem) return '';
        if (typeof mem === 'string') {
          return `<div><strong>${defaultLabel}:</strong> ${esc(mem)}</div>`;
        }
        let label = `<strong>${defaultLabel}:</strong> ${esc(mem.fullName || mem.name || 'Delegate')}`;
        if (mem.mobile || mem.phone) label += ` (+91 ${esc(mem.mobile || mem.phone)})`;
        if (mem.email) label += ` &bull; ${esc(mem.email)}`;
        return `<div>${label}</div>`;
      }

      let membersListHtml = parseOrFormatMember(match.member1, 'Member 1 (Lead)');
      if (match.member2) {
        membersListHtml += `<div style="margin-top:0.35rem;">${parseOrFormatMember(match.member2, 'Member 2')}</div>`;
      }
      if (match.member3) {
        membersListHtml += `<div style="margin-top:0.35rem;">${parseOrFormatMember(match.member3, 'Member 3')}</div>`;
      }

      const m1 = typeof match.member1 === 'object' && match.member1 ? match.member1 : {};
      const leadName = m1.fullName || m1.name || (typeof match.member1 === 'string' ? match.member1.split('|')[0].replace('Name:', '').trim() : 'Delegate');
      const leadCollege = m1.collegeName || m1.college || '';
      const leadDept = m1.department || m1.dept || '';
      const leadYear = m1.year || '';

      resultPane.innerHTML = `
        <div style="background:var(--bg-surface);border:1px solid var(--border-medium);padding:2rem;box-shadow:0 15px 35px rgba(0,0,0,0.4);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);padding-bottom:1rem;margin-bottom:1.5rem;flex-wrap:wrap;gap:0.75rem;">
            <div>
              <span class="struct-tag orange" style="font-size:0.85rem;">${esc(match.registrationCode || raw)}</span>
              <span class="struct-tag" style="background:#10B981;color:#FFF;border-color:#10B981;margin-left:0.5rem;">ACTIVE & VERIFIED</span>
              <h3 style="font-size:1.4rem;font-weight:800;margin-top:0.5rem;">${esc(leadName)}</h3>
            </div>
          </div>

          <table class="manifest-table-dark">
            ${leadCollege ? `<tr><th>College</th><td>${esc(leadCollege)}</td></tr>` : ''}
            ${leadDept || leadYear ? `<tr><th>Department & Year</th><td>${esc(leadDept)} ${leadYear ? `&bull; ${esc(leadYear)} Year` : ''}</td></tr>` : ''}
            <tr><th>Selected Events</th><td><span class="struct-tag orange">${esc(match.events || (match.technicalEvents ? match.technicalEvents.join(', ') : (match.techEvents ? match.techEvents.join(', ') : '')))}</span></td></tr>
            ${match.teamName ? `<tr><th>Team Name</th><td><strong>${esc(match.teamName)}</strong></td></tr>` : ''}
            ${match.pptTopic ? `<tr><th>PPT Topic</th><td><em>${esc(match.pptTopic)}</em></td></tr>` : ''}
            <tr><th>Participants</th><td>${membersListHtml}</td></tr>
            <tr><th>Registration Date</th><td>${esc(match.registrationDate || match.timestamp || '')}</td></tr>
          </table>
        </div>
      `;
      resultPane.classList.add('show');
      resultPane.scrollIntoView({ behavior: 'smooth' });
    }, 200);
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

/* ===============================================================
   9. Organizers One-by-One Spotlight Controller
   =============================================================== */
function initOrganizerSpotlight() {
  const container = document.getElementById('organizer-spotlight');
  if (!container) return;

  const steps = container.querySelectorAll('.org-seq-step, .org-tab-btn');
  const slides = container.querySelectorAll('.organizer-slide-item');
  const dots = container.querySelectorAll('.org-dot');
  const prevBtn = document.getElementById('org-prev-btn');
  const nextBtn = document.getElementById('org-next-btn');

  let currentIdx = 0;
  const total = slides.length;
  let autoTimer = null;

  function showSlide(idx) {
    currentIdx = (idx + total) % total;
    
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIdx);
    });

    steps.forEach((step, i) => {
      step.classList.toggle('active', i === currentIdx);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIdx);
    });
  }

  steps.forEach(step => {
    step.addEventListener('click', () => {
      const idx = parseInt(step.getAttribute('data-org-index'), 10);
      showSlide(idx);
      resetAutoTimer();
    });
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-org-index'), 10);
      showSlide(idx);
      resetAutoTimer();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentIdx - 1);
      resetAutoTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentIdx + 1);
      resetAutoTimer();
    });
  }

  function resetAutoTimer() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      showSlide(currentIdx + 1);
    }, 4500);
  }

  container.addEventListener('mouseenter', () => {
    if (autoTimer) clearInterval(autoTimer);
  });
  container.addEventListener('mouseleave', resetAutoTimer);

  resetAutoTimer();
}
