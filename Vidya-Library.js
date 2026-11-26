/* =========================================================
   VIDYA LIBRARY | THE STUDY ZONE - RAJNANDGAON
   COMPLETE JAVASCRIPT
   Firebase Realtime Database Direct Sync (Users, Seats, Lockers, Bookings)
   Mobile Auth + Forgot Password + Live Availability + Admin
   ========================================================= */

"use strict";

/* ================= PLAN DISPLAY NAME HELPER ================= */
function getPlanDisplayName(p) {
    if (p === "4") return "4 घंटे (शिफ्ट)";
    if (p === "6") return "6 घंटे (शिफ्ट)";
    if (p === "8") return "8 घंटे (शिफ्ट)";
    if (p === "Full Time") return "Full Time (24/7)";
    if (p === "Reserved") return "Reserved (फिक्स्ड अपनी सीट)";
    return p || "4 घंटे";
}
window.getPlanDisplayName = getPlanDisplayName;


import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    update,
    child,
    onValue,
    push,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
    apiKey: "AIzaSyAinNLUTaMDRYhAHId_3c-44nN2ygGAF_c",
    authDomain: "vidya-library-7aeb7.firebaseapp.com",
    databaseURL: "https://vidya-library-7aeb7-default-rtdb.firebaseio.com",
    projectId: "vidya-library-7aeb7",
    storageBucket: "vidya-library-7aeb7.firebasestorage.app",
    messagingSenderId: "213812561204",
    appId: "1:213812561204:web:7cec5ec006e1a419f51161"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================= LIBRARY SETTINGS ================= */
const TOTAL_SEATS = 80;
const TOTAL_LOCKERS = 24;
const DEPOSIT = 300;
const LOCKER_MONTHLY = 100;
const UPI_ID = "q270033628@ybl";
const PAYEE_NAME = "Vidyalibrary the study zone";
const LIBRARY_PHONE_1 = "9111701828";
const LIBRARY_PHONE_2 = "7000545675";
const LIBRARY_PHONE = "9111701828";
const LIBRARY_ADDRESS = "Add. - 1st Floor, Near Digvijay College, Front of Durga Mandir, Shiv Towar, Rajnandgaon (C.G.)";

/* ================= FEES STRUCTURE ================= */
const FEES = {
    "4": { "1": 500, "2": 800, "3": 1200, "6": 2400 },
    "6": { "1": 700, "2": 1200, "3": 1800, "6": 3200 },
    "8": { "1": 900, "2": 1600, "3": 2200, "6": 4000 },
    "Full Time": { "1": 1000, "2": 1800, "3": 2500, "6": 4500 },
    "Reserved": { "1": 1200, "2": 2200, "3": 3200, "6": 5500 }
};

/* ================= SEED BOOKS ================= */
const INITIAL_BOOKS = [
  {
    "id": "b1",
    "title": "Ankganit (RS Agrawal)",
    "author": "RS Agrawal",
    "category": "गणित (Maths)",
    "copies": 2
  },
  {
    "id": "b2",
    "title": "Ankganit (S.D. Yadav)",
    "author": "S.D. Yadav",
    "category": "गणित (Maths)",
    "copies": 2
  },
  {
    "id": "b3",
    "title": "Lakshmikant (Bharat Ki Rajvyavastha)",
    "author": "M. Laxmikanth",
    "category": "राजव्यवस्था (Polity)",
    "copies": 2
  },
  {
    "id": "b4",
    "title": "Aryabhatt (Maths)",
    "author": "Aryabhatt Publication",
    "category": "गणित (Maths)",
    "copies": 2
  },
  {
    "id": "b5",
    "title": "Deepak Kumar (Reasoning)",
    "author": "Deepak Kumar",
    "category": "रीजनिंग (Reasoning)",
    "copies": 2
  },
  {
    "id": "b6",
    "title": "Aryabhatt (Reasoning)",
    "author": "Aryabhatt Publication",
    "category": "रीजनिंग (Reasoning)",
    "copies": 1
  },
  {
    "id": "b7",
    "title": "Vinay Kumar Pathak (Hindi)",
    "author": "Vinay Kumar Pathak",
    "category": "हिंदी भाषा",
    "copies": 2
  },
  {
    "id": "b8",
    "title": "Vinay Kumar (Chhattisgarhi)",
    "author": "Vinay Kumar",
    "category": "छत्तीसगढ़ी भाषा",
    "copies": 2
  },
  {
    "id": "b9",
    "title": "Lucent Samanya Gyan",
    "author": "Lucent Publication",
    "category": "सामान्य ज्ञान (GK)",
    "copies": 2
  },
  {
    "id": "b10",
    "title": "Lucent Hindi",
    "author": "Lucent Publication",
    "category": "हिंदी भाषा",
    "copies": 2
  },
  {
    "id": "b11",
    "title": "Lucent Sa. Vigyan (General Science)",
    "author": "Lucent Publication",
    "category": "सामान्य विज्ञान",
    "copies": 2
  },
  {
    "id": "b12",
    "title": "Mahesh Kr Barnwal (Bhugol)",
    "author": "Mahesh Kumar Barnwal",
    "category": "भूगोल (Geography)",
    "copies": 2
  },
  {
    "id": "b13",
    "title": "Ramkumar Behar",
    "author": "Ramkumar Behar",
    "category": "छत्तीसगढ़ संदर्भ",
    "copies": 1
  },
  {
    "id": "b14",
    "title": "Gitesh Kumar Janjati",
    "author": "Gitesh Kumar",
    "category": "जनजाति एवं संस्कृति",
    "copies": 1
  },
  {
    "id": "b15",
    "title": "Gitesh Kumar Manna Sanskriti",
    "author": "Gitesh Kumar",
    "category": "संस्कृति एवं परंपरा",
    "copies": 1
  },
  {
    "id": "b16",
    "title": "HR Vishisht Adhyayan (CG)",
    "author": "Hariram Patel (HR)",
    "category": "छत्तीसगढ़ अध्ययन",
    "copies": 2
  },
  {
    "id": "b17",
    "title": "Neetu Mam English (Vol-1)",
    "author": "Neetu Singh (KD Campus)",
    "category": "अंग्रेजी (English)",
    "copies": 1
  },
  {
    "id": "b18",
    "title": "Neetu Mam English (Vol-2)",
    "author": "Neetu Singh (KD Campus)",
    "category": "अंग्रेजी (English)",
    "copies": 1
  },
  {
    "id": "b19",
    "title": "HR Samanya Angreji",
    "author": "Hariram Patel (HR)",
    "category": "अंग्रेजी (English)",
    "copies": 2
  },
  {
    "id": "b20",
    "title": "Arihant CTET (Ganit)",
    "author": "Arihant Publication",
    "category": "शिक्षक पात्रता (CTET/TET)",
    "copies": 1
  },
  {
    "id": "b21",
    "title": "Arihant CTET (Sa. Vigyan)",
    "author": "Arihant Publication",
    "category": "शिक्षक पात्रता (CTET/TET)",
    "copies": 1
  },
  {
    "id": "b22",
    "title": "HR (CG Class Notes)",
    "author": "Hariram Patel (HR)",
    "category": "छत्तीसगढ़ क्लास नोट्स",
    "copies": 2
  },
  {
    "id": "b23",
    "title": "Arihant Samanya Adhyayan 1400+",
    "author": "Arihant Publication",
    "category": "सामान्य अध्ययन",
    "copies": 2
  },
  {
    "id": "b24",
    "title": "Samanya Gyan Manohar Pandey",
    "author": "Manohar Pandey",
    "category": "सामान्य ज्ञान (GK)",
    "copies": 2
  },
  {
    "id": "b25",
    "title": "HR Computer (Solved)",
    "author": "Hariram Patel (HR)",
    "category": "कंप्यूटर ज्ञान",
    "copies": 2
  },
  {
    "id": "b26",
    "title": "Madan Kumar",
    "author": "Madan Kumar",
    "category": "प्रतियोगी संदर्भ",
    "copies": 1
  },
  {
    "id": "b27",
    "title": "Hindi Vidhish",
    "author": "Vidhish Publication",
    "category": "हिंदी साहित्य व व्याकरण",
    "copies": 1
  },
  {
    "id": "b28",
    "title": "Rojgar / Suchna",
    "author": "Govt Publications",
    "category": "रोजगार व सूचना",
    "copies": 1
  },
  {
    "id": "b29",
    "title": "CG Vastunishth Solved Paper",
    "author": "CG Vyapam / CGPSC",
    "category": "सॉल्व्ड पेपर्स",
    "copies": 1
  },
  {
    "id": "b30",
    "title": "Pariksha Vani (Jeev Vigyan)",
    "author": "Pariksha Vani",
    "category": "जीव विज्ञान (Biology)",
    "copies": 2
  },
  {
    "id": "b31",
    "title": "Pariksha Vani (Bhautik Rasayan)",
    "author": "Pariksha Vani",
    "category": "भौतिक व रसायन",
    "copies": 2
  },
  {
    "id": "b32",
    "title": "Vinay Kumar (CG Handbook)",
    "author": "Vinay Kumar",
    "category": "छत्तीसगढ़ हैंडबुक",
    "copies": 2
  },
  {
    "id": "b33",
    "title": "HR Bharat Bhugol",
    "author": "Hariram Patel (HR)",
    "category": "भारत का भूगोल",
    "copies": 2
  },
  {
    "id": "b34",
    "title": "Arihant (SSC-GD)",
    "author": "Arihant Publication",
    "category": "SSC-GD भर्ती",
    "copies": 2
  },
  {
    "id": "b35",
    "title": "Arihant (Railway Group D)",
    "author": "Arihant Publication",
    "category": "रेलवे (Railway)",
    "copies": 2
  },
  {
    "id": "b36",
    "title": "Vardhwal (Itihas)",
    "author": "Vardhwal Publication",
    "category": "इतिहास (History)",
    "copies": 2
  },
  {
    "id": "b37",
    "title": "Vardhwal (Arthashastra)",
    "author": "Vardhwal Publication",
    "category": "अर्थशास्त्र (Economics)",
    "copies": 2
  },
  {
    "id": "b38",
    "title": "Ghatnachakra (Bhugol)",
    "author": "Ghatna Chakra",
    "category": "पूर्वावलोकन भूगोल",
    "copies": 2
  },
  {
    "id": "b39",
    "title": "HR CGPSC Solved",
    "author": "Hariram Patel (HR)",
    "category": "CGPSC सॉल्व्ड पेपर्स",
    "copies": 2
  },
  {
    "id": "b40",
    "title": "HR Hamar Chhattisgarhi Bhasha",
    "author": "Hariram Patel (HR)",
    "category": "छत्तीसगढ़ी भाषा",
    "copies": 1
  },
  {
    "id": "b41",
    "title": "HR CG Ko Gaurav Shala",
    "author": "Hariram Patel (HR)",
    "category": "छत्तीसगढ़ सामान्य ज्ञान",
    "copies": 1
  },
  {
    "id": "b42",
    "title": "HR - CG VYAPAM Solved",
    "author": "Hariram Patel (HR)",
    "category": "व्यापम सॉल्व्ड पेपर्स",
    "copies": 1
  },
  {
    "id": "b43",
    "title": "HR Lok Kala Sanskriti",
    "author": "Hariram Patel (HR)",
    "category": "लोक कला एवं संस्कृति",
    "copies": 1
  },
  {
    "id": "b44",
    "title": "Delhi IAS Prashnottari Sangrah",
    "author": "Delhi IAS Academy",
    "category": "IAS/PSC प्रश्नोत्तरी",
    "copies": 1
  },
  {
    "id": "b45",
    "title": "Varnwal Samvidhan",
    "author": "Mahesh Kumar Barnwal",
    "category": "भारतीय संविधान",
    "copies": 1
  },
  {
    "id": "b46",
    "title": "Tuteja CG Prashnottari",
    "author": "Tuteja Tutorials",
    "category": "छत्तीसगढ़ प्रश्नोत्तरी",
    "copies": 1
  },
  {
    "id": "b47",
    "title": "Book Nayak Current Affairs",
    "author": "Book Nayak",
    "category": "करेंट अफेयर्स",
    "copies": 1
  },
  {
    "id": "b48",
    "title": "Picasso (General English / GS)",
    "author": "Picasso Series",
    "category": "सामान्य अध्ययन",
    "copies": 1
  },
  {
    "id": "b49",
    "title": "e-Pathshala Current Affairs",
    "author": "e-Pathshala",
    "category": "करेंट अफेयर्स",
    "copies": 1
  },
  {
    "id": "b50",
    "title": "Arjuna Current Affairs",
    "author": "Arjuna Publication",
    "category": "करेंट अफेयर्स",
    "copies": 1
  },
  {
    "id": "b51",
    "title": "UGC NET (Madan-1)",
    "author": "KVS Madaan",
    "category": "UGC NET Paper 1",
    "copies": 2
  },
  {
    "id": "b52",
    "title": "UGC NET (Arihant-1)",
    "author": "Arihant Publication",
    "category": "UGC NET Paper 1",
    "copies": 2
  },
  {
    "id": "b53",
    "title": "Ghatnachakra Hindi",
    "author": "Ghatna Chakra",
    "category": "पूर्वावलोकन सामान्य हिंदी",
    "copies": 2
  },
  {
    "id": "b54",
    "title": "Ghatnachakra Rajya Vyavastha",
    "author": "Ghatna Chakra",
    "category": "पूर्वावलोकन राजव्यवस्था",
    "copies": 2
  },
  {
    "id": "b55",
    "title": "Ghatnachakra Itihas",
    "author": "Ghatna Chakra",
    "category": "पूर्वावलोकन इतिहास",
    "copies": 2
  },
  {
    "id": "b56",
    "title": "ADEO Vastunishth",
    "author": "ADEO Exam Special",
    "category": "ADEO परीक्षा विशेष",
    "copies": 1
  },
  {
    "id": "b57",
    "title": "HOSTAL WARDEN",
    "author": "Hostel Warden Special",
    "category": "छात्रावास अधीक्षक विशेष",
    "copies": 2
  },
  {
    "id": "b58",
    "title": "CG Aarthik Sarvekshan",
    "author": "CG Government",
    "category": "छत्तीसगढ़ आर्थिक सर्वेक्षण",
    "copies": 1
  }
];

/* ================= STATE ================= */
let currentUser = null;
let currentAuthMode = "login";
let activeGeneratedOtp = null;
let registeredUsers = {};
let usedUtrs = {};

let selectedSeat = null;
let currentBookingType = "seat";
let currentSelectedPlan = "4";
let currentSelectedMonths = "1";
let selectedLocker = null;

let availability = {
    seats: {},
    lockers: {}
};

let myBookings = [];
let allAdminRequests = [];
let allComplaints = [];
let booksCache = [...INITIAL_BOOKS];
let toastTimer = null;
let currentBookingDraft = null;
let currentLockerDraft = null;

/* ================= HELPER FUNCTIONS ================= */
const $ = id => document.getElementById(id);
const value = (id, fallback = "") => $(id)?.value ?? fallback;

function text(id, content) {
    const el = $(id);
    if (el) el.textContent = content;
}

function money(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function escapeHTML(input) {
    return String(input ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function normalisePhone(phone) {
    return String(phone || "").replace(/\D/g, "").slice(-10);
}


/* ================= ROBUST DATE PARSER & 30-DAY MONTH VALIDITY ================= */
function parseAnyDate(dStr) {
    if (!dStr) return new Date();
    if (dStr instanceof Date && !isNaN(dStr.getTime())) return dStr;
    const str = String(dStr).trim();
    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
        const parts = str.split('/').map(Number);
        if (parts[0] > 12) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date(parts[2], parts[0] - 1, parts[1]);
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date();
}

function calculateValidity(startDateStr, months) {
    try {
        const start = parseAnyDate(startDateStr);
        const m = Number(months || 1);
        const totalDays = m * 30; // 30 days per month
        const end = new Date(start.getTime() + (totalDays - 1) * 24 * 60 * 60 * 1000);

        const pad = n => String(n).padStart(2, '0');
        const formatDate = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        const formatISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const formatReadable = d => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        return {
            startDate: formatISO(start),
            startDateFormatted: formatDate(start),
            endDate: formatISO(end),
            endDateFormatted: formatDate(end),
            startReadable: formatReadable(start),
            endReadable: formatReadable(end),
            totalDays,
            months: m,
            summaryText: `${formatDate(start)} से ${formatDate(end)} (कुल ${totalDays} दिन)`
        };
    } catch (err) {
        console.warn("calculateValidity fallback:", err);
        const d = new Date();
        return {
            startDate: todayDate(),
            startDateFormatted: todayDate(),
            endDate: todayDate(),
            endDateFormatted: todayDate(),
            startReadable: todayDate(),
            endReadable: todayDate(),
            totalDays: 30,
            months: 1,
            summaryText: "30 दिन की सदस्यता"
        };
    }
}

function todayDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/* ================= TOAST ================= */
function toast(message, type = "info") {
    let node = $("toast");
    if (!node) {
        node = document.createElement("div");
        node.id = "toast";
        document.body.appendChild(node);
    }
    node.textContent = message;
    node.style.display = "block";
    node.style.background = type === "error" ? "#df2028" : (type === "success" ? "#18833b" : "#252f87");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        node.style.display = "none";
    }, 3500);
}
window.toast = toast;

/* ================= NAVIGATION ================= */
function go(pageId) {
    try {
        if (pageId === "login" || pageId === "lockers") {
            pageId = (pageId === "lockers") ? "booking" : "profile";
        }
        const target = $(pageId);
        if (!target || !target.classList.contains("page")) {
            toast("पेज नहीं मिला: " + pageId, "error");
            return;
        }

        document.querySelectorAll(".page").forEach(p => {
            p.classList.remove("active");
            p.style.display = "none";
        });

        target.classList.add("active");
        target.style.display = "block";

        document.querySelectorAll(".nav-item, .d-nav-item").forEach(btn => {
            const active = btn.dataset.page === pageId;
            btn.classList.toggle("active", active);
            if (active) btn.setAttribute("aria-current", "page");
            else btn.removeAttribute("aria-current");
        });

        window.scrollTo({ top: 0, behavior: "smooth" });

        // Safely trigger sub-page renders inside independent try/catch
        if (pageId === "booking") {
            try {
                if (currentUser) {
                    if ($("studentName") && !$("studentName").value) $("studentName").value = currentUser.displayName || "";
                    if ($("studentPhone") && !$("studentPhone").value && currentUser.phoneNumber) $("studentPhone").value = currentUser.phoneNumber;
                }
                renderSeatGrid();
                updateSummary();
                const curPhone = normalisePhone(value("studentPhone") || currentUser?.phoneNumber || "");
                if (curPhone.length === 10) {
                    renderDepositBadge(curPhone, getStudentDepositStatus(curPhone));
                }
            } catch (e) {
                console.warn("Booking sub-render notice:", e);
            }
        } else if (pageId === "lockers") {
            try { renderLockerGrid(); } catch (e) {}
        } else if (pageId === "profile") {
            try { renderHistory(); } catch (e) { console.warn("renderHistory notice:", e); }
            try { renderAdminRequests(); } catch (e) { console.warn("renderAdminRequests notice:", e); }
            try { renderStudentComplaints(); } catch (e) { console.warn("renderStudentComplaints notice:", e); }
        } else if (pageId === "books") {
            try { renderBooks(booksCache); } catch (e) { console.warn("renderBooks notice:", e); }
        } else if (pageId === "fees") {
            try { updateSummary(); } catch (e) { console.warn("updateSummary notice:", e); }
        }
    } catch (navErr) {
        console.error("Global navigation error:", navErr);
    }
}
window.go = go;

window._pageRenderHooks = {
    booking: function() {
        if (currentUser) {
            if ($("studentName") && !$("studentName").value) $("studentName").value = currentUser.displayName || "";
            if ($("studentPhone") && !$("studentPhone").value && currentUser.phoneNumber) $("studentPhone").value = currentUser.phoneNumber;
        }
        renderSeatGrid();
        updateSummary();
        const curPhone = normalisePhone(value("studentPhone") || currentUser?.phoneNumber || "");
        if (curPhone.length === 10) {
            renderDepositBadge(curPhone, getStudentDepositStatus(curPhone));
        }
    },
    lockers: function() { renderLockerGrid(); },
    profile: function() {
        try { renderHistory(); } catch(e) {}
        try { renderAdminRequests(); } catch(e) {}
        try { renderStudentComplaints(); } catch(e) {}
    },
    books: function() { renderBooks(booksCache); },
    fees: function() { updateSummary(); }
};



/* ================= UNIFIED BOOKING (SEAT, LOCKER, COMBO) ================= */
function setBookingType(type) {
    currentBookingType = type;

    $("btnTypeSeat")?.classList.toggle("active", type === "seat");
    $("btnTypeBoth")?.classList.toggle("active", type === "seat_and_locker");
    $("btnTypeLocker")?.classList.toggle("active", type === "locker_only");

    const seatCard = $("seatSelectionCard");
    const lockerCard = $("lockerSelectionCard");
    const seatPlanRow = $("seatPlanRow");
    const lockerDurationWrap = $("lockerOnlyDurationWrap");
    const rowBaseFee = $("rowBaseFee");
    const rowLockerFee = $("rowLockerFee");
    const rowDepositFee = $("rowDepositFee");

    if (type === "seat") {
        if (seatCard) seatCard.style.display = "block";
        if (lockerCard) lockerCard.style.display = "none";
        if (seatPlanRow) seatPlanRow.style.display = "grid";
        if (lockerDurationWrap) lockerDurationWrap.style.display = "none";
        if (rowBaseFee) rowBaseFee.style.display = "flex";
        if (rowLockerFee) rowLockerFee.style.display = "none";
        if (rowDepositFee) rowDepositFee.style.display = "flex";
        selectedLocker = null;
    } else if (type === "seat_and_locker") {
        if (seatCard) seatCard.style.display = "block";
        if (lockerCard) lockerCard.style.display = "block";
        if (seatPlanRow) seatPlanRow.style.display = "grid";
        if (lockerDurationWrap) lockerDurationWrap.style.display = "none";
        if (rowBaseFee) rowBaseFee.style.display = "flex";
        if (rowLockerFee) rowLockerFee.style.display = "flex";
        if (rowDepositFee) rowDepositFee.style.display = "flex";
    } else if (type === "locker_only") {
        if (seatCard) seatCard.style.display = "none";
        if (lockerCard) lockerCard.style.display = "block";
        if (seatPlanRow) seatPlanRow.style.display = "none";
        if (lockerDurationWrap) lockerDurationWrap.style.display = "block";
        if (rowBaseFee) rowBaseFee.style.display = "none";
        if (rowLockerFee) rowLockerFee.style.display = "flex";
        if (rowDepositFee) rowDepositFee.style.display = "none";
        selectedSeat = null;
    }

    selectSlot("4");
    selectMonths("1");
    renderLockerGrid();
    updateSummary();
}
window.setBookingType = setBookingType;

function onMonthsChange() {
    updateSummary();
}
window.onMonthsChange = onMonthsChange;

function onLockerMonthsChange() {
    updateSummary();
}
window.onLockerMonthsChange = onLockerMonthsChange;

function renderDepositBadge(phone, status) {
    const badge = $("depositNoticeBadge");
    if (!badge) return;

    if (!phone || phone.length !== 10) {
        badge.style.display = "none";
        return;
    }

    badge.style.display = "block";
    if (status === "active_held") {
        badge.style.background = "#f0fdf4";
        badge.style.border = "1.5px solid #86efac";
        badge.style.color = "#15803d";
        badge.innerHTML = `✓ <b>रजिस्टर्ड विद्यार्थी:</b> आपका ₹300 सिक्योरिटी डिपॉजिट पूर्व से सुरक्षित जमा है। <u>सेकंड, थर्ड या आगे की किसी भी बुकिंग (2nd / 3rd Booking) पर डिपॉजिट ₹0 (पूर्णतः फ्री)</u> रहेगा!`;
    } else if (status === "refunded") {
        badge.style.background = "#fffbeb";
        badge.style.border = "1.5px solid #fde68a";
        badge.style.color = "#b45309";
        badge.innerHTML = `↩️ <b>पुनः प्रवेश:</b> आपका पूर्व डिपॉजिट रिफंड हो चुका था। नए सत्र हेतु ₹300 रिफंडेबल डिपॉजिट देय होगा।`;
    } else {
        badge.style.background = "#eff6ff";
        badge.style.border = "1.5px solid #bfdbfe";
        badge.style.color = "#1e40af";
        badge.innerHTML = `ℹ️ <b>फर्स्ट बुकिंग (1st Time):</b> ₹300 रिफंडेबल सिक्योरिटी डिपॉजिट <u>केवल पहली बार</u> देय है। इसके बाद 2nd, 3rd या आगे की किसी भी बुकिंग पर यह शुल्क ₹0 रहेगा।`;
    }
}
window.renderDepositBadge = renderDepositBadge;

async function onPhoneInput() {
    const phone = normalisePhone(value("studentPhone"));
    updateSummary();

    if (phone.length === 10) {
        const localStatus = getStudentDepositStatus(phone);
        renderDepositBadge(phone, localStatus);

        // Also verify real-time status in Firebase
        try {
            const userSnap = await get(child(ref(db), "users/" + phone));
            if (userSnap.exists()) {
                const uData = userSnap.val();
                if (!registeredUsers[phone]) registeredUsers[phone] = {};
                registeredUsers[phone] = { ...registeredUsers[phone], ...uData };

                if (uData.depositStatus) {
                    registeredUsers[phone].depositStatus = uData.depositStatus;
                } else if (uData.bookings && Object.keys(uData.bookings).length > 0) {
                    registeredUsers[phone].depositStatus = "active_held";
                }

                if (uData.name && $("studentName") && !$("studentName").value.trim()) {
                    $("studentName").value = uData.name;
                }

                updateSummary();
                renderDepositBadge(phone, getStudentDepositStatus(phone));
            }
        } catch (e) {
            console.warn("Realtime phone deposit check notice:", e);
        }
    } else {
        renderDepositBadge("", "not_paid");
    }
}
window.onPhoneInput = onPhoneInput;

/* ================= PLAN SELECTION ================= */
function selectedPlan() {
    return currentSelectedPlan || value("slot", "4");
}

function selectedMonths() {
    return String(currentSelectedMonths || value("months", "1"));
}

function selectedStartDate() {
    return value("startDate", todayDate());
}


/* ================= INSTANT SELECT SLOT & MONTHS (PILL BUTTONS) ================= */
function selectSlot(planName) {
    currentSelectedPlan = planName;
    const slotEl = $("slot");
    if (slotEl) slotEl.value = planName;

    // Highlight active pill button
    document.querySelectorAll(".plan-pill").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.plan === planName);
    });

    onPlanChange();
    updateSummary();

    if (planName === "Reserved") {
        toast("🌟 Reserved प्लान चुना गया! सीट फीस ₹1,200 (कुल ₹1,500) नीचे 80 सीटों का नक्शा खुला है।", "info");
    } else {
        const amt = calculateBookingAmount();
        toast(`✓ ${getPlanDisplayName(planName)} चुना गया! सीट फीस: ${money(amt.baseFee)} | कुल: ${money(amt.total)}`, "info");
    }
}
window.selectSlot = selectSlot;

function selectMonths(mCount) {
    currentSelectedMonths = String(mCount);
    const monthsEl = $("months");
    if (monthsEl) monthsEl.value = String(mCount);

    document.querySelectorAll(".dur-pill").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.months === String(mCount));
    });

    onMonthsChange();
    updateSummary();

    const amt = calculateBookingAmount();
    const mLabel = (String(mCount) === "6") ? "4+2 Month (6 माह - 180 दिन)" : `${mCount} माह (${mCount * 30} दिन)`;
    toast(`✓ ${mLabel} चुना गया! कुल राशि: ${money(amt.total)}`, "info");
}
window.selectMonths = selectMonths;

function onPlanChange() {
    const plan = selectedPlan();
    document.querySelectorAll(".plan-pill").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.plan === plan);
    });
    renderSeatGrid();
    updateSummary();
}

function onPayMethodChange() {
    if (currentBookingDraft) {
        // Render payment directly on current active page
    const activePage = document.querySelector(".page.active")?.id || "booking";
    showPaymentPanel(currentBookingDraft, activePage);
    }
}

/* ================= AVAILABILITY (LIVE FROM FIREBASE) ================= */
function startLiveAvailability() {
    try {
        const availRef = ref(db, "public/availability");
        onValue(availRef, snapshot => {
            const data = snapshot.val();
            if (data) {
                if (data.seats) availability.seats = { ...availability.seats, ...data.seats };
                if (data.lockers) availability.lockers = { ...availability.lockers, ...data.lockers };
                renderSeatGrid();
                renderLockerGrid();
            }
        }, error => {
            console.warn("Firebase availability read info:", error.message);
        });
    } catch (err) {
        console.warn("Firebase availability setup:", err);
    }
}

function getSeatStatus(seatNo) {
    const item = availability.seats[String(seatNo)];
    if (!item) return "available";
    if (typeof item === "string") return item;
    return item.status || "available";
}

function getLockerStatus(lockerNo) {
    const item = availability.lockers[String(lockerNo)];
    if (!item) return "available";
    if (typeof item === "string") return item;
    return item.status || "available";
}

function isUnavailable(status) {
    return ["reserved", "booked", "occupied", "pending_verification"].includes(String(status).toLowerCase());
}

/* ================= EXACT ARCHITECTURAL FLOOR MAP (IMAGE 3 REPLICA) ================= */
// Clean Production Launch: All 80 Seats and 24 Lockers are 100% Vacant & Available

function renderSeatGrid() {
    const wrapper = $("floorMapWrapper");
    const container = $("floorMapContainer");
    const msg = $("seatMessage");
    const count = $("freeSeatsCount");
    const cardTitle = $("seatCardTitle");
    if (!container) return;

    const plan = selectedPlan();
    const isReserved = (plan === "Reserved");

    // 4, 6, 8 hours or Full Time: DO NOT SHOW SEATS!
    if (!isReserved) {
        if (wrapper) wrapper.style.display = "none";
        selectedSeat = null;

        if (count) count.textContent = "लाइब्रेरी आवंटन";
        if (cardTitle) cardTitle.textContent = `सीट आवंटन (${plan} प्लान)`;

        if (msg) {
            msg.innerHTML = `
                <div class="notice" style="background:#eef2ff; border:1px solid #c7ccff; color:#252f87; padding:16px; border-radius:14px; font-size:14px; line-height:1.7;">
                    ℹ️ <b>${plan} प्लान:</b> 4, 6, 8 घंटे और Full Time प्लान में सीट <b>लाइब्रेरी काउंटर</b> द्वारा आवंटित की जाती है।<br>
                    👉 यदि आप बिल्डिंग का पूरा नक्शा देखकर अपनी <b>मनपसंद फिक्स्ड सीट (Reserved)</b> चुनना चाहते हैं, तो 'समय प्लान' में <b>'Reserved'</b> चुनें।
                </div>
            `;
        }
        return;
    }

    // ONLY FOR "Reserved" PLAN: SHOW THE FULL ARCHITECTURAL FLOOR PLAN!
    if (wrapper) wrapper.style.display = "block";
    if (cardTitle) cardTitle.textContent = "🏢 संपूर्ण लाइब्रेरी सिटिंग फ्लोर मैप (Flat Floor Plan)";

    // Calculate counts
    let freeSeatsCount = 0;
    let resSeatsCount = 0;
    for (let s = 1; s <= TOTAL_SEATS; s++) {
        if (isUnavailable(getSeatStatus(s))) resSeatsCount++;
        else freeSeatsCount++;
    }

    if (count) count.textContent = `${freeSeatsCount} सीटें खाली | ${resSeatsCount} आरक्षित`;

    // Helper to generate seat button HTML
    const renderSeatBtn = (seatNo, label = null) => {
        const num = seatNo;
        const status = getSeatStatus(num);
        const unavailable = isUnavailable(status);
        const isSelected = (selectedSeat === num);
        const disp = label || num;

        return `
            <button type="button" 
                class="bp-seat ${unavailable ? 'reserved' : 'available'} ${isSelected ? 'selected' : ''}" 
                data-seat="${num}" 
                ${unavailable ? 'disabled' : ''} 
                title="सीट नं. ${num} (${unavailable ? 'आरक्षित' : 'खाली / उपलब्ध'})">
                ${disp}
            </button>
        `;
    };

    // Helper to generate locker button HTML
    const renderLockerBtn = (lockerNo) => {
        const status = getLockerStatus(lockerNo);
        const unavailable = isUnavailable(status);
        const isSelected = (selectedLocker === lockerNo);

        return `
            <button type="button" 
                class="bp-locker ${unavailable ? 'reserved' : 'vacant'} ${isSelected ? 'selected' : ''}" 
                data-locker="${lockerNo}" 
                ${unavailable ? 'disabled' : ''} 
                title="लॉकर L${lockerNo} (${unavailable ? 'आरक्षित' : 'खाली'})">
                L${lockerNo}
            </button>
        `;
    };

    // Generate complete Architectural Blueprint HTML matching Image 3
    container.innerHTML = `
        <div class="blueprint-building">
            
            <!-- LEFT BLUEPRINT SUMMARY SIDEBAR (EXACT MATCHING IMAGE 3) -->
            <div class="blueprint-sidebar">
                
                <!-- SEATING PLAN SUMMARY -->
                <div class="bp-summary-box">
                    <div class="bp-summary-header">SEATING PLAN SUMMARY</div>
                    <div class="bp-summary-body">
                        <div><b>कुल सीटें: 1 से 80</b></div>
                        <div style="font-size:11px; color:#555;">← → = (रास्ता / मार्ग / Pathway)</div>
                        <div class="bp-legend-item">
                            <span class="bp-color-box bp-green"></span>
                            <span><b>खाली / रिक्त सीटें:</b> ${freeSeatsCount}</span>
                        </div>
                        <div class="bp-legend-item">
                            <span class="bp-color-box bp-red"></span>
                            <span><b>आरक्षित सीटें:</b> ${resSeatsCount}</span>
                        </div>
                        <div class="bp-legend-item">
                            <span class="bp-color-box bp-blue"></span>
                            <span><b>आपकी चयनित सीट</b></span>
                        </div>
                    </div>
                </div>

                <!-- LOCKER SUMMARY -->
                <div class="bp-summary-box">
                    <div class="bp-summary-header" style="background:#a81219;">LOCKER SUMMARY (24 Total)</div>
                    <div class="bp-summary-body">
                        <div class="bp-legend-item">
                            <span class="bp-color-box bp-green"></span>
                            <span><b>उपलब्ध लॉकर:</b> ${24 - Object.keys(availability.lockers || {}).length}</span>
                        </div>
                        <div class="bp-legend-item">
                            <span class="bp-color-box bp-red"></span>
                            <span><b>आरक्षित लॉकर:</b> ${Object.keys(availability.lockers || {}).length}</span>
                        </div>
                        <div style="font-size:11px; margin-top:4px; color:#555;">शुल्क: ₹100 प्रति माह (30 दिन)</div>
                    </div>
                </div>

                <div class="notice" style="font-size:11px; padding:10px; background:#fff8d8; border:1px solid #f0e2a3;">
                    💡 <b>फ्लोर टिप्स:</b><br>
                    • 57 से 80: शांत कॉर्नर विंग<br>
                    • 1 से 25: फ्रंट विंग<br>
                    • अपनी पसंद की सीट पर क्लिक करें।
                </div>

            </div>

            <!-- MAIN ARCHITECTURAL FLOOR DRAWING -->
            <div class="blueprint-plan-area">
                
                <div class="bp-plan-header">Vidya Library - The Study Zone.</div>

                <!-- UPPER SECTION (LEFT DESKS + CENTRAL CORRIDOR + RIGHT DESKS & LOCKERS) -->
                <div class="bp-upper-wing">
                    
                    <!-- LEFT DESK COLUMN -->
                    <div class="bp-left-desks">
                        <!-- Cluster 1 -->
                        <div class="bp-desk-row">${renderSeatBtn(1)} ${renderSeatBtn(2)} ${renderSeatBtn(3)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 2 -->
                        <div class="bp-desk-row">${renderSeatBtn(7)} ${renderSeatBtn(8)} ${renderSeatBtn(11)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 3 -->
                        <div class="bp-desk-row">${renderSeatBtn(16)} ${renderSeatBtn(17)} ${renderSeatBtn(18)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(21)} ${renderSeatBtn(22)} ${renderSeatBtn(23)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 4 -->
                        <div class="bp-desk-row">${renderSeatBtn(26)} ${renderSeatBtn(27)} ${renderSeatBtn(28)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 5 -->
                        <div class="bp-desk-row">${renderSeatBtn(29)} ${renderSeatBtn(30)} ${renderSeatBtn(31)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(32)} ${renderSeatBtn(33)} ${renderSeatBtn(34)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 6 -->
                        <div class="bp-desk-row">${renderSeatBtn(35)} ${renderSeatBtn(36)} ${renderSeatBtn(37)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(38)} ${renderSeatBtn(39)} ${renderSeatBtn(40)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 7 -->
                        <div class="bp-desk-row">${renderSeatBtn(41)} ${renderSeatBtn(42)} ${renderSeatBtn(43)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(44)} ${renderSeatBtn(45)} ${renderSeatBtn(46)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Cluster 8 -->
                        <div class="bp-desk-row">${renderSeatBtn(47)} ${renderSeatBtn(48)} ${renderSeatBtn(49)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(50)} ${renderSeatBtn(51)} ${renderSeatBtn(52)}</div>
                    </div>

                    <!-- CENTRAL VERTICAL CORRIDOR (← Pathway →) -->
                    <div class="bp-vertical-corridor">
                        ← Pathway →
                    </div>

                    <!-- RIGHT DESK & LOCKERS COLUMN -->
                    <div class="bp-right-desks-and-lockers">
                        <!-- Top Desk Cluster 1 -->
                        <div class="bp-desk-row">${renderSeatBtn(4)} ${renderSeatBtn(5)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Top Desk Cluster 2 -->
                        <div class="bp-desk-row">${renderSeatBtn(9)} ${renderSeatBtn(10)}</div>
                        <div class="bp-pathway">← Pathway →</div>

                        <!-- Top Desk Cluster 3 -->
                        <div class="bp-desk-row">${renderSeatBtn(19)} ${renderSeatBtn(20)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(24)} ${renderSeatBtn(25)}</div>

                        <!-- LOCKER ZONE (4x6 GRID FROM IMAGE 3) -->
                        <div class="bp-lockers-block">
                            <div class="bp-lockers-header">🔐 LOCKERS (24 Total)</div>
                            <div class="bp-lockers-grid">
                                ${[1,2,3,4, 5,6,7,8, 9,10,11,12, 13,14,15,16, 17,18,19,20, 21,22,23,24].map(l => renderLockerBtn(l)).join('')}
                            </div>
                        </div>
                    </div>

                </div>

                <!-- HORIZONTAL MAIN HALLWAY -->
                <div class="bp-horizontal-hallway">
                    ← Pathway (हॉलवे / मुख्य गलियारा) →
                </div>

                <!-- BOTTOM L-WING (QUIET CORNER ZONE 53 TO 80) -->
                <div class="bp-bottom-wing">
                    
                    <!-- BOTTOM LEFT WING (Seats 57-80) -->
                    <div class="bp-bot-left-wing">
                        <div style="font-size:10px; font-weight:800; color:#203580; text-align:center;">शांत कॉर्नर विंग</div>
                        <div class="bp-desk-row">${renderSeatBtn(59)} ${renderSeatBtn(58)} ${renderSeatBtn(57)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(66)} ${renderSeatBtn(65)} ${renderSeatBtn(64)}</div>
                        <div class="bp-pathway">← Pathway →</div>
                        <div class="bp-desk-row">${renderSeatBtn(73)} ${renderSeatBtn(72)} ${renderSeatBtn(71)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(80)} ${renderSeatBtn(79)} ${renderSeatBtn(78)}</div>
                    </div>

                    <!-- BOTTOM VERTICAL CORRIDOR -->
                    <div class="bp-bot-vertical-corridor">
                        ← Pathway →
                    </div>

                    <!-- BOTTOM RIGHT WING (Seats 53-77) -->
                    <div class="bp-bot-right-wing">
                        <div style="font-size:10px; font-weight:800; color:#203580; text-align:center;">बैक स्टडी विंग</div>
                        <div class="bp-desk-row">${renderSeatBtn(56)} ${renderSeatBtn(55)} ${renderSeatBtn(54)} ${renderSeatBtn(53)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(63)} ${renderSeatBtn(62)} ${renderSeatBtn(61)} ${renderSeatBtn(60)}</div>
                        <div class="bp-pathway">← Pathway →</div>
                        <div class="bp-desk-row">${renderSeatBtn(70)} ${renderSeatBtn(69)} ${renderSeatBtn(68)} ${renderSeatBtn(67)}</div>
                        <div class="bp-desk-row">${renderSeatBtn(77)} ${renderSeatBtn(76)} ${renderSeatBtn(75)} ${renderSeatBtn(74)}</div>
                    </div>

                </div>

            </div>

        </div>
    `;

    // Attach click events to all seat buttons
    container.querySelectorAll(".bp-seat.available").forEach(btn => {
        btn.addEventListener("click", () => {
            const seatNum = Number(btn.dataset.seat);
            selectedSeat = (selectedSeat === seatNum) ? null : seatNum;
            renderSeatGrid();
            updateSummary();
        });
    });

    // Attach click events to locker buttons
    container.querySelectorAll(".bp-locker.vacant").forEach(btn => {
        btn.addEventListener("click", () => {
            const lNum = Number(btn.dataset.locker);
            selectedLocker = (selectedLocker === lNum) ? null : lNum;
            text("lockerChoice", selectedLocker ? `L${selectedLocker} (शुल्क ₹100)` : "कोई नहीं");
            renderSeatGrid();
            renderLockerGrid();
            updateSummary();
        });
    });

    if (msg) {
        msg.innerHTML = selectedSeat
            ? `<div class="notice" style="background:#eafaf1; border:1.5px solid #18833b; color:#127938; padding:14px 18px; border-radius:14px; font-size:14px;">
                   ✓ आपने <b>सीट नं. ${selectedSeat}</b> चुनी है! (${selectedSeat >= 57 ? 'कॉर्नर / शांत ज़ोन' : 'मुख्य हॉल'})
               </div>`
            : `<div class="notice" style="background:#fff8d8; border:1.5px solid #d4c060; color:#5c4c00; padding:14px 18px; border-radius:14px; font-size:14px;">
                   👉 ऊपर दिए गए <b>लाइब्रेरी नक्शे</b> में अपनी मनपसंद खाली हरी सीट (Green Seat) पर क्लिक करके चुनें।
               </div>`;
    }
}

/* ================= RENDER LOCKERS ================= */
function renderLockerGrid() {
    const grid = $("lockerGrid");
    if (!grid) return;

    grid.innerHTML = "";
    let freeLockers = 0;

    for (let locker = 1; locker <= TOTAL_LOCKERS; locker++) {
        const status = getLockerStatus(locker);
        const unavailable = isUnavailable(status);

        if (!unavailable) freeLockers++;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "locker " + (unavailable ? "reserved" : "available") + (selectedLocker === locker ? " selected" : "");
        button.textContent = `L${locker}`;
        button.disabled = unavailable;
        button.title = unavailable ? `लॉकर L${locker} आरक्षित है` : `लॉकर L${locker} उपलब्ध है`;

        if (!unavailable) {
            button.addEventListener("click", () => {
                selectedLocker = (selectedLocker === locker) ? null : locker;
                text("lockerChoice", selectedLocker ? `L${selectedLocker} (शुल्क ₹100)` : "कोई नहीं");
                renderLockerGrid();
                updateSummary();
            });
        }

        grid.appendChild(button);
    }

    text("freeLockersCount", `${freeLockers} उपलब्ध`);
    text("lockerChoice", selectedLocker ? `L${selectedLocker}` : "कोई नहीं");
}

/* ================= FEES CALCULATION ================= */
function calculateBookingAmount() {
    const plan = selectedPlan();
    const months = (currentBookingType === "locker_only") 
        ? Number(value("lockerOnlokingAmount() {
    const plan = selectedPlan();
    const months = (currentBookingType === "locker_only") 
        ? Number(value("lockerOnlyMonths", "1")) 
        : Number(selectedMonths());

    const phone = normalisePhone(value("studentPhone") || currentUser?.phoneNumber || "");
    const deposit = (currentBookingType === "locker_only") ? 0 : calculateCurrentDeposit(phone);

    let baseFee = 0;
    if (currentBookingType === "seat" || currentBookingType === "seat_and_locker") {
        baseFee = FEES[plan]?.[String(months)] ?? (FEES[plan]?.["1"] || 500);
    }

    // LOCKER FEE: Strictly ₹100 per locker whenever any locker is selected or locker booking is active
    let lockerFee = 0;
    if (selectedLocker || currentBookingType === "locker_only" || currentBookingType === "seat_and_locker") {
        lockerFee = 100;
    }

    return {
        baseFee,
        lockerFee,
        deposit,
        total: baseFee + lockerFee + deposit,
        months,
        plan: (currentBookingType === "locker_only") ? "Locker Only" : plan
    };
}

/* ================= ADVANCED SECURITY DEPOSIT LIFECYCLE ================= */
// Statuses: 'not_paid' (first time: ₹300), 'active_held' (re-booking/continuing: ₹0), 'refunded' (re-joining: ₹300)
function getStudentDepositStatus(phone) {
    const cleanPhone = normalisePhone(phone || currentUser?.phoneNumber || "");
    if (!cleanPhone || cleanPhone.length !== 10) return "not_paid";

    const userRecord = registeredUsers[cleanPhone];
    if (userRecord && userRecord.depositStatus) {
        return userRecord.depositStatus;
    }

    // Check all confirmed bookings across student session and local database
    const allKnown = [...(myBookings || []), ...(allAdminRequests || [])];
    const userBookings = allKnown.filter(b => 
        normalisePhone(b.studentPhone) === cleanPhone && 
        (b.status === "confirmed" || b.status === "approved" || b.status === "paid") && 
        b.bookingType !== "locker"
    );

    if (userBookings.length > 0) {
        if (userBookings.some(b => b.depositRefunded === true)) {
            return "refunded";
        }
        return "active_held";
    }

    return "not_paid";
}

function calculateCurrentDeposit(phone) {
    const status = getStudentDepositStatus(phone);
    // If student already has active deposit held at library, charge 0.
    // If first time ('not_paid') or previously refunded ('refunded'), charge 300.
    return (status === "active_held") ? 0 : DEPOSIT;
}

function updateSummary() {
    try {
        const plan = selectedPlan();
        const months = selectedMonths();
        const phone = normalisePhone(value("studentPhone") || currentUser?.phoneNumber || "");
        const amount = calculateBookingAmount();
        const validity = calculateValidity(selectedStartDate(), months);

        const planDisplay = getPlanDisplayName(plan);
        const durLabel = (amount.months === 6) ? "4+2 Month" : `${amount.months} माह`;

        // Update live calc box on Booking Page
        if (currentBookingType === "locker_only") {
            text("bSumPlanText", `निजी लॉकर L${selectedLocker || '?'} · ${durLabel} (${validity.totalDays} दिन)`);
            text("bSumLockerFee", money(amount.lockerFee));
            if ($("rowLockerFee")) $("rowLockerFee").style.display = "flex";
            if ($("rowBaseFee")) $("rowBaseFee").style.display = "none";
            if ($("rowDepositFee")) $("rowDepositFee").style.display = "none";
        } else if (currentBookingType === "seat_and_locker" || selectedLocker) {
            text("bSumPlanText", `${planDisplay} + लॉकर L${selectedLocker || '?'} · ${durLabel}`);
            text("bSumBaseFee", money(amount.baseFee));
            text("bSumLockerFee", money(amount.lockerFee) + (selectedLocker ? ` (L${selectedLocker})` : ""));
            if ($("rowLockerFee")) $("rowLockerFee").style.display = "flex";
            if ($("rowBaseFee")) $("rowBaseFee").style.display = "flex";
            if ($("rowDepositFee")) $("rowDepositFee").style.display = "flex";
        } else {
            text("bSumPlanText", `${planDisplay} · ${durLabel} (${validity.totalDays} दिन)`);
            text("bSumBaseFee", money(amount.baseFee));
            if ($("rowLockerFee")) $("rowLockerFee").style.display = "none";
            if ($("rowBaseFee")) $("rowBaseFee").style.display = "flex";
            if ($("rowDepositFee")) $("rowDepositFee").style.display = "flex";
        }

        text("bSumBaseFee", money(amount.baseFee));
        text("bSumDeposit", amount.deposit > 0 ? "₹300 (पहली बार - रिफंडेबल)" : "₹0 (सुरक्षित जमा है · दोबारा देय नहीं ✓)");
        text("bSumTotal", money(amount.total));
        text("bSumExactText", money(amount.total));

        // Update validity text on booking page
        text("seatValidityText", validity.summaryText);

        // Update Fees Page Summary
        text("sumSeat", selectedSeat ? `Seat ${selectedSeat}` : (plan === "Reserved" ? "सीट चुनें" : "लाइब्रेरी द्वारा आवंटित"));
        text("sumSlot", planDisplay);
        text("sumMonths", `${amount.months} महीना (${validity.totalDays} दिन)`);
        text("sumValidity", `${validity.startReadable} से ${validity.endReadable} (${validity.totalDays} दिन)`);
        text("sumFee", money(amount.baseFee));
        text("sumLocker", money(amount.lockerFee));

        const depStatus = getStudentDepositStatus(phone);
        if (amount.deposit === 0) {
            text("sumDeposit", "₹0 (पहले से सुरक्षित जमा है ✓)");
        } else if (depStatus === "refunded") {
            text("sumDeposit", "₹300 (पिछला रिफंड हो चुका था)");
        } else {
            text("sumDeposit", "₹300 (प्रथम बार - रिफंडेबल)");
        }
        text("sumTotal", money(amount.total));

        // Update locker page
        const lockerStartDate = value("lockerStartDate", todayDate());
        const lockerMonths = Number(value("lockerMonths", "1"));
        const lockerValidity = calculateValidity(lockerStartDate, lockerMonths);
        text("lockerValidityText", lockerValidity.summaryText);
        text("lockerPrice", money(100));

        syncToFeesPage();
    } catch (e) {
        console.error("updateSummary error:", e);
    }
}

/* ================= FIREBASE USER AUTHENTICATION ================= */
let uploadedStudentPhotoDataUrl = "";

function handleStudentPhotoSelect(e) {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        toast("कृपया केवल मान्य इमेज फ़ाइल (JPG/PNG) चुनें।", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            // Compress & crop square avatar (180x180 JPEG) for fast Firebase RTDB sync
            const canvas = document.createElement("canvas");
            const size = 180;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");

            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

            uploadedStudentPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.72);
            const previewImg = $("authPhotoPreviewImg");
            const placeholder = $("authPhotoPlaceholder");
            const statusText = $("authPhotoStatusText");
            if (previewImg) {
                previewImg.src = uploadedStudentPhotoDataUrl;
                previewImg.style.display = "block";
            }
            if (placeholder) placeholder.style.display = "none";
            if (statusText) {
                statusText.textContent = "✅ फ़ोटो / सेल्फ़ी अपलोड हो गई!";
                statusText.style.color = "#15803d";
            }
            toast("📸 फ़ोटो सफलतापूर्वक संलग्न हो गई!", "success");
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}
window.handleStudentPhotoSelect = handleStudentPhotoSelect;

function isStrongPassword(pwd) {
    // At least 6 chars, contains at least 1 letter and 1 digit
    return pwd.length >= 6 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd);
}

function checkPasswordStrength() {
    if (currentAuthMode !== "register") return;
    const pwd = value("authPassword");
    const box = $("pwdStrengthBox");
    const bar = $("pwdStrengthBar");
    const txt = $("pwdStrengthText");
    if (!box || !bar || !txt) return;

    box.style.display = "block";
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Za-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 9) score++;

    if (score <= 1) {
        bar.style.width = "25%";
        bar.style.background = "#dc2626";
        txt.style.color = "#dc2626";
        txt.textContent = "कमजोर पासवर्ड: कम से कम 6 अक्षर, 1 अंग्रेज़ी अक्षर और 1 अंक डालें";
    } else if (score === 2) {
        bar.style.width = "55%";
        bar.style.background = "#d97706";
        txt.style.color = "#b45309";
        txt.textContent = "मध्यम पासवर्ड: अक्षर और अंक दोनों शामिल करें";
    } else if (score === 3) {
        bar.style.width = "80%";
        bar.style.background = "#16a34a";
        txt.style.color = "#15803d";
        txt.textContent = "✅ मजबूत पासवर्ड (Strong Password)";
    } else {
        bar.style.width = "100%";
        bar.style.background = "#15803d";
        txt.style.color = "#15803d";
        txt.textContent = "🛡️ अति सुरक्षित पासवर्ड (Very Strong)";
    }
}
window.checkPasswordStrength = checkPasswordStrength;

function setAuthMode(mode) {
    currentAuthMode = mode;
    const loginTab = $("loginTab");
    const registerTab = $("registerTab");
    const authForm = $("authForm");
    const forgotForm = $("forgotForm");
    const regFields = $("registerOnlyFields");
    const confirmWrap = $("authConfirmWrap");
    const pwdBox = $("pwdStrengthBox");
    const passLabel = $("authPassLabel");
    const submitBtn = $("authSubmit");
    const helperLinks = $("loginHelperLinks");

    if (mode === "login") {
        if (loginTab) loginTab.className = "btn btn-primary";
        if (registerTab) registerTab.className = "btn btn-outline";
        if (authForm) authForm.style.display = "block";
        if (forgotForm) forgotForm.style.display = "none";
        if (regFields) regFields.style.display = "none";
        if (confirmWrap) confirmWrap.style.display = "none";
        if (pwdBox) pwdBox.style.display = "none";
        if (passLabel) passLabel.textContent = "पासवर्ड";
        if (submitBtn) submitBtn.textContent = "🔓 लॉगिन करें (Login) →";
        if (helperLinks) helperLinks.style.display = "flex";
    } else if (mode === "register") {
        if (loginTab) loginTab.className = "btn btn-outline";
        if (registerTab) registerTab.className = "btn btn-primary";
        if (authForm) authForm.style.display = "block";
        if (forgotForm) forgotForm.style.display = "none";
        if (regFields) regFields.style.display = "block";
        if (confirmWrap) confirmWrap.style.display = "block";
        if (pwdBox) pwdBox.style.display = "block";
        if (passLabel) passLabel.textContent = "मजबूत पासवर्ड बनाएं (अक्षर + अंक, न्यूनतम 6)";
        if (submitBtn) submitBtn.textContent = "✅ नया रजिस्ट्रेशन पूरा करें →";
        if (helperLinks) helperLinks.style.display = "none";
    } else if (mode === "forgot") {
        if (loginTab) loginTab.className = "btn btn-outline";
        if (registerTab) registerTab.className = "btn btn-outline";
        if (authForm) authForm.style.display = "none";
        if (forgotForm) forgotForm.style.display = "block";
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const phone = normalisePhone(value("authPhone"));
    const password = value("authPassword").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।", "error");
        $("authPhone")?.focus();
        return;
    }

    if (currentAuthMode === "register") {
        const name = value("authName").trim();
        const aadhaar = String(value("authAadhaar")).replace(/\D/g, "");
        const confirmPass = value("authConfirmPassword").trim();

        if (!uploadedStudentPhotoDataUrl) {
            toast("📸 कृपया अपनी स्पष्ट फ़ोटो या सेल्फ़ी अपलोड करें!", "error");
            return;
        }
        if (name.length < 2) {
            toast("कृपया विद्यार्थी का पूरा नाम दर्ज करें।", "error");
            $("authName")?.focus();
            return;
        }
        if (!/^\d{12}$/.test(aadhaar)) {
            toast("❌ कृपया सही 12 अंकों का आधार कार्ड नंबर दर्ज करें।", "error");
            $("authAadhaar")?.focus();
            return;
        }
        if (!isStrongPassword(password)) {
            toast("🔒 सुरक्षा नियम: पासवर्ड कम से कम 6 अक्षर का हो और उसमें अंग्रेज़ी अक्षर (A-Z) व अंक (0-9) दोनों शामिल हों।", "error");
            $("authPassword")?.focus();
            return;
        }
        if (password !== confirmPass) {
            toast("❌ दोनों पासवर्ड मेल नहीं खा रहे हैं! कृपया एक जैसा पासवर्ड दर्ज करें।", "error");
            $("authConfirmPassword")?.focus();
            return;
        }

        // Check if phone already registered
        let alreadyUser = registeredUsers[phone];
        if (!alreadyUser) {
            try {
                const snap = await get(child(ref(db), "users/" + phone));
                if (snap.exists()) alreadyUser = snap.val();
            } catch (err) {}
        }

        if (alreadyUser) {
            toast("⚠️ यह मोबाइल नंबर पहले से रजिस्टर्ड है! कृपया सीधे लॉगिन करें।", "info");
            setAuthMode("login");
            if ($("authPhone")) $("authPhone").value = phone;
            return;
        }

        const userData = {
            name,
            phone,
            aadhaar,
            photo: uploadedStudentPhotoDataUrl,
            password,
            depositStatus: "not_paid",
            createdAt: Date.now()
        };

        try {
            await set(ref(db, "users/" + phone), userData);
            console.log("Student KYC registered in Firebase:", phone);
        } catch (fbErr) {
            console.warn("Firebase User Save Notice:", fbErr.message);
        }

        registeredUsers[phone] = userData;
        saveLocalData();

        currentUser = {
            uid: "user_" + phone,
            displayName: name,
            phoneNumber: phone,
            aadhaar: aadhaar,
            photo: uploadedStudentPhotoDataUrl
        };
        localStorage.setItem("vidya_user", JSON.stringify(currentUser));
        updateAuthUI(currentUser);

        if ($("studentName")) $("studentName").value = name;
        if ($("studentPhone")) $("studentPhone").value = phone;

        toast(`🎉 रजिस्ट्रेशन सफल! स्वागत है, ${name}`, "success");
        go("booking");

    } else {
        // LOGIN MODE
        if (password.length < 4) {
            toast("कृपया अपना सही पासवर्ड दर्ज करें।", "error");
            $("authPassword")?.focus();
            return;
        }

        let userFound = registeredUsers[phone];
        try {
            const snap = await get(child(ref(db), "users/" + phone));
            if (snap.exists()) {
                userFound = snap.val();
                registeredUsers[phone] = userFound;
                saveLocalData();
            }
        } catch (err) {}

        if (!userFound) {
            toast("❌ यह मोबाइल नंबर रजिस्टर्ड नहीं है। कृपया पहले 'नया रजिस्ट्रेशन (KYC)' करें।", "error");
            setAuthMode("register");
            if ($("authPhone")) $("authPhone").value = phone;
            return;
        }

        if (userFound.password !== password) {
            toast("❌ गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें या 'पासवर्ड भूल गए?' पर क्लिक करें।", "error");
            $("authPassword")?.focus();
            return;
        }

        currentUser = {
            uid: "user_" + phone,
            displayName: userFound.name || "विद्यार्थी",
            phoneNumber: phone,
            aadhaar: userFound.aadhaar || "",
            photo: userFound.photo || ""
        };
        localStorage.setItem("vidya_user", JSON.stringify(currentUser));
        updateAuthUI(currentUser);
        toast(`लॉगिन सफल! स्वागत है, ${currentUser.displayName}`, "success");

        loadUserBookingsFromFirebase(phone);

        if ($("studentName")) $("studentName").value = userFound.name || "";
        if ($("studentPhone")) $("studentPhone").value = phone;

        go("booking");
    }
}

async function sendForgotOTP() {
    const phone = normalisePhone(value("forgotPhone"));
    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया पहले सही 10 अंकों का मोबाइल नंबर भरें।", "error");
        $("forgotPhone")?.focus();
        return;
    }

    let userFound = registeredUsers[phone];
    if (!userFound) {
        try {
            const snap = await get(child(ref(db), "users/" + phone));
            if (snap.exists()) userFound = snap.val();
        } catch (e) {}
    }

    if (!userFound) {
        toast("यह मोबाइल नंबर रजिस्टर्ड नहीं है। कृपया पहले नया रजिस्ट्रेशन करें।", "error");
        setAuthMode("register");
        if ($("authPhone")) $("authPhone").value = phone;
        return;
    }

    activeGeneratedOtp = String(Math.floor(1000 + Math.random() * 9000));
    const otpInput = $("forgotOtp");
    if (otpInput) otpInput.value = activeGeneratedOtp;

    toast(`सुरक्षा OTP कोड: ${activeGeneratedOtp} (ऑटो-फिल कर दिया गया है)`, "success");
}

async function handleForgotSubmit(e) {
    e.preventDefault();
    const phone = normalisePhone(value("forgotPhone"));
    const enteredOtp = value("forgotOtp").trim();
    const newPass = value("forgotNewPassword").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।", "error");
        return;
    }

    if (!activeGeneratedOtp || enteredOtp !== activeGeneratedOtp) {
        toast("अमान्य OTP कोड! कृपया 'OTP भेजें' पर क्लिक करके सही कोड दर्ज करें।", "error");
        return;
    }

    if (newPass.length < 4) {
        toast("नया पासवर्ड कम से कम 4 अक्षर/अंकों का होना चाहिए।", "error");
        $("forgotNewPassword")?.focus();
        return;
    }

    try {
        await update(ref(db, "users/" + phone), {
            password: newPass,
            passwordResetAt: Date.now()
        });
        console.log("Password updated in Firebase for:", phone);
    } catch (fbErr) {
        console.warn("Firebase password reset notice:", fbErr);
    }

    if (registeredUsers[phone]) {
        registeredUsers[phone].password = newPass;
    } else {
        registeredUsers[phone] = { name: "User", phone, password: newPass };
    }
    saveLocalData();

    currentUser = {
        uid: "user_" + phone,
        displayName: registeredUsers[phone].name,
        phoneNumber: phone
    };
    localStorage.setItem("vidya_user", JSON.stringify(currentUser));
    updateAuthUI(currentUser);

    activeGeneratedOtp = null;
    toast("पासवर्ड सफलतापूर्वक बदल गया! आप लॉगिन हो चुके हैं।", "success");
    setAuthMode("login");
    go("booking");
}

function logout() {
    currentUser = null;
    myBookings = [];
    localStorage.removeItem("vidya_user");
    localStorage.removeItem("vidya_bookings");
    updateAuthUI(null);
    renderHistory();
    toast("आप सफलतापूर्वक Logout हो गए हैं।");
    go("home");
}

function updateAuthUI(user) {
    const authSec = $("authCardSection");
    const profSec = $("profileCardSection");

    if (authSec && profSec) {
        authSec.style.display = user ? "none" : "block";
        profSec.style.display = user ? "block" : "none";
    }

    if (user) {
        if ($("studentName") && !$("studentName").value) $("studentName").value = user.displayName || "";
        if ($("studentPhone") && !$("studentPhone").value && user.phoneNumber) $("studentPhone").value = user.phoneNumber;
        if ($("lockerStudentName") && !$("lockerStudentName").value) $("lockerStudentName").value = user.displayName || "";
        if ($("lockerStudentPhone") && !$("lockerStudentPhone").value && user.phoneNumber) $("lockerStudentPhone").value = user.phoneNumber;
        if ($("complaintStudentName") && !$("complaintStudentName").value) $("complaintStudentName").value = user.displayName || "";
        if ($("complaintStudentPhone") && !$("complaintStudentPhone").value && user.phoneNumber) $("complaintStudentPhone").value = user.phoneNumber;
        const myActiveSeat = (myBookings || []).find(b => (b.assignedSeat || b.requestedSeat));
        if (myActiveSeat && $("complaintSeatNo") && !$("complaintSeatNo").value) {
            $("complaintSeatNo").value = String(myActiveSeat.assignedSeat || myActiveSeat.requestedSeat);
        }
        renderStudentComplaints();
    }

    text("profileName", user?.displayName || "अतिथि विद्यार्थी");
    text("profilePhone", user?.phoneNumber || "अभी लॉगिन नहीं किया");
    text("profileStatus", user ? "लॉगिन है (Active)" : "अतिथि मोड");
    if (user && user.phoneNumber) {
        const dStat = getStudentDepositStatus(user.phoneNumber);
        if (dStat === "active_held") {
            text("profileDepositStatus", "🟢 ₹300 जमा है (2nd, 3rd बुकिंग पर ₹0 देय)");
        } else if (dStat === "refunded") {
            text("profileDepositStatus", "↩️ ₹300 रिफंडेड (पुनः जुड़ने पर ₹300 देय)");
        } else {
            text("profileDepositStatus", "⚪ पहली बार ₹300 देय (रिफंडेबल)");
        }
        renderDepositBadge(user.phoneNumber, dStat);
        updateSummary();
    } else {
        text("profileDepositStatus", "अतिथि (पहली बार ₹300 देय)");
    }

    const avatar = $("profileAvatar");
    if (avatar) {
        const photoSrc = user?.photo || registeredUsers[user?.phoneNumber]?.photo || "";
        if (photoSrc) {
            avatar.innerHTML = `<img src="${photoSrc}" alt="Student" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            avatar.textContent = (user?.displayName || "वि").charAt(0).toUpperCase();
        }
    }

    const aadhaarRow = $("profileAadhaarRow");
    const aadhaarVal = user?.aadhaar || registeredUsers[user?.phoneNumber]?.aadhaar || "";
    if (aadhaarRow) {
        if (user && aadhaarVal) {
            aadhaarRow.style.display = "flex";
            const masked = aadhaarVal.length === 12 ? `XXXX-XXXX-${aadhaarVal.slice(-4)} ✓` : aadhaarVal;
            text("profileAadhaar", masked);
        } else {
            aadhaarRow.style.display = "none";
        }
    }
}

/* ================= BOOKING FLOW ================= */
function getPaymentArea(parentId) {
    let area = $("paymentArea");
    if (!area) {
        area = document.createElement("div");
        area.id = "paymentArea";
        area.className = "card";
    }
    const parent = $(parentId);
    if (parent && area.parentElement !== parent) {
        parent.appendChild(area);
    }
    area.hidden = false;
    area.style.display = "block";
    return area;
}

function prepareBooking() {
    const name = String(value("studentName") || currentUser?.displayName || "").trim();
    const phone = normalisePhone(value("studentPhone") || currentUser?.phoneNumber || "");
    const startDate = selectedStartDate();
    const plan = selectedPlan();
    const months = Number(selectedMonths());

    if (name.length < 2) {
        toast("कृपया विद्यार्थी का पूरा नाम दर्ज करें।", "error");
        go("booking");
        $("studentName")?.focus();
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया सही 10 अंकों का WhatsApp मोबाइल नंबर दर्ज करें।", "error");
        go("booking");
        $("studentPhone")?.focus();
        return;
    }

    // Strict check: Student must be logged in with owner-verified account
    if (!currentUser || normalisePhone(currentUser.phoneNumber) !== phone) {
        toast("🔒 सीट बुक करने के लिए कृपया पहले मालिक द्वारा दिए गए मोबाइल नंबर व पासवर्ड से लॉगिन करें।", "error");
        go("profile");
        if ($("authPhone")) $("authPhone").value = phone;
        $("authPassword")?.focus();
        return;
    }

    if ((currentBookingType === "seat" || currentBookingType === "seat_and_locker") && plan === "Reserved" && !selectedSeat) {
        toast("Reserved Plan के लिए कृपया पहले फ्लोर मैप में अपनी सीट चुनें।", "error");
        go("booking");
        return;
    }

    if ((currentBookingType === "locker_only" || currentBookingType === "seat_and_locker") && !selectedLocker) {
        toast("कृपया उपलब्ध लॉकर (हरा बॉक्स) चुनें।", "error");
        go("booking");
        $("lockerSelectionCard")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const amount = calculateBookingAmount();

    const validity = calculateValidity(startDate, months);

    currentBookingDraft = {
        name,
        phone,
        startDate,
        endDate: validity.endDateFormatted,
        endDateISO: validity.endDate,
        totalDays: validity.totalDays,
        validitySummary: validity.summaryText,
        plan,
        months,
        seatPreference: selectedSeat,
        seatAssignment: plan === "Reserved" ? "reserved_fixed" : (selectedSeat ? "requested" : "admin_to_assign"),
        locker: selectedLocker,
        bookingType: currentBookingType,
        ...amount
    };

    // Render payment directly on current active page
    const activePage = document.querySelector(".page.active")?.id || "booking";
    showPaymentPanel(currentBookingDraft, activePage);
}

function showPaymentPanel(draft, targetPageId = "booking") {
    let paymentArea = (targetPageId === "fees") ? $("paymentArea") : $("bookingPaymentArea");
    if (!paymentArea) paymentArea = getPaymentArea(targetPageId);
    const method = value("payMethod", "UPI");

    const amtStr = draft.total.toFixed(2);
    const txnNote = `VL-Seat-${draft.total}`;
    
    // Standard UPI Intent
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    const gpayUrl = `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    const paytmUrl = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;

    let contentHTML = "";

    if (method === "cash") {
        contentHTML = `
            <div class="payment-card" style="border:2px solid #22c55e;">
                <h3 style="color:#15803d; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
                    <span>💵</span> नकद भुगतान बुकिंग (Cash Payment at Counter)
                </h3>
                <p class="small muted" style="margin-top:0;">विद्या लाइब्रेरी राजनांदगांव · The Study Zone</p>

                <div class="summary-row"><span>विद्यार्थी का नाम:</span> <b>${escapeHTML(draft.name)}</b></div>
                <div class="summary-row"><span>मोबाइल नं:</span> <b>${escapeHTML(draft.phone)}</b></div>
                <div class="summary-row"><span>समय स्लॉट व अवधि:</span> <b>${escapeHTML(draft.plan)} (${draft.months} माह / ${draft.totalDays} दिन)</b></div>
                <div class="summary-row"><span>सीट विवरण:</span> <b>${draft.seatPreference ? "Seat " + draft.seatPreference : (draft.bookingType === 'locker_only' ? 'केवल लॉकर' : 'काउंटर द्वारा आवंटित')}</b></div>
                ${draft.locker ? `<div class="summary-row"><span>निजी लॉकर:</span> <b>Locker L${draft.locker}</b></div>` : ''}
                <div class="summary-row"><span>प्रारंभ तिथि:</span> <b>${escapeHTML(draft.startDate)}</b></div>
                <div class="summary-row" style="background:#eef2ff; border-radius:8px; padding:8px 10px;">
                    <span>वैधता (Ending Date):</span> 
                    <b style="color:var(--navy);">${escapeHTML(draft.endDate)} (पूरे ${draft.totalDays} दिन)</b>
                </div>
                <div class="summary-row summary-total" style="background:#f0fdf4; border-color:#86efac;">
                    <span style="color:#15803d;">कुल नकद देय राशि:</span> 
                    <b style="color:#15803d; font-size:22px;">${money(draft.total)}</b>
                </div>

                <div class="cash-instructions" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:14px; margin:16px 0; text-align:left;">
                    <div style="font-weight:800; color:var(--navy); margin-bottom:6px; font-size:14px;">
                        📍 नकद जमा करने का स्थान:
                    </div>
                    <p style="margin:0 0 6px; font-size:13px; color:#334155;">
                        <b>विद्या लाइब्रेरी काउंटर (प्रथम तल)</b><br>
                        शिव टॉवर, दिग्विजय कॉलेज के पास, दुर्गा मंदिर के सामने, राजनांदगांव (छ.ग.)<br>
                        हेल्पलाइन: <b>9111701828, 7000545675</b>
                    </p>
                    <div style="font-size:12px; color:#166534; background:#dcfce7; padding:8px 10px; border-radius:6px; border:1px solid #86efac; margin-top:8px;">
                        ✓ <b>कोई UTR की आवश्यकता नहीं:</b> नीचे दिए गए बटन पर क्लिक करते ही आपकी सीट बुक हो जाएगी और आधिकारिक डिजिटल रसीद तुरंत कटकर डाउनलोड के लिए तैयार हो जाएगी।
                    </div>
                </div>

                <button type="button" id="submitBookingBtn" class="btn btn-success full" style="font-size:16px; padding:15px; margin-top:10px;">
                    ✅ नकद बुकिंग दर्ज करें व डिजिटल रसीद प्राप्त करें (₹${draft.total}) →
                </button>
                <p class="secure-note" style="text-align:center; font-size:11.5px; color:#64748b; margin-top:8px;">
                    रिफंडेबल सिक्योरिटी डिपॉजिट ₹300 सहित। रसीद कटने के बाद आप काउंटर पर नकद देकर अध्ययन प्रारंभ कर सकते हैं।
                </p>
            </div>
        `;
    } else {
        contentHTML = `
            <div class="payment-card">
                <h3 style="color:var(--navy); margin-bottom: 4px;">💳 सीधा ऑनलाइन भुगतान (Direct UPI Payment)</h3>
                <p class="small muted" style="margin-top:0;">विद्या लाइब्रेरी राजनांदगांव · The Study Zone</p>

                <div class="summary-row"><span>विद्यार्थी का नाम:</span> <b>${escapeHTML(draft.name)}</b></div>
                <div class="summary-row"><span>मोबाइल नं:</span> <b>${escapeHTML(draft.phone)}</b></div>
                <div class="summary-row"><span>समय स्लॉट व अवधि:</span> <b>${escapeHTML(draft.plan)} (${draft.months} माह / ${draft.totalDays} दिन)</b></div>
                <div class="summary-row"><span>सीट विवरण:</span> <b>${draft.seatPreference ? "Seat " + draft.seatPreference : (draft.bookingType === 'locker_only' ? 'केवल लॉकर' : 'लाइब्रेरी द्वारा आवंटित')}</b></div>
                ${draft.locker ? `<div class="summary-row"><span>निजी लॉकर:</span> <b>Locker L${draft.locker}</b></div>` : ''}
                <div class="summary-row"><span>प्रारंभ तिथि:</span> <b>${escapeHTML(draft.startDate)}</b></div>
                <div class="summary-row" style="background:#eef2ff; border-radius:8px; padding:8px 10px;">
                    <span>वैधता (Ending Date):</span> 
                    <b style="color:var(--navy);">${escapeHTML(draft.endDate)} (पूरे ${draft.totalDays} दिन)</b>
                </div>
                <div class="summary-row"><span>सीट प्लान फीस:</span> <b>${money(draft.baseFee)}</b></div>
                ${draft.lockerFee ? `<div class="summary-row"><span>लॉकर फीस:</span> <b>${money(draft.lockerFee)}</b></div>` : ''}
                <div class="summary-row" style="background:${draft.deposit > 0 ? '#eff6ff' : '#f0fdf4'}; padding:6px 10px; border-radius:6px; margin:4px 0;">
                    <span>सिक्योरिटी डिपॉजिट (रिफंडेबल):</span> 
                    <b style="color:${draft.deposit > 0 ? '#1e40af' : '#15803d'};">
                        ${draft.deposit > 0 ? "₹300 (केवल 1st बुकिंग पर देय)" : "₹0 (पूर्व से सुरक्षित जमा ✓ · 2nd/3rd बुकिंग पर ₹0)"}
                    </b>
                </div>
                <div class="summary-row summary-total"><span>कुल देय राशि:</span> <b>${money(draft.total)}</b></div>

                <div class="direct-pay-box">
                    <div class="exact-amount-pill">
                        ⚡ सटीक देय राशि: <b>${money(draft.total)}</b>
                    </div>
                    <p class="small muted" style="margin: 6px 0 12px; text-align:center;">
                        नीचे दिए गए बटन पर क्लिक करें, सीधे PhonePe या Google Pay खुलेगा और उसमें <b>₹${draft.total}</b> की सटीक राशि अपने-आप सेट रहेगी:
                    </p>

                    <!-- DIRECT GPAY & PHONEPE BUTTONS -->
                    <div class="upi-buttons-grid">
                        <a href="${phonepeUrl}" class="btn btn-pay-phonepe full" style="text-decoration:none;">
                            <span class="pay-app-icon">🟣</span> <b>PhonePe से ₹${draft.total} पे करें</b>
                        </a>

                        <a href="${gpayUrl}" class="btn btn-pay-gpay full" style="text-decoration:none;">
                            <span class="pay-app-icon">🌐</span> <b>Google Pay से ₹${draft.total} पे करें</b>
                        </a>

                        <a href="${paytmUrl}" class="btn btn-pay-anyupi full" style="text-decoration:none; background:#002970;">
                            <span class="pay-app-icon">🔷</span> <b>Paytm से ₹${draft.total} पे करें</b>
                        </a>

                        <a href="${upiUrl}" class="btn btn-pay-anyupi full" style="text-decoration:none;">
                            <span class="pay-app-icon">📲</span> <b>BHIM / अन्य UPI ऐप से पे करें</b>
                        </a>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:14px; padding-top:10px; border-top:1px dashed #c7ccff;">
                        <div class="upi-pill" style="margin:0;">
                            <span>UPI ID: <b>${UPI_ID}</b></span>
                            <span class="copy-badge" onclick="copyUPI()">कॉपी करें</span>
                        </div>
                        <button type="button" class="btn btn-outline" style="padding:6px 12px; font-size:12px;" onclick="togglePayQrCode('${draft.total}')">
                            📱 कंप्यूटर / QR कोड से स्कैन करें
                        </button>
                    </div>

                    <div id="dynamicPayQrArea" style="display:none; margin-top:14px; text-align:center; padding:14px; background:#ffffff; border-radius:12px; border:1px solid #d5daf5;">
                        <p style="font-weight:700; color:var(--navy); font-size:13px; margin:0 0 6px;">
                            यदि आप कंप्यूटर या लैपटॉप पर हैं, तो मोबाइल से QR स्कैन करें:
                        </p>
                        <img id="dynamicPayQrImg" src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(upiUrl)}" alt="UPI QR" style="width:160px; height:160px; margin:auto; border:1px solid #ccc; border-radius:10px; display:block;">
                        <small style="display:block; margin-top:4px; color:#555;">सटीक राशि: <b>${money(draft.total)}</b></small>
                    </div>
                </div>

                <!-- STRICT 12-DIGIT UTR VALIDATION SECTION -->
                <div class="field" style="margin-top:16px;">
                    <label for="paymentUtr" style="color:var(--navy); font-size:13px; font-weight:800;">
                        🔒 भुगतान के बाद 12 अंकों का असली UPI UTR / Ref No. दर्ज करें:
                    </label>
                    <input id="paymentUtr" type="text" maxlength="12" inputmode="numeric" 
                           placeholder="PhonePe/GPay से 12 अंकों का UTR (उदा. 429182749102)" required 
                           style="font-size:16px; font-weight:700; letter-spacing:1px;">
                    <small class="muted" style="display:block; margin-top:4px; font-size:11px;">
                        ⚠️ <b>सुरक्षा नियम:</b> केवल इसी ₹${draft.total} भुगतान का 12 अंकों का असली UTR ही स्वीकार होगा।
                    </small>
                </div>

                <button type="button" id="submitBookingBtn" class="btn btn-primary full" style="font-size:15px; margin-top:10px;">
                    ✅ ₹${draft.total} UTR सबमिट करें व डिजिटल रसीद प्राप्त करें →
                </button>
                <p class="secure-note" style="text-align:center;">
                    डिपॉजिट ₹300 रिफंडेबल है। बैंक खाते में सत्यापन के बाद सीट कन्फर्म रहेगी।
                </p>
            </div>
        `;
    }

    paymentArea.innerHTML = contentHTML;
    paymentArea.hidden = false;
    paymentArea.style.display = "block";

    $("submitBookingBtn")?.addEventListener("click", submitBooking);
    paymentArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

function copyUPI() {
    navigator.clipboard?.writeText(UPI_ID).then(() => {
        toast("UPI ID कॉपी हो गई: " + UPI_ID, "success");
    }).catch(() => {
        toast("UPI ID: " + UPI_ID);
    });
}


/* ================= SEQUENTIAL RECEIPT SL. NO. COUNTER (1, 2, 3...) ================= */
async function getNextReceiptNumber() {
    let maxExisting = 0;

    // 1. Check in-memory arrays (both admin requests and personal bookings)
    const allKnown = [...(allAdminRequests || []), ...(myBookings || [])];
    allKnown.forEach(b => {
        const n = Number(b.slNo || b.regNum);
        if (!isNaN(n) && n > maxExisting && n < 50000) {
            maxExisting = n;
        }
    });

    // 2. Check Firebase Realtime Database counter
    try {
        const snap = await get(child(ref(db), "public/counters/receiptCounter"));
        if (snap.exists()) {
            const fbVal = Number(snap.val());
            if (!isNaN(fbVal) && fbVal > maxExisting && fbVal < 50000) {
                maxExisting = fbVal;
            }
        }
    } catch (e) {
        console.warn("Firebase counter read notice:", e);
    }

    // 3. Check LocalStorage fallback
    const localVal = Number(localStorage.getItem("vidya_receipt_sl_counter") || 0);
    if (!isNaN(localVal) && localVal > maxExisting && localVal < 50000) {
        maxExisting = localVal;
    }

    // Next receipt number starts at 1, then 2, 3, 4, 5...
    const nextNum = maxExisting + 1;

    // 4. Atomically persist updated counter to Firebase & LocalStorage
    try {
        await set(ref(db, "public/counters/receiptCounter"), nextNum);
    } catch (e) {
        console.warn("Firebase counter write notice:", e);
    }
    localStorage.setItem("vidya_receipt_sl_counter", String(nextNum));

    console.log("Generated next sequential receipt Sl. No.:", nextNum);
    return nextNum;
}
window.getNextReceiptNumber = getNextReceiptNumber;

/* ================= SUBMIT SEAT BOOKING TO FIREBASE ================= */
async function submitBooking() {
    if (!currentUser || !currentBookingDraft) {
        toast("पहले बुकिंग तैयार करें।", "error");
        return;
    }

    const draft = currentBookingDraft;
    const method = value("payMethod", "UPI");
    let utr = "";

    if (method === "UPI") {
        utr = String(value("paymentUtr")).trim().replace(/\s+/g, "");

        // 1. Strict 12-digit validation
        if (!/^\d{12}$/.test(utr)) {
            toast("❌ अमान्य UTR! कृपया PhonePe/GPay से 12 अंकों का शुद्ध नंबर (UTR) दर्ज करें।", "error");
            $("paymentUtr")?.focus();
            return;
        }

        // 2. Reject obvious fake numbers
        if (/^(\d)\1{11}$/.test(utr) || utr === "123456789012" || utr === "012345678901") {
            toast("❌ यह फ़र्ज़ी UTR नंबर है! कृपया अपने असली ट्रांजैक्शन का UTR नंबर भरें।", "error");
            $("paymentUtr")?.focus();
            return;
        }

        // 3. Block reused/duplicate UTRs
        if (usedUtrs[utr]) {
            toast(`❌ यह UTR (${utr}) पहले ही उपयोग किया जा चुका है!`, "error");
            $("paymentUtr")?.focus();
            return;
        }

        // Record UTR as used
        usedUtrs[utr] = {
            amount: draft.total,
            phone: draft.phone,
            date: Date.now()
        };
    } else {
        // Cash Payment at Library Counter
        utr = "CASH_COUNTER";
    }

    const slNo = await getNextReceiptNumber();
    const regNum = String(slNo);
    const bookingId = "VL" + Math.floor(100000 + Math.random() * 900000);
    const record = {
        bookingId,
        slNo,
        regNum,
        uid: currentUser.uid,
        studentName: draft.name,
        studentPhone: draft.phone,
        plan: draft.plan,
        months: draft.months,
        startDate: draft.startDate,
        endDate: draft.endDate,
        endDateISO: draft.endDateISO,
        totalDays: draft.totalDays,
        baseFee: draft.baseFee,
        lockerFee: draft.lockerFee,
        refundableDeposit: draft.deposit,
        totalAmount: draft.total,
        bookingType: draft.bookingType || "seat",
        requestedSeat: draft.seatPreference,
        assignedSeat: draft.plan === "Reserved" ? draft.seatPreference : null,
        locker: draft.locker,
        assignedLocker: draft.locker,
        paymentMethod: method === "cash" ? "नकद (Cash Counter)" : "UPI Online",
        utr: utr,
        paymentStatus: method === "UPI" ? "submitted_for_verification" : "cash_pending",
        status: "confirmed",
        depositPaid: true,
        depositStatusAtBooking: (draft.deposit > 0 ? "newly_paid" : "already_active"),
        createdAt: Date.now()
    };

    if (draft.seatPreference) {
        availability.seats[String(draft.seatPreference)] = "reserved";
    }
    if (draft.locker) {
        availability.lockers[String(draft.locker)] = "reserved";
    }

    // 1. Save to Firebase Realtime Database
    try {
        const updates = {};
        updates[`users/${draft.phone}/bookings/${bookingId}`] = record;
        updates[`users/${draft.phone}/depositStatus`] = 'active_held';
        updates[`users/${draft.phone}/name`] = draft.name;
        updates[`bookingRequests/${bookingId}`] = record;
        if (draft.seatPreference) {
            updates[`public/availability/seats/${draft.seatPreference}`] = "reserved";
        }
        if (draft.locker) {
            updates[`public/availability/lockers/${draft.locker}`] = "reserved";
        }
        await update(ref(db), updates);
        console.log("Booking saved to Firebase Realtime DB:", bookingId);
    } catch (fbErr) {
        console.warn("Firebase booking save notice:", fbErr.message);
    }

    // 2. Save locally
    if (draft.phone) {
        if (!registeredUsers[draft.phone]) registeredUsers[draft.phone] = { phone: draft.phone, name: draft.name };
        registeredUsers[draft.phone].depositStatus = 'active_held';
    }
    // Only add to myBookings if it belongs to the active currentUser
    if (currentUser && normalisePhone(currentUser.phoneNumber) === normalisePhone(draft.phone)) {
        myBookings.unshift(record);
    }
    allAdminRequests.unshift(record);
    saveLocalData();

    // Auto-sync to Google Sheets webhook if configured
    syncBookingToGoogleSheets(record);

    // 3. Render success card on booking page
    const successCardHTML = `
        <div style="text-align:center; padding: 24px 16px; background:#ffffff; border:2.5px solid #18833b; border-radius:18px; box-shadow:0 10px 35px rgba(24,131,59,0.18);">
            <div style="font-size: 52px; margin-bottom: 8px;">🎉</div>
            <h3 style="color:var(--green); margin:0 0 6px; font-size:22px; font-weight:900;">
                ${method === 'cash' ? 'नकद बुकिंग सफलतापूर्वक दर्ज हो गई!' : 'ऑनलाइन पेमेंट बुकिंग सफलतापूर्वक दर्ज!'}
            </h3>
            <p style="font-size:16px; margin:4px 0;">पंजीकरण क्रमांक: <b style="color:var(--red); font-size:22px;">Reg. No. A. ${record.regNum}</b></p>
            <p class="small muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.7;">
                विद्यार्थी: <b>${escapeHTML(draft.name)}</b> | मोबाइल: <b>${escapeHTML(draft.phone)}</b><br>
                सीट: <b>${draft.plan === 'Reserved' && draft.seatPreference ? 'Seat ' + draft.seatPreference : (draft.bookingType === 'locker_only' ? 'केवल लॉकर' : 'काउंटर द्वारा आवंटित')}</b>
                ${draft.locker ? ` | लॉकर: <b>L${draft.locker}</b>` : ''}<br>
                वैधता: <b>${draft.startDate} से ${draft.endDate} (${draft.totalDays} दिन)</b><br>
                कुल देय राशि: <b style="color:var(--navy); font-size:17px;">${money(draft.total)}</b> 
                (${method === 'cash' ? 'नकद काउंटर भुगतान' : 'UPI ऑनलाइन'})
            </p>

            <div style="display:flex; flex-direction:column; gap:10px; margin: 20px 0;">
                <button type="button" class="btn btn-primary full" style="font-size:15px; padding:14px;" onclick="printReceipt('${bookingId}')">
                    📄 आधिकारिक डिजिटल रसीद देखें व PDF डाउनलोड करें
                </button>
                
                <button type="button" class="btn btn-success full" style="font-size:14px; padding:13px;" onclick="sendReceiptToWhatsApp('${bookingId}')">
                    💬 सीधे WhatsApp पर रसीद भेजें
                </button>

                <button type="button" class="btn btn-outline full" onclick="go('profile')">
                    👤 मेरी प्रोफाइल व बुकिंग हिस्ट्री देखें →
                </button>
            </div>

            <p style="font-size:11.5px; color:#64748b; margin:0;">
                ✓ आपकी आधिकारिक रसीद तैयार है। आप नीचे डाउनलोड कर सकते हैं या 'मेरी प्रोफाइल' में सुरक्षित रख सकते हैं।
            </p>
        </div>
    `;

    const bArea = $("bookingPaymentArea");
    if (bArea) {
        bArea.innerHTML = successCardHTML;
        bArea.hidden = false;
        bArea.style.display = "block";
        bArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    renderSeatGrid();
    renderLockerGrid();
    renderHistory();
    toast("बुकिंग दर्ज! आधिकारिक रसीद तैयार है।", "success");

    // Automatically open the official receipt modal so the student can view & download PDF immediately!
    setTimeout(() => {
        printReceipt(bookingId);
    }, 600);
}

/* ================= LOCKER BOOKING TO FIREBASE ================= */
function saveLocker() {
    if (!currentUser) {
        toast("लॉकर बुक करने से पहले कृपया लॉगिन करें।", "error");
        go("login");
        return;
    }

    const name = String(value("lockerStudentName") || currentUser.displayName || "").trim();
    const phone = normalisePhone(value("lockerStudentPhone") || currentUser.phoneNumber || "");
    const months = Number(value("lockerMonths", "1"));
    const startDate = value("lockerStartDate", todayDate());
    const locker = selectedLocker;

    if (name.length < 2) {
        toast("कृपया पूरा नाम दर्ज करें।", "error");
        $("lockerStudentName")?.focus();
        return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("सही 10 अंकों का मोबाइल नंबर दर्ज करें।", "error");
        $("lockerStudentPhone")?.focus();
        return;
    }
    if (!locker) {
        toast("कृपया उपलब्ध लॉकर (हरा बॉक्स) चुनें।", "error");
        return;
    }

    const total = 100; // Flat ₹100 per locker
    const lockerVal = calculateValidity(startDate, months);
    currentLockerDraft = { 
        name, phone, locker, months, startDate, 
        endDate: lockerVal.endDateFormatted,
        totalDays: lockerVal.totalDays,
        total 
    };

    showLockerPayment(currentLockerDraft);
}

function showLockerPayment(draft) {
    const area = $("lockerPaymentArea");
    if (!area) return;

    area.hidden = false;
    area.style.display = "block";

    const amtStr = draft.total.toFixed(2);
    const txnNote = `VL-Locker-${draft.locker}`;
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
    const gpayUrl = `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(txnNote)}`;

    area.innerHTML = `
        <div class="payment-card">
            <h3 style="color:var(--navy);">🔐 सीधा लॉकर पेमेंट: Locker L${draft.locker}</h3>
            <div class="summary-row"><span>विद्यार्थी:</span> <b>${escapeHTML(draft.name)}</b></div>
            <div class="summary-row"><span>अवधि व वैधता:</span> <b>${draft.months} महीने (${draft.totalDays} दिन) - ${draft.startDate} से ${draft.endDate}</b></div>
            <div class="summary-row summary-total"><span>लॉकर फीस:</span> <b>${money(draft.total)}</b></div>

            <div class="direct-pay-box">
                <div class="exact-amount-pill">देय राशि: <b>${money(draft.total)}</b></div>
                <div class="upi-buttons-grid" style="margin-top:10px;">
                    <a href="${phonepeUrl}" onclick="window.location.href='${upiUrl}'" class="btn btn-pay-phonepe full" style="text-decoration:none;">
                        🟣 PhonePe से ₹${draft.total} पे करें
                    </a>
                    <a href="${gpayUrl}" onclick="window.location.href='${upiUrl}'" class="btn btn-pay-gpay full" style="text-decoration:none;">
                        🌐 Google Pay से ₹${draft.total} पे करें
                    </a>
                </div>
                <div class="upi-pill" style="margin-top:10px; justify-content:center;">
                    <span>UPI ID: <b>${UPI_ID}</b></span>
                    <span class="copy-badge" onclick="copyUPI()">कॉपी करें</span>
                </div>
            </div>

            <div class="field" style="margin-top:14px;">
                <label for="lockerUTR">भुगतान के बाद 12 अंकों का UTR दर्ज करें:</label>
                <input id="lockerUTR" type="text" maxlength="12" inputmode="numeric" placeholder="12 अंकों का UPI UTR नंबर दर्ज करें" style="font-size:15px; font-weight:700;">
            </div>

            <button type="button" class="btn btn-primary full" onclick="submitLockerWithUTR()">
                ✅ ₹${draft.total} UTR जमा करें व लॉकर बुक करें
            </button>
        </div>
    `;

    area.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitLockerWithUTR() {
    if (!currentUser || !currentLockerDraft) return;

    const utr = String(value("lockerUTR")).trim().replace(/\s+/g, "");
    if (!/^\d{12}$/.test(utr)) {
        toast("❌ कृपया 12 अंकों का शुद्ध UPI UTR नंबर भरें।", "error");
        $("lockerUTR")?.focus();
        return;
    }
    if (usedUtrs[utr]) {
        toast("❌ यह UTR पहले ही उपयोग किया जा चुका है!", "error");
        return;
    }
    usedUtrs[utr] = { amount: draft.total, phone: draft.phone, date: Date.now() };

    const draft = currentLockerDraft;
    const bookingId = "LCK" + Math.floor(10000 + Math.random() * 90000);

    const record = {
        bookingId,
        uid: currentUser.uid,
        studentName: draft.name,
        studentPhone: draft.phone,
        bookingType: "locker",
        locker: draft.locker,
        months: draft.months,
        startDate: draft.startDate,
        endDate: draft.endDate,
        totalDays: draft.totalDays,
        lockerFee: draft.total,
        totalAmount: draft.total,
        paymentMethod: "UPI",
        utr,
        status: "confirmed",
        createdAt: Date.now()
    };

    availability.lockers[String(draft.locker)] = "reserved";

    // Save to Firebase
    try {
        const updates = {};
        updates[`users/${draft.phone}/bookings/${bookingId}`] = record;
        updates[`users/${draft.phone}/depositStatus`] = 'active_held';
        updates[`users/${draft.phone}/name`] = draft.name;
        updates[`bookingRequests/${bookingId}`] = record;
        updates[`public/availability/lockers/${draft.locker}`] = "reserved";
        await update(ref(db), updates);
        console.log("Locker saved to Firebase:", bookingId);
    } catch (fbErr) {
        console.warn("Firebase Locker notice:", fbErr.message);
    }

    if (draft.phone) {
        if (!registeredUsers[draft.phone]) registeredUsers[draft.phone] = { phone: draft.phone, name: draft.name };
        registeredUsers[draft.phone].depositStatus = 'active_held';
    }
    // Only add to myBookings if it belongs to the active currentUser
    if (currentUser && normalisePhone(currentUser.phoneNumber) === normalisePhone(draft.phone)) {
        myBookings.unshift(record);
    }
    allAdminRequests.unshift(record);
    saveLocalData();

    toast(`लॉकर L${draft.locker} सफलतापूर्वक Firebase में बुक हो गया!`, "success");
    currentLockerDraft = null;
    selectedLocker = null;
    $("lockerPaymentArea").hidden = true;
    renderLockerGrid();
    renderHistory();
    go("profile");
}

/* ================= RENDER HISTORY & RECEIPTS ================= */
async function loadUserBookingsFromFirebase(phone) {
    if (!phone) return;
    try {
        const snap = await get(child(ref(db), `users/${phone}/bookings`));
        if (snap.exists()) {
            const data = snap.val();
            // Strictly filter and keep only bookings belonging to this student's phone
            const bookingsList = Object.values(data)
                .filter(b => normalisePhone(b.studentPhone) === normalisePhone(phone))
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            myBookings = bookingsList;
        } else {
            // No bookings found in cloud for this student
            myBookings = [];
        }
        saveLocalData();
        renderHistory();
        updateSummary();
        renderDepositBadge(phone, getStudentDepositStatus(phone));
    } catch (err) {
        console.warn("Load bookings notice:", err);
    }
}

function renderHistory() {
    const list = $("historyList");
    if (!list) return;

    if (!currentUser) {
        list.innerHTML = `<div class="empty">अपनी व्यक्तिगत बुकिंग और रसीद देखने के लिए <a href="javascript:go('login')" style="color:var(--navy); font-weight:bold;">यहाँ लॉगिन करें</a>।</div>`;
        return;
    }

    const myPhone = normalisePhone(currentUser.phoneNumber);

    // Strict privacy lock: filter ONLY bookings belonging to the currently logged-in student
    const studentOnlyBookings = (myBookings || []).filter(b => 
        normalisePhone(b.studentPhone) === myPhone
    );

    if (!studentOnlyBookings.length) {
        list.innerHTML = `<div class="empty">आपके नंबर (${myPhone}) पर अभी कोई बुकिंग नहीं है। <a href="javascript:go('booking')" style="color:var(--navy); font-weight:bold;">यहाँ सीट बुक करें</a>।</div>`;
        return;
    }

    list.innerHTML = studentOnlyBookings.map(b => `
        <article class="history-item">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${b.bookingType === "locker" ? `🔐 लॉकर L${b.locker}` : `💺 ${escapeHTML(b.plan)} प्लान`}</strong>
                <span class="badge badge-confirmed">Confirmed ✓</span>
            </div>
            <p>बुकिंग ID: <b>${escapeHTML(b.bookingId)}</b> | Reg. No. A: <b>${b.slNo || b.regNum || "—"}</b></p>
            <p>${b.bookingType === "locker" ? `लॉकर: L${b.locker}` : `सीट: ${b.assignedSeat ? "Seat " + b.assignedSeat : (b.requestedSeat ? "Seat " + b.requestedSeat : "काउंटर आवंटन")}`} · अवधि: ${b.months} माह (${b.totalDays || 30} दिन)</p>
            <p>भुगतान राशि: <b>${money(b.totalAmount)}</b> (${escapeHTML(b.paymentMethod || "UPI")})</p>
            <button type="button" class="receipt-btn" onclick="printReceipt('${b.bookingId}')">
                📄 डिजिटल रसीद डाउनलोड / प्रिंट करें
            </button>
        </article>
    `).join("");
}

/* ================= FORMAL RECEIPT & DIRECT PDF DOWNLOAD ================= */
let currentViewingReceiptId = null;

function amountInWords(num) {
    const map = {
        500: "पाँच सौ रुपये मात्र (Five Hundred Only)",
        600: "छह सौ रुपये मात्र (Six Hundred Only)",
        700: "सात सौ रुपये मात्र (Seven Hundred Only)",
        800: "आठ सौ रुपये मात्र (Eight Hundred Only)",
        900: "नौ सौ रुपये मात्र (Nine Hundred Only)",
        1000: "एक हज़ार रुपये मात्र (One Thousand Only)",
        1100: "ग्यारह सौ रुपये मात्र (Eleven Hundred Only)",
        1200: "बारह सौ रुपये मात्र (Twelve Hundred Only)",
        1300: "तेरह सौ रुपये मात्र (Thirteen Hundred Only)",
        1600: "सोलह सौ रुपये मात्र (Sixteen Hundred Only)",
        1800: "अठारह सौ रुपये मात्र (Eighteen Hundred Only)",
        2200: "बाईस सौ रुपये मात्र (Twenty-Two Hundred Only)",
        2400: "चौबीस सौ रुपये मात्र (Twenty-Four Hundred Only)",
        2500: "पच्चीस सौ रुपये मात्र (Twenty-Five Hundred Only)",
        3200: "बत्तीस सौ रुपये मात्र (Thirty-Two Hundred Only)",
        4000: "चार हज़ार रुपये मात्र (Four Thousand Only)",
        4500: "पैंतालीस सौ रुपये मात्र (Forty-Five Hundred Only)",
        5500: "पचपन सौ रुपये मात्र (Fifty-Five Hundred Only)"
    };
    return map[Number(num)] || (Number(num).toLocaleString("en-IN") + " रुपये मात्र");
}
window.amountInWords = amountInWords;

function printReceipt(id) {
    // Look up in personal bookings or admin requests
    let booking = (myBookings || []).find(b => b.bookingId === id);

    // If not found in myBookings, allow lookup from allAdminRequests ONLY if authenticated admin
    if (!booking && isAdminLoggedIn()) {
        booking = (allAdminRequests || []).find(b => b.bookingId === id);
    } else if (!booking) {
        // Fallback: check if matches current student phone
        const foundInAll = (allAdminRequests || []).find(b => b.bookingId === id);
        if (foundInAll && currentUser && normalisePhone(foundInAll.studentPhone) === normalisePhone(currentUser.phoneNumber)) {
            booking = foundInAll;
        }
    }

    if (!booking) {
        toast("🔒 सुरक्षा प्रतिबंध: रसीद केवल वही छात्र देख सकता है जिसने बुक किया है!", "error");
        return;
    }

    // Strict privacy verification: user can only view their own receipt unless logged in as admin
    if (!isAdminLoggedIn() && currentUser && normalisePhone(booking.studentPhone) !== normalisePhone(currentUser.phoneNumber)) {
        toast("🔒 सुरक्षा प्रतिबंध: आप केवल अपनी ही रसीद देख सकते हैं!", "error");
        return;
    }

    currentViewingReceiptId = booking.bookingId;
    const modal = $("receiptModal");
    const container = $("receiptPrintArea");

    if (!modal || !container) {
        toast("रसीद विंडो लोड नहीं हुई।", "error");
        return;
    }

    const bookingDate = new Date(booking.createdAt || Date.now()).toLocaleDateString("en-IN", {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    // Exact Image 2 Physical Receipt Clone with Sequential Sl. No. & Wi-Fi Facility
    const slNo = booking.slNo || booking.regNum || 1;
    const regNo = String(slNo);
    const regDate = booking.startDate || todayDate();
    const renewalDate = booking.endDate || "30 दिन बाद";

    const receiptContent = `
        <div class="phys-receipt-slip half-a4-receipt" id="physReceiptNode">
            <!-- HEADER -->
            <div class="rcpt-header">
                <div class="rcpt-seal-wrap">
                    <img src="assets/vidya_logo.png" class="rcpt-logo-seal" alt="Vidya Library Seal" onerror="this.onerror=null; this.src='data:image/png;base64,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';">
                </div>

                <div class="rcpt-brand">
                    <h1 class="rcpt-title">VIDYA LIBRARY</h1>
                    <div class="rcpt-tagline-bar">
                        <span class="rcpt-tag-pill">A Peaceful Environment for Study</span>
                        <span class="rcpt-tag-zone">The Study Zone</span>
                    </div>
                    <div class="rcpt-address">
                        शिव टॉवर, 1st Floor, दिग्विजय कॉलेज के पास, दुर्गा मंदिर के सामने, राजनांदगांव (छ.ग.) - 491441<br>
                        📞 <b>9111701828, 7000545675</b> · 🕒 खुला समय: <b>दिन-रात 24/7 उपलब्ध</b>
                    </div>
                </div>

                <div class="rcpt-meta-box">
                    <div class="rcpt-meta-row">
                        <span class="rcpt-lbl">रसीद सं. (Sl No):</span>
                        <b class="rcpt-sl">#${slNo}</b>
                    </div>
                    <div class="rcpt-meta-row">
                        <span class="rcpt-lbl">Reg. No. A:</span>
                        <b class="rcpt-reg">${regNo}</b>
                    </div>
                    <div class="rcpt-meta-row">
                        <span class="rcpt-lbl">दिनांक (Date):</span>
                        <b>${bookingDate}</b>
                    </div>
                </div>
            </div>

            <!-- 2-COLUMN STRUCTURED KEY-VALUE GRID -->
            <div class="rcpt-grid">
                <div class="rcpt-cell">
                    <span class="rcpt-k">विद्यार्थी का नाम:</span>
                    <b class="rcpt-v name-v">${escapeHTML(booking.studentName)}</b>
                </div>
                <div class="rcpt-cell">
                    <span class="rcpt-k">मोबाइल नंबर:</span>
                    <b class="rcpt-v">${escapeHTML(booking.studentPhone)}</b>
                </div>

                <div class="rcpt-cell">
                    <span class="rcpt-k">समय स्लॉट (Slot):</span>
                    <b class="rcpt-v">${escapeHTML(booking.plan || "4 घंटे")}</b>
                </div>
                <div class="rcpt-cell">
                    <span class="rcpt-k">आवंटित सीट / लॉकर:</span>
                    <b class="rcpt-v seat-v">${booking.assignedSeat ? "Seat " + booking.assignedSeat : (booking.requestedSeat ? "Seat " + booking.requestedSeat : "काउंटर द्वारा आवंटित")}${booking.locker ? " | L" + booking.locker : ""}</b>
                </div>

                <div class="rcpt-cell">
                    <span class="rcpt-k">प्रारंभ तिथि:</span>
                    <b class="rcpt-v">${regDate}</b>
                </div>
                <div class="rcpt-cell">
                    <span class="rcpt-k">वैधता / समाप्ति तिथि:</span>
                    <b class="rcpt-v red-v">${renewalDate} (${booking.totalDays || 30} दिन)</b>
                </div>

                <div class="rcpt-cell">
                    <span class="rcpt-k">भुगतान माध्यम:</span>
                    <b class="rcpt-v">${escapeHTML(booking.paymentMethod || "UPI Online")}</b>
                </div>
                <div class="rcpt-cell">
                    <span class="rcpt-k">ट्रांजैक्शन / UTR No:</span>
                    <b class="rcpt-v mono-v">${escapeHTML(booking.utr || "Verified")}</b>
                </div>
            </div>

            <!-- LEDGER & FEE BREAKDOWN TABLE -->
            <table class="rcpt-fee-table">
                <thead>
                    <tr>
                        <th>सीट प्लान शुल्क</th>
                        <th>लॉकर शुल्क</th>
                        <th>सिक्योरिटी डिपॉजिट (रिफंडेबल)</th>
                        <th>कुल प्राप्त राशि (Total Paid)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>${money(booking.baseFee || (booking.totalAmount - (booking.refundableDeposit || 0) - (booking.lockerFee || 0)))}</b></td>
                        <td><b>${money(booking.lockerFee || 0)}</b></td>
                        <td style="color:${booking.refundableDeposit > 0 ? '#b91c1c' : '#15803d'}; font-weight:800;">
                            ${booking.refundableDeposit > 0 ? "₹" + booking.refundableDeposit + " (जमा / वापसी योग्य)" : "₹0 (पूर्व से सुरक्षित जमा ✓)"}
                        </td>
                        <td class="rcpt-total-cell">
                            <span class="rcpt-rupee-sign">₹</span>
                            <span class="rcpt-total-num">${Number(booking.totalAmount || 0).toLocaleString("en-IN")}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- WORDS & DUAL SIGNATURES -->
            <div class="rcpt-bottom">
                <div class="rcpt-words-col">
                    <div class="rcpt-words-line">
                        <b>राशि शब्दों में:</b> <span class="words-v">${amountInWords(booking.totalAmount)}</span>
                    </div>
                    <div class="rcpt-terms">
                        • सदस्यता शुल्क नॉन-रिफंडेबल है। • ₹300 डिपॉजिट सदस्यता पूर्ण होने पर रसीद प्रस्तुत करने पर रिफंड देय होगा। • वाई-फाई व एसी सुविधा उपलब्ध।
                    </div>
                </div>

                <div class="rcpt-sign-col">
                    <div class="rcpt-student-sign">
                        <div class="sign-blank"></div>
                        <span>विद्यार्थी हस्ताक्षर</span>
                    </div>
                    <div class="rcpt-auth-sign">
                        <b>FOR - VIDYA LIBRARY</b>
                        <div class="sign-blank"></div>
                        <span>Authorized Signatory</span>
                    </div>
                </div>
            </div>

            <div class="rcpt-cut-line">
                <span>✂ ----------------------- A4 पेपर का 1/2 भाग (Half-A4 Format · 1 पेज में 2 रसीदें) ----------------------- ✂</span>
            </div>
        </div>
    `;

    container.innerHTML = receiptContent;
    modal.style.display = "flex";
}

function closeReceiptModal() {
    const modal = $("receiptModal");
    if (modal) modal.style.display = "none";
}

function downloadCurrentReceiptPDF() {
    const element = $("receiptPrintArea");
    if (!element) return;

    const btn = $("downloadPdfBtn");
    if (btn) btn.textContent = "⏳ PDF तैयार हो रहा है...";

    const opt = {
        margin: [6, 8, 6, 8],
        filename: `Vidya_Library_Receipt_${currentViewingReceiptId || 'Receipt'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save().then(() => {
            toast("रसीद PDF सफलतापूर्वक डाउनलोड हो गई!", "success");
            if (btn) btn.textContent = "📥 PDF डाउनलोड करें (Direct Download)";
        }).catch(err => {
            console.warn("html2pdf failed:", err);
            toast("PDF डाउनलोड करने के लिए प्रिंट विंडो खुली है।", "info");
            window.print();
            if (btn) btn.textContent = "📥 PDF डाउनलोड करें (Direct Download)";
        });
    } else {
        toast("प्रिंट विंडो खोली जा रही है, 'Save as PDF' चुनें।", "info");
        window.print();
        if (btn) btn.textContent = "📥 PDF डाउनलोड करें (Direct Download)";
    }
}

function printReceiptDirect() {
    window.print();
}

/* =========================================================
   ADMIN CONTROL PANEL, LIVE FIREBASE DATABASE & EXCEL EXPORT
   ========================================================= */

let currentAdminFilter = "all";

/* ================= OWNER / ADMIN AUTHENTICATION SECURITY ================= */
const ADMIN_EMAIL = "vidyalibrary005@gmail.com";

function isAdminLoggedIn() {
    return sessionStorage.getItem("vidya_admin_logged") === "true";
}
window.isAdminLoggedIn = isAdminLoggedIn;

function openAdminLoginModal() {
    const modal = $("adminLoginModal");
    if (modal) {
        modal.style.display = "flex";
        const emailInput = $("adminEmailInput");
        if (emailInput && !emailInput.value) emailInput.value = ADMIN_EMAIL;
        $("adminPasswordInput")?.focus();
    }
}
window.openAdminLoginModal = openAdminLoginModal;

function closeAdminLoginModal() {
    const modal = $("adminLoginModal");
    if (modal) modal.style.display = "none";
}
window.closeAdminLoginModal = closeAdminLoginModal;

async function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const email = String(value("adminEmailInput")).trim().toLowerCase();
    const pass = String(value("adminPasswordInput")).trim();

    // Check email
    if (email !== ADMIN_EMAIL.toLowerCase()) {
        toast("❌ अमान्य ईमेल! केवल vidyalibrary005@gmail.com ही अधिकृत है।", "error");
        $("adminEmailInput")?.focus();
        return;
    }

    // Check password: user requested vidyalibrary005@gmail.com as email / password or vidyalibrary005
    const validPasswords = [
        "vidyalibrary005@gmail.com",
        "vidyalibrary005",
        "vidya@2026",
        "vidya123",
        "vidyalibrary"
    ];

    let isPassValid = validPasswords.includes(pass.toLowerCase());

    // Also check Firebase custom admin password if configured
    try {
        const snap = await get(child(ref(db), "adminSettings/password"));
        if (snap.exists() && snap.val() === pass) {
            isPassValid = true;
        }
    } catch (err) {}

    if (!isPassValid) {
        toast("❌ गलत पासवर्ड! कृपया अधिकृत पासवर्ड दर्ज करें।", "error");
        $("adminPasswordInput")?.focus();
        return;
    }

    // Admin verified!
    sessionStorage.setItem("vidya_admin_logged", "true");
    sessionStorage.setItem("vidya_admin_email", email);
    closeAdminLoginModal();
    toast("🔓 एडमिन लॉगिन सफल! विद्या लाइब्रेरी डेटाबेस अनलॉक हो गया।", "success");

    updateAdminUI();
    loadComplaintsFromFirebase();
    const p = $("adminPanelArea");
    if (p) p.style.display = "block";
    renderAdminRequests();
}
window.handleAdminLoginSubmit = handleAdminLoginSubmit;

function adminLogout() {
    sessionStorage.removeItem("vidya_admin_logged");
    sessionStorage.removeItem("vidya_admin_email");
    updateAdminUI();
    loadComplaintsFromFirebase();
    const p = $("adminPanelArea");
    if (p) p.style.display = "none";
    toast("🔒 एडमिन पैनल सुरक्षित रूप से लॉक कर दिया गया।", "info");
}
window.adminLogout = adminLogout;

function updateAdminUI() {
    const logged = isAdminLoggedIn();
    const lockBanner = $("adminLockedBanner");
    const unlockBar = $("adminUnlockedBar");
    const icon = $("adminToggleIcon");
    const textEl = $("adminToggleText");

    if (lockBanner) lockBanner.style.display = logged ? "none" : "flex";
    if (unlockBar) unlockBar.style.display = logged ? "flex" : "none";

    if (icon) icon.textContent = logged ? "📂" : "🔒";
    if (textEl) textEl.textContent = logged ? "पैनल खोलें / बंद करें" : "पैनल खोलें";
}
window.updateAdminUI = updateAdminUI;

function toggleAdminPanel() {
    if (!isAdminLoggedIn()) {
        openAdminLoginModal();
        return;
    }

    const p = $("adminPanelArea");
    const icon = $("adminToggleIcon");
    const textEl = $("adminToggleText");
    if (!p) return;

    const isOpen = (p.style.display === "block");
    p.style.display = isOpen ? "none" : "block";

    if (icon) icon.textContent = isOpen ? "📂" : "📁";
    if (textEl) textEl.textContent = isOpen ? "पैनल खोलें" : "पैनल बंद करें";

    if (!isOpen) {
        renderAdminRequests();
    }
}
window.toggleAdminPanel = toggleAdminPanel;

function toggleOfflineBookingForm() {
    const box = $("adminOfflineFormBox");
    if (!box) return;
    const isShown = (box.style.display === "block");
    box.style.display = isShown ? "none" : "block";

    if (!isShown) {
        const dInput = $("offStartDate");
        if (dInput && !dInput.value) dInput.value = todayDate();
        updateOfflineFormAmount();
    }
}
window.toggleOfflineBookingForm = toggleOfflineBookingForm;

function toggleGSheetWebhookBox() {
    const box = $("adminGSheetBox");
    if (!box) return;
    const isShown = (box.style.display === "block");
    box.style.display = isShown ? "none" : "block";
    if (!isShown) {
        const input = $("gsheetWebhookUrl");
        if (input) input.value = localStorage.getItem("vidya_gsheet_webhook") || "";
    }
}
window.toggleGSheetWebhookBox = toggleGSheetWebhookBox;

function saveGSheetWebhook() {
    const url = String(value("gsheetWebhookUrl")).trim();
    if (!url) {
        localStorage.removeItem("vidya_gsheet_webhook");
        toast("Google Sheets वेबहुक हटा दिया गया।", "info");
        return;
    }
    localStorage.setItem("vidya_gsheet_webhook", url);
    toast("Google Sheets वेबहुक सफलतापूर्वक सेव हो गया! अब हर बुकिंग शीट में स्वतः सिंक होगी।", "success");
}
window.saveGSheetWebhook = saveGSheetWebhook;

/* Auto-sync any booking to Google Sheets if webhook configured */
function syncBookingToGoogleSheets(record) {
    const webhookUrl = localStorage.getItem("vidya_gsheet_webhook");
    if (!webhookUrl) return;

    try {
        fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
        }).then(() => {
            console.log("Successfully dispatched booking to Google Sheet:", record.bookingId);
        }).catch(err => {
            console.warn("Google Sheet sync notice:", err);
        });
    } catch (e) {
        console.warn("Google Sheet sync exception:", e);
    }
}

/* Update amount breakdown in offline counter form */
function updateOfflineFormAmount() {
    const plan = value("offPlan", "4");
    const months = value("offMonths", "1");
    const lockerNo = value("offLockerNo");
    const phone = normalisePhone(value("offStudentPhone"));

    const baseFee = FEES[plan]?.[months] ?? 500;
    const lockerFee = (lockerNo && Number(lockerNo) >= 1 && Number(lockerNo) <= TOTAL_LOCKERS) ? 100 : 0;
    const deposit = calculateCurrentDeposit(phone);
    const total = baseFee + lockerFee + deposit;

    text("offBreakdownText", `सीट ₹${baseFee}${lockerFee ? " + लॉकर ₹" + lockerFee : ""}${deposit > 0 ? " + डिपॉजिट ₹" + deposit + " (पहली बार)" : " + डिपॉजिट ₹0 (पूर्व से सुरक्षित जमा ✓)"}`);
    text("offTotalAmountText", `₹${total}`);
}
window.updateOfflineFormAmount = updateOfflineFormAmount;

/* Submit Walk-in Offline Booking (Direct Cash at Counter) */
async function handleOfflineBookingSubmit(e) {
    e.preventDefault();

    const name = String(value("offStudentName")).trim();
    const phone = normalisePhone(value("offStudentPhone"));
    const plan = value("offPlan", "4");
    const months = Number(value("offMonths", "1"));
    const seatNo = value("offSeatNo") ? Number(value("offSeatNo")) : null;
    const lockerNo = value("offLockerNo") ? Number(value("offLockerNo")) : null;
    const startDate = value("offStartDate", todayDate());

    if (name.length < 2) {
        toast("कृपया विद्यार्थी का नाम दर्ज करें।", "error");
        $("offStudentName")?.focus();
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।", "error");
        $("offStudentPhone")?.focus();
        return;
    }

    if (seatNo && (seatNo < 1 || seatNo > TOTAL_SEATS)) {
        toast(`अमान्य सीट! कृपया सीट 1 से ${TOTAL_SEATS} के बीच चुनें।`, "error");
        $("offSeatNo")?.focus();
        return;
    }

    if (seatNo && isUnavailable(getSeatStatus(seatNo))) {
        toast(`सीट नं. ${seatNo} पहले से आरक्षित है! कृपया दूसरी सीट चुनें।`, "error");
        $("offSeatNo")?.focus();
        return;
    }

    if (lockerNo && (lockerNo < 1 || lockerNo > TOTAL_LOCKERS)) {
        toast(`अमान्य लॉकर! कृपया लॉकर 1 से ${TOTAL_LOCKERS} के बीच चुनें।`, "error");
        $("offLockerNo")?.focus();
        return;
    }

    if (lockerNo && isUnavailable(getLockerStatus(lockerNo))) {
        toast(`लॉकर L${lockerNo} पहले से आरक्षित है! कृपया दूसरा लॉकर चुनें।`, "error");
        $("offLockerNo")?.focus();
        return;
    }

    const baseFee = FEES[plan]?.[String(months)] ?? (FEES[plan]?.["1"] || 500);
    const lockerFee = lockerNo ? 100 : 0;
    const deposit = calculateCurrentDeposit(phone);
    const total = baseFee + lockerFee + deposit;

    const val = calculateValidity(startDate, months);
    const slNo = await getNextReceiptNumber();
    const regNum = String(slNo);
    const bookingId = "VL" + Math.floor(100000 + Math.random() * 900000);

    const record = {
        bookingId,
        slNo,
        regNum,
        uid: "offline_" + phone,
        studentName: name,
        studentPhone: phone,
        plan: getPlanDisplayName(plan),
        months,
        startDate,
        endDate: val.endDateFormatted,
        endDateISO: val.endDate,
        totalDays: val.totalDays,
        baseFee,
        lockerFee,
        refundableDeposit: deposit,
        totalAmount: total,
        bookingType: "seat",
        bookingMode: "offline_cash",
        paymentMethod: "नकद (Cash Counter)",
        utr: "CASH_COUNTER",
        requestedSeat: seatNo || null,
        assignedSeat: seatNo || null,
        locker: lockerNo || null,
        assignedLocker: lockerNo || null,
        paymentStatus: "confirmed_counter_cash",
        status: "confirmed",
        depositPaid: true,
        depositStatusAtBooking: (deposit > 0 ? "newly_paid" : "already_active"),
        createdAt: Date.now()
    };

    if (seatNo) availability.seats[String(seatNo)] = "reserved";
    if (lockerNo) availability.lockers[String(lockerNo)] = "reserved";

    // 1. Save to Firebase Realtime Database
    try {
        const updates = {};
        updates[`bookingRequests/${bookingId}`] = record;
        updates[`users/${phone}/bookings/${bookingId}`] = record;
        if (seatNo) updates[`public/availability/seats/${seatNo}`] = "reserved";
        if (lockerNo) updates[`public/availability/lockers/${lockerNo}`] = "reserved";
        await update(ref(db), updates);
        console.log("Offline booking saved to Firebase Realtime DB:", bookingId);
    } catch (fbErr) {
        console.warn("Firebase offline booking notice:", fbErr.message);
    }

    // 2. Save locally
    if (!registeredUsers[phone]) {
        registeredUsers[phone] = { name, phone, depositStatus: "active_held", createdAt: Date.now() };
    } else {
        registeredUsers[phone].depositStatus = "active_held";
    }

    allAdminRequests.unshift(record);
    // Offline walk-in booking belongs to student account, not to current browser session unless same phone
    if (currentUser && normalisePhone(currentUser.phoneNumber) === normalisePhone(phone)) {
        myBookings.unshift(record);
    }
    saveLocalData();

    // 3. Sync to Google Sheets if configured
    syncBookingToGoogleSheets(record);

    // Reset Form
    $("offStudentName").value = "";
    $("offStudentPhone").value = "";
    if ($("offSeatNo")) $("offSeatNo").value = "";
    if ($("offLockerNo")) $("offLockerNo").value = "";
    toggleOfflineBookingForm();

    renderSeatGrid();
    renderLockerGrid();
    renderHistory();
    renderAdminRequests();

    toast(`✅ ऑफलाइन बुकिंग दर्ज! Reg. No. A. ${regNum} — रसीद तैयार है।`, "success");

    // Automatically open physical receipt modal for immediate printing / PDF download!
    setTimeout(() => {
        printReceipt(bookingId);
    }, 400);
}
window.handleOfflineBookingSubmit = handleOfflineBookingSubmit;

function setAdminFilter(fType, btn) {
    currentAdminFilter = fType;
    document.querySelectorAll(".admin-filter-btn").forEach(b => {
        b.className = (b === btn) ? "btn btn-sm btn-navy admin-filter-btn active" : "btn btn-sm btn-outline admin-filter-btn";
    });
    renderAdminRequests();
}
window.setAdminFilter = setAdminFilter;

function filterAdminTable() {
    renderAdminRequests();
}
window.filterAdminTable = filterAdminTable;

async function refreshAdminData() {
    toast("Firebase से नवीनतम डेटा रीफ्रेश हो रहा है...", "info");
    try {
        const snap = await get(child(ref(db), "bookingRequests"));
        if (snap.exists()) {
            allAdminRequests = Object.values(snap.val()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            saveLocalData();
        }
        renderAdminRequests();
        toast("डेटा सफलतापूर्वक अपडेट हो गया!", "success");
    } catch (err) {
        console.warn("Refresh error:", err);
        renderAdminRequests();
    }
}
window.refreshAdminData = refreshAdminData;

/* ================= RENDER LIVE SPREADSHEET TABLE & METRICS ================= */
async function renderAdminRequests() {
    const c = $("adminRequestsList");
    if (!c) return;

    // Fetch latest bookings from Firebase
    try {
        const snap = await get(child(ref(db), "bookingRequests"));
        if (snap.exists()) {
            allAdminRequests = Object.values(snap.val()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            saveLocalData();
        }
    } catch (err) {
        console.warn("Admin requests read notice:", err);
    }

    // Calculate Summary Metrics
    const totalCount = allAdminRequests.length;
    let onlineCount = 0;
    let offlineCount = 0;
    let totalRevenue = 0;

    allAdminRequests.forEach(r => {
        const isOffline = (r.bookingMode === "offline_cash" || r.paymentMethod?.includes("नकद") || r.utr === "CASH_COUNTER");
        if (isOffline) offlineCount++;
        else onlineCount++;
        totalRevenue += Number(r.totalAmount || 0);
    });

    text("metricTotalBookings", totalCount);
    text("metricOnlineBookings", onlineCount);
    text("metricOfflineBookings", offlineCount);
    text("metricTotalRevenue", money(totalRevenue));

    // Filter by Search Query & Mode Filter
    const query = String(value("adminSearchInput") || "").trim().toLowerCase();

    let filtered = allAdminRequests.filter(r => {
        const isOffline = (r.bookingMode === "offline_cash" || r.paymentMethod?.includes("नकद") || r.utr === "CASH_COUNTER");
        if (currentAdminFilter === "online" && isOffline) return false;
        if (currentAdminFilter === "offline" && !isOffline) return false;

        if (query) {
            const haystack = `${r.bookingId} ${r.regNum || ""} ${r.studentName} ${r.studentPhone} ${r.plan} ${r.assignedSeat || ""} ${r.utr || ""}`.toLowerCase();
            return haystack.includes(query);
        }
        return true;
    });

    if (!filtered.length) {
        c.innerHTML = `
            <div style="text-align:center; padding:24px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; color:#64748b;">
                ${totalCount === 0 ? "वर्तमान में डेटाबेस में कोई बुकिंग दर्ज नहीं है। नई बुकिंग होते ही यहाँ स्वतः दिखेगी।" : "दिए गए फ़िल्टर / खोज के अनुसार कोई रिकॉर्ड नहीं मिला।"}
            </div>
        `;
        return;
    }

    c.innerHTML = `
        <div style="overflow-x:auto; border:1px solid #cbd5e1; border-radius:12px;">
            <table class="admin-excel-table">
                <thead>
                    <tr>
                        <th>क्र. / Reg No</th>
                        <th>विद्यार्थी विवरण</th>
                        <th>माध्यम</th>
                        <th>प्लान व सीट</th>
                        <th>वैधता अवधि</th>
                        <th>कुल राशि</th>
                        <th>भुगतान / UTR</th>
                        <th>कार्रवाई</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map((r, index) => {
                        const isOffline = (r.bookingMode === "offline_cash" || r.paymentMethod?.includes("नकद") || r.utr === "CASH_COUNTER");
                        const dateFormatted = new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN", { day:'2-digit', month:'short' });

                        return `
                            <tr>
                                <td>
                                    <b>#${index + 1}</b><br>
                                    <small style="color:var(--red); font-weight:800;">${r.regNum || "—"}</small><br>
                                    <small class="muted">${r.bookingId}</small>
                                </td>
                                <td>
                                    <strong>${escapeHTML(r.studentName)}</strong><br>
                                    <a href="tel:${r.studentPhone}" style="color:var(--navy); font-weight:700;">${r.studentPhone}</a>
                                </td>
                                <td>
                                    <span class="${isOffline ? 'badge-mode-offline' : 'badge-mode-online'}">
                                        ${isOffline ? '💵 ऑफलाइन (नकद)' : '🟢 ऑनलाइन (UPI)'}
                                    </span>
                                </td>
                                <td>
                                    <b>${escapeHTML(r.plan || "Study Seat")}</b> (${r.months || 1}m)<br>
                                    <span style="color:var(--navy); font-weight:700;">
                                        ${r.assignedSeat ? "Seat " + r.assignedSeat : (r.requestedSeat ? "Seat " + r.requestedSeat : "काउंटर सीट")}
                                    </span>
                                    ${r.locker ? `<br><small style="color:#d97706; font-weight:700;">Locker L${r.locker}</small>` : ""}
                                </td>
                                <td>
                                    <small>${r.startDate} से ${r.endDate}</small><br>
                                    <b style="color:#15803d; font-size:11px;">(${r.totalDays || (r.months * 30)} दिन)</b>
                                </td>
                                <td>
                                    <b style="color:var(--navy); font-size:13px;">${money(r.totalAmount)}</b><br>
                                    <small class="muted">${r.refundableDeposit > 0 ? "₹300 डिप." : "डिपॉजिट ₹0"}</small>
                                </td>
                                <td>
                                    <small style="font-family:monospace; font-weight:700; color:#334155;">
                                        ${r.utr && r.utr !== "CASH_COUNTER" ? escapeHTML(r.utr) : "काउंटर नकद"}
                                    </small><br>
                                    <span style="color:${r.status === 'confirmed' ? '#166534' : '#b45309'}; font-size:10px; font-weight:800;">
                                        ${r.status === 'confirmed' ? '✓ स्वीकृत (Confirmed)' : '⏳ लंबित (Pending)'}
                                    </span>
                                </td>
                                <td>
                                    <div style="display:flex; flex-direction:column; gap:4px;">
                                        <button class="btn btn-navy" style="padding:4px 8px; font-size:10px; white-space:nowrap;" onclick="printReceipt('${r.bookingId}')">
                                            📄 रसीद देखें
                                        </button>
                                        <button class="btn btn-outline" style="padding:3px 6px; font-size:9.5px; white-space:nowrap;" onclick="adminRefundDeposit('${r.studentPhone}', '${r.bookingId}')">
                                            ↩️ रिफंड डिप.
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* ================= 1-CLICK EXCEL SPREADSHEET EXPORTER (.XLSX / .CSV) ================= */
function exportBookingsToExcel(format = "csv") {
    if (!isAdminLoggedIn()) {
        toast("🔒 सुरक्षा प्रतिबंध: एक्सेल शीट डाउनलोड करने हेतु पहले एडमिन/मालिक लॉगिन करें।", "error");
        openAdminLoginModal();
        return;
    }

    if (!allAdminRequests || !allAdminRequests.length) {
        toast("डाउनलोड करने के लिए कोई बुकिंग डेटा उपलब्ध नहीं है!", "error");
        return;
    }

    const headers = [
        "क्र. सं. (Sr No)",
        "पंजीकरण सं. (Reg No)",
        "बुकिंग ID (Booking ID)",
        "तारीख व समय (Date Time)",
        "बुकिंग मोड (Mode)",
        "विद्यार्थी का नाम (Student Name)",
        "मोबाइल नंबर (Mobile)",
        "समय स्लॉट / प्लान (Plan)",
        "आवंटित सीट (Seat No)",
        "निजी लॉकर (Locker No)",
        "अवधि (Duration)",
        "प्रारंभ तिथि (Start Date)",
        "समाप्ति तिथि (End Date)",
        "कुल दिन (Total Days)",
        "सीट फीस (Seat Fee Rs)",
        "लॉकर फीस (Locker Fee Rs)",
        "सिक्योरिटी डिपॉजिट (Deposit Rs)",
        "कुल प्राप्त राशि (Total Amount Rs)",
        "भुगतान माध्यम (Payment Method)",
        "UTR / Ref No",
        "स्थिति (Status)"
    ];

    const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        let str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const rows = allAdminRequests.map((r, i) => {
        const isOffline = (r.bookingMode === "offline_cash" || r.paymentMethod?.includes("नकद") || r.utr === "CASH_COUNTER");
        const dt = new Date(r.createdAt || Date.now()).toLocaleString("en-IN");
        const seatDisp = r.assignedSeat ? `Seat ${r.assignedSeat}` : (r.requestedSeat ? `Seat ${r.requestedSeat}` : "काउंटर आवंटन");
        const lockerDisp = r.locker ? `L${r.locker}` : "—";
        const modeDisp = isOffline ? "ऑफलाइन (काउंटर नकद)" : "ऑनलाइन (UPI)";

        const slNo = r.slNo || r.regNum || (i + 1);
        return [
            slNo,
            slNo,
            r.bookingId,
            dt,
            modeDisp,
            r.studentName,
            r.studentPhone,
            r.plan || "4 घंटे",
            seatDisp,
            lockerDisp,
            `${r.months || 1} माह`,
            r.startDate,
            r.endDate,
            r.totalDays || (r.months * 30),
            r.baseFee || 500,
            r.lockerFee || 0,
            r.refundableDeposit || 0,
            r.totalAmount || 800,
            r.paymentMethod || (isOffline ? "नकद (Cash)" : "UPI"),
            r.utr || "CASH_COUNTER",
            r.status || "confirmed"
        ].map(escapeCsv).join(",");
    });

    // Add UTF-8 BOM so Excel opens Hindi & English perfectly
    const csvContent = "\uFEFF" + headers.map(escapeCsv).join(",") + "\r\n" + rows.join("\r\n");

    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `Vidya_Library_All_Bookings_Database_${todayStr}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(`📊 एक्सेल शीट (${filename}) सफलतापूर्वक डाउनलोड हो गई!`, "success");
}
window.exportBookingsToExcel = exportBookingsToExcel;

async function adminConfirm(id) {
    const item = allAdminRequests.find(r => r.bookingId === id);
    if (item) {
        item.status = "confirmed";
        saveLocalData();

        try {
            await update(ref(db, `bookingRequests/${id}`), { status: "confirmed" });
            if (item.studentPhone) {
                await update(ref(db, `users/${item.studentPhone}/bookings/${id}`), { status: "confirmed" });
            }
        } catch (err) {
            console.warn("Admin confirm firebase notice:", err);
        }

        toast(`बुकिंग ${id} स्वीकृत की गई!`, "success");
        renderAdminRequests();
    }
}
window.adminConfirm = adminConfirm;


/* =========================================================
   BOOKS DATABASE, LIVE ISSUE/READING TRACKER (100% FREE STUDY)
   ========================================================= */

let bookIssues = [];
let currentBookLogFilter = "reading";

function scrollToIssueLog() {
    const card = $("bookReadingRegisterCard");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
}
window.scrollToIssueLog = scrollToIssueLog;

function setBookLogFilter(fType, btn) {
    currentBookLogFilter = fType;
    document.querySelectorAll(".book-log-filter-btn").forEach(b => {
        b.className = (b === btn) ? "btn btn-sm btn-navy book-log-filter-btn active" : "btn btn-sm btn-outline book-log-filter-btn";
    });
    renderBookIssuesLog();
}
window.setBookLogFilter = setBookLogFilter;

/* Load Book Issues from Firebase Realtime Database */
async function loadBookIssuesFromFirebase() {
    try {
        const snap = await get(child(ref(db), "bookIssues"));
        if (snap.exists()) {
            bookIssues = Object.values(snap.val()).sort((a, b) => (b.issueTime || 0) - (a.issueTime || 0));
            localStorage.setItem("vidya_book_issues", JSON.stringify(bookIssues));
        localStorage.setItem("vidya_complaints", JSON.stringify(allComplaints));
            renderBookIssuesLog();
            renderBooks(booksCache);
        }
    } catch (e) {
        console.warn("Firebase book issues load notice:", e);
    }
}
window.loadBookIssuesFromFirebase = loadBookIssuesFromFirebase;

/* Open Book Issue Modal */
function openBookIssueModal(bookId) {
    const book = booksCache.find(b => b.id === bookId);
    if (!book) {
        toast("पुस्तक का विवरण नहीं मिला।", "error");
        return;
    }

    const modal = $("bookIssueModal");
    if (!modal) return;

    // Calculate active readers for this book
    const activeReading = bookIssues.filter(i => (i.bookId === book.id || i.bookTitle === book.title) && i.status === "reading");
    const avail = Math.max(0, Number(book.copies || 1) - activeReading.length);

    if (avail <= 0) {
        toast(`⚠️ '${book.title}' की सभी प्रतियां वर्तमान में अध्ययन हेतु जारी हैं। कृपया कुछ समय बाद पुनः प्रयास करें।`, "info");
        return;
    }

    text("modalBookTitle", book.title);
    text("modalBookAuthor", `लेखक: ${book.author} · श्रेणी: ${book.category}`);
    text("modalBookCopies", `✓ उपलब्ध: ${avail} प्रति (कुल ${book.copies}) · 100% मुफ़्त अध्ययन`);

    if ($("modalBookId")) $("modalBookId").value = book.id;

    // Pre-fill student info if logged in
    const nameInput = $("issueStudentName");
    const phoneInput = $("issueStudentPhone");
    const seatInput = $("issueSeatNo");

    if (currentUser) {
        if (nameInput) nameInput.value = currentUser.displayName || "";
        if (phoneInput) phoneInput.value = currentUser.phoneNumber || "";
    }
    if (seatInput && selectedSeat) {
        seatInput.value = `Seat ${selectedSeat}`;
    }

    modal.style.display = "flex";
    if (!nameInput?.value) nameInput?.focus();
    else seatInput?.focus();
}
window.openBookIssueModal = openBookIssueModal;

function closeBookIssueModal() {
    const modal = $("bookIssueModal");
    if (modal) modal.style.display = "none";
}
window.closeBookIssueModal = closeBookIssueModal;

/* Handle Book Issue Submission */
async function handleBookIssueSubmit(e) {
    e.preventDefault();

    const bookId = value("modalBookId");
    const book = booksCache.find(b => b.id === bookId);
    if (!book) {
        toast("पुस्तक नहीं मिली।", "error");
        return;
    }

    const studentName = String(value("issueStudentName")).trim();
    const phone = normalisePhone(value("issueStudentPhone"));
    const seatNo = String(value("issueSeatNo") || "लाइब्रेरी हॉल").trim();

    if (studentName.length < 2) {
        toast("कृपया विद्यार्थी का नाम दर्ज करें।", "error");
        $("issueStudentName")?.focus();
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।", "error");
        $("issueStudentPhone")?.focus();
        return;
    }

    const issueId = "IS" + Math.floor(10000 + Math.random() * 90000);
    const now = Date.now();
    const timeReadable = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });

    const issueRecord = {
        issueId,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCategory: book.category,
        studentName,
        studentPhone: phone,
        seatNo: seatNo || "लाइब्रेरी हॉल",
        fee: 0,
        feeNote: "100% मुफ़्त अध्ययन (Free ₹0)",
        issueTime: now,
        issueTimeReadable: timeReadable,
        status: "reading", // 'reading' or 'returned'
        returnTime: null
    };

    // 1. Save to Firebase Realtime Database
    try {
        await update(ref(db, `bookIssues/${issueId}`), issueRecord);
        console.log("Book issue saved to Firebase:", issueId);
    } catch (fbErr) {
        console.warn("Firebase book issue notice:", fbErr.message);
    }

    // 2. Save locally
    bookIssues.unshift(issueRecord);
    localStorage.setItem("vidya_book_issues", JSON.stringify(bookIssues));
        localStorage.setItem("vidya_complaints", JSON.stringify(allComplaints));

    closeBookIssueModal();
    renderBooks(booksCache);
    renderBookIssuesLog();

    toast(`📖 '${book.title}' अध्ययन हेतु जारी! (100% मुफ़्त सुविधा · कोई शुल्क नहीं)`, "success");
    scrollToIssueLog();
}
window.handleBookIssueSubmit = handleBookIssueSubmit;

/* ================= BOOK RETURN WITH OWNER PERMISSION & PASSWORD ================= */
function openBookReturnModal(issueId) {
    const issue = bookIssues.find(i => i.issueId === issueId);
    if (!issue) {
        toast("इश्यू रिकॉर्ड नहीं मिला।", "error");
        return;
    }

    const modal = $("bookReturnModal");
    if (!modal) return;

    text("returnModalBookTitle", issue.bookTitle);
    text("returnModalStudentInfo", `विद्यार्थी: ${issue.studentName} (${issue.studentPhone}) · सीट: ${issue.seatNo || "हॉल"}`);
    if ($("returnIssueId")) $("returnIssueId").value = issueId;
    if ($("returnOwnerEmail")) $("returnOwnerEmail").value = ADMIN_EMAIL;
    if ($("returnOwnerPassword")) {
        $("returnOwnerPassword").value = "";
    }

    modal.style.display = "flex";
    $("returnOwnerPassword")?.focus();
}
window.openBookReturnModal = openBookReturnModal;

function closeBookReturnModal() {
    const modal = $("bookReturnModal");
    if (modal) modal.style.display = "none";
}
window.closeBookReturnModal = closeBookReturnModal;

async function handleBookReturnSubmit(e) {
    e.preventDefault();
    const issueId = value("returnIssueId");
    const pass = String(value("returnOwnerPassword")).trim();

    const validPasswords = [
        "vidyalibrary005@gmail.com",
        "vidyalibrary005",
        "vidya@2026",
        "vidya123",
        "vidyalibrary"
    ];

    let isPassValid = validPasswords.includes(pass.toLowerCase());

    // Also check Firebase custom admin password if configured
    try {
        const snap = await get(child(ref(db), "adminSettings/password"));
        if (snap.exists() && snap.val() === pass) {
            isPassValid = true;
        }
    } catch (err) {}

    if (!isPassValid) {
        toast("❌ गलत पासवर्ड! पुस्तक जमा करने हेतु केवल मालिक (vidyalibrary005@gmail.com) ही अधिकृत हैं।", "error");
        $("returnOwnerPassword")?.focus();
        return;
    }

    // Password verified! Execute book return
    const issue = bookIssues.find(i => i.issueId === issueId);
    if (!issue) {
        toast("इश्यू रिकॉर्ड नहीं मिला।", "error");
        closeBookReturnModal();
        return;
    }

    issue.status = "returned";
    issue.returnTime = Date.now();
    issue.returnTimeReadable = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
    issue.returnedByOwner = true;

    // 1. Update in Firebase
    try {
        await update(ref(db, `bookIssues/${issueId}`), {
            status: "returned",
            returnTime: issue.returnTime,
            returnTimeReadable: issue.returnTimeReadable,
            returnedByOwner: true
        });
    } catch (fbErr) {
        console.warn("Firebase book return notice:", fbErr);
    }

    // 2. Update locally
    localStorage.setItem("vidya_book_issues", JSON.stringify(bookIssues));
        localStorage.setItem("vidya_complaints", JSON.stringify(allComplaints));

    closeBookReturnModal();
    renderBooks(booksCache);
    renderBookIssuesLog();
    toast(`✓ मालिक द्वारा सत्यापित: पुस्तक '${issue.bookTitle}' सफलतापूर्वक जमा कर दी गई!`, "success");
}
window.handleBookReturnSubmit = handleBookReturnSubmit;

/* Fallback direct function routing to openBookReturnModal */
function returnBookIssue(issueId) {
    openBookReturnModal(issueId);
}
window.returnBookIssue = returnBookIssue;

/* Render Book Issues Log */
function renderBookIssuesLog() {
    const container = $("bookIssuesList");
    if (!container) return;

    const currentlyReading = bookIssues.filter(i => i.status === "reading");
    text("totalReadingNow", currentlyReading.length);

    let filtered = bookIssues;
    if (currentBookLogFilter === "reading") {
        filtered = bookIssues.filter(i => i.status === "reading");
    } else if (currentBookLogFilter === "returned") {
        filtered = bookIssues.filter(i => i.status === "returned");
    }

    if (!filtered.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; color:#64748b; font-size:13px;">
                ${currentBookLogFilter === "reading" ? "वर्तमान में कोई पुस्तक अध्ययन हेतु जारी नहीं है। नीचे दी गई सूची से कोई भी पुस्तक 100% मुफ़्त अध्ययन हेतु लें।" : "दिए गए फ़िल्टर के अनुसार कोई रिकॉर्ड नहीं मिला।"}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="overflow-x:auto;">
            <table class="admin-excel-table" style="font-size:12px;">
                <thead>
                    <tr>
                        <th>पुस्तक का नाम</th>
                        <th>विद्यार्थी (किसने लिया)</th>
                        <th>सीट नं.</th>
                        <th>इश्यू समय</th>
                        <th>शुल्क</th>
                        <th>स्थिति</th>
                        <th>कार्रवाई</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(i => {
                        const isReading = (i.status === "reading");
                        return `
                            <tr>
                                <td>
                                    <strong style="color:var(--navy); font-size:13px;">${escapeHTML(i.bookTitle)}</strong><br>
                                    <small class="muted">${escapeHTML(i.bookAuthor || "")}</small>
                                </td>
                                <td>
                                    <strong>${escapeHTML(i.studentName)}</strong><br>
                                    <a href="tel:${i.studentPhone}" style="color:var(--navy); font-weight:700;">${i.studentPhone}</a>
                                </td>
                                <td>
                                    <span style="background:#eef2ff; color:#1e293b; padding:2px 8px; border-radius:6px; font-weight:700; font-size:11.5px;">
                                        ${escapeHTML(i.seatNo || "हॉल")}
                                    </span>
                                </td>
                                <td>
                                    <small style="color:#334155;">${escapeHTML(i.issueTimeReadable || "आज")}</small>
                                </td>
                                <td>
                                    <span style="color:#15803d; font-weight:800; font-size:11.5px; background:#dcfce7; padding:2px 8px; border-radius:999px;">
                                        ₹0 (मुफ़्त)
                                    </span>
                                </td>
                                <td>
                                    <span style="font-weight:700; font-size:11px; padding:2px 8px; border-radius:999px; ${isReading ? 'background:#fef3c7; color:#b45309; border:1px solid #fde047;' : 'background:#f1f5f9; color:#475569;'}">
                                        ${isReading ? "📖 अध्ययन जारी" : "✓ वापस जमा"}
                                    </span>
                                </td>
                                <td>
                                    ${isReading ? `
                                        <button type="button" class="btn btn-outline" style="padding:4px 10px; font-size:11px; font-weight:700; border-color:#16a34a; color:#15803d;" onclick="openBookReturnModal('${i.issueId}')">
                                            ↩️ वापस जमा करें
                                        </button>
                                    ` : `
                                        <small class="muted" style="font-size:11px;">जमा हो चुकी</small>
                                    `}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* ================= RENDER BOOKS CATALOG WITH DYNAMIC COPIES ================= */
function renderBooks(books) {
    const grid = $("booksGrid");
    if (!grid) return;

    text("totalBooks", booksCache.length);
    text("totalCopies", booksCache.reduce((s, b) => s + Number(b.copies || 0), 0));

    const currentlyReading = bookIssues.filter(i => i.status === "reading");
    text("totalReadingNow", currentlyReading.length);

    if (!books.length) {
        grid.innerHTML = `<div class="empty">कोई पुस्तक नहीं मिली। कृपया दूसरा नाम खोजें।</div>`;
        text("bookResults", "0 पुस्तकें मिलीं");
        return;
    }

    text("bookResults", `कुल ${books.length} पुस्तकें उपलब्ध हैं (अध्ययन 100% मुफ़्त है):`);

    grid.innerHTML = books.map(b => {
        const activeIssues = bookIssues.filter(i => (i.bookId === b.id || i.bookTitle === b.title) && i.status === "reading");
        const readingCount = activeIssues.length;
        const totalCopies = Number(b.copies || 1);
        const availCopies = Math.max(0, totalCopies - readingCount);

        return `
            <article class="book-item" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:14px; background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:240px;">
                    <div class="book-icon" style="font-size:26px; min-width:44px; height:44px; display:grid; place-items:center; background:#f0f4ff; border-radius:12px; border:1px solid #c7ccff;">📖</div>
                    <div class="book-details" style="flex:1;">
                        <h4 style="margin:0 0 4px; color:var(--navy); font-size:15px; font-weight:800;">${escapeHTML(b.title)}</h4>
                        <p style="margin:0 0 4px; font-size:12.5px; color:#475569;">लेखक/प्रकाशन: <b>${escapeHTML(b.author)}</b> · <span style="color:#0369a1; font-weight:600;">${escapeHTML(b.category)}</span></p>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            <span class="book-available" style="font-size:12px; font-weight:700; color:${availCopies > 0 ? '#15803d' : '#b45309'};">
                                ${availCopies > 0 ? `✓ उपलब्ध: ${availCopies} प्रतियां (कुल ${totalCopies})` : `⏳ सभी ${totalCopies} प्रतियां अध्ययन में हैं`}
                            </span>
                            ${readingCount > 0 ? `<span style="font-size:11px; background:#eff6ff; color:#1e40af; padding:2px 8px; border-radius:6px; font-weight:700;">📖 ${readingCount} छात्र अभी पढ़ रहे हैं</span>` : ""}
                            <span style="font-size:11px; background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:6px; font-weight:800;">✨ पढ़ाई 100% मुफ़्त (₹0)</span>
                        </div>
                    </div>
                </div>

                <div class="book-action-wrap" style="flex-shrink:0;">
                    ${availCopies > 0 ? `
                        <button type="button" class="btn btn-success" style="padding:8px 16px; font-size:12.5px; font-weight:800; box-shadow:0 3px 10px rgba(22,163,74,0.25);" onclick="openBookIssueModal('${escapeHTML(b.id)}')">
                            📖 पढ़ने हेतु लें (Free ₹0)
                        </button>
                    ` : `
                        <button type="button" class="btn btn-outline" style="padding:7px 12px; font-size:12px; font-weight:600; opacity:0.8;" onclick="toast('यह पुस्तक अभी अध्ययन हेतु ली जा चुकी है। छात्र द्वारा वापस जमा करने पर उपलब्ध होगी।', 'info')">
                            ⏳ अध्ययन जारी है
                        </button>
                    `}
                </div>
            </article>
        `;
    }).join("");
}

function searchBooks() {
    const q = String(value("bookSearch")).trim().toLowerCase();
    const filtered = booksCache.filter(b => 
        (b.title + " " + b.author + " " + b.category).toLowerCase().includes(q)
    );
    renderBooks(filtered);
}
window.searchBooks = searchBooks;

/* ================= LOCAL STORAGE BACKUP ================= */
function loadLocalData() {
    try {
        const u = localStorage.getItem("vidya_user");
        if (u) currentUser = JSON.parse(u);

        const ru = localStorage.getItem("vidya_registered_users");
        if (ru) registeredUsers = JSON.parse(ru);

        const b = localStorage.getItem("vidya_bookings");
        if (b) {
            const raw = JSON.parse(b);
            if (currentUser && currentUser.phoneNumber) {
                const uPhone = normalisePhone(currentUser.phoneNumber);
                myBookings = raw.filter(item => normalisePhone(item.studentPhone) === uPhone);
            } else {
                myBookings = [];
            }
        }

        const a = localStorage.getItem("vidya_admin_req");
        if (a) allAdminRequests = JSON.parse(a);

        const uu = localStorage.getItem("vidya_used_utrs");
        if (uu) usedUtrs = JSON.parse(uu);

        const bi = localStorage.getItem("vidya_book_issues");
        if (bi) bookIssues = JSON.parse(bi);

        const cmp = localStorage.getItem("vidya_complaints");
        if (cmp) allComplaints = JSON.parse(cmp);

        const av = localStorage.getItem("vidya_avail");
        if (av) availability = JSON.parse(av);
        else availability = { seats: {}, lockers: {} };
    } catch (e) {
        availability = { seats: {}, lockers: {} };
        console.warn("Local storage read error", e);
    }
}

function saveLocalData() {
    try {
        localStorage.setItem("vidya_registered_users", JSON.stringify(registeredUsers));
        localStorage.setItem("vidya_bookings", JSON.stringify(myBookings));
        localStorage.setItem("vidya_admin_req", JSON.stringify(allAdminRequests));
        localStorage.setItem("vidya_avail", JSON.stringify(availability));
        localStorage.setItem("vidya_used_utrs", JSON.stringify(usedUtrs));
        localStorage.setItem("vidya_book_issues", JSON.stringify(bookIssues));
        localStorage.setItem("vidya_complaints", JSON.stringify(allComplaints));
    } catch (e) {
        console.warn("Local storage write error", e);
    }
}

let resetConfirmPending = false;
let resetConfirmTimer = null;

function clearDemoData() {
    // 1. Strict Owner Authentication Guard
    if (!isAdminLoggedIn()) {
        toast("🔒 सुरक्षा प्रतिबंध: केवल मुख्य लाइब्रेरी संचालक (vidyalibrary005@gmail.com) ही डेटाबेस रीसेट कर सकते हैं।", "error");
        openAdminLoginModal();
        return;
    }

    // 2. In-page 2-step verification (Canvas safe without confirm() dialog)
    if (!resetConfirmPending) {
        resetConfirmPending = true;
        toast("⚠️ पुष्टि हेतु 5 सेकंड के भीतर दोबारा क्लिक करें: क्या आप निश्चित रूप से पूरा डेटाबेस रीसेट करना चाहते हैं?", "error");
        clearTimeout(resetConfirmTimer);
        resetConfirmTimer = setTimeout(() => {
            resetConfirmPending = false;
        }, 5000);
        return;
    }

    resetConfirmPending = false;
    clearTimeout(resetConfirmTimer);

    myBookings = [];
    allAdminRequests = [];
    registeredUsers = {};
    currentUser = null;
    availability = { seats: {}, lockers: {} };
    localStorage.removeItem("vidya_user");
    localStorage.removeItem("vidya_registered_users");
    localStorage.removeItem("vidya_bookings");
    localStorage.removeItem("vidya_admin_req");
    localStorage.removeItem("vidya_avail");
    localStorage.removeItem("vidya_used_utrs");
    updateAuthUI(null);
    selectSlot("4");
    selectMonths("1");
    renderLockerGrid();
    renderHistory();
    renderAdminRequests();
    updateSummary();
    toast("मालिक द्वारा डेटाबेस सुरक्षित रूप से रीसेट कर दिया गया। सभी 80 सीटें उपलब्ध हैं।", "info");
}


/* =========================================================
   STUDENT HELPDESK & COMPLAINT SYSTEM (विद्यार्थी सहायता व शिकायत निवारण)
   ========================================================= */

function saveComplaintsLocal() {
    try {
        localStorage.setItem("vidya_complaints", JSON.stringify(allComplaints));
    } catch (e) {
        console.warn("Save complaints error:", e);
    }
}

async function loadComplaintsFromFirebase() {
    try {
        const snap = await get(child(ref(db), "complaints"));
        if (snap.exists()) {
            const data = snap.val();
            const list = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            allComplaints = list;
            saveComplaintsLocal();
        }
    } catch (err) {
        console.warn("Firebase complaints fetch notice:", err);
    }
    renderStudentComplaints();
    renderAdminComplaints();
    updateAdminComplaintBadge();
}
window.loadComplaintsFromFirebase = loadComplaintsFromFirebase;

function updateAdminComplaintBadge() {
    const badge = $("adminComplaintBadge");
    if (badge) {
        const pendingCount = allComplaints.filter(c => c.status !== "resolved").length;
        badge.textContent = String(pendingCount);
        badge.style.display = pendingCount > 0 ? "inline-block" : "none";
    }
}
window.updateAdminComplaintBadge = updateAdminComplaintBadge;

async function handleComplaintSubmit(e) {
    e.preventDefault();

    const category = value("complaintCategory");
    const seatNo = value("complaintSeatNo").trim();
    const name = value("complaintStudentName").trim();
    const phone = normalisePhone(value("complaintStudentPhone"));
    const message = value("complaintText").trim();

    if (!category) {
        toast("कृपया परेशानी का प्रकार चुनें।", "error");
        $("complaintCategory")?.focus();
        return;
    }

    if (name.length < 2) {
        toast("कृपया अपना पूरा नाम दर्ज करें।", "error");
        $("complaintStudentName")?.focus();
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        toast("कृपया सही 10 अंकों का WhatsApp मोबाइल नंबर दर्ज करें।", "error");
        $("complaintStudentPhone")?.focus();
        return;
    }

    if (message.length < 4) {
        toast("कृपया अपनी परेशानी का विवरण थोड़ा विस्तार से लिखें।", "error");
        $("complaintText")?.focus();
        return;
    }

    const complaintId = "CMP" + Math.floor(1000 + Math.random() * 9000);
    const dateFormatted = new Date().toLocaleDateString("en-IN", {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const record = {
        id: complaintId,
        studentName: name,
        studentPhone: phone,
        seatNo: seatNo || "—",
        category,
        message,
        status: "pending",
        createdAt: Date.now(),
        dateFormatted
    };

    // 1. Save to Firebase Realtime Database
    try {
        const updates = {};
        updates[`complaints/${complaintId}`] = record;
        updates[`users/${phone}/complaints/${complaintId}`] = record;
        await update(ref(db), updates);
        console.log("Complaint saved to Firebase:", complaintId);
    } catch (fbErr) {
        console.warn("Firebase complaint notice:", fbErr.message);
    }

    // 2. Save locally
    allComplaints.unshift(record);
    saveComplaintsLocal();

    toast(`✅ आपकी समस्या संचालक (मालिक) को भेज दी गई है (ID: #${complaintId})। शीघ्र समाधान किया जाएगा!`, "success");

    // Reset message
    if ($("complaintText")) $("complaintText").value = "";
    renderStudentComplaints();
    renderAdminComplaints();
    updateAdminComplaintBadge();
}
window.handleComplaintSubmit = handleComplaintSubmit;

function sendComplaintViaWhatsApp() {
    const category = value("complaintCategory") || "लाइब्रेरी सहायता";
    const seatNo = value("complaintSeatNo").trim();
    const name = value("complaintStudentName").trim() || currentUser?.displayName || "विद्यार्थी";
    const phone = normalisePhone(value("complaintStudentPhone")) || currentUser?.phoneNumber || "";
    const message = value("complaintText").trim();

    if (!message) {
        toast("कृपया पहले परेशानी का विवरण भरें।", "error");
        $("complaintText")?.focus();
        return;
    }

    const seatPart = seatNo ? ` (सीट नं: ${seatNo})` : "";
    const waText = `नमस्ते विद्या लाइब्रेरी संचालक (मालिक)!%0A%0Aमैं *${encodeURIComponent(name)}* बोल रहा हूँ${seatPart}।%0A📱 मोबाइल: ${phone}%0A⚠️ *विषय:* ${encodeURIComponent(category)}%0A📝 *समस्या का विवरण:* ${encodeURIComponent(message)}%0A%0Aकृपया इस परेशानी का जल्द समाधान करने की कृपा करें। धन्यवाद!`;

    window.open(`https://wa.me/919111701828?text=${waText}`, "_blank");
}
window.sendComplaintViaWhatsApp = sendComplaintViaWhatsApp;

function renderStudentComplaints() {
    const container = $("studentComplaintsList");
    if (!container) return;

    const curPhone = normalisePhone(currentUser?.phoneNumber || value("complaintStudentPhone"));
    const list = curPhone
        ? allComplaints.filter(c => normalisePhone(c.studentPhone) === curPhone)
        : allComplaints.slice(0, 3);

    if (!list.length) {
        container.innerHTML = `<div class="empty" style="padding:14px; font-size:12px; background:#f8fafc; border-radius:8px; text-align:center; color:#64748b;">
            आपने अभी तक कोई शिकायत या समस्या दर्ज नहीं की है। सब कुछ ठीक है! ✓
        </div>`;
        return;
    }

    container.innerHTML = list.map(c => `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                <div>
                    <span style="font-weight:800; color:var(--navy); font-size:13px;">#${c.id}</span>
                    <span style="font-size:11px; color:#64748b; margin-left:6px;">${c.dateFormatted || ''}</span>
                    ${c.seatNo && c.seatNo !== '—' ? `<span style="font-size:11px; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px; font-weight:700; margin-left:6px;">सीट: ${escapeHTML(c.seatNo)}</span>` : ''}
                </div>
                <div>
                    ${c.status === 'resolved' 
                        ? `<span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:6px; font-weight:800; font-size:11px; border:1px solid #86efac;">✅ समाधान पूर्ण (Resolved)</span>`
                        : `<span style="background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:6px; font-weight:800; font-size:11px; border:1px solid #fde68a;">⏳ संचालक के पास लंबित (Pending)</span>`
                    }
                </div>
            </div>
            <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:3px;">
                ${escapeHTML(c.category)}
            </div>
            <div style="font-size:12px; color:#475569; line-height:1.4; background:#ffffff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0;">
                ${escapeHTML(c.message)}
            </div>
        </div>
    `).join("");
}
window.renderStudentComplaints = renderStudentComplaints;

function renderAdminComplaints() {
    const container = $("adminComplaintsListTable");
    if (!container) return;

    if (!allComplaints.length) {
        container.innerHTML = `<div class="empty" style="padding:16px; text-align:center; color:#64748b;">
            अभी कोई विद्यार्थी शिकायत या समस्या दर्ज नहीं है। सब कुछ सामान्य है! ✓
        </div>`;
        return;
    }

    container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            ${allComplaints.map(c => `
                <div style="background:#ffffff; border:1.5px solid ${c.status === 'resolved' ? '#bbf7d0' : '#fcd34d'}; border-radius:12px; padding:14px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                        <div>
                            <span style="font-weight:900; color:var(--navy); font-size:14px;">#${c.id}</span>
                            <span style="font-size:12px; font-weight:700; color:#0f172a; margin-left:8px;">${escapeHTML(c.studentName)}</span>
                            <span style="font-size:11.5px; color:#475569; margin-left:6px;">(${escapeHTML(c.studentPhone)})</span>
                            ${c.seatNo && c.seatNo !== '—' ? `<span style="font-size:11px; background:#eff6ff; color:#1e40af; padding:2px 7px; border-radius:5px; font-weight:800; margin-left:6px;">सीट: ${escapeHTML(c.seatNo)}</span>` : ''}
                            <div style="font-size:11px; color:#64748b; margin-top:2px;">दर्ज समय: ${c.dateFormatted || ''}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${c.status === 'resolved' 
                                ? `<span style="background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:6px; font-weight:800; font-size:12px; border:1px solid #86efac;">✅ सुलझा लिया गया</span>`
                                : `<button type="button" class="btn btn-sm btn-success" style="font-size:11.5px; padding:5px 10px; font-weight:800;" onclick="adminResolveComplaint('${c.id}', '${c.studentPhone}')">
                                    ✅ समाधान हुआ (Mark Resolved)
                                   </button>`
                            }
                            <a href="tel:${c.studentPhone}" class="btn btn-sm btn-outline" style="font-size:11px; padding:4px 8px;">📞 कॉल</a>
                            <a href="https://wa.me/91${c.studentPhone}?text=${encodeURIComponent('नमस्ते ' + c.studentName + ', विद्या लाइब्रेरी संचालक। आपकी शिकायत #' + c.id + ' के संबंध में:')}" target="_blank" class="btn btn-sm btn-success" style="font-size:11px; padding:4px 8px;">💬 WA</a>
                        </div>
                    </div>

                    <div style="font-size:12.5px; font-weight:800; color:#1e3a8a; margin-bottom:4px;">
                        ⚠️ विषय: ${escapeHTML(c.category)}
                    </div>
                    <div style="font-size:12.5px; color:#334155; line-height:1.45; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
                        ${escapeHTML(c.message)}
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}
window.renderAdminComplaints = renderAdminComplaints;

async function adminResolveComplaint(id, phone) {
    if (!isAdminLoggedIn()) {
        toast("🔒 केवल मुख्य लाइब्रेरी संचालक ही इसे अपडेट कर सकते हैं।", "error");
        return;
    }

    try {
        const updates = {};
        updates[`complaints/${id}/status`] = "resolved";
        updates[`complaints/${id}/resolvedAt`] = Date.now();
        if (phone) {
            updates[`users/${phone}/complaints/${id}/status`] = "resolved";
            updates[`users/${phone}/complaints/${id}/resolvedAt`] = Date.now();
        }
        await update(ref(db), updates);
        console.log("Complaint marked resolved in Firebase:", id);
    } catch (e) {
        console.warn("Firebase update complaint notice:", e);
    }

    const item = allComplaints.find(c => c.id === id);
    if (item) {
        item.status = "resolved";
        item.resolvedAt = Date.now();
    }
    saveComplaintsLocal();

    toast(`✅ शिकायत #${id} का समाधान दर्ज कर दिया गया!`, "success");
    renderAdminComplaints();
    renderStudentComplaints();
    updateAdminComplaintBadge();
}
window.adminResolveComplaint = adminResolveComplaint;

function toggleAdminComplaintsView() {
    const box = $("adminComplaintsBox");
    if (!box) return;
    const isHidden = box.style.display === "none";
    box.style.display = isHidden ? "block" : "none";
    if (isHidden) {
        renderAdminComplaints();
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
window.toggleAdminComplaintsView = toggleAdminComplaintsView;


/* ================= INITIAL SETUP ================= */
function setupUI() {
        // Production launch: ensure all 80 seats and 24 lockers are clean & vacant unless booked
    if (!localStorage.getItem("vidya_prod_v1")) {
        localStorage.clear();
        localStorage.setItem("vidya_prod_v1", "true");
        availability = { seats: {}, lockers: {} };
        myBookings = [];
        allAdminRequests = [];
        registeredUsers = {};
        currentUser = null;
    }

    loadLocalData();

    if ($("startDate")) $("startDate").min = todayDate();
    if ($("startDate") && !$("startDate").value) $("startDate").value = todayDate();
    if ($("lockerStartDate")) $("lockerStartDate").min = todayDate();
    if ($("lockerStartDate") && !$("lockerStartDate").value) $("lockerStartDate").value = todayDate();

    $("bookSearch")?.addEventListener("input", searchBooks);
    $("lockerStartDate")?.addEventListener("change", updateSummary);
    $("lockerMonths")?.addEventListener("change", updateSummary);

    setAuthMode("login");
    updateAuthUI(currentUser);
    selectSlot("4");
    selectMonths("1");
    renderLockerGrid();
    renderBooks(booksCache);
    loadBookIssuesFromFirebase();
    renderBookIssuesLog();
    updateSummary();
    if (currentUser && currentUser.phoneNumber) {
        loadUserBookingsFromFirebase(currentUser.phoneNumber);
    } else {
        renderHistory();
    }
    updateAdminUI();
    loadComplaintsFromFirebase();

    document.querySelectorAll(".nav-item[data-page]").forEach(b => {
        b.addEventListener("click", e => {
            e.preventDefault();
            go(b.dataset.page);
        });
    });

    startLiveAvailability();
}

// Global functions for inline HTML events

/* ================= DIRECT PHONE CALL & DIRECT WHATSAPP LAUNCH ================= */
function callPhone(number = "9111701828") {
    const cleanNum = String(number).replace(/\D/g, "");
    window.location.href = `tel:${cleanNum}`;
}
window.callPhone = callPhone;

function openWhatsApp(customText = "") {
    const defaultMsg = "नमस्ते विद्या लाइब्रेरी राजनांदगांव! मुझे सीट बुकिंग के बारे में जानकारी चाहिए।";
    const msg = encodeURIComponent(customText || defaultMsg);
    
    // Direct native WhatsApp app intent
    const appIntentUrl = `whatsapp://send?phone=919111701828&text=${msg}`;
    const webFallbackUrl = `https://api.whatsapp.com/send?phone=919111701828&text=${msg}`;

    const start = Date.now();
    window.location.href = appIntentUrl;

    setTimeout(() => {
        // If app intent wasn't handled within 700ms (e.g. desktop browser), fallback to web/wa.me
        if (Date.now() - start < 1200) {
            window.open(webFallbackUrl, "_blank");
        }
    }, 600);
}
window.openWhatsApp = openWhatsApp;


/* ================= SHOW / HIDE PASSWORD TOGGLE ================= */
function togglePasswordVisibility(inputId, btn) {
    const input = $(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (btn) btn.textContent = "🙈";
    } else {
        input.type = "password";
        if (btn) btn.textContent = "👁️";
    }
}
window.togglePasswordVisibility = togglePasswordVisibility;

/* ================= SEND RECEIPT TO WHATSAPP ================= */
function sendReceiptToWhatsApp(id) {
    const booking = myBookings.find(b => b.bookingId === id) || allAdminRequests.find(b => b.bookingId === id);
    if (!booking) {
        toast("रसीद का विवरण नहीं मिला!", "error");
        return;
    }
    const msg = `नमस्ते विद्या लाइब्रेरी राजनांदगांव!\nमैंने सीट/लॉकर बुक किया है। कृपया मेरी रसीद की पुष्टि करें:\n\n` +
        `📄 Reg. No. A: ${booking.regNum || booking.bookingId}\n` +
        `👤 विद्यार्थी: ${booking.studentName}\n` +
        `📱 मोबाइल: ${booking.studentPhone}\n` +
        `💺 प्लान: ${booking.plan || "Study Seat"} (${booking.months} माह)\n` +
        `📅 प्रारंभ तिथि: ${booking.startDate} से ${booking.endDate}\n` +
        `💰 कुल राशि: ₹${booking.totalAmount} (${booking.paymentMethod || "UPI"})\n` +
        `🔒 UTR / Ref: ${booking.utr || "Counter Cash"}\n` +
        `🏢 Vidya Library, Shiv Towar, Rajnandgaon`;
    openWhatsApp(msg);
}
window.sendReceiptToWhatsApp = sendReceiptToWhatsApp;

window.go = go;

window._pageRenderHooks = {
    booking: function() {
        if (currentUser) {
            if ($("studentName") && !$("studentName").value) $("studentName").value = currentUser.displayName || "";
            if ($("studentPhone") && !$("studentPhone").value && currentUser.phoneNumber) $("studentPhone").value = currentUser.phoneNumber;
        }
        renderSeatGrid();
        updateSummary();
        const curPhone = normalisePhone(value("studentPhone") || currentUser?.phoneNumber || "");
        if (curPhone.length === 10) {
            renderDepositBadge(curPhone, getStudentDepositStatus(curPhone));
        }
    },
    lockers: function() { renderLockerGrid(); },
    profile: function() {
        try { renderHistory(); } catch(e) {}
        try { renderAdminRequests(); } catch(e) {}
        try { renderStudentComplaints(); } catch(e) {}
    },
    books: function() { renderBooks(booksCache); },
    fees: function() { updateSummary(); }
};

window.setAuthMode = setAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.sendForgotOTP = sendForgotOTP;
window.handleForgotSubmit = handleForgotSubmit;
window.logout = logout;
window.onPlanChange = onPlanChange;
window.onPayMethodChange = onPayMethodChange;
window.updateSummary = updateSummary;
window.prepareBooking = prepareBooking;
window.saveLocker = saveLocker;
window.submitLockerWithUTR = submitLockerWithUTR;
window.copyUPI = copyUPI;
window.printReceipt = printReceipt;
window.closeReceiptModal = closeReceiptModal;
window.downloadCurrentReceiptPDF = downloadCurrentReceiptPDF;
window.printReceiptDirect = printReceiptDirect;
window.searchBooks = searchBooks;
window.clearDemoData = clearDemoData;
window.toggleAdminPanel = toggleAdminPanel;
window.adminConfirm = adminConfirm;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupUI, { once: true });
} else {
    setupUI();
}


async function adminRefundDeposit(phone, bookingId) {
    if (!phone) return;
    if (registeredUsers[phone]) {
        registeredUsers[phone].depositStatus = "refunded";
        registeredUsers[phone].depositRefundedAt = Date.now();
    }
    const b = myBookings.find(item => item.bookingId === bookingId) || allAdminRequests.find(item => item.bookingId === bookingId);
    if (b) b.depositRefunded = true;

    saveLocalData();

    try {
        await update(ref(db, `users/${phone}`), { depositStatus: "refunded", depositRefundedAt: Date.now() });
        if (bookingId) {
            await update(ref(db, `bookingRequests/${bookingId}`), { depositRefunded: true });
        }
    } catch (e) {}

    toast(`विद्यार्थी ${phone} का ₹300 डिपॉजिट रिफंड मार्क कर दिया गया!`, "info");
    renderAdminRequests();
    updateSummary();
    if (currentUser) updateAuthUI(currentUser);
}
window.adminRefundDeposit = adminRefundDeposit;


async function adminReject(bookingId) {
    const item = allAdminRequests.find(r => r.bookingId === bookingId);
    if (!item) return;

    item.status = "rejected";
    // Release seat back if it was reserved
    if (item.requestedSeat && availability.seats[String(item.requestedSeat)] === "reserved") {
        delete availability.seats[String(item.requestedSeat)];
    }
    if (item.locker && availability.lockers[String(item.locker)] === "reserved") {
        delete availability.lockers[String(item.locker)];
    }

    saveLocalData();

    try {
        await update(ref(db, `bookingRequests/${bookingId}`), { status: "rejected" });
        if (item.studentPhone) {
            await update(ref(db, `users/${item.studentPhone}/bookings/${bookingId}`), { status: "rejected" });
        }
        if (item.requestedSeat) {
            await update(ref(db, `public/availability/seats/${item.requestedSeat}`), "available");
        }
    } catch (e) {}

    toast(`बुकिंग ${bookingId} रिजेक्ट कर दी गई और सीट खाली कर दी गई।`, "error");
    renderAdminRequests();
    renderSeatGrid();
}
window.adminReject = adminReject;


function selectPlanFromTable(planName, monthsCount = null) {
    const slotEl = $("slot");
    if (slotEl) slotEl.value = planName;
    if (monthsCount && $("months")) $("months").value = String(monthsCount);

    if ($("feesSlotSelect")) $("feesSlotSelect").value = planName;
    if (monthsCount && $("feesMonthsSelect")) $("feesMonthsSelect").value = String(monthsCount);

    onPlanChange();
    updateSummary();

    const amt = calculateBookingAmount();
    toast(`${getPlanDisplayName(planName)} (${amt.months} माह) चयनित! कुल: ${money(amt.total)}`, "success");
}
window.selectPlanFromTable = selectPlanFromTable;

function togglePayQrCode(amount) {
    const qrArea = $("dynamicPayQrArea");
    if (!qrArea) return;
    qrArea.style.display = (qrArea.style.display === "none") ? "block" : "none";
}
window.togglePayQrCode = togglePayQrCode;

/* Synchronize dropdowns from Fees page to Booking page */
function syncFromFeesPage() {
    const fSlot = value("feesSlotSelect");
    const fMonths = value("feesMonthsSelect");
    if (fSlot && $("slot")) $("slot").value = fSlot;
    if (fMonths && $("months")) $("months").value = fMonths;
    onPlanChange();
    updateSummary();
}
window.syncFromFeesPage = syncFromFeesPage;

function syncToFeesPage() {
    const slot = value("slot");
    const months = value("months");
    if (slot && $("feesSlotSelect")) $("feesSlotSelect").value = slot;
    if (months && $("feesMonthsSelect")) $("feesMonthsSelect").value = months;
}


// Auto-remove any injected Netlify badges that cover bottom navigation
function removeInjectedNetlifyBadge() {
    try {
        const netlifyNodes = document.querySelectorAll('[data-netlify-deploy-id], [class*="netlify-feedback"], [id*="netlify-feedback"], .netlify-badge, #netlify-badge, iframe[src*="netlify"]');
        netlifyNodes.forEach(n => {
            n.style.display = "none";
            n.style.pointerEvents = "none";
            n.remove();
        });
    } catch (e) {}
}
if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", removeInjectedNetlifyBadge);
    window.addEventListener("load", removeInjectedNetlifyBadge);
    setInterval(removeInjectedNetlifyBadge, 800);
}
्रसिद्ध हैं।"}, {"q": "महाभारत काल में छत्तीसगढ़ क्षेत्र को किस नाम से जाना जाता था?", "opts": ["दक्षिण कोसल", "प्राक् कोसल", "दंडकारण्य", "चेदिदेश"], "ans": 1, "exp": "महाभारत काल में इसे प्राक् कोसल और रामायण काल में दक्षिण कोसल कहा जाता था।"}, {"q": "समुद्रगुप्त की प्रयाग प्रशस्ति में दक्षिण कोसल के किस राजा का उल्लेख मिलता है?", "opts": ["महेंद्र", "व्याघ्रराज", "तीवरदेव", "भवदत्त वर्मन"], "ans": 0, "exp": "समुद्रगुप्त ने दक्षिण कोसल के राजा महेंद्र और महाकांतर के व्याघ्रराज को पराजित किया था।"}, {"q": "सिरपुर का प्रसिद्ध ईंटों से निर्मित 'लक्ष्मण मंदिर' किस वंश के काल में बनाया गया था?", "opts": ["कलचुरी वंश", "पांडु वंश", "सोम वंश", "नल वंश"], "ans": 1, "exp": "पांडु वंश की महारानी वासटा देवी ने अपने पति हर्षगुप्त की स्मृति में लक्ष्मण मंदिर बनवाया।"}, {"q": "शरभपुरीय वंश के सिक्के किस धातु के बने होते थे और किस लिपि में थे?", "opts": ["तांबा, ब्राह्मी", "स्वर्ण, पेटीकाशीर्ष लिपि", "चांदी, खरोष्ठी", "लोहा, देवनागरी"], "ans": 1, "exp": "शरभपुरीय शासकों के स्वर्ण सिक्कों पर पेटीकाशीर्ष (Box-headed) ब्राह्मी लिपि मिलती है।"}, {"q": "बस्तर के नल वंश के किस शासक ने वाकाटक नरेश नरेंद्रसेन को पराजित किया था?", "opts": ["भवदत्त वर्मन", "अर्थपति भट्टारक", "वराहराज", "विलासतुंग"], "ans": 0, "exp": "भवदत्त वर्मन ने वाकाटक राज्य पर आक्रमण कर नंदिवर्धन को जीता था।"}, {"q": "कलचुरी वंश के किस शासक ने पाली (कोरबा) के प्रसिद्ध शिव मंदिर का निर्माण करवाया था?", "opts": ["कलिंगराज", "विक्रमादित्य प्रथम (बाण वंश)", "जाजल्लदेव प्रथम", "पृथ्वीदेव द्वितीय"], "ans": 1, "exp": "पाली के शिव मंदिर का निर्माण बाणवंशी शासक विक्रमादित्य प्रथम ने करवाया तथा जाजल्लदेव ने जीर्णोद्धार कराया।"}, {"q": "रतनपुर में महामाया मंदिर का निर्माण किस कलचुरी शासक ने करवाया?", "opts": ["कलिंगराज", "रत्नदेव प्रथम", "पृथ्वीदेव प्रथम", "कल्याण साय"], "ans": 1, "exp": "रत्नदेव प्रथम ने 1050 ई. में रतनपुर की स्थापना कर महामाया मंदिर का निर्माण कराया।"}, {"q": "किस कलचुरी शासक ने 'सकलकोसलाधिपति' और 'गजशार्दूल' की उपाधि धारण की?", "opts": ["रत्नदेव द्वितीय", "जाजल्लदेव प्रथम", "पृथ्वीदेव प्रथम", "प्रतापमल्ल"], "ans": 1, "exp": "जाजल्लदेव प्रथम ने जांजगीर (जाजल्लपुर) नगर बसाया और गजशार्दूल उपाधि धारण की।"}, {"q": "किस कलचुरी शासक की राजस्व जमाबंदी प्रणाली का विवरण ब्रिटिश अधिकारी चिश्म ने किया है?", "opts": ["कल्याण साय", "रघुनाथ सिंह", "तख्तसिंह", "रत्नदेव तृतीय"], "ans": 0, "exp": "कलचुरी राजा कल्याण साय की जमाबंदी प्रणाली (गढ़ों का विभाजन) प्रसिद्ध थी।"}, {"q": "रतनपुर के अंतिम स्वतंत्र कलचुरी शासक कौन थे जिन्हें मराठों ने पराजित किया?", "opts": ["रघुनाथ सिंह", "मोहन सिंह", "अमर सिंह", "बिंबाजी"], "ans": 0, "exp": "1741 ई. में भास्कर पंत के आक्रमण के समय रघुनाथ सिंह रतनपुर के कलचुरी शासक थे।"}, {"q": "छत्तीसगढ़ में प्रत्यक्ष मराठा शासन के प्रथम शासक कौन थे?", "opts": ["रघुजी प्रथम", "बिंबाजी भोंसले", "व्यंकोजी भोंसले", "महीपतराव दिनकर"], "ans": 1, "exp": "1758 से 1787 ई. तक बिंबाजी भोंसले ने रतनपुर से प्रत्यक्ष मराठा शासन किया।"}, {"q": "छत्तीसगढ़ में 'परगना पद्धति' का जन्मदाता किस मराठा सूबेदार को माना जाता है?", "opts": ["महीपतराव दिनकर", "विट्ठलराव दिनकर", "केशव गोविंद", "भीकाजी गोपाल"], "ans": 1, "exp": "विट्ठलराव दिनकर ने गढ़ व्यवस्था समाप्त कर 27 परगनों की परगना पद्धति लागू की।"}, {"q": "ब्रिटिश अधीक्षक कैप्टन एगन्यू ने छत्तीसगढ़ की राजधानी रतनपुर से कहाँ स्थानांतरित की?", "opts": ["बिलासपुर", "रायपुर", "दुर्ग", "राजनांदगांव"], "ans": 1, "exp": "1818 ई. में कैप्टन एगन्यू ने प्रशासनिक सुविधा हेतु राजधानी रतनपुर से रायपुर स्थानांतरित की।"}, {"q": "1854 में ब्रिटिश साम्राज्य में नागपुर विलय के समय छत्तीसगढ़ के प्रथम डिप्टी कमिश्नर कौन बने?", "opts": ["चार्ल्स इलियट", "कैप्टन एडमंड", "मिस्टर सैंडिस", "सर रिचर्ड टेंपल"], "ans": 0, "exp": "1854 में चार्ल्स इलियट छत्तीसगढ़ के प्रथम डिप्टी कमिश्नर नियुक्त हुए।"}, {"q": "1861 में मध्यप्रांत (Central Provinces) के गठन के समय छत्तीसगढ़ में कितने जिले बनाए गए?", "opts": ["2 (रायपुर, बिलासपुर)", "3 (रायपुर, बिलासपुर, संबलपुर)", "4", "5"], "ans": 1, "exp": "1861 में रायपुर, बिलासपुर और संबलपुर को जिला बनाया गया; 1862 में छत्तीसगढ़ संभाग बना।"}, {"q": "बस्तर के किस काकतीय शासक ने 1424 में राजधानी मधोता से बस्तर स्थानांतरित की?", "opts": ["अन्नमदेव", "पुरुषोत्तमदेव", "प्रतापराज देव", "दलपत देव"], "ans": 3, "exp": "दलपत देव ने बस्तर के बाद जगदलपुर नगर बसाकर राजधानी बनाया।"}, {"q": "सिरपुर में 'गंधेश्वर मंदिर' किस नदी के तट पर स्थित है?", "opts": ["शिवनाथ", "महानदी", "खारुन", "हसदेव"], "ans": 1, "exp": "सिरपुर स्थित प्राचीन गंधेश्वर महादेव मंदिर महानदी के तट पर है।"}, {"q": "छत्तीसगढ़ में सती प्रथा और नरबलि प्रथा पर रोक किस ब्रिटिश अधिकारी के समय लगी?", "opts": ["कैप्टन एडमंड", "कैप्टन एगन्यू / क्रॉफर्ड", "चार्ल्स इलियट", "मॉन्टगोमरी"], "ans": 1, "exp": "ब्रिटिश संरक्षण काल में ही सती प्रथा व दंतेवाड़ा में नरबलि (मेरिया) प्रथा पर कड़ा प्रतिबंध लगा।"}, {"q": "1857 की क्रांति में शहीद हुए वीर नारायण सिंह किस जमींदारी के जमींदार थे?", "opts": ["भटगांव", "सोनाखान", "खैरागढ़", "पंडरिया"], "ans": 1, "exp": "वीर नारायण सिंह बलौदाबाजार-भाटापारा क्षेत्र की सोनाखान जमींदारी के जमींदार थे।"}, {"q": "वीर नारायण सिंह को रायपुर के किस स्थान पर 10 दिसंबर 1857 को फांसी दी गई?", "opts": ["गांधी चौक", "जयस्तंभ चौक", "बूढ़ातालाब", "तेलीबांधा"], "ans": 1, "exp": "उन्हें रायपुर के जयस्तंभ चौक पर सार्वजनिक रूप से फांसी दी गई थी।"}, {"q": "18 जनवरी 1858 को रायपुर में सैन्य विद्रोह का नेतृत्व किसने किया था?", "opts": ["हनुमान सिंह", "सुरेंद्र साय", "कल्याण सिंह", "गजाधर साव"], "ans": 0, "exp": "हनुमान सिंह ने सार्जेंट सिडवेल की हत्या कर रायपुर में सिपाही विद्रोह किया।"}, {"q": "1857 के विद्रोह में संबलपुर और रायगढ़ क्षेत्र में लंबे समय तक संघर्ष करने वाले क्रांतिकारी कौन थे?", "opts": ["वीर सुरेंद्र साय", "अजीत सिंह", "गेंदसिंह", "रामराय"], "ans": 0, "exp": "वीर सुरेंद्र साय ने वर्षों तक अंग्रेजों से छापामार युद्ध किया।"}, {"q": "बस्तर का 'तारापुर विद्रोह' (1842-1854) किसके विरुद्ध हुआ था?", "opts": ["जंगल कटाई", "बढ़ी हुई टकोली (कर) के विरुद्ध", "नमक कर", "रेल लाइन निर्माण"], "ans": 1, "exp": "दलगंजन सिंह के नेतृत्व में बढ़ी हुई टकोली कर के विरोध में तारापुर विद्रोह हुआ।"}, {"q": "1859 का 'कोई विद्रोह' बस्तर में किस प्रमुख कारण से हुआ था?", "opts": ["साल के वृक्षों की कटाई के विरोध में", "लगान वृद्धि", "जमींदारी छीनने पर", "शराब नीति"], "ans": 0, "exp": "नागुल दोरला के नेतृत्व में 'एक साल वृक्ष के पीछे एक सिर' के नारे के साथ कोई विद्रोह हुआ।"}, {"q": "1910 के भूमकाल विद्रोह का प्रतीक चिह्न क्या था?", "opts": ["तीर-धनुष", "आम की टहनी और लाल मिर्च", "कमल और रोटी", "कुल्हाड़ी"], "ans": 1, "exp": "आम की टहनी और लाल मिर्च घुमाकर गांव-गांव में भूमकाल विद्रोह का संदेश भेजा गया।"}, {"q": "1906 में राजनांदगांव में 'सरस्वती पुस्तकालय' की स्थापना किसने की थी?", "opts": ["ठाकुर प्यारेलाल सिंह", "माधवराव सप्रे", "वामनराव लाखे", "रविशंकर शुक्ल"], "ans": 0, "exp": "ठाकुर प्यारेलाल सिंह ने युवाओं में राष्ट्रीय चेतना के लिए सरस्वती पुस्तकालय की स्थापना की।"}, {"q": "छत्तीसगढ़ में प्रकाशित होने वाला प्रथम समाचार पत्र कौन-सा था?", "opts": ["महाकोशल", "छत्तीसगढ़ मित्र (1900)", "हिंद केसरी", "उत्थान"], "ans": 1, "exp": "माधवराव सप्रे ने 1900 में पेंड्रा रोड से 'छत्तीसगढ़ मित्र' मासिक पत्रिका शुरू की।"}, {"q": "1918 में 'होमरूल लीग' की रायपुर शाखा के प्रमुख नेता कौन थे?", "opts": ["पं. रविशंकर शुक्ल व वामनराव लाखे", "हनुमान सिंह", "अजीत जोगी", "खूबचंद बघेल"], "ans": 0, "exp": "पं. रविशंकर शुक्ल, वामनराव लाखे और ई. राघवेंद्र राव ने होमरूल आंदोलन को गति दी।"}, {"q": "1920 के धमतरी कंडेल नहर सत्याग्रह के प्रमुख सूत्रधार कौन थे?", "opts": ["पं. सुंदरलाल शर्मा", "ठाकुर प्यारेलाल", "बलीराम दुबे", "यति यतनलाल"], "ans": 0, "exp": "पं. सुंदरलाल शर्मा, छोटे लाल श्रीवास्तव व नत्थूजी जगताप ने कंडेल नहर सत्याग्रह चलाया।"}, {"q": "1922 का प्रसिद्ध 'सिहावा-नगरी जंगल सत्याग्रह' किस जिले में हुआ था?", "opts": ["धमतरी", "बिलासपुर", "महासमुंद", "राजनांदगांव"], "ans": 0, "exp": "श्यामलाल सोम के नेतृत्व में धमतरी के सिहावा-नगरी में प्रथम जंगल सत्याग्रह हुआ।"}, {"q": "1930 का 'रुद्री-नवागांव जंगल सत्याग्रह' किस आंदोलन के दौरान हुआ?", "opts": ["असहयोग आंदोलन", "सविनय अवज्ञा आंदोलन", "भारत छोड़ो आंदोलन", "स्वदेशी आंदोलन"], "ans": 1, "exp": "सविनय अवज्ञा आंदोलन (1930) के दौरान नत्थूजी जगताप व नारायणराव मेघावाले के नेतृत्व में हुआ।"}, {"q": "1930 में 'बिलासपुर वानर सेना' का गठन किसने किया था?", "opts": ["वासुदेव देवरस", "बलिराम आजाद", "यदुनंदन प्रसाद", "रामगोपाल तिवारी"], "ans": 0, "exp": "बिलासपुर में वासुदेव देवरस तथा रायपुर में बलिराम दुबे 'आजाद' ने वानर सेना बनाई।"}, {"q": "महात्मा गांधी का दूसरी बार छत्तीसगढ़ आगमन किस वर्ष हुआ?", "opts": ["1930", "1933 (हरिजन उद्धार यात्रा)", "1937", "1942"], "ans": 1, "exp": "नवंबर 1933 में गांधीजी अछूतोद्धार कार्यक्रम के तहत दूसरी बार छत्तीसगढ़ आए थे।"}, {"q": "छत्तीसगढ़ में 'अछूतोद्धार' के लिए गांधीजी ने किसे अपना 'अग्रज / गुरु' कहकर सम्मानित किया?", "opts": ["पं. सुंदरलाल शर्मा", "खूबचंद बघेल", "ठाकुर प्यारेलाल", "माधवराव सप्रे"], "ans": 0, "exp": "गांधीजी ने राजीवलोचन मंदिर में हरिजन प्रवेश कराने पर पं. सुंदरलाल शर्मा की सराहना की।"}, {"q": "1942 के 'रायपुर षड्यंत्र केस' के प्रमुख नायक कौन थे?", "opts": ["परसराम सोनी", "बिलख नारायण अग्रवाल", "ईश्वरीचरण शुक्ल", "रघुनंदन सिंगरौल"], "ans": 0, "exp": "परसराम सोनी ने रायपुर में क्रांतिकारी बम व हथियार निर्माण दल का नेतृत्व किया।"}, {"q": "1942 का 'रायपुर डायनामाइट कांड' किसके नेतृत्व में हुआ था?", "opts": ["बिलख नारायण अग्रवाल", "परसराम सोनी", "त्रेतानाथ तिवारी", "क्रांति कुमार"], "ans": 0, "exp": "बिलख नारायण अग्रवाल के नेतृत्व में रायपुर सेंट्रल जेल की दीवार तोड़ने की योजना बनी थी।"}, {"q": "1947 में भारत की स्वतंत्रता के समय राजनांदगांव रियासत के शासक कौन थे?", "opts": ["महंत सर्वेश्वरदास", "दिग्विजय दास", "घासीदास", "प्रवीरचंद भंजदेव"], "ans": 1, "exp": "विलय के समय महंत दिग्विजय दास राजनांदगांव रियासत के शासक थे।"}, {"q": "1937 में 'छत्तीसगढ़ किसान सभा' की स्थापना किसके द्वारा की गई थी?", "opts": ["डॉ. खूबचंद बघेल", "ठाकुर प्यारेलाल सिंह", "पं. सुंदरलाल शर्मा", "रामानंद दुबे"], "ans": 0, "exp": "खूबचंद बघेल व अन्य नेताओं ने किसान अधिकारों के लिए किसान संगठनों को मजबूत किया।"}, {"q": "छत्तीसगढ़ का कुल भौगोलिक क्षेत्रफल लगभग कितना है?", "opts": ["1,35,192 वर्ग किमी", "1,45,200 वर्ग किमी", "1,25,190 वर्ग किमी", "1,52,000 वर्ग किमी"], "ans": 0, "exp": "छत्तीसगढ़ का क्षेत्रफल 1,35,192 वर्ग किमी है, जो भारत के कुल क्षेत्रफल का 4.11% है।"}, {"q": "कर्क रेखा (Tropic of Cancer) छत्तीसगढ़ के कितने जिलों से होकर गुजरती है?", "opts": ["2", "3", "4", "5"], "ans": 2, "exp": "कर्क रेखा राज्य के उत्तरी भाग (मनेंद्रगढ़-चिरमिरी-भरतपुर, कोरिया, सूरजपुर, बलरामपुर) 4 जिलों से गुजरती है।"}, {"q": "छत्तीसगढ़ की सीमा भारत के कितने राज्यों को स्पर्श करती है?", "opts": ["5", "6", "7", "8"], "ans": 2, "exp": "यह 7 राज्यों (MP, UP, झारखंड, ओडिशा, आंध्रप्रदेश, तेलंगाना, महाराष्ट्र) से सीमा साझा करता है।"}, {"q": "बस्तर के पठार की सबसे ऊँची चोटी 'नंदीराज' (1210 मी.) किस पहाड़ी पर स्थित है?", "opts": ["अबूझमाड़", "बैलाडीला पहाड़ी", "केशकाल घाटी", "सीतालेखनी"], "ans": 1, "exp": "नंदीराज चोटी दंतेवाड़ा जिले की बैलाडीला पहाड़ी में स्थित है।"}, {"q": "छत्तीसगढ़ में सर्वाधिक वर्षा किस क्षेत्र में होती है?", "opts": ["कवर्धा", "अबूझमाड़ (नारायणपुर)", "दुर्ग", "बिलासपुर"], "ans": 1, "exp": "नारायणपुर के अबूझमाड़ क्षेत्र में सर्वाधिक वर्षा (~187 सेमी) होने से इसे छत्तीसगढ़ का चेरापूंजी कहते हैं।"}, {"q": "हसदेव नदी का उद्गम किस जिले की कैमूर पहाड़ियों (देवगढ़) से होता है?", "opts": ["मनेंद्रगढ़-चिरमिरी-भरतपुर / कोरिया", "सरगुजा", "कोरबा", "जशपुर"], "ans": 0, "exp": "हसदेव नदी का उद्गम सोनहत (कोरिया/MCB) की देवगढ़ पहाड़ी से होता है।"}, {"q": "छत्तीसगढ़ का सबसे चौड़ा जलप्रपात कौन-सा है?", "opts": ["तीरथगढ़", "चित्रकोट", "अमृतधारा", "रक्सगंडा"], "ans": 1, "exp": "बस्तर का चित्रकोट जलप्रपात (इंद्रावती नदी पर) भारत का सबसे चौड़ा जलप्रपात है।"}, {"q": "छत्तीसगढ़ का सबसे ऊँचा जलप्रपात 'तीरथगढ़' किस नदी पर स्थित है?", "opts": ["शबरी", "मुनगाबहार नदी", "हसदेव", "रिहंद"], "ans": 1, "exp": "तीरथगढ़ जलप्रपात कांगेर घाटी में कांगेर की सहायक मुनगाबहार नदी पर स्थित है।"}, {"q": "मिनीमाता (हसदेव बांगो) परियोजना छत्तीसगढ़ की पहली बहुउद्देशीय परियोजना किस वर्ष शुरू हुई?", "opts": ["1967", "1978", "1985", "1992"], "ans": 0, "exp": "कोरबा में स्थित हसदेव बांगो बांध का निर्माण 1967 में प्रारंभ हुआ और इसका ऊँचाई 87 मीटर है।"}, {"q": "तांदुला जलाशय (1913) छत्तीसगढ़ की प्रथम सिंचाई परियोजना किस जिले में स्थित है?", "opts": ["दुर्ग", "बालोद", "धमतरी", "राजनांदगांव"], "ans": 1, "exp": "तांदुला बांध बालोद जिले में तांदुला व सूखा नदी के संगम पर निर्मित राज्य की पहली परियोजना है।"}, {"q": "खूंटाघाट (संजय गांधी) परियोजना किस नदी पर स्थित है?", "opts": ["अरपा", "खारंग नदी", "लीलागर", "मनियारी"], "ans": 1, "exp": "बिलासपुर जिले में खारंग नदी पर खूंटाघाट बांध स्थित है।"}, {"q": "क्षेत्रफल के आधार पर भारत में वन आवरण की दृष्टि से छत्तीसगढ़ का कौन-सा स्थान है?", "opts": ["प्रथम", "द्वितीय", "तृतीय", "चतुर्थ"], "ans": 2, "exp": "मध्यप्रदेश और अरुणाचल प्रदेश के बाद छत्तीसगढ़ देश में तीसरे स्थान पर है।"}, {"q": "छत्तीसगढ़ के वनों में सर्वाधिक किस प्रजाति के वृक्ष पाए जाते हैं?", "opts": ["सागौन", "साल (सरई)", "बांस", "बीजा"], "ans": 1, "exp": "छत्तीसगढ़ के कुल वन क्षेत्र में लगभग 40.56% भाग पर साल के वृक्ष हैं (साल वनों का द्वीप - बस्तर)।"}, {"q": "बस्तर का 'साल वनों का द्वीप' किसे कहा जाता है?", "opts": ["बस्तर क्षेत्र", "सरगुजा", "कवर्धा", "जशपुर"], "ans": 0, "exp": "साल वृक्षों की सघनता के कारण बस्तर को साल वनों का द्वीप कहा जाता है।"}, {"q": "सीतानदी वन्यजीव अभयारण्य (1974) किस जिले में स्थित है और यह राज्य का सबसे पुराना अभयारण्य है?", "opts": ["गरियाबंद", "धमतरी", "महासमुंद", "बलौदाबाजार"], "ans": 1, "exp": "धमतरी जिले का सीतानदी अभयारण्य राज्य का सबसे प्राचीन अभयारण्य है।"}, {"q": "उदंती वन्यजीव अभयारण्य मुख्य रूप से किस पशु के संरक्षण के लिए प्रसिद्ध है?", "opts": ["बाघ", "वन भैंसा", "तेंदुआ", "नीलगाय"], "ans": 1, "exp": "गरियाबंद स्थित उदंती अभयारण्य राजकीय पशु वन भैंसा के संरक्षण के लिए प्रसिद्ध है।"}, {"q": "कुटुमसर की अंधी मछलियों ('शंकरा') वाली गुफाएँ किस राष्ट्रीय उद्यान में स्थित हैं?", "opts": ["इंद्रावती", "गुरु घासीदास", "कांगेर घाटी", "अचानकमार"], "ans": 2, "exp": "कांगेर घाटी राष्ट्रीय उद्यान (बस्तर) में कुटुमसर, कैलाश व दंडक गुफाएँ स्थित हैं।"}, {"q": "लेमरू एलीफेंट रिजर्व (हाथी अभयारण्य) किस जिले में स्थित है?", "opts": ["कोरबा", "बस्तर", "दुर्ग", "कवर्धा"], "ans": 0, "exp": "कोरबा जिले में मानव-हाथी द्वंद्व रोकने के लिए लेमरू एलीफेंट रिजर्व बनाया गया है।"}, {"q": "छत्तीसगढ़ में 'काली मिट्टी' को स्थानीय भाषा में किस नाम से जाना जाता है?", "opts": ["मटासी", "कन्हार", "डोरसा", "भाटा"], "ans": 1, "exp": "काली मिट्टी को कन्हार, लाल-पीली को मटासी, मिश्रित को डोरसा और लैटेराइट को भाटा कहते हैं।"}, {"q": "कोटरी नदी किस बड़ी नदी की प्रमुख सहायक नदी है?", "opts": ["महानदी", "इंद्रावती", "सोन", "नर्मदा"], "ans": 1, "exp": "मोहला-मानपुर से निकलने वाली कोटरी नदी इंद्रावती की सबसे बड़ी सहायक नदी है।"}, {"q": "बैगा जनजाति के प्रमुख पारंपरिक नृत्य कौन-से हैं?", "opts": ["करमा, बिलमा, परधौनी", "पंथी, राउत नाचा", "डंडारी", "गौर"], "ans": 0, "exp": "बैगा जनजाति में करमा, बिलमा, शैला और विवाह पर परधौनी नृत्य प्रसिद्ध है।"}, {"q": "छत्तीसगढ़ की कौन-सी जनजाति बाँस शिल्प (Bamboo Craft) के लिए प्रसिद्ध है?", "opts": ["कमार, कंडरा व बिरहोर", "हल्बा", "भतरा", "कंवर"], "ans": 0, "exp": "कमार और कंडरा जनजातियाँ बाँस से बर्तन और टोकरी बनाने में पारंगत हैं।"}, {"q": "छत्तीसगढ़ की 'खोरिया' और 'गौरा-गौरी' पूजा किस जनजाति व अंचल में प्रसिद्ध है?", "opts": ["गोंड / मैदानी अंचल", "कोरवा", "बिरहोर", "सौरा"], "ans": 0, "exp": "कार्तिक अमावस्या (दीपावली) पर गौरा-गौरी (शिव-पार्वती) की पूजा पूरे अंचल में होती है।"}, {"q": "गोंड जनजाति के प्रमुख देवता कौन हैं?", "opts": ["बूढ़ादेव", "सिंघबोंगा", "खूंटादेव", "दंतेश्वरी"], "ans": 0, "exp": "गोंड जनजाति में बूढ़ादेव (साल वृक्ष में निवास) व दूल्हादेव की पूजा की जाती है।"}, {"q": "किस पर्व पर बहनें अपने भाई के जीवन की मंगलकामना के लिए 'भोजली' विसर्जित करती हैं?", "opts": ["तीजा", "भोजली (रक्षाबंधन के दूसरे दिन)", "पोला", "हरेली"], "ans": 1, "exp": "भाद्रपद कृष्ण प्रतिपदा को 'भोजली' पर्व मित्रता और भाईचारे के प्रतीक रूप में मनाया जाता है।"}, {"q": "माटी से बने बैलों की पूजा छत्तीसगढ़ के किस पर्व पर की जाती है?", "opts": ["हरेली", "पोला", "तीजा", "नवाखाई"], "ans": 1, "exp": "भाद्रपद अमावस्या को 'पोला' पर्व पर किसान बैलों और बच्चे मिट्टी के नंदी की पूजा करते हैं।"}, {"q": "स्त्रियाँ अपने मायके जाकर निर्जला व्रत किस छत्तीसगढ़ी पर्व पर रखती हैं?", "opts": ["हरतालिका तीज (तीजा)", "कमछठ", "गौरा", "अक्ती"], "ans": 0, "exp": "भाद्रपद शुक्ल तृतीया को 'तीजा' पर्व पर विवाहित महिलाएँ मायके में व्रत रखती हैं।"}, {"q": "वैशाख शुक्ल तृतीया को गुड़िया विवाह (पुतरा-पुतरी) किस पर्व पर किया जाता है?", "opts": ["अक्ती (अक्षय तृतीया)", "चेरा-छेरा", "पुन्नी", "नवाखाई"], "ans": 0, "exp": "अक्ती के दिन बच्चे मिट्टी के पुतरा-पुतरी का विवाह रचाते हैं और किसान धान बोने का शगुन करते हैं।"}, {"q": "बस्तर दशहरा की किस रस्म में रथ बनाने के लिए जंगल से पहली लकड़ी लाई जाती है?", "opts": ["काछन गादी", "पाट जात्रा", "जोगी बिठाई", "मुरिया दरबार"], "ans": 1, "exp": "बस्तर दशहरा का शुभारंभ 'पाट जात्रा' रस्म से होता है।"}, {"q": "'गौर नृत्य' (माड़िया जनजाति द्वारा भैंसे के सींग लगाकर किया जाने वाला नृत्य) को विश्व के सबसे सुंदर लोकनृत्यों में किसने गिना था?", "opts": ["वेरियर एल्विन", "ग्रियर्सन", "श्यामाचरण दुबे", "हीरा लाल"], "ans": 0, "exp": "प्रसिद्ध मानवविज्ञानी वेरियर एल्विन ने गौर नृत्य को संसार का सबसे सुंदर नृत्य कहा था।"}, {"q": "कंवर और उरांव जनजातियों में भादो माह में फसल कटाई के समय कौन-सा नृत्य होता है?", "opts": ["करमा नृत्य", "पंथी", "सुआ", "भड़ौनी"], "ans": 0, "exp": "करमा नृत्य छत्तीसगढ़ की कई जनजातियों में कर्मदेव की आराधना के रूप में लोकप्रिय है।"}, {"q": "'ककसार नृत्य' किस जनजाति के युवाओं द्वारा अबूझमाड़ क्षेत्र में किया जाता है?", "opts": ["अबूझमाड़िया", "बैगा", "बिरहोर", "पंडो"], "ans": 0, "exp": "अबूझमाड़िया जनजाति में ककसार देवता की पूजा के बाद ककसार नृत्य किया जाता है।"}, {"q": "छत्तीसगढ़ की 'सूरुज बाई खांडे' किस लोकगायन विधा के लिए प्रसिद्ध थीं?", "opts": ["भरथरी गायन", "पंडवानी", "ददरिया", "बांसगीत"], "ans": 0, "exp": "सूरुज बाई खांडे भरथरी (राजा भर्तृहरि की कथा) गायन की सुप्रसिद्ध कलाकार थीं।"}, {"q": "'लोकगीतों का राजा' किसे कहा जाता है?", "opts": ["सुआ गीत", "ददरिया", "सोहर", "बिहाव गीत"], "ans": 1, "exp": "श्रृंगार और प्रेम से परिपूर्ण 'ददरिया' को छत्तीसगढ़ी लोकगीतों का राजा कहा जाता है।"}, {"q": "छत्तीसगढ़ में बांस गीत (मुख्यतः राउत समुदाय द्वारा) किसकी कथा पर गाया जाता है?", "opts": ["राजा मोरध्वज और कर्ण", "नल-दमयंती", "लोरिक-चंदा", "सीता-राम"], "ans": 0, "exp": "राउत जाति के गायक बांस की लंबी बांसुरी के साथ मोरध्वज, कर्ण और शीतबसंत की कथा गाते हैं।"}, {"q": "छत्तीसगढ़ी आभूषण 'सुता' और 'हंसुली' शरीर के किस अंग में पहने जाते हैं?", "opts": ["हाथ", "गला", "पैर", "कान"], "ans": 1, "exp": "सुता, हंसुली, पुतरी और दुलरी गले में पहने जाने वाले पारंपरिक आभूषण हैं।"}, {"q": "'खिनवा' और 'ढार' नामक आभूषण कहाँ पहने जाते हैं?", "opts": ["नाक", "कान", "कमर", "कलाई"], "ans": 1, "exp": "खिनवा, ढार, तरकी और खुंटी कान के पारंपरिक आभूषण हैं।"}, {"q": "छत्तीसगढ़ी आभूषण 'बनउरिया' और 'ऐंठी' किस अंग में पहने जाते हैं?", "opts": ["हाथ / कलाई / बांह", "पैर", "गला", "सिर"], "ans": 0, "exp": "बनउरिया, ऐंठी, पहुँची और नागमोरी बांह व कलाई में पहने जाते हैं।"}, {"q": "छत्तीसगढ़ी हाना (लोकोक्ति): 'नाचे न जाने आंगन टेढ़' का समानार्थी छत्तीसगढ़ी हाना क्या है?", "opts": ["करिया अछर भैंस बराबर", "नाचे न जानै अंगना टेड़गा", "घर के मुरगी दार बराबर", "कोदो देके पढ़ना"], "ans": 1, "exp": "अपनी कमजोरी छुपाकर साधन को दोष देने के लिए यह लोकोक्ति प्रयुक्त होती है।"}, {"q": "छत्तीसगढ़ी जनउला 'करिया गाय कलिंदर खाय, दुहते जाय पन्हते जाय' का सही उत्तर क्या है?", "opts": ["कुआँ / रहट", "चक्की (जाता)", "महुआ", "बेलन"], "ans": 1, "exp": "इस जनउला का सही उत्तर 'जाता' (अनाज पीसने की चक्की) है।"}, {"q": "छत्तीसगढ़ राज्य में सर्वाधिक सिंचित क्षेत्र किस माध्यम से होता है?", "opts": ["नहरें", "नलकूप", "तालाब", "कुआँ"], "ans": 0, "exp": "राज्य में कुल सिंचित क्षेत्र का लगभग 52-55% हिस्सा नहरों द्वारा सिंचित होता है।"}, {"q": "छत्तीसगढ़ में 'डोलोमाइट' का प्रमुख उत्पादक क्षेत्र कौन-सा है?", "opts": ["हिर्री (बिलासपुर) व भाटापारा", "बैलाडीला", "मैनपाट", "गरियाबंद"], "ans": 0, "exp": "बिलासपुर की हिर्री खदान डोलोमाइट उत्पादन के लिए प्रसिद्ध है।"}, {"q": "छत्तीसगढ़ में कोरंडम (Corundum) किस जिले के भोपालपटनम व कुचनूर में पाया जाता है?", "opts": ["बीजापुर", "सुकमा", "कोरबा", "रायगढ़"], "ans": 0, "exp": "बीजापुर जिले में उच्च श्रेणी का कोरंडम खनिज पाया जाता है।"}, {"q": "छत्तीसगढ़ राज्य विद्युत मंडल (CSEB) का गठन कब हुआ था?", "opts": ["15 नवंबर 2000", "1 दिसंबर 2000", "1 जनवरी 2001", "26 जनवरी 2001"], "ans": 0, "exp": "छत्तीसगढ़ राज्य विद्युत मंडल का गठन 15 नवंबर 2000 को हुआ था (2008 में 5 कंपनियों में पुनर्गठित)।"}, {"q": "छत्तीसगढ़ का प्रथम जूट मिल (मोहन जूट मिल - 1935) किस जिले में स्थापित हुआ था?", "opts": ["रायगढ़", "दुर्ग", "राजनांदगांव", "बिलासपुर"], "ans": 0, "exp": "मोहन जूट मिल की स्थापना 1935 में रायगढ़ में हुई थी।"}, {"q": "राजनांदगांव स्थित प्रसिद्ध 'बंगाल-नागपुर कॉटन मिल (BNC Mill)' की स्थापना कब हुई?", "opts": ["1892", "1905", "1920", "1935"], "ans": 0, "exp": "BNC मिल की स्थापना 1892 में हुई, जो राज्य की पहली सूती वस्त्र मिल थी।"}, {"q": "ग्रामीण महिलाओं को आर्थिक संबल देने वाली 'महतारी वंदन योजना' की शुरुआत कब हुई?", "opts": ["मार्च 2024", "जनवरी 2023", "नवंबर 2024", "अप्रैल 2025"], "ans": 0, "exp": "मार्च 2024 में महतारी वंदन योजना के तहत ₹1,000 मासिक राशि का अंतरण प्रारंभ हुआ।"}, {"q": "छत्तीसगढ़ राज्य के प्रथम विधानसभा अध्यक्ष कौन थे?", "opts": ["राजेंद्र प्रसाद शुक्ल", "धरमलाल कौशिक", "प्रेमप्रकाश पांडेय", "गौरीशंकर अग्रवाल"], "ans": 0, "exp": "पं. राजेंद्र प्रसाद शुक्ल छत्तीसगढ़ विधानसभा के प्रथम अध्यक्ष थे।"}, {"q": "छत्तीसगढ़ में नगर निगम बनने के लिए न्यूनतम कितनी जनसंख्या आवश्यक है?", "opts": ["50,000", "1,00,000", "3,00,000", "5,00,000"], "ans": 1, "exp": "छत्तीसगढ़ में 1 लाख से अधिक जनसंख्या वाले शहरों में नगर निगम का गठन किया जाता है।"}, {"q": "छत्तीसगढ़ में कितनी नगर निगम (Municipal Corporations) वर्तमान में कार्यरत हैं?", "opts": ["10", "12", "14", "16"], "ans": 2, "exp": "छत्तीसगढ़ में वर्तमान में 14 नगर निगम हैं (रिसाली नवीनतम नगर निगमों में से एक है)।"}, {"q": "राज्य की नगरीय प्रशासन व्यवस्था में 'नगर पंचायत' किस स्तर के क्षेत्र के लिए होती है?", "opts": ["महानगर", "संक्रमणकालीन ग्रामीण से शहरी क्षेत्र", "छोटा शहर", "जिला मुख्यालय"], "ans": 1, "exp": "गांव से शहर में परिवर्तित हो रहे संक्रमणशील क्षेत्रों के लिए नगर पंचायत गठित होती है।"}, {"q": "छत्तीसगढ़ का राजकीय पशु 'वन भैंसा' मुख्य रूप से किस अभयारण्य में संरक्षित है?", "opts": ["उदंती-सीतानदी", "अचानकमार", "गोमर्डा", "भोरमदेव"], "ans": 0, "exp": "गरियाबंद स्थित उदंती-सीतानदी अभयारण्य वन भैंसा का प्रमुख आवास है।"}, {"q": "छत्तीसगढ़ में 'छत्तीसगढ़िया ओलंपिक' या 'बस्तर ओलंपिक' में कितने पारंपरिक खेलों को बढ़ावा दिया जाता है?", "opts": ["ग्रामीण व जनजातीय खेल", "केवल क्रिकेट", "केवल शतरंज", "केवल हॉकी"], "ans": 0, "exp": "स्थानीय एवं जनजातीय खेल प्रतिभाओं को मंच देने हेतु बस्तर ओलंपिक का आयोजन किया जाता है।"}, {"q": "छत्तीसगढ़ में 'राजीव गांधी किसान न्याय योजना' के स्थान पर किसानों की आय बढ़ाने हेतु कौन-सी योजना संचालित है?", "opts": ["कृषक उन्नति योजना", "भूमिहीन न्याय योजना", "गोधन योजना", "रोका-छेका"], "ans": 0, "exp": "कृषक उन्नति योजना के तहत धान व वैकल्पिक फसलों पर किसानों को आदान सहायता दी जाती है।"}, {"q": "छत्तीसगढ़ लोक सेवा आयोग (CGPSC) का मुख्यालय कहाँ स्थित है?", "opts": ["बिलासपुर", "नवा रायपुर (अटल नगर)", "दुर्ग", "जगदलपुर"], "ans": 1, "exp": "CGPSC का मुख्यालय नवा रायपुर अटल नगर में स्थित है।"}, {"q": "छत्तीसगढ़ का पहला 'सॉफ्टवेयर टेक्नोलॉजी पार्क' (STPI) कहाँ स्थापित किया गया है?", "opts": ["भिलाई (दुर्ग)", "कोरबा", "बिलासपुर", "राजनांदगांव"], "ans": 0, "exp": "भिलाई में प्रदेश का प्रथम सॉफ्टवेयर टेक्नोलॉजी पार्क स्थापित किया गया था।"}, {"q": "छत्तीसगढ़ में 'तेंदूपत्ता' का सर्वाधिक संग्रहण किस क्षेत्र में होता है?", "opts": ["बस्तर और सरगुजा वन क्षेत्र", "दुर्ग मैदानी क्षेत्र", "बेमेतरा", "जांजगीर"], "ans": 0, "exp": "बस्तर और सरगुजा के सघन वन क्षेत्रों में सर्वाधिक तेंदूपत्ता संग्रहण होता है।"}, {"q": "छत्तीसगढ़ की प्रमुख सिंचाई परियोजना 'सोंढूर परियोजना' किस जिले में स्थित है?", "opts": ["धमतरी", "बिलासपुर", "सरगुजा", "रायगढ़"], "ans": 0, "exp": "धमतरी जिले में सोंढूर नदी पर सोंढूर जलाशय निर्मित है।"}, {"q": "छत्तीसगढ़ के किस जिले को 'टमाटर की राजधानी' कहा जाता है?", "opts": ["लुडेंग (जशपुर)", "दुर्ग", "महासमुंद", "कांकेर"], "ans": 0, "exp": "जशपुर जिले का लुडेंग क्षेत्र टमाटर के भारी उत्पादन के कारण टमाटर की राजधानी कहलाता है।"}, {"q": "छत्तीसगढ़ के उच्च न्यायालय बिलासपुर की मुख्य पीठ के अंतर्गत प्रदेश के सभी कितने जिले आते हैं?", "opts": ["सभी 33 जिले", "केवल 18 जिले", "केवल 28 जिले", "केवल 20 जिले"], "ans": 0, "exp": "छत्तीसगढ़ के समस्त 33 जिले बिलासपुर उच्च न्यायालय के न्यायिक क्षेत्राधिकार में आते हैं।"}]}, "india_gk_s1": {"title": "🇮🇳 भारत का सामान्य ज्ञान — सेट 1 (100 प्रश्न)", "questions": [{"q": "सिंधु घाटी सभ्यता का प्रसिद्ध बंदरगाह नगर 'लोथल' किस राज्य में स्थित है?", "opts": ["राजस्थान", "गुजरात", "हरियाणा", "पंजाब"], "ans": 1, "exp": "लोथल गुजरात में भोगवा नदी के किनारे स्थित हड़प्पा कालीन प्रमुख बंदरगाह था।"}, {"q": "गौतम बुद्ध ने अपना प्रथम उपदेश (धर्मचक्रप्रवर्तन) कहाँ दिया था?", "opts": ["बोधगया", "सारनाथ", "कुशीनगर", "लुम्बिनी"], "ans": 1, "exp": "बुद्ध ने वाराणसी के निकट सारनाथ (ऋषिपत्तन) में प्रथम उपदेश दिया।"}, {"q": "मौर्य वंश के किस शासक ने कलिंग युद्ध के बाद बौद्ध धर्म स्वीकार किया?", "opts": ["चंद्रगुप्त मौर्य", "बिंदुसार", "अशोक", "बृहद्रथ"], "ans": 2, "exp": "261 ईसा पूर्व में कलिंग युद्ध के भीषण नरसंहार के बाद सम्राट अशोक ने धम्म नीति अपनाई।"}, {"q": "गुप्त काल को भारतीय इतिहास का 'स्वर्ण युग' क्यों कहा जाता है?", "opts": ["कला, साहित्य व विज्ञान की चरम उन्नति के कारण", "केवल सैन्य विजय के कारण", "विदेशी व्यापार बंद होने से", "कृषि न होने से"], "ans": 0, "exp": "कालिदास, आर्यभट्ट व मंदिर स्थापत्य कला के विकास के कारण गुप्त काल को स्वर्ण युग कहा जाता है।"}, {"q": "दिल्ली सल्तनत में 'बाजार नियंत्रण प्रणाली' किस सुल्तान ने लागू की थी?", "opts": ["इल्तुतमिश", "अलाउद्दीन खिलजी", "बलबन", "फिरोजशाह तुगलक"], "ans": 1, "exp": "अलाउद्दीन खिलजी ने सैनिकों को सस्ती दरों पर वस्तुएँ उपलब्ध कराने हेतु बाजार नियंत्रण लागू किया।"}, {"q": "पानीपत का प्रथम युद्ध (1526 ई.) किसके बीच हुआ था?", "opts": ["बाबर और इब्राहिम लोदी", "अकबर और हेमू", "अहमदशाह अब्दाली और मराठे", "हुमायूँ और शेरशाह"], "ans": 0, "exp": "21 अप्रैल 1526 को बाबर ने इब्राहिम लोदी को हराकर भारत में मुगल साम्राज्य की नींव रखी।"}, {"q": "मुगल सम्राट अकबर द्वारा 'दीन-ए-इलाही' धर्म किस वर्ष चलाया गया?", "opts": ["1575", "1582", "1556", "1605"], "ans": 1, "exp": "1582 ई. में अकबर ने सभी धर्मों के सार के रूप में दीन-ए-इलाही की शुरुआत की।"}, {"q": "छत्रपति शिवाजी महाराज के मंत्रिपरिषद को क्या कहा जाता था?", "opts": ["अष्टदिग्गज", "अष्टप्रधान", "नवरत्न", "सप्तांग"], "ans": 1, "exp": "मराठा प्रशासन में 8 मंत्रियों की परिषद 'अष्टप्रधान' कहलाती थी।"}, {"q": "1757 ई. के प्लासी के युद्ध में अंग्रेजों का नेतृत्व किसने किया था?", "opts": ["लॉर्ड क्लाइव", "हेक्टर मुनरो", "वॉरेन हेस्टिंग्स", "लॉर्ड वेलेजली"], "ans": 0, "exp": "रॉबर्ट क्लाइव ने बंगाल के नवाब सिराजुद्दौला को प्लासी के युद्ध में पराजित किया।"}, {"q": "भारत में 'स्थायी बंदोबस्त' (Permanent Settlement 1793) किसने लागू किया?", "opts": ["लॉर्ड कार्नवालिस", "लॉर्ड डलहौजी", "लॉर्ड विलियम बेंटिंक", "लॉर्ड कैनिंग"], "ans": 0, "exp": "1793 ई. में लॉर्ड कार्नवालिस ने बंगाल, बिहार व उड़ीसा में स्थायी बंदोबस्त लागू किया।"}, {"q": "1829 ई. में 'सती प्रथा' पर कानूनी रोक लगाने वाले गवर्नर जनरल कौन थे?", "opts": ["लॉर्ड डलहौजी", "लॉर्ड विलियम बेंटिंक", "लॉर्ड कर्जन", "लॉर्ड रिपन"], "ans": 1, "exp": "राजा राममोहन राय के प्रयासों से 1829 में लॉर्ड विलियम बेंटिंक ने सती प्रथा का उन्मूलन किया।"}, {"q": "1857 की क्रांति की शुरुआत 10 मई 1857 को कहाँ से हुई थी?", "opts": ["दिल्ली", "मेरठ", "कानपुर", "बैरकपुर"], "ans": 1, "exp": "10 मई 1857 को मेरठ की सैनिक छावनी से 1857 का विद्रोह प्रारंभ हुआ।"}, {"q": "भारतीय राष्ट्रीय कांग्रेस की स्थापना 1885 में कहाँ हुई थी?", "opts": ["कोलकाता", "मुंबई", "दिल्ली", "लाहौर"], "ans": 1, "exp": "28 दिसंबर 1885 को ए.ओ. ह्यूम के प्रयास से मुंबई के गोकुलदास तेजपाल संस्कृत कॉलेज में कांग्रेस की स्थापना हुई।"}, {"q": "बंगाल विभाजन (1905) किस वायसराय के काल में हुआ था?", "opts": ["लॉर्ड कर्जन", "लॉर्ड हार्डिंग", "लॉर्ड मिंटो", "लॉर्ड इरविन"], "ans": 0, "exp": "1905 में लॉर्ड कर्जन ने प्रशासनिक कारणों का हवाला देकर बंगाल का विभाजन किया।"}, {"q": "'स्वराज मेरा जन्मसिद्ध अधिकार है और मैं इसे लेकर रहूँगा' यह नारा किसने दिया?", "opts": ["लाला लाजपत राय", "बाल गंगाधर तिलक", "बिपिन चंद्र पाल", "सुभाष चंद्र बोस"], "ans": 1, "exp": "लोकमान्य बाल गंगाधर तिलक ने 1916 के होमरूल आंदोलन के समय यह प्रसिद्ध नारा दिया।"}, {"q": "जलियाँवाला बाग हत्याकांड (13 अप्रैल 1919) किस शहर में हुआ था?", "opts": ["लाहौर", "अमृतसर", "चंडीगढ़", "दिल्ली"], "ans": 1, "exp": "अमृतसर के जलियाँवाला बाग में जनरल डायर ने शांतिपूर्ण सभा पर गोली चलवाई थी।"}, {"q": "महात्मा गांधी ने 'असहयोग आंदोलन' किस घटना के बाद वापस ले लिया?", "opts": ["जलियाँवाला बाग", "चौरी-चौरा कांड (1922)", "काकोरी कांड", "गांधी-इरविन समझौता"], "ans": 1, "exp": "5 फरवरी 1922 को गोरखपुर के चौरी-चौरा में पुलिस थाने में आग लगाए जाने के बाद आंदोलन स्थगित हुआ।"}, {"q": "'करो या मरो' (Do or Die) का नारा गांधीजी ने किस आंदोलन में दिया?", "opts": ["असहयोग आंदोलन", "सविनय अवज्ञा", "भारत छोड़ो आंदोलन (1942)", "चंपारण सत्याग्रह"], "ans": 2, "exp": "8 अगस्त 1942 को भारत छोड़ो आंदोलन के अवसर पर मुंबई के ग्वालिया टैंक मैदान से यह नारा दिया।"}, {"q": "आजाद हिंद फौज (INA) की कमान सिंगापुर में 1943 में किसने संभाली?", "opts": ["रासबिहारी बोस", "सुभाष चंद्र बोस", "मोहन सिंह", "शाहनवाज खान"], "ans": 1, "exp": "1943 में नेताजी सुभाष चंद्र बोस ने सिंगापुर में आजाद हिंद फौज और अस्थायी सरकार का नेतृत्व किया।"}, {"q": "'आर्य समाज' की स्थापना 1875 ई. में किसने की थी?", "opts": ["राजा राममोहन राय", "स्वामी दयानंद सरस्वती", "स्वामी विवेकानंद", "ज्योतिबा फुले"], "ans": 1, "exp": "स्वामी दयानंद सरस्वती ने 1875 में मुंबई में आर्य समाज की स्थापना की और 'वेदों की ओर लौटो' का नारा दिया।"}, {"q": "1929 के कांग्रेस के लाहौर अधिवेशन में किस लक्ष्य की घोषणा की गई थी?", "opts": ["डोमिनियन स्टेटस", "पूर्ण स्वराज", "संविधान सभा", "द्वैध शासन"], "ans": 1, "exp": "पं. जवाहरलाल नेहरू की अध्यक्षता में 1929 के लाहौर अधिवेशन में 'पूर्ण स्वराज' का प्रस्ताव पारित हुआ।"}, {"q": "दांडी मार्च (नमक सत्याग्रह) 12 मार्च 1930 को कहाँ से शुरू हुआ था?", "opts": ["साबरमती आश्रम", "सेवाग्राम", "दांडी", "बारदोली"], "ans": 0, "exp": "गांधीजी ने 78 अनुयायियों के साथ साबरमती आश्रम से दांडी तक 24 दिन की पैदल यात्रा की।"}, {"q": "'अखिल भारतीय मुस्लिम लीग' की स्थापना 1906 में कहाँ हुई थी?", "opts": ["अलीगढ़", "ढाका", "कराची", "लखनऊ"], "ans": 1, "exp": "1906 में ढाका में नवाब सलीमुल्लाह व आगा खां के नेतृत्व में मुस्लिम लीग बनी।"}, {"q": "'सत्यशोधक समाज' की स्थापना किस समाज सुधारक ने की थी?", "opts": ["डॉ. भीमराव अंबेडकर", "महात्मा ज्योतिबा फुले", "ईश्वरचंद्र विद्यासागर", "गोपाल कृष्ण गोखले"], "ans": 1, "exp": "1873 में महाराष्ट्र में ज्योतिबा फुले ने वंचित वर्गों के उत्थान हेतु सत्यशोधक समाज की स्थापना की।"}, {"q": "स्वतंत्र भारत के प्रथम भारतीय गवर्नर जनरल कौन थे?", "opts": ["लॉर्ड माउंटबेटन", "चक्रवर्ती राजगोपालाचारी", "डॉ. राजेंद्र प्रसाद", "सरदार पटेल"], "ans": 1, "exp": "सी. राजगोपालाचारी स्वतंत्र भारत के प्रथम और अंतिम भारतीय गवर्नर जनरल थे।"}, {"q": "भारत की मुख्य भूमि का दक्षिणतम बिंदु (कन्याकुमारी) किस राज्य में है?", "opts": ["केरल", "तमिलनाडु", "आंध्रप्रदेश", "कर्नाटक"], "ans": 1, "exp": "मुख्य भूमि का दक्षिणतम बिंदु केप कोमोरिन (कन्याकुमारी, तमिलनाडु) है, जबकि संपूर्ण भारत का इंदिरा पॉइंट है।"}, {"q": "भारत की सबसे लंबी नदी कौन-सी है?", "opts": ["ब्रह्मपुत्र", "गंगा", "गोदावरी", "सिंधु"], "ans": 1, "exp": "गंगा नदी की कुल लंबाई लगभग 2525 किमी है, जो भारत की सबसे लंबी नदी है।"}, {"q": "प्रायद्वीपीय भारत की सबसे लंबी नदी (जिसे दक्षिण गंगा भी कहते हैं) कौन-सी है?", "opts": ["कृष्णा", "कावेरी", "गोदावरी", "महानदी"], "ans": 2, "exp": "गोदावरी (1465 किमी) प्रायद्वीपीय भारत की सबसे लंबी नदी है।"}, {"q": "भारत में मीठे पानी की सबसे बड़ी झील कौन-सी है?", "opts": ["चिल्का झील", "वुलर झील", "डल झील", "सांभर झील"], "ans": 1, "exp": "जम्मू-कश्मीर में स्थित वुलर झील भारत की सबसे बड़ी मीठे पानी की झील है।"}, {"q": "भारत की सबसे बड़ी खारे पानी की तटीय झील (लैगून) कौन-सी है?", "opts": ["पुलिकट", "चिल्का झील (ओडिशा)", "वेम्बनाड", "कोलेरु"], "ans": 1, "exp": "ओडिशा की चिल्का झील भारत की सबसे बड़ी खारे पानी की लैगून झील है।"}, {"q": "हिमालय की भारत में स्थित सबसे ऊँची चोटी कौन-सी है?", "opts": ["माउंट एवरेस्ट", "कंचनजंघा", "नंदा देवी", "धौलागिरि"], "ans": 1, "exp": "सिक्किम स्थित कंचनजंघा (8586 मी.) भारत में हिमालय की सर्वोच्च चोटी है।"}, {"q": "भारत में सर्वाधिक वर्षा किस मानसून से होती है?", "opts": ["उत्तर-पूर्वी मानसून", "दक्षिण-पश्चिम मानसून", "पश्चिमी विक्षोभ", "चक्रवाती वर्षा"], "ans": 1, "exp": "जून से सितंबर के बीच दक्षिण-पश्चिम मानसून से भारत की लगभग 80% वर्षा होती है।"}, {"q": "कपास की खेती के लिए भारत में कौन-सी मिट्टी सर्वोत्तम मानी जाती है?", "opts": ["जलोढ़ मिट्टी", "काली मिट्टी (रेगुर)", "लाल मिट्टी", "मरुस्थलीय मिट्टी"], "ans": 1, "exp": "काली मिट्टी (रेगुर) में नमी धारण करने की क्षमता अधिक होती है, अतः यह कपास के लिए श्रेष्ठ है।"}, {"q": "भारत में 'हरित क्रांति' का सर्वाधिक सकारात्मक प्रभाव किस फसल पर पड़ा?", "opts": ["चावल", "गेहूँ", "दालें", "तिलहन"], "ans": 1, "exp": "1966-67 की हरित क्रांति (डॉ. एम.एस. स्वामीनाथन) से गेहूँ के उत्पादन में अभूतपूर्व वृद्धि हुई।"}, {"q": "भारत का सबसे लंबा राष्ट्रीय राजमार्ग (National Highway) कौन-सा है?", "opts": ["NH-27", "NH-44", "NH-48", "NH-16"], "ans": 1, "exp": "NH-44 श्रीनगर से कन्याकुमारी तक लगभग 3745 किमी लंबा भारत का सबसे लंबा राजमार्ग है।"}, {"q": "भारत की पहली रेलगाड़ी 1853 में किन दो शहरों के बीच चली थी?", "opts": ["दिल्ली-आगरा", "मुंबई-ठाणे", "कोलकाता-रानीगंज", "मद्रास-अर्कोणम"], "ans": 1, "exp": "16 अप्रैल 1853 को लॉर्ड डलहौजी के काल में मुंबई से ठाणे (34 किमी) के बीच पहली ट्रेन चली।"}, {"q": "झारखंड स्थित 'जादूगोड़ा' की खान किस खनिज के लिए प्रसिद्ध है?", "opts": ["सोना", "यूरेनियम", "तांबा", "बॉक्साइट"], "ans": 1, "exp": "जादूगोड़ा भारत की सबसे प्रसिद्ध यूरेनियम खदान है।"}, {"q": "भारत में 'कोलार स्वर्ण क्षेत्र' किस राज्य में स्थित है?", "opts": ["आंध्रप्रदेश", "कर्नाटक", "तमिलनाडु", "झारखंड"], "ans": 1, "exp": "कोलार गोल्ड फील्ड्स (KGF) कर्नाटक राज्य में स्थित है।"}, {"q": "भारत में सर्वाधिक थोरियम किस राज्य के मोनाजाइट रेत में पाया जाता है?", "opts": ["केरल", "तमिलनाडु", "गुजरात", "महाराष्ट्र"], "ans": 0, "exp": "केरल के तटीय क्षेत्रों में मोनाजाइट बालू से विश्व का सर्वाधिक थोरियम प्राप्त होता है।"}, {"q": "भारत का सबसे गहरा प्राकृतिक बंदरगाह (Natural Deepest Port) कौन-सा है?", "opts": ["मुंबई", "चेन्नई", "विशाखापत्तनम", "कांडला"], "ans": 2, "exp": "आंध्रप्रदेश का विशाखापत्तनम बंदरगाह भारत का सबसे गहरा और सुरक्षित बंदरगाह है।"}, {"q": "सरदार सरोवर बांध किस नदी पर बनाया गया है?", "opts": ["ताप्ती", "नर्मदा", "माही", "साबरमती"], "ans": 1, "exp": "गुजरात में नर्मदा नदी पर सरदार सरोवर बांध निर्मित है।"}, {"q": "लोकटक झील (तैरता हुआ राष्ट्रीय उद्यान केबुल लामजाओ) किस राज्य में है?", "opts": ["असम", "मणिपुर", "मेघालय", "त्रिपुरा"], "ans": 1, "exp": "मणिपुर की लोकटक झील में विश्व का एकमात्र तैरता हुआ राष्ट्रीय उद्यान स्थित है।"}, {"q": "भारत में जूट का सर्वाधिक उत्पादन किस राज्य में होता है?", "opts": ["बिहार", "पश्चिम बंगाल", "असम", "ओडिशा"], "ans": 1, "exp": "पश्चिम बंगाल भारत के कुल जूट उत्पादन में प्रथम स्थान पर है।"}, {"q": "काजीरंगा राष्ट्रीय उद्यान (असम) मुख्य रूप से किस वन्यजीव के लिए प्रसिद्ध है?", "opts": ["एशियाई शेर", "एक सींग वाला गैंडा", "बंगाल टाइगर", "कस्तूरी मृग"], "ans": 1, "exp": "काजीरंगा एक सींग वाले भारतीय गैंडों का विश्व का सबसे बड़ा आवास है।"}, {"q": "भारत की 'मानक समय रेखा' (82°30' पूर्वी देशांतर) कितने राज्यों से होकर गुजरती है?", "opts": ["4", "5", "6", "7"], "ans": 1, "exp": "यह 5 राज्यों (UP, MP, छत्तीसगढ़, ओडिशा और आंध्रप्रदेश) से होकर गुजरती है।"}, {"q": "भारतीय संविधान सभा के स्थायी अध्यक्ष कौन थे?", "opts": ["डॉ. सच्चिदानंद सिन्हा", "डॉ. राजेंद्र प्रसाद", "डॉ. बी.आर. अंबेडकर", "पं. नेहरू"], "ans": 1, "exp": "11 दिसंबर 1946 को डॉ. राजेंद्र प्रसाद संविधान सभा के स्थायी अध्यक्ष निर्वाचित हुए।"}, {"q": "संविधान की प्रारूप समिति (Drafting Committee) के अध्यक्ष कौन थे?", "opts": ["डॉ. भीमराव अंबेडकर", "सरदार पटेल", "बी.एन. राव", "के.एम. मुंशी"], "ans": 0, "exp": "7 सदस्यीय प्रारूप समिति (29 अगस्त 1947) के अध्यक्ष डॉ. बी.आर. अंबेडकर थे।"}, {"q": "भारतीय संविधान में 'समाजवादी, पंथनिरपेक्ष और अखंडता' शब्द किस संशोधन द्वारा जोड़े गए?", "opts": ["44वां संशोधन", "42वां संशोधन (1976)", "52वां संशोधन", "73वां संशोधन"], "ans": 1, "exp": "42वें संविधान संशोधन 1976 (मिनी संविधान) द्वारा प्रस्तावना में ये तीन शब्द जोड़े गए।"}, {"q": "भारतीय संविधान के किस भाग को 'संविधान की आत्मा' या 'मैग्नाकार्टा' कहा जाता है?", "opts": ["भाग-3 (मौलिक अधिकार)", "भाग-4 (नीति निर्देशक तत्व)", "भाग-2 (नागरिकता)", "भाग-5"], "ans": 0, "exp": "भाग-3 (अनुच्छेद 12-35) में मौलिक अधिकारों को भारत का मैग्नाकार्टा कहा जाता है।"}, {"q": "डॉ. बी.आर. अंबेडकर ने किस अनुच्छेद को संविधान का 'हृदय और आत्मा' कहा?", "opts": ["अनुच्छेद 14", "अनुच्छेद 19", "अनुच्छेद 32 (संवैधानिक उपचार)", "अनुच्छेद 21"], "ans": 2, "exp": "अनुच्छेद 32 के तहत सर्वोच्च न्यायालय 5 प्रकार की रिट जारी कर मौलिक अधिकारों की रक्षा करता है।"}, {"q": "मौलिक कर्तव्यों को किस समिति की सिफारिश पर संविधान (भाग 4-क) में जोड़ा गया?", "opts": ["सरकारिया आयोग", "सरदार स्वर्ण सिंह समिति", "बलवंत राय मेहता समिति", "मंडल आयोग"], "ans": 1, "exp": "42वें संशोधन 1976 द्वारा स्वर्ण सिंह समिति की सिफारिश पर मौलिक कर्तव्य जोड़े गए।"}, {"q": "राज्य के नीति निर्देशक तत्व (DPSP) किस देश के संविधान से लिए गए हैं?", "opts": ["अमेरिका", "आयरलैंड", "कनाडा", "ऑस्ट्रेलिया"], "ans": 1, "exp": "भाग-4 (अनुच्छेद 36-51) के नीति निर्देशक तत्व आयरलैंड के संविधान से लिए गए हैं।"}, {"q": "भारत के राष्ट्रपति को पद की शपथ कौन दिलाता है?", "opts": ["प्रधानमंत्री", "उपराष्ट्रपति", "भारत के मुख्य न्यायाधीश", "लोकसभा अध्यक्ष"], "ans": 2, "exp": "अनुच्छेद 60 के तहत सर्वोच्च न्यायालय के मुख्य न्यायाधीश राष्ट्रपति को शपथ दिलाते हैं।"}, {"q": "भारत में कोई विधेयक 'धन विधेयक' (Money Bill) है या नहीं, इसका अंतिम निर्णय कौन करता है?", "opts": ["राष्ट्रपति", "वित्त मंत्री", "लोकसभा अध्यक्ष", "राज्यसभा सभापति"], "ans": 2, "exp": "अनुच्छेद 110 के अंतर्गत धन विधेयक का प्रमाणन केवल लोकसभा अध्यक्ष करते हैं।"}, {"q": "संसद के दोनों सदनों की संयुक्त बैठक (अनुच्छेद 108) की अध्यक्षता कौन करता है?", "opts": ["राष्ट्रपति", "लोकसभा अध्यक्ष", "उपराष्ट्रपति", "प्रधानमंत्री"], "ans": 1, "exp": "संयुक्त बैठक राष्ट्रपति बुलाते हैं, लेकिन इसकी अध्यक्षता लोकसभा अध्यक्ष करते हैं।"}, {"q": "सर्वोच्च न्यायालय के न्यायाधीशों की सेवानिवृत्ति की आयु क्या है?", "opts": ["60 वर्ष", "62 वर्ष", "65 वर्ष", "70 वर्ष"], "ans": 2, "exp": "सुप्रीम कोर्ट के जज 65 वर्ष और हाईकोर्ट के जज 62 वर्ष की आयु में सेवानिवृत्त होते हैं।"}, {"q": "संविधान के किस अनुच्छेद के अंतर्गत राष्ट्रपति देश में 'राष्ट्रीय आपातकाल' घोषित कर सकते हैं?", "opts": ["अनुच्छेद 352", "अनुच्छेद 356", "अनुच्छेद 360", "अनुच्छेद 368"], "ans": 0, "exp": "अनुच्छेद 352 (राष्ट्रीय आपात), 356 (राष्ट्रपति शासन) और 360 (वित्तीय आपात) से संबंधित है।"}, {"q": "मतदान की आयु 21 वर्ष से घटाकर 18 वर्ष किस संविधान संशोधन द्वारा की गई?", "opts": ["42वां संशोधन", "61वां संशोधन (1989)", "73वां संशोधन", "86वां संशोधन"], "ans": 1, "exp": "61वें संशोधन अधिनियम द्वारा अनुच्छेद 326 में मतदान की आयु 18 वर्ष की गई।"}, {"q": "शिक्षा के अधिकार (अनुच्छेद 21-क) को किस संविधान संशोधन द्वारा मौलिक अधिकार बनाया गया?", "opts": ["86वां संशोधन (2002)", "44वां संशोधन", "91वां संशोधन", "101वां संशोधन"], "ans": 0, "exp": "86वें संशोधन 2002 द्वारा 6 से 14 वर्ष के बच्चों को निःशुल्क एवं अनिवार्य शिक्षा का अधिकार मिला।"}, {"q": "वस्तु एवं सेवा कर (GST) किस संविधान संशोधन द्वारा लागू किया गया?", "opts": ["100वां", "101वां संशोधन", "102वां", "103वां"], "ans": 1, "exp": "101वें संविधान संशोधन द्वारा 1 जुलाई 2017 से भारत में GST लागू हुआ।"}, {"q": "भारत में नीति आयोग (NITI Aayog) का गठन योजना आयोग के स्थान पर कब हुआ?", "opts": ["1 जनवरी 2015", "15 अगस्त 2014", "1 अप्रैल 2015", "26 जनवरी 2016"], "ans": 0, "exp": "1 जनवरी 2015 को नीति आयोग की स्थापना हुई, जिसके पदेन अध्यक्ष प्रधानमंत्री होते हैं।"}, {"q": "भारत में 'बैंकों का बैंक' तथा मौद्रिक नीति जारी करने वाली शीर्ष संस्था कौन-सी है?", "opts": ["SBI", "भारतीय रिजर्व बैंक (RBI)", "NABARD", "SEBI"], "ans": 1, "exp": "RBI की स्थापना 1 अप्रैल 1935 को हुई और इसका राष्ट्रीयकरण 1 जनवरी 1949 को हुआ।"}, {"q": "भारत में राष्ट्रीय आय की गणना सर्वप्रथम किसने की थी?", "opts": ["पी.सी. महालनोबिस", "दादाभाई नौरोजी", "वी.के.आर.वी. राव", "अमर्त्य सेन"], "ans": 1, "exp": "दादाभाई नौरोजी ने 1867-68 में अपनी पुस्तक में प्रथम बार प्रति व्यक्ति आय ₹20 आंकी थी।"}, {"q": "किस पंचवर्षीय योजना का मुख्य मॉडल 'पी.सी. महालनोबिस मॉडल' (भारी उद्योग) पर आधारित था?", "opts": ["प्रथम", "द्वितीय (1956-61)", "तृतीय", "पाँचवीं"], "ans": 1, "exp": "द्वितीय पंचवर्षीय योजना (1956-61) में भिलाई, राउरकेला व दुर्गापुर स्टील प्लांट लगे।"}, {"q": "मुद्रास्फीति (Inflation) को नियंत्रित करने के लिए RBI रेपो रेट में क्या परिवर्तन करता है?", "opts": ["रेपो रेट बढ़ाता है", "रेपो रेट घटाता है", "नोट छापता है", "ब्याज शून्य करता है"], "ans": 0, "exp": "महंगाई कम करने हेतु RBI रेपो रेट बढ़ाकर बाजार में तरलता कम करता है।"}, {"q": "भारत के संविधान में 'संपत्ति का अधिकार' अब किस प्रकार का अधिकार है?", "opts": ["मौलिक अधिकार", "विधिक / कानूनी अधिकार (अनुच्छेद 300-क)", "प्राकृतिक अधिकार", "नीति निर्देशक तत्व"], "ans": 1, "exp": "44वें संशोधन 1978 द्वारा इसे मौलिक अधिकार से हटाकर अनुच्छेद 300-क में रखा गया।"}, {"q": "भारतीय रिजर्व बैंक का मुख्यालय कहाँ स्थित है?", "opts": ["नई दिल्ली", "मुंबई", "कोलकाता", "चेन्नई"], "ans": 1, "exp": "RBI का केंद्रीय कार्यालय मुंबई में स्थित है।"}, {"q": "कृषि और ग्रामीण विकास के लिए शीर्ष वित्त संस्था 'नाबार्ड' (NABARD) की स्थापना कब हुई?", "opts": ["1975", "12 जुलाई 1982", "1991", "1969"], "ans": 1, "exp": "शिवरामन समिति की सिफारिश पर 12 जुलाई 1982 को NABARD की स्थापना हुई।"}, {"q": "राज्यसभा का पदेन सभापति कौन होता है?", "opts": ["राष्ट्रपति", "भारत के उपराष्ट्रपति", "प्रधानमंत्री", "संसदीय कार्य मंत्री"], "ans": 1, "exp": "अनुच्छेद 64 के अनुसार भारत का उपराष्ट्रपति राज्यसभा का पदेन सभापति होता है।"}, {"q": "73वां संविधान संशोधन (1992) किस विषय से संबंधित है?", "opts": ["नगरपालिका", "पंचायती राज व्यवस्था", "मौलिक कर्तव्य", "दलबदल कानून"], "ans": 1, "exp": "73वें संशोधन द्वारा संविधान में 11वीं अनुसूची जोड़कर पंचायतों को संवैधानिक दर्जा मिला।"}, {"q": "विद्युत धारा (Electric Current) का SI मात्रक क्या है?", "opts": ["वोल्ट", "एम्पियर", "ओम", "वाट"], "ans": 1, "exp": "विद्युत धारा का SI मात्रक एम्पियर (Ampere) है।"}, {"q": "सूर्य के प्रकाश को पृथ्वी तक पहुँचने में लगभग कितना समय लगता है?", "opts": ["8 मिनट 20 सेकंड", "2 मिनट", "15 मिनट", "1 घंटा"], "ans": 0, "exp": "प्रकाश लगभग 3×10^8 मी/से की गति से 8 मिनट 20 सेकंड में पृथ्वी पर पहुँचता है।"}, {"q": "निकट दृष्टि दोष (Myopia) को दूर करने के लिए किस लेंस का प्रयोग किया जाता है?", "opts": ["उत्तल लेंस", "अवतल लेंस (Concave Lens)", "बेलनाकार लेंस", "समतल कांच"], "ans": 1, "exp": "निकट दृष्टि दोष में अवतल लेंस और दूर दृष्टि दोष में उत्तल लेंस का उपयोग होता है।"}, {"q": "मनुष्य की लार में कौन-सा एंजाइम पाया जाता है जो स्टार्च को पचाता है?", "opts": ["पेप्सिन", "टायलिन (एमाइलेज)", "ट्रिप्सिन", "लाइपेज"], "ans": 1, "exp": "लार में टायलिन (Salivary Amylase) पाया जाता है।"}, {"q": "रक्त का कौन-सा घटक ऑक्सीजन के परिवहन में मुख्य भूमिका निभाता है?", "opts": ["श्वेत रक्त कणिका (WBC)", "लाल रक्त कणिका / हीमोग्लोबिन", "प्लेटलेट्स", "प्लाज्मा"], "ans": 1, "exp": "RBC में उपस्थित हीमोग्लोबिन फेफड़ों से ऊतकों तक ऑक्सीजन पहुंचाता है।"}, {"q": "किस रक्त समूह (Blood Group) को 'सर्वदाता' (Universal Donor) कहा जाता है?", "opts": ["AB+", "O-", "A+", "B-"], "ans": 1, "exp": "O नेगेटिव (O-) रक्त समूह में कोई एंटीजन नहीं होता, अतः यह सर्वदाता है।"}, {"q": "खाने के सोडा (Baking Soda) का रासायनिक नाम क्या है?", "opts": ["सोडियम कार्बोनेट", "सोडियम बाइकार्बोनेट (NaHCO3)", "कैल्शियम कार्बोनेट", "सोडियम क्लोराइड"], "ans": 1, "exp": "बेकिंग सोडा का रासायनिक सूत्र NaHCO3 (सोडियम बाइकार्बोनेट) है।"}, {"q": "शुद्ध जल का pH मान कितना होता है?", "opts": ["5", "7", "9", "0"], "ans": 1, "exp": "शुद्ध जल उदासीन होता है, अतः इसका pH मान 7 होता है।"}, {"q": "मानव शरीर की सबसे बड़ी ग्रंथि कौन-सी है?", "opts": ["अग्न्याशय", "यकृत (Liver)", "थायरॉयड", "पीयूष ग्रंथि"], "ans": 1, "exp": "यकृत (Liver) मानव शरीर की सबसे बड़ी आंतरिक ग्रंथि है।"}, {"q": "पौधों में प्रकाश संश्लेषण (Photosynthesis) के लिए कौन-सी गैस आवश्यक होती है?", "opts": ["ऑक्सीजन", "नाइट्रोजन", "कार्बन डाइऑक्साइड (CO2)", "हाइड्रोजन"], "ans": 2, "exp": "पौधे CO2, जल और सूर्य के प्रकाश की उपस्थिति में क्लोरोफिल द्वारा भोजन बनाते हैं।"}, {"q": "इंसुलिन की कमी से कौन-सा रोग होता है?", "opts": ["घेंघा", "मधुमेह (Diabetes)", "पीलिया", "एनीमिया"], "ans": 1, "exp": "अग्न्याशय द्वारा इंसुलिन कम बनने से रक्त में ग्लूकोज बढ़ जाता है (मधुमेह)।"}, {"q": "भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) का मुख्यालय कहाँ स्थित है?", "opts": ["श्रीहरिकोटा", "बेंगलुरु", "तिरुवनंतपुरम", "अहमदाबाद"], "ans": 1, "exp": "ISRO की स्थापना 15 अगस्त 1969 को हुई थी और इसका मुख्यालय बेंगलुरु में है।"}, {"q": "भारत के प्रथम चंद्र मिशन 'चंद्रयान-3' ने चंद्रमा के दक्षिणी ध्रुव पर सफलतापूर्वक लैंडिंग कब की?", "opts": ["23 अगस्त 2023", "14 जुलाई 2023", "2 सितंबर 2023", "15 अगस्त 2023"], "ans": 0, "exp": "23 अगस्त 2023 को विक्रम लैंडर की सफल सॉफ्ट लैंडिंग हुई (राष्ट्रीय अंतरिक्ष दिवस)।"}, {"q": "सूर्य के अध्ययन के लिए ISRO द्वारा भेजा गया भारत का पहला सौर मिशन कौन-सा है?", "opts": ["आदित्य-L1", "गगनयान", "मंगलयान", "निसार"], "ans": 0, "exp": "आदित्य-L1 मिशन सितंबर 2023 में प्रक्षेपित किया गया था।"}, {"q": "वायुमंडल में सर्वाधिक मात्रा में पाई जाने वाली गैस कौन-सी है?", "opts": ["ऑक्सीजन (21%)", "नाइट्रोजन (78%)", "कार्बन डाइऑक्साइड", "आर्गन"], "ans": 1, "exp": "पृथ्वी के वायुमंडल में लगभग 78% नाइट्रोजन और 21% ऑक्सीजन है।"}, {"q": "ओजोन परत (Ozone Layer) हमें सूर्य की किन हानिकारक किरणों से बचाती है?", "opts": ["अवरक्त किरणें", "पराबैंगनी किरणें (UV Rays)", "एक्स-रे", "गामा किरणें"], "ans": 1, "exp": "समताप मंडल में स्थित ओजोन परत UV किरणों को अवशोषित करती है।"}, {"q": "'प्रोजेक्ट टाइगर' (बाघ संरक्षण योजना) भारत में किस वर्ष शुरू की गई थी?", "opts": ["1972", "1973", "1980", "1992"], "ans": 1, "exp": "1 अप्रैल 1973 को जिम कॉर्बेट नेशनल पार्क से प्रोजेक्ट टाइगर शुरू हुआ था।"}, {"q": "विश्व पर्यावरण दिवस प्रतिवर्ष किस तिथि को मनाया जाता है?", "opts": ["22 अप्रैल", "5 जून", "16 सितंबर", "2 फरवरी"], "ans": 1, "exp": "5 जून को प्रतिवर्ष विश्व पर्यावरण दिवस मनाया जाता है।"}, {"q": "रेड डाटा बुक (Red Data Book) किस अंतरराष्ट्रीय संगठन द्वारा जारी की जाती है?", "opts": ["UNEP", "IUCN", "WWF", "UNESCO"], "ans": 1, "exp": "IUCN संकटापन्न जीव-जंतुओं व वनस्पतियों की सूची Red Data Book में प्रकाशित करता है।"}, {"q": "ग्लोबल वार्मिंग (वैश्विक तापन) के लिए सर्वाधिक उत्तरदायी ग्रीनहाउस गैस कौन-सी है?", "opts": ["ऑक्सीजन", "कार्बन डाइऑक्साइड (CO2)", "नाइट्रोजन", "हीलियम"], "ans": 1, "exp": "CO2, मीथेन और CFC प्रमुख ग्रीनहाउस गैसें हैं।"}, {"q": "संयुक्त राष्ट्र संघ (UNO) की स्थापना कब हुई थी?", "opts": ["24 अक्टूबर 1945", "10 दिसंबर 1948", "1 जनवरी 1945", "15 अगस्त 1947"], "ans": 0, "exp": "24 अक्टूबर 1945 को संयुक्त राष्ट्र की स्थापना हुई, मुख्यालय न्यूयॉर्क में है।"}, {"q": "विश्व स्वास्थ्य संगठन (WHO) का मुख्यालय कहाँ स्थित है?", "opts": ["पेरिस", "जिनेवा (स्विट्जरलैंड)", "वाशिंगटन", "वियना"], "ans": 1, "exp": "WHO का मुख्यालय जिनेवा में स्थित है।"}, {"q": "ओलंपिक खेलों का आयोजन कितने वर्षों के अंतराल पर होता है?", "opts": ["2 वर्ष", "3 वर्ष", "4 वर्ष", "5 वर्ष"], "ans": 2, "exp": "ग्रीष्मकालीन एवं शीतकालीन ओलंपिक प्रत्येक 4 वर्ष में आयोजित होते हैं।"}, {"q": "भारत में 'रक्षा अनुसंधान एवं विकास संगठन (DRDO)' का गठन किस वर्ष हुआ?", "opts": ["1958", "1969", "1947", "1975"], "ans": 0, "exp": "DRDO का गठन 1958 में हुआ, जिसका आदर्श वाक्य 'बलस्य मूलं विज्ञानम्' है।"}, {"q": "ध्वनि की तीव्रता (Sound Intensity) को किस इकाई में मापा जाता है?", "opts": ["हर्ट्ज़", "डेसीबल (dB)", "न्यूटन", "पास्कल"], "ans": 1, "exp": "ध्वनि की आवृत्ति हर्ट्ज़ में तथा प्रबलता/तीव्रता डेसीबल में मापी जाती है।"}, {"q": "वायुमंडलीय दाब को मापने के लिए किस यंत्र का उपयोग किया जाता है?", "opts": ["थर्मामीटर", "बैरोमीटर", "हाइग्रोमीटर", "एनीमोमीटर"], "ans": 1, "exp": "बैरोमीटर से वायुदाब और हाइग्रोमीटर से आर्द्रता मापी जाती है।"}, {"q": "विटामिन D का सबसे अच्छा प्राकृतिक स्रोत क्या है?", "opts": ["नींबू", "सूर्य का प्रकाश", "चावल", "हरी मिर्च"], "ans": 1, "exp": "सूर्य की किरणों से त्वचा में विटामिन D संश्लेषित होता है, इसकी कमी से रिकेट्स होता है।"}, {"q": "कपड़े धोने का सोडा (Washing Soda) का रासायनिक नाम क्या है?", "opts": ["सोडियम कार्बोनेट", "सोडियम हाइड्रॉक्साइड", "पोटैशियम क्लोराइड", "जिप्सम"], "ans": 0, "exp": "धोवन सोडा सोडियम कार्बोनेट (Na2CO3.10H2O) है।"}, {"q": "कोयले की सर्वोत्तम किस्म कौन-सी होती है जिसमें कार्बन की मात्रा सर्वाधिक (80-95%) होती है?", "opts": ["पीट", "लिग्नाइट", "बिटुमिनस", "एन्थ्रासाइट"], "ans": 3, "exp": "एन्थ्रासाइट सबसे उच्च गुणवत्ता वाला कठोर कोयला है।"}, {"q": "अंतरराष्ट्रीय योग दिवस प्रतिवर्ष किस दिन मनाया जाता है?", "opts": ["21 मई", "21 जून", "11 जुलाई", "5 सितंबर"], "ans": 1, "exp": "21 जून 2015 से प्रतिवर्ष अंतरराष्ट्रीय योग दिवस मनाया जाता है।"}]}, "hindi_s1": {"title": "✍️ सामान्य हिंदी — सेट 1 (100 प्रश्न)", "questions": [{"q": "हिंदी वर्णमाला में स्वरों की कुल संख्या (मूल रूप से) कितनी मानी जाती है?", "opts": ["10", "11", "13", "33"], "ans": 1, "exp": "हिंदी में मूल स्वरों की संख्या 11 (अ से औ तक) होती है।"}, {"q": "इनमें से कौन-सा वर्ण 'स्पर्श व्यंजन' नहीं है?", "opts": ["क", "च", "प", "श"], "ans": 3, "exp": "'श' ऊष्म व्यंजन है, जबकि क, च, प स्पर्श व्यंजन हैं।"}, {"q": "'क्ष, त्र, ज्ञ, श्र' को किस श्रेणी के व्यंजन कहा जाता है?", "opts": ["अंतःस्थ व्यंजन", "ऊष्म व्यंजन", "संयुक्त व्यंजन", "अयोगवाह"], "ans": 2, "exp": "दो व्यंजनों के मेल से बने होने के कारण इन्हें संयुक्त व्यंजन कहते हैं।"}, {"q": "निम्नलिखित में से किस शब्द की वर्तनी शुद्ध है?", "opts": ["कवयित्री", "कवियित्री", "कविइत्री", "कव्यित्री"], "ans": 0, "exp": "शुद्ध वर्तनी 'कवयित्री' है।"}, {"q": "निम्न में से शुद्ध वर्तनी वाला शब्द चुनें:", "opts": ["उज्जवल", "उज्ज्वल", "उज्वल", "उज्ज्वल्"], "ans": 1, "exp": "उत् + ज्वल से 'उज्ज्वल' बनता है जिसमें दोनों 'ज' आधे होते हैं।"}, {"q": "शुद्ध वर्तनी का चयन करें:", "opts": ["अशीर्वाद", "आशीर्वाद", "आशिर्वाद", "आर्शीवाद"], "ans": 1, "exp": "'आशीर्वाद' शुद्ध रूप है (श पर बड़ी ई तथा व के ऊपर रेफ)।"}, {"q": "हिंदी में 'अयोगवाह' वर्ण किन्हें कहा जाता है?", "opts": ["य, र, ल, व", "अं, अः", "श, ष, स, ह", "क, ख, ग"], "ans": 1, "exp": "अनुस्वार (अं) और विसर्ग (अः) को अयोगवाह कहते हैं।"}, {"q": "'क, ख, ग, घ' का उच्चारण स्थान क्या है?", "opts": ["तालु", "मूर्धा", "कंठ", "ओष्ठ"], "ans": 2, "exp": "कवर्ग का उच्चारण स्थान कंठ है।"}, {"q": "'य, र, ल, व' किस प्रकार के व्यंजन कहलाते हैं?", "opts": ["अंतःस्थ व्यंजन", "ऊष्म व्यंजन", "संयुक्त व्यंजन", "नासिक्य"], "ans": 0, "exp": "य, र, ल, व को अंतःस्थ व्यंजन कहा जाता है।"}, {"q": "शुद्ध वर्तनी चुनें:", "opts": ["पूज्यनीय", "पूजनीय", "पुजनीय", "पूज्यनिय"], "ans": 1, "exp": "शुद्ध शब्द 'पूजनीय' अथवा 'पूज्य' होता है।"}, {"q": "'विद्या + आलय = विद्यालय' में कौन-सी संधि है?", "opts": ["गुण संधि", "दीर्घ स्वर संधि", "वृद्धि संधि", "यण संधि"], "ans": 1, "exp": "आ + आ = आ होने से यहाँ दीर्घ स्वर संधि है।"}, {"q": "'सूर्य + उदय = सूर्योदय' किस संधि का उदाहरण है?", "opts": ["गुण स्वर संधि", "दीर्घ संधि", "अयादि संधि", "व्यंजन संधि"], "ans": 0, "exp": "अ + उ = ओ बनने के कारण यहाँ गुण संधि है।"}, {"q": "'अति + अधिक = अत्यधिक' में कौन-सी संधि है?", "opts": ["वृद्धि संधि", "यण संधि", "अयादि संधि", "विसर्ग संधि"], "ans": 1, "exp": "इ + अ = य बनने से यहाँ यण स्वर संधि है।"}, {"q": "'पवन' का सही संधि-विच्छेद क्या होगा?", "opts": ["प + वन", "पो + अन", "पौ + अन", "पा + वन"], "ans": 1, "exp": "पो + अन = पवन (अयादि संधि) तथा पौ + अन = पावन।"}, {"q": "'जगन्नाथ' शब्द में कौन-सी संधि है?", "opts": ["स्वर संधि", "व्यंजन संधि", "विसर्ग संधि", "दीर्घ संधि"], "ans": 1, "exp": "जगत् + नाथ = जगन्नाथ (व्यंजन संधि)।"}, {"q": "'मनः + रथ = मनोरथ' में कौन-सी संधि है?", "opts": ["गुण संधि", "व्यंजन संधि", "विसर्ग संधि", "वृद्धि संधि"], "ans": 2, "exp": "विसर्ग के 'ओ' में परिवर्तन के कारण यहाँ विसर्ग संधि है।"}, {"q": "'सदैव' (सदा + एव) में कौन-सी संधि है?", "opts": ["गुण संधि", "वृद्धि संधि", "यण संधि", "दीर्घ संधि"], "ans": 1, "exp": "आ + ए = ऐ बनने से यहाँ वृद्धि स्वर संधि है।"}, {"q": "'यथाशक्ति' में कौन-सा समास है?", "opts": ["तत्पुरुष समास", "अव्ययीभाव समास", "द्वंद्व समास", "कर्मधारय समास"], "ans": 1, "exp": "प्रथम पद 'यथा' अव्यय होने से यहाँ अव्ययीभाव समास है।"}, {"q": "'माता-पिता' शब्द में कौन-सा समास है?", "opts": ["द्विगु समास", "द्वंद्व समास", "बहुव्रीहि समास", "तत्पुरुष समास"], "ans": 1, "exp": "दोनों पद प्रधान और योजक चिह्न होने से द्वंद्व समास है।"}, {"q": "'चौराहा' (चार राहों का समूह) में कौन-सा समास है?", "opts": ["द्विगु समास", "कर्मधारय समास", "अव्ययीभाव", "द्वंद्व समास"], "ans": 0, "exp": "पहला पद संख्यावाचक होने से यहाँ द्विगु समास है।"}, {"q": "'नीलकमल' (नीला है जो कमल) में कौन-सा समास है?", "opts": ["तत्पुरुष", "कर्मधारय समास", "द्वंद्व", "द्विगु"], "ans": 1, "exp": "विशेषण-विशेष्य संबंध होने से कर्मधारय समास है।"}, {"q": "'दशानन' (दस हैं आनन जिसके अर्थात रावण) में कौन-सा समास है?", "opts": ["द्विगु", "बहुव्रीहि समास", "कर्मधारय", "तत्पुरुष"], "ans": 1, "exp": "तीसरे विशेष अर्थ (रावण) की प्रधानता होने से बहुव्रीहि समास है।"}, {"q": "'राजपुत्र' (राजा का पुत्र) किस समास का उदाहरण है?", "opts": ["संबंध तत्पुरुष समास", "अव्ययीभाव", "द्वंद्व", "कर्मधारय"], "ans": 0, "exp": "विभक्ति चिह्न 'का' का लोप होने से संबंध तत्पुरुष समास है।"}, {"q": "'गजानन' में कौन-सा समास है?", "opts": ["बहुव्रीहि समास", "द्विगु", "तत्पुरुष", "द्वंद्व"], "ans": 0, "exp": "गज के समान आनन है जिनका (गणेश) - बहुव्रीहि समास।"}, {"q": "'प्रतिदिन' में कौन-सा समास है?", "opts": ["अव्ययीभाव समास", "तत्पुरुष", "कर्मधारय", "द्विगु"], "ans": 0, "exp": "'प्रति' उपसर्ग/अव्यय होने से अव्ययीभाव समास है।"}, {"q": "'प्रख्यात' शब्द में कौन-सा उपसर्ग प्रयुक्त हुआ है?", "opts": ["प्र", "पर", "प", "त"], "ans": 0, "exp": "'प्र' उपसर्ग + ख्यात = प्रख्यात।"}, {"q": "'सजावट' शब्द में कौन-सा प्रत्यय लगा है?", "opts": ["ट", "वट", "आवट", "स"], "ans": 2, "exp": "सज + आवट = सजावट।"}, {"q": "'अत्याचार' शब्द में कौन-सा उपसर्ग है?", "opts": ["अ", "अति", "अत्य", "आ"], "ans": 1, "exp": "अति + आचार = अत्याचार।"}, {"q": "इनमें से कौन-सा शब्द 'तत्सम' (संस्कृत से ज्यों का त्यों) है?", "opts": ["आग", "अग्नि", "घर", "हाथ"], "ans": 1, "exp": "'अग्नि' तत्सम शब्द है और इसका तद्भव रूप 'आग' है।"}, {"q": "'खेत' शब्द का तत्सम रूप क्या है?", "opts": ["क्षेत्र", "खेतक", "क्षिति", "कृषि"], "ans": 0, "exp": "'क्षेत्र' तत्सम और 'खेत' उसका तद्भव रूप है।"}, {"q": "'लोटा' और 'पगड़ी' उत्पत्ति की दृष्टि से किस प्रकार के शब्द हैं?", "opts": ["तत्सम", "तद्भव", "देशज", "विदेशज"], "ans": 2, "exp": "स्थानीय बोलियों से आए लोटा, पगड़ी, खटिया आदि देशज शब्द हैं।"}, {"q": "'रिक्शा' किस भाषा का विदेशज शब्द है?", "opts": ["अंग्रेजी", "जापानी", "तुर्की", "पुर्तगाली"], "ans": 1, "exp": "'रिक्शा' मूलतः जापानी भाषा का शब्द है।"}, {"q": "'रेलगाड़ी' किस प्रकार का शब्द है?", "opts": ["देशज", "संकर शब्द", "तत्सम", "रूढ़"], "ans": 1, "exp": "अंग्रेजी (रेल) + हिंदी (गाड़ी) दो भाषाओं से मिलकर बना 'संकर शब्द' है।"}, {"q": "'कैंची' और 'चाकू' किस भाषा से हिंदी में आए हैं?", "opts": ["तुर्की", "अरबी", "फ्रेंच", "चीनी"], "ans": 0, "exp": "कैंची, चाकू, तोप, बारूद तुर्की भाषा के शब्द हैं।"}, {"q": "'विद्यालय' रचना की दृष्टि से किस प्रकार का शब्द है?", "opts": ["रूढ़", "यौगिक", "योगरूढ़", "देशज"], "ans": 1, "exp": "दो सार्थक शब्दों (विद्या + आलय) के योग से बनने से यह यौगिक शब्द है।"}, {"q": "'पंकज' (कीचड़ में जन्मा = कमल) रचना के आधार पर कैसा शब्द है?", "opts": ["रूढ़", "यौगिक", "योगरूढ़", "तद्भव"], "ans": 2, "exp": "विशेष अर्थ देने वाले यौगिक शब्द 'योगरूढ़' कहलाते हैं।"}, {"q": "'दुकानदार' में 'दार' क्या है?", "opts": ["उपसर्ग", "प्रत्यय", "अव्यय", "कारक"], "ans": 1, "exp": "शब्द के अंत में लगने वाले शब्दांश प्रत्यय कहलाते हैं।"}, {"q": "'कमल' का पर्यायवाची शब्द इनमें से कौन-सा नहीं है?", "opts": ["पंकज", "नीरज", "सरोज", "दिनकर"], "ans": 3, "exp": "'दिनकर' सूर्य का पर्यायवाची है, जबकि पंकज, नीरज, सरोज कमल के हैं।"}, {"q": "'अमृत' का पर्यायवाची शब्द क्या है?", "opts": ["अनल", "पीयूष", "पयोद", "विपिन"], "ans": 1, "exp": "पीयूष, सुधा, अमिय और सोम अमृत के पर्यायवाची हैं।"}, {"q": "'आकाश' का पर्यायवाची नहीं है:", "opts": ["गगन", "नभ", "व्योम", "वसुधा"], "ans": 3, "exp": "'वसुधा' पृथ्वी का पर्यायवाची है।"}, {"q": "'आग' (अग्नि) का पर्यायवाची शब्द चुनें:", "opts": ["अनल", "अनिल", "सलिल", "तोय"], "ans": 0, "exp": "'अनल' का अर्थ आग और 'अनिल' का अर्थ हवा होता है।"}, {"q": "'स्थावर' शब्द का सही विलोम शब्द क्या है?", "opts": ["जंगम", "चंचल", "चेतन", "स्थिर"], "ans": 0, "exp": "स्थावर (अचल) का विलोम 'जंगम' होता है।"}, {"q": "'आकर्षण' का विलोम शब्द क्या होगा?", "opts": ["घृणा", "विकर्षण", "तिरस्कार", "प्रतिकर्षण"], "ans": 1, "exp": "आकर्षण का शुद्ध विलोम 'विकर्षण' है।"}, {"q": "'अनाथ' का विलोम शब्द है:", "opts": ["धनी", "सनाथ", "निर्धन", "बेकार"], "ans": 1, "exp": "अनाथ का विलोम 'सनाथ' होता है।"}, {"q": "'अल्पज्ञ' का सही विलोम शब्द क्या है?", "opts": ["सर्वज्ञ", "अज्ञ", "विज्ञ", "मूर्ख"], "ans": 0, "exp": "कम जानने वाला (अल्पज्ञ) का विलोम सब कुछ जानने वाला (सर्वज्ञ) है।"}, {"q": "'अनुराग' का विलोम शब्द क्या होगा?", "opts": ["प्रेम", "विराग", "द्वेष", "राग"], "ans": 1, "exp": "अनुराग का विलोम 'विराग' होता है।"}, {"q": "'कनक' शब्द के दो प्रमुख अनेकार्थी अर्थ क्या हैं?", "opts": ["सोना और धतूरा", "चांदी और पानी", "कमल और मोती", "हाथी और घोड़ा"], "ans": 0, "exp": "'कनक' के दो अर्थ सोना और धतूरा होते हैं।"}, {"q": "'अंबर' शब्द का अनेकार्थी अर्थ है:", "opts": ["आकाश और वस्त्र", "धरती और जल", "सूर्य और चंद्र", "फूल और कांटा"], "ans": 0, "exp": "'अंबर' का अर्थ आकाश तथा कपड़ा (वस्त्र) दोनों होता है।"}, {"q": "'हरि' शब्द का अनेकार्थी इनमें से कौन नहीं है?", "opts": ["विष्णु", "बंदर", "सिंह", "पत्थर"], "ans": 3, "exp": "विष्णु, वानर, सिंह, सर्प आदि 'हरि' के अर्थ हैं, पत्थर नहीं।"}, {"q": "वाक्यांश के लिए एक शब्द: 'जो कभी बूढ़ा न हो'", "opts": ["अमर", "अजर", "अजेय", "अनंत"], "ans": 1, "exp": "जो कभी बूढ़ा न हो 'अजर' और जो कभी न मरे 'अमर' कहलाता है।"}, {"q": "'जिसका कोई शत्रु न जन्मा हो' के लिए एक शब्द:", "opts": ["अजातशत्रु", "शत्रुघ्न", "अजेय", "निर्भय"], "ans": 0, "exp": "उसे 'अजातशत्रु' कहते हैं।"}, {"q": "'जो सब कुछ जानता हो' उसे क्या कहते हैं?", "opts": ["ज्ञानी", "सर्वज्ञ", "विद्वान", "बुद्धिमान"], "ans": 1, "exp": "सब कुछ जानने वाला 'सर्वज्ञ' कहलाता है।"}, {"q": "'जिसके समान कोई दूसरा न हो' के लिए एक शब्द:", "opts": ["अद्वितीय", "अनुपम", "अद्भुत", "सर्वश्रेष्ठ"], "ans": 0, "exp": "जिसके समान कोई दूसरा न हो, वह 'अद्वितीय' कहलाता है।"}, {"q": "'जंगल में लगने वाली आग' को क्या कहते हैं?", "opts": ["जठराग्नि", "बड़वाग्नि", "दावाग्नि / दावानल", "पंचाग्नि"], "ans": 2, "exp": "जंगल की आग 'दावानल', समुद्र की आग 'बड़वानल' और पेट की आग 'जठराग्नि' कहलाती है।"}, {"q": "'कम बोलने वाला' के लिए उपयुक्त एक शब्द:", "opts": ["वाचाल", "मितभाषी", "मूक", "अल्पज्ञ"], "ans": 1, "exp": "कम बोलने वाला 'मितभाषी' और अधिक बोलने वाला 'वाचाल' कहलाता है।"}, {"q": "'ईश्वर में विश्वास रखने वाला' कहलाता है:", "opts": ["नास्तिक", "आस्तिक", "भक्त", "तपस्वी"], "ans": 1, "exp": "आस्तिक ईश्वर में आस्था रखता है।"}, {"q": "'हाथ से लिखा हुआ' के लिए एक शब्द:", "opts": ["हस्तलिखित / पांडुलिपि", "टंकित", "मुद्रित", "अलिखित"], "ans": 0, "exp": "हाथ से लिखा हुआ 'हस्तलिखित' कहलाता है।"}, {"q": "मुहावरा 'नौ दो ग्यारह होना' का अर्थ क्या है?", "opts": ["गिनती करना", "भाग जाना", "इकट्ठा होना", "मजबूत होना"], "ans": 1, "exp": "इसका अर्थ चुपचाप भाग जाना होता है।"}, {"q": "'अंधे की लाठी' मुहावरे का सही अर्थ है:", "opts": ["गंवार व्यक्ति", "एकमात्र सहारा", "अंधकार होना", "लड़ाई करना"], "ans": 1, "exp": "बेसहारे का एकमात्र सहारा।"}, {"q": "'गागर में सागर भरना' मुहावरे का अर्थ है:", "opts": ["छोटे बर्तन में पानी भरना", "थोड़े शब्दों में बहुत कुछ कह देना", "व्यर्थ की बातें करना", "अधिक खर्च करना"], "ans": 1, "exp": "कम शब्दों में गहन भाव व्यक्त करना।"}, {"q": "'ऊँट के मुँह में जीरा' लोकोक्ति का सही अर्थ क्या है?", "opts": ["अधिक भोजन", "आवश्यकता से बहुत कम वस्तु मिलना", "स्वादिष्ट भोजन", "जानवर को खिलाना"], "ans": 1, "exp": "बड़ी जरूरत के सामने बहुत कम मात्रा मिलना।"}, {"q": "'ईद का चाँद होना' मुहावरे का अर्थ:", "opts": ["त्योहार मनाना", "बहुत दिनों बाद दिखाई देना", "सुंदर दिखना", "गायब हो जाना"], "ans": 1, "exp": "बहुत समय बाद दर्शन देना।"}, {"q": "'आँख का तारा' मुहावरे का अर्थ है:", "opts": ["बहुत प्यारा", "आँख में दर्द", "दूर की नजर", "गुस्सा होना"], "ans": 0, "exp": "अत्यंत प्रिय होना।"}, {"q": "'हिमालय' शब्द में कौन-सी संज्ञा है?", "opts": ["जातिवाचक", "व्यक्तिवाचक संज्ञा", "भाववाचक", "द्रव्यवाचक"], "ans": 1, "exp": "विशेष पर्वत का नाम होने से यह व्यक्तिवाचक संज्ञा है।"}, {"q": "'बुढ़ापा' और 'मिठास' किस प्रकार की संज्ञाएँ हैं?", "opts": ["व्यक्तिवाचक", "जातिवाचक", "भाववाचक संज्ञा", "समूहवाचक"], "ans": 2, "exp": "गुण, दशा या भाव का बोध कराने से ये भाववाचक संज्ञाएँ हैं।"}, {"q": "हिंदी में सर्वनाम के कुल कितने भेद होते हैं?", "opts": ["4", "5", "6", "7"], "ans": 2, "exp": "पुरुषवाचक, निजवाचक, निश्चयवाचक, अनिश्चयवाचक, संबंधवाचक और प्रश्नवाचक (कुल 6)।"}, {"q": "'यह घोड़ा काला है' वाक्य में 'काला' शब्द क्या है?", "opts": ["संज्ञा", "सर्वनाम", "विशेषण", "क्रिया"], "ans": 2, "exp": "संज्ञा की विशेषता बताने के कारण 'काला' गुणवाचक विशेषण है।"}, {"q": "हिंदी में कारक के कुल कितने भेद होते हैं?", "opts": ["6", "7", "8", "10"], "ans": 2, "exp": "कर्ता, कर्म, करण, संप्रदान, अपादान, संबंध, अधिकरण और संबोधन (कुल 8)।"}, {"q": "'पेड़ से पत्ता गिरा' वाक्य में कौन-सा कारक है?", "opts": ["करण कारक", "अपादान कारक", "संप्रदान कारक", "अधिकरण कारक"], "ans": 1, "exp": "अलग होने (अलगाव) का भाव होने से यहाँ अपादान कारक है।"}, {"q": "'राम ने रावण को बाण से मारा' में 'बाण से' में कौन-सा कारक है?", "opts": ["करण कारक", "अपादान कारक", "कर्म कारक", "संबंध कारक"], "ans": 0, "exp": "साधन (बाण के द्वारा) का बोध होने से करण कारक है।"}, {"q": "'सीता घर में बैठी है' में 'में' किस कारक का चिह्न है?", "opts": ["संप्रदान", "अधिकरण कारक", "कर्म", "करण"], "ans": 1, "exp": "स्थान या आधार ('में', 'पर') का बोध होने से अधिकरण कारक है।"}, {"q": "निम्नलिखित में से कौन-सा शब्द सदैव 'बहुवचन' में प्रयोग होता है?", "opts": ["पानी", "प्राण / हस्ताक्षर", "सोना", "लड़का"], "ans": 1, "exp": "प्राण, दर्शन, आँसू और हस्ताक्षर सदैव बहुवचन में प्रयुक्त होते हैं।"}, {"q": "'कवि' शब्द का सही स्त्रीलिंग रूप क्या होगा?", "opts": ["कवियत्री", "कवयित्री", "कविनी", "काव्या"], "ans": 1, "exp": "'कवि' का शुद्ध स्त्रीलिंग 'कवयित्री' होता है।"}, {"q": "'वह कल दिल्ली जाएगा' वाक्य किस काल का है?", "opts": ["भूतकाल", "वर्तमान काल", "भविष्यत् काल", "संदिग्ध काल"], "ans": 2, "exp": "आने वाले समय का बोध होने से यह सामान्य भविष्यत् काल है।"}, {"q": "जो शब्द लिंग, वचन और कारक के अनुसार अपना रूप नहीं बदलते, उन्हें क्या कहते हैं?", "opts": ["संज्ञा", "अव्यय (अविकारी शब्द)", "विशेषण", "क्रिया"], "ans": 1, "exp": "जैसे: धीरे, और, लेकिन, आज आदि अव्यय हैं।"}, {"q": "'तुम ही यह काम कर सकते हो' में 'ही' किस प्रकार का शब्द है?", "opts": ["संज्ञा", "निपात", "सर्वनाम", "विशेषण"], "ans": 1, "exp": "ही, भी, तो, तक आदि बल देने वाले शब्द 'निपात' कहलाते हैं।"}, {"q": "वाक्य में प्रयुक्त 'सकर्मक क्रिया' का उदाहरण चुनें:", "opts": ["राम सोता है", "बच्चा रोता है", "सीता फल खाती है", "पक्षी उड़ते हैं"], "ans": 2, "exp": "खाना क्रिया के साथ 'फल' कर्म मौजूद होने से यह सकर्मक क्रिया है।"}, {"q": "शुद्ध वाक्य चुनें:", "opts": ["मैंने आज जाना है", "मुझे आज जाना है", "मेरे को आज जाना है", "हमने आज जाना है"], "ans": 1, "exp": "'मुझे आज जाना है' व्याकरण की दृष्टि से शुद्ध वाक्य है।"}, {"q": "संयुक्त वाक्य में दो स्वतंत्र उपवाक्यों को जोड़ने के लिए किसका प्रयोग होता है?", "opts": ["योजक शब्द (और, किंतु, परंतु)", "प्रश्नवाचक चिह्न", "विस्मयादिबोधक", "लाघव चिह्न"], "ans": 0, "exp": "और, तथा, एवं, लेकिन, परंतु से दो स्वतंत्र उपवाक्य जुड़ते हैं।"}, {"q": "किसी के कथन को ज्यों का त्यों लिखने के लिए किस विराम चिह्न का उपयोग होता है?", "opts": ["योजक चिह्न", "उद्धरण चिह्न (\" \")", "अर्धविराम", "विवरण चिह्न"], "ans": 1, "exp": "कथन को ज्यों का त्यों रखने हेतु दोहरा उद्धरण चिह्न लगाते हैं।"}, {"q": "संक्षिप्त रूप लिखने के लिए (जैसे डॉ. या प्रो.) किस चिह्न का प्रयोग करते हैं?", "opts": ["हंसपद", "लाघव चिह्न (° / .)", "योजक चिह्न", "कोष्ठक"], "ans": 1, "exp": "शब्द को संक्षिप्त करने के लिए लाघव चिह्न का उपयोग होता है।"}, {"q": "'शृंगार रस' का स्थायी भाव क्या है?", "opts": ["उत्साह", "रति (प्रेम)", "शोक", "हास"], "ans": 1, "exp": "शृंगार रस को रसराज कहा जाता है और इसका स्थायी भाव 'रति' है।"}, {"q": "'वीर रस' का स्थायी भाव क्या होता है?", "opts": ["भय", "उत्साह", "क्रोध", "विस्मय"], "ans": 1, "exp": "वीर रस का स्थायी भाव 'उत्साह' है।"}, {"q": "'करुण रस' का स्थायी भाव है:", "opts": ["शोक", "रति", "निर्वेद", "जुगुप्सा"], "ans": 0, "exp": "करुण रस का स्थायी भाव 'शोक' होता है।"}, {"q": "'दोहा' छंद के पहले और तीसरे चरण में कितनी-कितनी मात्राएँ होती हैं?", "opts": ["11-11", "13-13", "16-16", "12-12"], "ans": 1, "exp": "दोहा अर्धसम मात्रिक छंद है जिसके विषम चरणों (1,3) में 13 और सम चरणों (2,4) में 11 मात्राएँ होती हैं।"}, {"q": "'चौपाई' छंद के प्रत्येक चरण में कितनी मात्राएँ होती हैं?", "opts": ["13", "11", "16", "24"], "ans": 2, "exp": "चौपाई सम मात्रिक छंद है जिसके चारों चरणों में 16-16 मात्राएँ होती हैं।"}, {"q": "'चारु चंद्र की चंचल किरणें खेल रही थीं जल-थल में' — इसमें कौन-सा अलंकार है?", "opts": ["यमक", "अनुप्रास अलंकार", "उपमा", "श्लेष"], "ans": 1, "exp": "'च' वर्ण की बार-बार आवृत्ति होने से यहाँ अनुप्रास अलंकार है।"}, {"q": "'कनक-कनक ते सौ गुनी, मादकता अधिकाय' में कौन-सा अलंकार है?", "opts": ["अनुप्रास", "यमक अलंकार", "रूपक", "उत्प्रेक्षा"], "ans": 1, "exp": "एक ही शब्द 'कनक' के दो बार अलग-अलग अर्थों (सोना व धतूरा) में प्रयोग से यमक अलंकार है।"}, {"q": "'रहिमन पानी राखिए, बिन पानी सब सून' में कौन-सा अलंकार है?", "opts": ["श्लेष अलंकार", "यमक", "उपमा", "अतिशयोक्ति"], "ans": 0, "exp": "एक ही शब्द 'पानी' के तीन अर्थ (कांति, सम्मान, जल) चिपके होने से श्लेष अलंकार है।"}, {"q": "'चरण-कमल बंदौ हरिराई' में कौन-सा अलंकार है?", "opts": ["उपमा", "रूपक अलंकार", "उत्प्रेक्षा", "यमक"], "ans": 1, "exp": "उपमेय (चरण) पर उपमान (कमल) का अभेद आरोप होने से रूपक अलंकार है।"}, {"q": "प्रसिद्ध महाकाव्य 'कामायनी' के रचयिता कौन हैं?", "opts": ["सुमित्रानंदन पंत", "जयशंकर प्रसाद", "सूर्यकांत त्रिपाठी 'निराला'", "महादेवी वर्मा"], "ans": 1, "exp": "जयशंकर प्रसाद हिंदी छायावाद के प्रमुख स्तंभ व 'कामायनी' के रचयिता हैं।"}, {"q": "'गोदान' और 'गबन' किस प्रसिद्ध साहित्यकार के उपन्यास हैं?", "opts": ["जयशंकर प्रसाद", "मुंशी प्रेमचंद", "फणीश्वरनाथ रेणु", "रामधारी सिंह दिनकर"], "ans": 1, "exp": "उपन्यास सम्राट मुंशी प्रेमचंद ने गोदान, गबन, सेवासदन व निर्मला की रचना की।"}, {"q": "'रामचरितमानस' की रचना गोस्वामी तुलसीदास ने किस भाषा में की थी?", "opts": ["ब्रजभाषा", "अवधी", "खड़ी बोली", "मैथिली"], "ans": 1, "exp": "गोस्वामी तुलसीदास कृत रामचरितमानस अवधी भाषा में लिखा गया है।"}, {"q": "'मधुशाला' काव्य संग्रह के रचनाकार कौन हैं?", "opts": ["हरिवंश राय बच्चन", "रामधारी सिंह दिनकर", "मैथिलीशरण गुप्त", "अज्ञेय"], "ans": 0, "exp": "हरिवंश राय बच्चन की अमर कृति 'मधुशाला' (1935) है।"}, {"q": "'अंधेर नगरी' और 'भारत दुर्दशा' नाटकों के लेखक कौन हैं?", "opts": ["भारतेंदु हरिश्चंद्र", "मोहन राकेश", "हजारीप्रसाद द्विवेदी", "महावीर प्रसाद द्विवेदी"], "ans": 0, "exp": "हिंदी नवजागरण के अग्रदूत भारतेंदु हरिश्चंद्र ने इनकी रचना की।"}, {"q": "'रश्मिरथी' और 'उर्वशी' किस कवि की प्रसिद्ध रचनाएँ हैं?", "opts": ["माखनलाल चतुर्वेदी", "रामधारी सिंह दिनकर", "सुभद्रा कुमारी चौहान", "नागार्जुन"], "ans": 1, "exp": "राष्ट्रकवि रामधारी सिंह दिनकर को 'उर्वशी' के लिए ज्ञानपीठ पुरस्कार मिला था।"}, {"q": "'बीजक' (साखी, सबद, रमैनी) किस संत कवि की रचनाओं का संग्रह है?", "opts": ["सूरदास", "कबीरदास", "रैदास", "मीराबाई"], "ans": 1, "exp": "कबीरदास जी की वाणी का संग्रह 'बीजक' उनके शिष्य धर्मदास ने किया।"}, {"q": "'जहाँ पहुँचना कठिन हो' वाक्यांश के लिए एक शब्द क्या होगा?", "opts": ["सुगम", "दुर्गम", "अगम्य", "कठिन"], "ans": 1, "exp": "जहाँ पहुँचना कठिन हो उसे 'दुर्गम' कहते हैं।"}, {"q": "छंद के अंगों में 'यति' का अर्थ क्या होता है?", "opts": ["मात्राओं की संख्या", "पढ़ते समय रुकने या विराम का स्थान", "अंतिम अक्षरों की समानता", "लय"], "ans": 1, "exp": "छंद पाठ में बीच में रुकने के स्थान को 'यति' कहते हैं।"}, {"q": "वाक्य में क्रिया के होने के समय का बोध किससे होता है?", "opts": ["वचन", "काल", "लिंग", "कारक"], "ans": 1, "exp": "क्रिया के जिस रूप से उसके होने के समय का बोध हो, उसे काल कहते हैं।"}]}, "english_s1": {"title": "🔤 सामान्य अंग्रेज़ी (English) — सेट 1 (100 प्रश्न)", "questions": [{"q": "Choose the correct article: He is ___ honest man.", "opts": ["a", "an", "the", "no article"], "ans": 1, "exp": "'Honest' begins with a vowel sound /ɒ/, so 'an' is used."}, {"q": "Choose the correct article: She is ___ university student.", "opts": ["a", "an", "the", "no article"], "ans": 0, "exp": "'University' begins with a consonant 'yu' sound, so 'a' is used."}, {"q": "Fill in the blank: ___ Ganga is a sacred river.", "opts": ["A", "An", "The", "No article"], "ans": 2, "exp": "'The' is used before names of rivers."}, {"q": "Fill in the blank: My brother is ___ M.L.A.", "opts": ["a", "an", "the", "no article"], "ans": 1, "exp": "'M' is pronounced 'em' (vowel sound), so 'an' is used."}, {"q": "Fill in the blank: ___ sun rises in the east.", "opts": ["A", "An", "The", "No article"], "ans": 2, "exp": "'The' is used before unique celestial bodies."}, {"q": "Fill in the blank: Gold is ___ precious metal.", "opts": ["a", "an", "the", "no article"], "ans": 0, "exp": "'Precious' starts with a consonant sound, so 'a' is used."}, {"q": "Fill in the blank: He plays ___ harmonium very well.", "opts": ["a", "an", "the", "no article"], "ans": 2, "exp": "'The' is used before musical instruments."}, {"q": "Fill in the blank: I saw ___ one-eyed man yesterday.", "opts": ["a", "an", "the", "no article"], "ans": 0, "exp": "'One' starts with a 'w' consonant sound, so 'a' is used."}, {"q": "Fill in the blank: ___ Mount Everest is the highest peak.", "opts": ["A", "An", "The", "No article"], "ans": 3, "exp": "No article is used before individual mountain peaks."}, {"q": "Fill in the blank: Copper is ___ useful metal.", "opts": ["a", "an", "the", "no article"], "ans": 0, "exp": "'Useful' begins with a 'yu' consonant sound, so 'a' is used."}, {"q": "Fill in the blank: He is afraid ___ dogs.", "opts": ["from", "of", "with", "by"], "ans": 1, "exp": "'Afraid' is always followed by the preposition 'of'."}, {"q": "Fill in the blank: The cat jumped ___ the table.", "opts": ["in", "upon", "into", "at"], "ans": 1, "exp": "'Upon' indicates motion onto a surface."}, {"q": "Fill in the blank: She has been living here ___ 2018.", "opts": ["for", "since", "from", "by"], "ans": 1, "exp": "'Since' is used for a specific point of time."}, {"q": "Fill in the blank: I have been waiting ___ two hours.", "opts": ["since", "for", "from", "during"], "ans": 1, "exp": "'For' is used for a duration/period of time."}, {"q": "Fill in the blank: Distribute these sweets ___ the two brothers.", "opts": ["among", "between", "within", "for"], "ans": 1, "exp": "'Between' is used for two persons/things; 'among' for more than two."}, {"q": "Fill in the blank: He died ___ malaria.", "opts": ["from", "of", "by", "with"], "ans": 1, "exp": "'Die of' is used when death is caused by a disease."}, {"q": "Fill in the blank: She is good ___ Mathematics.", "opts": ["in", "at", "on", "with"], "ans": 1, "exp": "'Good at' is used to show skill in a subject or activity."}, {"q": "Fill in the blank: The train arrived ___ the station on time.", "opts": ["to", "at", "in", "on"], "ans": 1, "exp": "'Arrive at' is used for stations, airports, or small places."}, {"q": "Fill in the blank: He prefers tea ___ coffee.", "opts": ["than", "to", "from", "over"], "ans": 1, "exp": "'Prefer' takes 'to', not 'than'."}, {"q": "Fill in the blank: Listen ___ what your teacher says.", "opts": ["at", "to", "for", "on"], "ans": 1, "exp": "'Listen' is always followed by 'to'."}, {"q": "Fill in the blank: The book is lying ___ the desk.", "opts": ["on", "in", "into", "at"], "ans": 0, "exp": "'On' denotes contact with a surface."}, {"q": "Fill in the blank: He is senior ___ me by two years.", "opts": ["than", "to", "from", "of"], "ans": 1, "exp": "Adjectives ending in -ior (senior, junior, superior) take 'to'."}, {"q": "Fill in the blank: Beware ___ pickpockets.", "opts": ["from", "of", "with", "to"], "ans": 1, "exp": "'Beware of' is the correct fixed preposition."}, {"q": "Fill in the blank: He divided the property ___ his four sons.", "opts": ["between", "among", "into", "with"], "ans": 1, "exp": "'Among' is used for more than two persons."}, {"q": "Fill in the blank: I agree ___ your proposal.", "opts": ["with", "to", "on", "at"], "ans": 1, "exp": "We 'agree with' a person, and 'agree to' a proposal."}, {"q": "Choose the correct verb: Neither Ram nor Shyam ___ present today.", "opts": ["are", "was", "were", "have"], "ans": 1, "exp": "With 'Neither...nor' and singular subjects, a singular verb ('was') is used."}, {"q": "Choose the correct verb: Slow and steady ___ the race.", "opts": ["win", "wins", "winning", "won"], "ans": 1, "exp": "'Slow and steady' expresses a single idea, so singular verb 'wins' is used."}, {"q": "Fill in the blank: The earth ___ round the sun.", "opts": ["move", "moves", "moved", "moving"], "ans": 1, "exp": "Universal truths take Simple Present Tense ('moves')."}, {"q": "Fill in the blank: If it rains, we ___ stay at home.", "opts": ["would", "will", "had", "were"], "ans": 1, "exp": "First conditional: If + Present Simple, Future Simple ('will')."}, {"q": "Fill in the blank: Bread and butter ___ my favourite breakfast.", "opts": ["are", "is", "were", "have"], "ans": 1, "exp": "'Bread and butter' refers to one dish, taking singular verb 'is'."}, {"q": "Fill in the blank: Each of the boys ___ given a prize.", "opts": ["were", "was", "are", "have"], "ans": 1, "exp": "'Each of' is followed by a plural noun and a singular verb ('was')."}, {"q": "Fill in the blank: Yesterday, I ___ a letter to my friend.", "opts": ["write", "wrote", "written", "am writing"], "ans": 1, "exp": "'Yesterday' indicates Simple Past Tense ('wrote')."}, {"q": "Fill in the blank: She ___ cooking food when I reached home.", "opts": ["is", "was", "has", "will"], "ans": 1, "exp": "Past continuous action interrupted by past simple takes 'was'."}, {"q": "Fill in the blank: The train had left before we ___ the station.", "opts": ["reach", "reached", "had reached", "will reach"], "ans": 1, "exp": "The second action in past takes Simple Past ('reached')."}, {"q": "Fill in the blank: Mathematics ___ a difficult subject for some.", "opts": ["are", "is", "were", "have"], "ans": 1, "exp": "Names of subjects ending in -s take a singular verb ('is')."}, {"q": "Fill in the blank: One of my friends ___ in Raipur.", "opts": ["live", "lives", "living", "are living"], "ans": 1, "exp": "'One of + plural noun' takes a singular verb ('lives')."}, {"q": "Fill in the blank: By next year, she ___ her degree.", "opts": ["will complete", "will have completed", "completes", "completed"], "ans": 1, "exp": "'By next year' indicates Future Perfect Tense."}, {"q": "Fill in the blank: Look! It ___ outside.", "opts": ["rains", "is raining", "rained", "rain"], "ans": 1, "exp": "'Look!' indicates an action happening right now (Present Continuous)."}, {"q": "Fill in the blank: Either you or he ___ to blame.", "opts": ["are", "is", "were", "have"], "ans": 1, "exp": "Verb agrees with the nearer subject ('he' -> 'is')."}, {"q": "Fill in the blank: A bouquet of flowers ___ placed on the table.", "opts": ["were", "was", "are", "have"], "ans": 1, "exp": "Collective noun 'a bouquet' takes a singular verb ('was')."}, {"q": "Change to Passive Voice: 'Ram writes a letter.'", "opts": ["A letter is written by Ram.", "A letter was written by Ram.", "A letter is being written by Ram.", "A letter has been written by Ram."], "ans": 0, "exp": "Simple Present Active converts to is/am/are + V3."}, {"q": "Change to Passive Voice: 'She sang a sweet song.'", "opts": ["A sweet song is sung by her.", "A sweet song was sung by her.", "A sweet song was being sung by her.", "A sweet song had sung by her."], "ans": 1, "exp": "Simple Past Active converts to was/were + V3."}, {"q": "Change to Passive Voice: 'Open the door.'", "opts": ["Let the door be opened.", "The door is opened.", "Let the door opened.", "You open the door."], "ans": 0, "exp": "Imperative sentences take 'Let + object + be + V3'."}, {"q": "Change to Passive Voice: 'Who broke this glass?'", "opts": ["By whom was this glass broken?", "Who was broken this glass?", "By whom is this glass broken?", "Whom did break this glass?"], "ans": 0, "exp": "'Who' changes to 'By whom' in passive voice."}, {"q": "Change to Passive Voice: 'They are playing cricket.'", "opts": ["Cricket is played by them.", "Cricket is being played by them.", "Cricket was being played by them.", "Cricket has been played by them."], "ans": 1, "exp": "Present Continuous Passive takes 'is/are + being + V3'."}, {"q": "Change to Indirect Speech: He said, 'I am busy.'", "opts": ["He said that he is busy.", "He said that he was busy.", "He told that he was busy.", "He said he will be busy."], "ans": 1, "exp": "Present Simple changes to Past Simple when reporting verb is in past."}, {"q": "Change to Indirect Speech: She said to me, 'Where do you live?'", "opts": ["She asked me where I lived.", "She asked me where did I live.", "She told me where I live.", "She asked me where do I live."], "ans": 0, "exp": "Interrogative reported speech uses 'asked' and assertive word order."}, {"q": "Change to Indirect Speech: The teacher said, 'The earth is round.'", "opts": ["The teacher said that the earth was round.", "The teacher said that the earth is round.", "The teacher told that earth is round.", "The teacher asked if the earth is round."], "ans": 1, "exp": "Universal truths do not change their tense in Indirect Speech."}, {"q": "Change to Indirect Speech: He said, 'Honesty is the best policy.'", "opts": ["He said that honesty was the best policy.", "He said that honesty is the best policy.", "He said honesty will be best policy.", "He told honesty is best policy."], "ans": 1, "exp": "Proverbs and universal truths remain in Present Tense."}, {"q": "Change to Indirect Speech: Ram said to Sita, 'Please help me.'", "opts": ["Ram ordered Sita to help him.", "Ram requested Sita to help him.", "Ram asked Sita please help me.", "Ram told Sita to help me."], "ans": 1, "exp": "'Please' converts to 'requested' + to + V1."}, {"q": "Change to Passive Voice: 'I know him.'", "opts": ["He is known by me.", "He is known to me.", "He was known to me.", "He is being known by me."], "ans": 1, "exp": "'Known' takes the preposition 'to' instead of 'by'."}, {"q": "Change to Passive Voice: 'Someone has stolen my pen.'", "opts": ["My pen has been stolen.", "My pen was stolen.", "My pen is stolen.", "My pen had been stolen."], "ans": 0, "exp": "Present Perfect Passive uses 'has/have + been + V3'."}, {"q": "Change to Indirect Speech: He said, 'I will go tomorrow.'", "opts": ["He said that he would go the next day.", "He said that he will go tomorrow.", "He said that he went the next day.", "He said he would go yesterday."], "ans": 0, "exp": "'Will' becomes 'would' and 'tomorrow' becomes 'the next day'."}, {"q": "Change to Passive Voice: 'The boy is flying a kite.'", "opts": ["A kite is flown by the boy.", "A kite is being flown by the boy.", "A kite was being flown by the boy.", "A kite has been flown by the boy."], "ans": 1, "exp": "Present Continuous Passive: is + being + V3 (flown)."}, {"q": "Change to Indirect Speech: She said, 'Alas! I am ruined.'", "opts": ["She exclaimed with sorrow that she was ruined.", "She said alas she is ruined.", "She exclaimed with joy that she was ruined.", "She told that she is ruined."], "ans": 0, "exp": "'Alas!' expresses sorrow -> 'exclaimed with sorrow'."}, {"q": "Choose the correct Synonym of 'ABUNDANT':", "opts": ["Scarce", "Plentiful", "Empty", "Tiny"], "ans": 1, "exp": "Abundant means existing in large quantities (Plentiful)."}, {"q": "Choose the correct Synonym of 'COURAGE':", "opts": ["Fear", "Bravery", "Weakness", "Anger"], "ans": 1, "exp": "Courage means bravery or valour."}, {"q": "Choose the correct Synonym of 'BRIEF':", "opts": ["Long", "Short", "Wide", "Heavy"], "ans": 1, "exp": "Brief means concise or short in duration."}, {"q": "Choose the correct Synonym of 'GENUINE':", "opts": ["Fake", "Authentic", "False", "Artificial"], "ans": 1, "exp": "Genuine means real or authentic."}, {"q": "Choose the correct Synonym of 'DILIGENT':", "opts": ["Lazy", "Hardworking", "Careless", "Slow"], "ans": 1, "exp": "Diligent means showing steady, hardworking effort."}, {"q": "Choose the correct Synonym of 'TRANSPARENT':", "opts": ["Opaque", "Clear", "Dark", "Cloudy"], "ans": 1, "exp": "Transparent means allowing light to pass through clearly."}, {"q": "Choose the correct Synonym of 'VANISH':", "opts": ["Appear", "Disappear", "Arrive", "Stay"], "ans": 1, "exp": "Vanish means to disappear suddenly."}, {"q": "Choose the correct Synonym of 'FEEBLE':", "opts": ["Strong", "Weak", "Bold", "Loud"], "ans": 1, "exp": "Feeble means lacking physical strength (Weak)."}, {"q": "Choose the correct Synonym of 'HUMBLE':", "opts": ["Proud", "Modest", "Rude", "Cruel"], "ans": 1, "exp": "Humble means modest and not arrogant."}, {"q": "Choose the correct Synonym of 'VIGILANT':", "opts": ["Careless", "Watchful", "Sleepy", "Blind"], "ans": 1, "exp": "Vigilant means keeping careful watch for danger (Watchful)."}, {"q": "Choose the correct Antonym of 'ANCIENT':", "opts": ["Old", "Modern", "Antique", "Past"], "ans": 1, "exp": "Ancient (very old) is the opposite of Modern."}, {"q": "Choose the correct Antonym of 'OPTIMIST':", "opts": ["Idealist", "Pessimist", "Realist", "Activist"], "ans": 1, "exp": "Optimist (hopeful) is the opposite of Pessimist."}, {"q": "Choose the correct Antonym of 'PROSPERITY':", "opts": ["Wealth", "Adversity", "Success", "Fortune"], "ans": 1, "exp": "Prosperity (success/wealth) is opposite to Adversity."}, {"q": "Choose the correct Antonym of 'EXPAND':", "opts": ["Grow", "Contract", "Enlarge", "Spread"], "ans": 1, "exp": "Expand (grow larger) is the opposite of Contract (shrink)."}, {"q": "Choose the correct Antonym of 'KNOWLEDGE':", "opts": ["Wisdom", "Ignorance", "Education", "Learning"], "ans": 1, "exp": "Knowledge is the opposite of Ignorance."}, {"q": "Choose the correct Antonym of 'HARMONY':", "opts": ["Peace", "Discord", "Unity", "Agreement"], "ans": 1, "exp": "Harmony (agreement) is the opposite of Discord (conflict)."}, {"q": "Choose the correct Antonym of 'VIRTUE':", "opts": ["Goodness", "Vice", "Honesty", "Truth"], "ans": 1, "exp": "Virtue (moral goodness) is the opposite of Vice."}, {"q": "Choose the correct Antonym of 'BARREN':", "opts": ["Dry", "Fertile", "Empty", "Desert"], "ans": 1, "exp": "Barren (unproductive land) is opposite to Fertile."}, {"q": "Choose the correct Antonym of 'CONCEAL':", "opts": ["Hide", "Reveal", "Cover", "Mask"], "ans": 1, "exp": "Conceal (hide) is the opposite of Reveal (show)."}, {"q": "Choose the correct Antonym of 'PERMANENT':", "opts": ["Fixed", "Temporary", "Lasting", "Constant"], "ans": 1, "exp": "Permanent is the opposite of Temporary."}, {"q": "Meaning of the idiom 'A piece of cake':", "opts": ["A difficult task", "A very easy task", "A sweet dish", "A costly item"], "ans": 1, "exp": "'A piece of cake' means something very easy to do."}, {"q": "Meaning of the idiom 'Once in a blue moon':", "opts": ["Very frequently", "Very rarely", "Every night", "Never"], "ans": 1, "exp": "'Once in a blue moon' means happening very rarely."}, {"q": "Meaning of the idiom 'Break the ice':", "opts": ["To start a conversation", "To cool water", "To fight", "To slip"], "ans": 0, "exp": "'Break the ice' means to initiate social interaction or conversation."}, {"q": "Meaning of the idiom 'Blessing in disguise':", "opts": ["A hidden curse", "Something good that seemed bad at first", "A magic trick", "A false friend"], "ans": 1, "exp": "An apparent misfortune that eventually has good results."}, {"q": "Meaning of the idiom 'Burn the midnight oil':", "opts": ["Waste electricity", "Work or study late into the night", "Light a lamp", "Sleep early"], "ans": 1, "exp": "Means studying or working hard late at night."}, {"q": "One-word substitution: 'One who knows everything':", "opts": ["Omnipresent", "Omniscient", "Omnipotent", "Optimist"], "ans": 1, "exp": "Omniscient = all-knowing; Omnipotent = all-powerful; Omnipresent = present everywhere."}, {"q": "One-word substitution: 'A life history written by oneself':", "opts": ["Biography", "Autobiography", "History", "Novel"], "ans": 1, "exp": "Autobiography is written by the person themselves."}, {"q": "One-word substitution: 'A person who cannot read or write':", "opts": ["Literate", "Illiterate", "Scholar", "Editor"], "ans": 1, "exp": "Illiterate means unable to read or write."}, {"q": "One-word substitution: 'Government by the people':", "opts": ["Autocracy", "Democracy", "Monarchy", "Anarchy"], "ans": 1, "exp": "Democracy is government of, by, and for the people."}, {"q": "One-word substitution: 'A person who does not believe in God':", "opts": ["Theist", "Atheist", "Saint", "Monk"], "ans": 1, "exp": "Theist believes in God; Atheist does not."}, {"q": "One-word substitution: 'That which cannot be seen':", "opts": ["Visible", "Invisible", "Opaque", "Transparent"], "ans": 1, "exp": "Invisible means unable to be seen."}, {"q": "One-word substitution: 'A place where books are kept':", "opts": ["Museum", "Library", "Laboratory", "Zoo"], "ans": 1, "exp": "A Library houses books for reading and reference."}, {"q": "Find the correctly spelt word:", "opts": ["Recieve", "Receive", "Receve", "Recive"], "ans": 1, "exp": "'Receive' follows 'i before e except after c'."}, {"q": "Find the correctly spelt word:", "opts": ["Separate", "Seperate", "Separete", "Seperete"], "ans": 0, "exp": "The correct spelling is 'Separate'."}, {"q": "Find the correctly spelt word:", "opts": ["Accomodation", "Accommodation", "Acomodation", "Accommodaton"], "ans": 1, "exp": "'Accommodation' has double 'c' and double 'm'."}, {"q": "Find the correctly spelt word:", "opts": ["Grammar", "Grammer", "Gramar", "Gramer"], "ans": 0, "exp": "The correct spelling is 'Grammar'."}, {"q": "Find the correctly spelt word:", "opts": ["Tommorow", "Tomorrow", "Tomorow", "Tommorrow"], "ans": 1, "exp": "The correct spelling is 'Tomorrow' (one 'm', double 'r')."}, {"q": "Choose the correct plural of 'Child':", "opts": ["Childs", "Children", "Childrens", "Childes"], "ans": 1, "exp": "'Children' is the irregular plural of 'Child'."}, {"q": "Choose the correct plural of 'Mouse':", "opts": ["Mouses", "Mice", "Mices", "Mouse"], "ans": 1, "exp": "'Mice' is the irregular plural of 'Mouse'."}, {"q": "Identify the Part of Speech of the underlined word: 'She runs FAST.'", "opts": ["Noun", "Adverb", "Pronoun", "Conjunction"], "ans": 1, "exp": "'Fast' modifies the verb 'runs', so it is an Adverb."}, {"q": "Identify the Part of Speech: 'Honesty is a GREAT virtue.'", "opts": ["Adjective", "Adverb", "Verb", "Preposition"], "ans": 0, "exp": "'Great' describes the noun 'virtue', so it is an Adjective."}, {"q": "Choose the correct comparative degree: 'Iron is ___ than wood.'", "opts": ["heavy", "heavier", "heaviest", "more heavy"], "ans": 1, "exp": "'Heavier' is used with 'than' in comparative degree."}, {"q": "Choose the correct superlative degree: 'He is the ___ boy in the class.'", "opts": ["tall", "taller", "tallest", "more tall"], "ans": 2, "exp": "'The' precedes the superlative degree 'tallest'."}, {"q": "Fill in the blank with a question tag: 'She is singing, ___?'", "opts": ["isn't she", "is she", "doesn't she", "wasn't she"], "ans": 0, "exp": "Positive statement with 'is' takes negative tag 'isn't she'."}, {"q": "Spot the error: 'He is / one of the best / player in the team.'", "opts": ["He is", "one of the best", "player in the team", "No error"], "ans": 2, "exp": "'One of the' is always followed by a plural noun ('players')."}]}, "computer_s1": {"title": "💻 कंप्यूटर का सामान्य ज्ञान — सेट 1 (100 प्रश्न)", "questions": [{"q": "कंप्यूटर का जनक (Father of Computer) किसे कहा जाता है?", "opts": ["बिल गेट्स", "चार्ल्स बैबेज", "एलन ट्यूरिंग", "ब्लेज पास्कल"], "ans": 1, "exp": "चार्ल्स बैबेज ने एनालिटिकल इंजन की संकल्पना दी, अतः उन्हें कंप्यूटर का जनक कहते हैं।"}, {"q": "विश्व का प्रथम इलेक्ट्रॉनिक डिजिटल कंप्यूटर कौन-सा था?", "opts": ["ENIAC", "ABACUS", "PASCALINE", "PARAM"], "ans": 0, "exp": "1946 में निर्मित ENIAC (Electronic Numerical Integrator and Computer) पहला इलेक्ट्रॉनिक कंप्यूटर था।"}, {"q": "प्रथम पीढ़ी (First Generation) के कंप्यूटरों में किस तकनीक का प्रयोग किया गया था?", "opts": ["ट्रांजिस्टर", "वैक्यूम ट्यूब (निर्वात नलिका)", "IC चिप", "माइक्रोप्रोसेसर"], "ans": 1, "exp": "पहली पीढ़ी (1942-1955) में वैक्यूम ट्यूब और दूसरी पीढ़ी में ट्रांजिस्टर का उपयोग हुआ।"}, {"q": "तीसरी पीढ़ी के कंप्यूटरों में किसका प्रयोग किया गया?", "opts": ["वैक्यूम ट्यूब", "ट्रांजिस्टर", "इंटीग्रेटेड सर्किट (IC चिप)", "AI"], "ans": 2, "exp": "तीसरी पीढ़ी में सिलिकॉन से बनी IC (Integrated Circuit) चिप का इस्तेमाल हुआ।"}, {"q": "चौथी पीढ़ी के कंप्यूटरों का मुख्य आधार क्या था?", "opts": ["माइक्रोप्रोसेसर (VLSI)", "वैक्यूम ट्यूब", "मैग्नेटिक ड्रम", "पंच कार्ड"], "ans": 0, "exp": "चौथी पीढ़ी में माइक्रोप्रोसेसर (VLSI तकनीक) से पर्सनल कंप्यूटर (PC) संभव हुए।"}, {"q": "भारत द्वारा विकसित प्रथम सुपर कंप्यूटर कौन-सा है?", "opts": ["आदित्य", "परम-8000 (PARAM 8000)", "प्रत्युष", "मिहिर"], "ans": 1, "exp": "C-DAC पुणे द्वारा 1991 में निर्मित 'परम-8000' भारत का पहला सुपर कंप्यूटर है।"}, {"q": "पाँचवीं पीढ़ी के कंप्यूटर किस मुख्य तकनीक पर आधारित हैं?", "opts": ["वैक्यूम ट्यूब", "कृत्रिम बुद्धिमत्ता (Artificial Intelligence - AI)", "केवल ट्रांजिस्टर", "पंच कार्ड"], "ans": 1, "exp": "पाँचवीं पीढ़ी ULSI और AI (कृत्रिम बुद्धिमत्ता) पर आधारित है।"}, {"q": "कंप्यूटर डेटा को किस भाषा (संख्या प्रणाली) में समझता है?", "opts": ["दशमलव", "बाइनरी (0 और 1)", "ऑक्टल", "रोमन"], "ans": 1, "exp": "कंप्यूटर केवल मशीनी / बाइनरी भाषा (0 और 1) को समझता है।"}, {"q": "IC चिप (एकीकृत परिपथ) का निर्माण मुख्यतः किस अर्धचालक धातु से होता है?", "opts": ["तांबा", "सिलिकॉन", "लोहा", "चांदी"], "ans": 1, "exp": "IC चिप अर्धचालक सिलिकॉन (Silicon) से बनाई जाती है।"}, {"q": "गणना करने वाला संसार का सबसे प्राचीन यंत्र कौन-सा माना जाता है?", "opts": ["एबेकस (Abacus)", "कैलकुलेटर", "एनालिटिकल इंजन", "ENIAC"], "ans": 0, "exp": "एबेकस प्राचीनतम गणना यंत्र है।"}, {"q": "कंप्यूटर साक्षरता दिवस प्रतिवर्ष कब मनाया जाता है?", "opts": ["1 दिसंबर", "2 दिसंबर", "10 दिसंबर", "15 अगस्त"], "ans": 1, "exp": "2 दिसंबर को विश्व कंप्यूटर साक्षरता दिवस मनाया जाता है।"}, {"q": "माउस का आविष्कार किसने किया था?", "opts": ["डगलस एंजेलबर्ट", "टिम बर्नर्स ली", "जेम्स गोसलिंग", "डेनिस रिची"], "ans": 0, "exp": "1964 में डगलस एंजेलबर्ट ने कंप्यूटर माउस का आविष्कार किया था।"}, {"q": "कंप्यूटर का 'मस्तिष्क' (Brain of Computer) किसे कहा जाता है?", "opts": ["RAM", "CPU (सेंट्रल प्रोसेसिंग यूनिट)", "हार्ड डिस्क", "मॉनिटर"], "ans": 1, "exp": "CPU सभी गणनाओं और निर्देशों को नियंत्रित करता है।"}, {"q": "CPU के मुख्य तीन भाग कौन-से होते हैं?", "opts": ["ALU, CU और मेमोरी/रजिस्टर", "RAM, ROM, CD", "कीबोर्ड, माउस, प्रिंटर", "BIOS, OS, ऐप"], "ans": 0, "exp": "अंकगणितीय तर्क इकाई (ALU), नियंत्रण इकाई (CU) और रजिस्टर मेमोरी।"}, {"q": "कंप्यूटर में सभी गणितीय और तार्किक गणनाएँ कौन करता है?", "opts": ["CU", "ALU (Arithmetic Logic Unit)", "ROM", "मॉडेम"], "ans": 1, "exp": "ALU जोड़, घटाव, गुणा, भाग व तार्किक तुलना करता है।"}, {"q": "निम्नलिखित में से कौन-सा एक 'इनपुट डिवाइस' (Input Device) है?", "opts": ["प्रिंटर", "मॉनिटर", "स्कैनर / कीबोर्ड", "स्पीकर"], "ans": 2, "exp": "कीबोर्ड, माउस, स्कैनर, जॉयस्टिक, MICR और OMR इनपुट डिवाइस हैं।"}, {"q": "इनमें से कौन-सा एक 'आउटपुट डिवाइस' (Output Device) है?", "opts": ["माइक्रोफोन", "प्लॉटर / प्रिंटर", "बारकोड रीडर", "ट्रैकबॉल"], "ans": 1, "exp": "मॉनिटर, प्रिंटर, प्लॉटर और स्पीकर आउटपुट डिवाइस हैं।"}, {"q": "परीक्षा की उत्तर-पुस्तिकाओं (गोले भरने वाली शीट) को जांचने के लिए किस डिवाइस का उपयोग होता है?", "opts": ["OCR", "OMR (Optical Mark Reader)", "MICR", "QR स्कैनर"], "ans": 1, "exp": "OMR मशीन पेंसिल/पेन के निशानों को पढ़ती है।"}, {"q": "बैंकों में चेक (Cheque) पर लिखे विशेष चुंबकीय कोड को पढ़ने के लिए किसका उपयोग होता है?", "opts": ["OMR", "MICR (Magnetic Ink Character Recognition)", "OCR", "OCR"], "ans": 1, "exp": "बैंकिंग चेक के नीचे MICR कोड पढ़ने के लिए MICR रीडर प्रयुक्त होता है।"}, {"q": "प्रिंटर की गुणवत्ता (Resolution) किस इकाई में मापी जाती है?", "opts": ["Hz", "DPI (Dots Per Inch)", "Mbps", "RPM"], "ans": 1, "exp": "प्रिंटर की स्पष्टता DPI (डॉट्स प्रति इंच) में मापी जाती है।"}, {"q": "लेजर प्रिंटर किस प्रकार का प्रिंटर है?", "opts": ["इम्पैक्ट प्रिंटर", "नॉन-इम्पैक्ट प्रिंटर", "लाइन प्रिंटर", "डॉट मैट्रिक्स"], "ans": 1, "exp": "लेजर व इंकजेट नॉन-इम्पैक्ट (बिना टकराए प्रिंट करने वाले) प्रिंटर हैं।"}, {"q": "एक स्टैंडर्ड QWERTY कीबोर्ड में कुल कितनी फंक्शन कुंजियाँ (F1 से...) होती हैं?", "opts": ["10", "12 (F1 से F12)", "8", "14"], "ans": 1, "exp": "कीबोर्ड के सबसे ऊपर F1 से F12 तक 12 फंक्शन की होती हैं।"}, {"q": "कंप्यूटर की प्राथमिक और अस्थायी (Volatile) मेमोरी कौन-सी है?", "opts": ["ROM", "RAM (रैंडम एक्सेस मेमोरी)", "हार्ड डिस्क", "पेन ड्राइव"], "ans": 1, "exp": "बिजली बंद होने पर RAM का डेटा मिट जाता है, अतः यह अस्थायी मेमोरी है।"}, {"q": "कंप्यूटर को बूट करने के आवश्यक निर्देश (BIOS) स्थायी रूप से किस मेमोरी में रहते हैं?", "opts": ["RAM", "ROM (रीड ओनली मेमोरी)", "कैश मेमोरी", "रजिस्टर"], "ans": 1, "exp": "ROM स्थायी (Non-volatile) मेमोरी है जिसमें BIOS स्टोर रहता है।"}, {"q": "कंप्यूटर मेमोरी की सबसे छोटी इकाई क्या है?", "opts": ["बाइट", "बिट (Bit - 0 या 1)", "निबल", "किलोबाइट"], "ans": 1, "exp": "1 Bit (Binary Digit) मेमोरी की सबसे छोटी इकाई है।"}, {"q": "1 बाइट (Byte) कितने बिट्स के बराबर होता है?", "opts": ["4 बिट्स", "8 बिट्स", "16 बिट्स", "1024 बिट्स"], "ans": 1, "exp": "8 बिट्स = 1 बाइट, और 4 बिट्स = 1 निबल।"}, {"q": "1 किलोबाइट (1 KB) में कितने बाइट्स होते हैं?", "opts": ["1000 बाइट्स", "1024 बाइट्स", "512 बाइट्स", "2048 बाइट्स"], "ans": 1, "exp": "1 KB = 1024 Bytes, 1 MB = 1024 KB, 1 GB = 1024 MB."}, {"q": "CPU और मुख्य मेमोरी (RAM) के बीच गति बढ़ाने के लिए किस अति तीव्र मेमोरी का उपयोग होता है?", "opts": ["हार्ड डिस्क", "कैश मेमोरी (Cache Memory)", "CD-ROM", "फ्लॉपी"], "ans": 1, "exp": "Cache मेमोरी CPU के सबसे करीब होती है और प्रोसेसिंग तेज करती है।"}, {"q": "SSD का पूर्ण रूप क्या है?", "opts": ["Solid State Drive", "Super Speed Disk", "System Storage Device", "Static State Disk"], "ans": 0, "exp": "SSD (Solid State Drive) पारंपरिक HDD से काफी तेज स्टोरेज डिवाइस है।"}, {"q": "पेन ड्राइव (USB Flash Drive) किस प्रकार की मेमोरी है?", "opts": ["प्राथमिक मेमोरी", "द्वितीयक (Secondary) फ्लैश मेमोरी", "कैश मेमोरी", "रजिस्टर"], "ans": 1, "exp": "यह एक पोर्टेबल द्वितीयक (Non-volatile) स्टोरेज मेमोरी है।"}, {"q": "एक सामान्य CD (Compact Disc) की भंडारण क्षमता लगभग कितनी होती है?", "opts": ["1.44 MB", "700 MB", "4.7 GB", "25 GB"], "ans": 1, "exp": "CD में लगभग 700 MB और DVD में 4.7 GB डेटा आता है।"}, {"q": "प्रोग्राम व डेटा के स्थायी भंडारण हेतु कंप्यूटर में मुख्य रूप से क्या लगा होता है?", "opts": ["RAM", "हार्ड डिस्क (HDD/SSD)", "ALU", "MODEM"], "ans": 1, "exp": "हार्ड डिस्क या SSD में ऑपरेटिंग सिस्टम व सभी फाइलें स्थायी रूप से सेव रहती हैं।"}, {"q": "मॉनिटर के स्क्रीन पर दिखने वाले छोटे-छोटे बिंदुओं को क्या कहते हैं?", "opts": ["पिक्सेल (Pixel)", "बाइट", "सेक्टर", "वेक्टर"], "ans": 0, "exp": "Picture Element या Pixel स्क्रीन की सबसे छोटी इकाई है।"}, {"q": "बड़े नक्शे, इंजीनियरिंग ड्राइंग और बैनर प्रिंट करने के लिए किस आउटपुट डिवाइस का प्रयोग होता है?", "opts": ["डॉट मैट्रिक्स", "प्लॉटर (Plotter)", "थर्मल प्रिंटर", "प्रोजेक्टर"], "ans": 1, "exp": "बड़े वेक्टर ग्राफिक्स और बैनर के लिए प्लॉटर का उपयोग होता है।"}, {"q": "कंप्यूटर को चालू करने पर सबसे पहले कौन-सा सॉफ्टवेयर लोड होता है?", "opts": ["MS Word", "ऑपरेटिंग सिस्टम (OS)", "ब्राउज़र", "पेंट"], "ans": 1, "exp": "ऑपरेटिंग सिस्टम (जैसे Windows, Linux, Android) हार्डवेयर और यूजर के बीच सेतु है।"}, {"q": "निम्नलिखित में से कौन-सा एक 'ओपन सोर्स' ऑपरेटिंग सिस्टम है?", "opts": ["Windows 11", "macOS", "Linux / Ubuntu", "iOS"], "ans": 2, "exp": "Linux एक निःशुल्क और ओपन-सोर्स ऑपरेटिंग सिस्टम है।"}, {"q": "Android किस कंपनी द्वारा विकसित मोबाइल ऑपरेटिंग सिस्टम है?", "opts": ["Apple", "Microsoft", "Google", "Samsung"], "ans": 2, "exp": "Android Google का मोबाइल ऑपरेटिंग सिस्टम है।"}, {"q": "MS Word, MS Excel और Tally किस प्रकार के सॉफ्टवेयर हैं?", "opts": ["सिस्टम सॉफ्टवेयर", "एप्लीकेशन सॉफ्टवेयर", "यूटिलिटी सॉफ्टवेयर", "फर्मवेयर"], "ans": 1, "exp": "यूजर के विशेष कार्य करने वाले प्रोग्राम एप्लीकेशन सॉफ्टवेयर कहलाते हैं।"}, {"q": "एंटीवायरस, डिस्क क्लीनअप और बैकअप प्रोग्राम किस श्रेणी के सॉफ्टवेयर हैं?", "opts": ["यूटिलिटी सॉफ्टवेयर", "गेम सॉफ्टवेयर", "ड्राइवर", "कंपाइलर"], "ans": 0, "exp": "सिस्टम के रखरखाव और सुरक्षा वाले प्रोग्राम यूटिलिटी सॉफ्टवेयर कहलाते हैं।"}, {"q": "MS Word में बनी फाइल का डिफ़ॉल्ट एक्सटेंशन (नए वर्जन में) क्या होता है?", "opts": [".txt", ".docx", ".xlsx", ".pptx"], "ans": 1, "exp": "MS Word का एक्सटेंशन .docx, Excel का .xlsx और PowerPoint का .pptx होता है।"}, {"q": "MS Word में किसी शब्द के नीचे लाल टेढ़ी-मेढ़ी (Red Wavy) लाइन क्या दर्शाती है?", "opts": ["व्याकरण की गलती", "वर्तनी (Spelling) की अशुद्धि", "हाइपरलिंक", "बोल्ड टेक्स्ट"], "ans": 1, "exp": "लाल लाइन Spelling Error तथा नीली/हरी लाइन Grammar Error दिखाती है।"}, {"q": "MS Excel में रो (Row) और कॉलम (Column) के कटान बिंदु (चौकोर बॉक्स) को क्या कहते हैं?", "opts": ["शीट", "सेल (Cell)", "फ़ॉर्मूला", "वर्कबुक"], "ans": 1, "exp": "रो और कॉलम के इंटरसेक्शन को Cell (जैसे A1, B2) कहते हैं।"}, {"q": "MS Excel में कोई भी फ़ॉर्मूला किस चिह्न से शुरू होता है?", "opts": ["+", "=", "@", "#"], "ans": 1, "exp": "Excel में प्रत्येक फ़ॉर्मूला बराबर (=) के चिह्न से प्रारंभ होता है।"}, {"q": "MS Excel में संख्याओं को जोड़ने का सही फ़ॉर्मूला क्या है?", "opts": ["=ADD(A1:A5)", "=SUM(A1:A5)", "=TOTAL(A1:A5)", "=PLUS(A1:A5)"], "ans": 1, "exp": "=SUM(A1:A5) रेंज की सभी संख्याओं को जोड़ता है।"}, {"q": "MS PowerPoint में प्रेजेंटेशन के एक पेज को क्या कहा जाता है?", "opts": ["डॉक्यूमेंट", "शीट", "स्लाइड (Slide)", "टेबल"], "ans": 2, "exp": "PowerPoint प्रेजेंटेशन स्लाइड्स से मिलकर बनता है।"}, {"q": "PowerPoint में स्लाइड शो (Slide Show) शुरू करने की शॉर्टकट कुंजी क्या है?", "opts": ["F1", "F5", "F7", "F12"], "ans": 1, "exp": "F5 दबाने से स्लाइड शो पहली स्लाइड से शुरू हो जाता है।"}, {"q": "PDF का पूर्ण रूप क्या होता है?", "opts": ["Personal Document File", "Portable Document Format", "Print Data Format", "Public Digital File"], "ans": 1, "exp": "Adobe द्वारा विकसित PDF का पूरा नाम Portable Document Format है।"}, {"q": "एक कंप्यूटर प्रोग्राम जो उच्च-स्तरीय भाषा (High Level Language) को एक साथ मशीनी भाषा में बदलता है:", "opts": ["असेंबलर", "कंपाइलर (Compiler)", "लिंकर", "लोडर"], "ans": 1, "exp": "कंपाइलर पूरे प्रोग्राम को एक साथ और इंटरप्रेटर लाइन-दर-लाइन अनुवाद करता है।"}, {"q": "MS Word में टेक्स्ट को बीच में (Center Align) करने की शॉर्टकट की क्या है?", "opts": ["Ctrl + C", "Ctrl + E", "Ctrl + L", "Ctrl + R"], "ans": 1, "exp": "Ctrl + E से Center, Ctrl + L से Left और Ctrl + R से Right अलाइनमेंट होता है।"}, {"q": "GUI का पूरा नाम क्या होता है?", "opts": ["Graphical User Interface", "General User Input", "Global Unit Internet", "Graphic Utility Icon"], "ans": 0, "exp": "Windows व Android आइकॉन और मेन्यू आधारित GUI का उपयोग करते हैं।"}, {"q": "MS Excel में कॉलम की पहचान किससे होती है?", "opts": ["संख्याओं (1, 2, 3) से", "अंग्रेजी अक्षरों (A, B, C) से", "प्रतीकों से", "रोमन अंकों से"], "ans": 1, "exp": "कॉलम A, B, C से तथा रो 1, 2, 3 से दर्शाई जाती हैं।"}, {"q": "कंप्यूटर को रीस्टार्ट करने की प्रक्रिया को क्या कहा जाता है?", "opts": ["कोल्ड बूटिंग", "वार्म बूटिंग (Warm Booting)", "शटडाउन", "हाइबरनेट"], "ans": 1, "exp": "चलते हुए कंप्यूटर को Restart करना Warm Booting कहलाता है।"}, {"q": "एक ही समय में एक से अधिक कार्य करने की ऑपरेटिंग सिस्टम की क्षमता क्या कहलाती है?", "opts": ["मल्टीटास्किंग (Multitasking)", "सिंगल प्रोसेसिंग", "डीबगिंग", "कंपाइलिंग"], "ans": 0, "exp": "एक साथ गाने सुनना और टाइप करना मल्टीटास्किंग का उदाहरण है।"}, {"q": "कंप्यूटर से डिलीट की गई फाइलें अस्थायी रूप से कहाँ जाती हैं?", "opts": ["My Documents", "Recycle Bin", "Control Panel", "Taskbar"], "ans": 1, "exp": "Recycle Bin से डिलीट फाइल को वापस Restore किया जा सकता है।"}, {"q": "MS Word में स्पेलिंग और ग्रामर चेक करने के लिए किस फंक्शन की का उपयोग करते हैं?", "opts": ["F2", "F5", "F7", "F11"], "ans": 2, "exp": "F7 कुंजी स्पेलिंग एवं ग्रामर जांच के लिए उपयोग होती है।"}, {"q": "किसी फाइल को स्थायी रूप से (Recycle Bin में भेजे बिना) डिलीट करने की शॉर्टकट की क्या है?", "opts": ["Delete", "Shift + Delete", "Ctrl + Delete", "Alt + Delete"], "ans": 1, "exp": "Shift + Delete दबाने से फाइल सीधे स्थायी रूप से हट जाती है।"}, {"q": "LibreOffice Calc या MS Excel में डिफ़ॉल्ट रूप से कितनी वर्कशीट/नाम दिखते हैं?", "opts": ["Sheet1", "Page1", "Slide1", "Doc1"], "ans": 0, "exp": "स्प्रेडशीट में शीट का नाम Sheet1, Sheet2 आदि होता है।"}, {"q": "किसी सॉफ्टवेयर में मौजूद त्रुटि (Error) को कंप्यूटर की भाषा में क्या कहते हैं?", "opts": ["स्पैम", "बग (Bug)", "वायरस", "पैच"], "ans": 1, "exp": "प्रोग्राम की गलती को Bug और उसे सुधारने को Debugging कहते हैं।"}, {"q": "इंटरनेट पर किसी वेबसाइट के पते (Address) को क्या कहा जाता है?", "opts": ["CPU", "URL (Uniform Resource Locator)", "RAM", "ALU"], "ans": 1, "exp": "जैसे https://www.vidyalibraryrjn.com एक URL है।"}, {"q": "WWW (World Wide Web) का आविष्कार किसने किया था?", "opts": ["बिल गेट्स", "टिम बर्नर्स ली", "मार्क जुकरबर्ग", "लैरी पेज"], "ans": 1, "exp": "1989 में टिम बर्नर्स ली ने WWW का आविष्कार किया।"}, {"q": "इनमें से कौन-सा एक 'वेब ब्राउज़र' (Web Browser) नहीं है?", "opts": ["Google Chrome", "Mozilla Firefox", "Google Search", "Microsoft Edge"], "ans": 2, "exp": "Google एक सर्च इंजन है, जबकि Chrome, Firefox, Safari और Edge वेब ब्राउज़र हैं।"}, {"q": "दुनिया का सबसे लोकप्रिय सर्च इंजन कौन-सा है?", "opts": ["Google", "Bing", "Yahoo", "DuckDuckGo"], "ans": 0, "exp": "Google विश्व का सर्वाधिक प्रयुक्त सर्च इंजन है।"}, {"q": "ईमेल (E-mail) का पूर्ण रूप क्या है?", "opts": ["Easy Mail", "Electronic Mail", "Express Mail", "Electric Message"], "ans": 1, "exp": "इलेक्ट्रॉनिक माध्यम से संदेश भेजने की प्रणाली Electronic Mail है।"}, {"q": "अनचाहे और बल्क में आने वाले विज्ञापन ईमेल को क्या कहते हैं?", "opts": ["ड्राफ्ट", "स्पैम (Spam / Junk Mail)", "इनबॉक्स", "अटैचमेंट"], "ans": 1, "exp": "अवांछित ईमेल को स्पैम कहा जाता है।"}, {"q": "किसी एक बिल्डिंग या ऑफिस के भीतर कंप्यूटरों को जोड़ने वाला नेटवर्क कौन-सा है?", "opts": ["WAN", "LAN (Local Area Network)", "MAN", "PAN"], "ans": 1, "exp": "एक कमरे या बिल्डिंग में LAN (Local Area Network) प्रयुक्त होता है।"}, {"q": "संपूर्ण विश्व में फैला हुआ सबसे बड़ा नेटवर्क (इंटरनेट) किस नेटवर्क का उदाहरण है?", "opts": ["LAN", "MAN", "WAN (Wide Area Network)", "PAN"], "ans": 2, "exp": "इंटरनेट WAN (Wide Area Network) का सबसे बड़ा उदाहरण है।"}, {"q": "ब्लूटूथ और हॉटस्पॉट किस प्रकार के नेटवर्क के अंतर्गत आते हैं?", "opts": ["WAN", "MAN", "PAN (Personal Area Network)", "CAN"], "ans": 2, "exp": "व्यक्तिगत छोटे दायरे (10 मीटर) के लिए PAN का उपयोग होता है।"}, {"q": "डिजिटल सिग्नल को एनालॉग और एनालॉग को डिजिटल में बदलने वाले उपकरण को क्या कहते हैं?", "opts": ["स्विच", "मॉडेम (MODEM - Modulator Demodulator)", "हब", "रिपीटर"], "ans": 1, "exp": "टेलीफोन लाइन से इंटरनेट जोड़ने में मॉडेम कार्य करता है।"}, {"q": "कंप्यूटर वायरस क्या होता है?", "opts": ["एक जीवाणु", "एक हानिकारक कंप्यूटर प्रोग्राम (Malware)", "हार्डवेयर खराबी", "बैटरी"], "ans": 1, "exp": "वायरस एक दुर्भावनापूर्ण सॉफ्टवेयर प्रोग्राम है जो डेटा को नुकसान पहुँचाता है।"}, {"q": "निम्न में से कौन-सा एक एंटीवायरस सॉफ्टवेयर है?", "opts": ["Quick Heal / Avast / Norton", "Trojan Horse", "Spyware", "Ransomware"], "ans": 0, "exp": "Quick Heal, Kaspersky, Norton, McAfee और Windows Defender एंटीवायरस हैं।"}, {"q": "ऐसा मैलवेयर जो कंप्यूटर की फाइलों को लॉक (Encrypt) कर फिरौती मांगता है, क्या कहलाता है?", "opts": ["एडवेयर", "रैंसमवेयर (Ransomware)", "वॉर्म", "कुकीज़"], "ans": 1, "exp": "रैंसमवेयर डेटा अनलॉक करने के लिए पैसे (फिरौती) मांगता है।"}, {"q": "फर्जी वेबसाइट या ईमेल भेजकर पासवर्ड व बैंक जानकारी चुराने की तकनीक क्या कहलाती है?", "opts": ["फ़िशिंग (Phishing)", "चैटिंग", "ब्राउज़िंग", "सर्फिंग"], "ans": 0, "exp": "नकली लिंक से गोपनीय डेटा चुराने को Phishing कहते हैं।"}, {"q": "नेटवर्क सुरक्षा के लिए अनधिकृत पहुँच को रोकने वाली प्रणाली क्या कहलाती है?", "opts": ["मॉडेम", "फ़ायरवॉल (Firewall)", "ब्राउज़र", "राउटर"], "ans": 1, "exp": "Firewall नेटवर्क ट्रैफिक की निगरानी कर अवैध प्रवेश रोकता है।"}, {"q": "निम्नलिखित में से कौन-सा एक ऑडियो फाइल फॉर्मेट है?", "opts": [".jpg", ".mp3 / .wav", ".mp4", ".pdf"], "ans": 1, "exp": ".mp3 और .wav ऑडियो फाइल, जबकि .mp4 और .avi वीडियो फाइल फॉर्मेट हैं।"}, {"q": "इनमें से कौन-सा एक इमेज/ग्राफिक्स फाइल फॉर्मेट है?", "opts": [".exe", ".png / .jpeg", ".docx", ".mp3"], "ans": 1, "exp": ".jpg, .png, .gif और .bmp इमेज फाइल फॉर्मेट हैं।"}, {"q": "इंटरनेट पर किसी वेबसाइट का प्रथम मुख्य पृष्ठ क्या कहलाता है?", "opts": ["बुकमार्क", "होम पेज (Home Page)", "ब्राउज़र पेज", "लिंक पेज"], "ans": 1, "exp": "वेबसाइट खोलने पर दिखने वाला पहला पेज Home Page कहलाता है।"}, {"q": "HTTPS में 'S' का क्या अर्थ होता है?", "opts": ["Simple", "Secure (सुरक्षित)", "System", "Server"], "ans": 1, "exp": "HTTPS (HyperText Transfer Protocol Secure) सुरक्षित एन्क्रिप्टेड कनेक्शन दर्शाता है।"}, {"q": "एक वेबसाइट से दूसरी वेबसाइट पर जाने की प्रक्रिया क्या कहलाती है?", "opts": ["डाउनलोडिंग", "वेब सर्फिंग / ब्राउज़िंग", "अपलोडिंग", "फ़ॉर्मेटिंग"], "ans": 1, "exp": "इंटरनेट पर अलग-अलग वेबपेज देखना सर्फिंग कहलाता है।"}, {"q": "किसी ईमेल में CC का क्या अर्थ होता है?", "opts": ["Computer Copy", "Carbon Copy", "Control Center", "Common Copy"], "ans": 1, "exp": "CC (Carbon Copy) और BCC (Blind Carbon Copy) एक से अधिक लोगों को ईमेल भेजने के काम आते हैं।"}, {"q": "मल्टीमीडिया में किन-किन तत्वों का समावेश होता है?", "opts": ["केवल टेक्स्ट", "टेक्स्ट, ऑडियो, वीडियो, इमेज और एनिमेशन", "केवल गणित", "केवल हार्डवेयर"], "ans": 1, "exp": "टेक्स्ट, चित्र, ध्वनि, वीडियो व एनिमेशन के संयोजन को मल्टीमीडिया कहते हैं।"}, {"q": "कंप्यूटर में किसी चयनित टेक्स्ट या फाइल को 'कॉपी' (Copy) करने की शॉर्टकट की क्या है?", "opts": ["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + Z"], "ans": 1, "exp": "Ctrl + C से Copy, Ctrl + X से Cut और Ctrl + V से Paste होता है।"}, {"q": "कॉपी या कट किए गए डेटा को 'पेस्ट' (Paste) करने की शॉर्टकट की क्या है?", "opts": ["Ctrl + P", "Ctrl + V", "Ctrl + S", "Ctrl + A"], "ans": 1, "exp": "Ctrl + V पेस्ट करने की शॉर्टकट कुंजी है।"}, {"q": "कंप्यूटर में की गई अंतिम क्रिया को वापस (Undo) करने की शॉर्टकट की:", "opts": ["Ctrl + Y", "Ctrl + Z", "Ctrl + U", "Ctrl + R"], "ans": 1, "exp": "Ctrl + Z से Undo तथा Ctrl + Y से Redo होता है।"}, {"q": "पेज के सभी टेक्स्ट या सभी फाइलों को एक साथ चुनने (Select All) की शॉर्टकट की:", "opts": ["Ctrl + S", "Ctrl + A", "Ctrl + D", "Ctrl + F"], "ans": 1, "exp": "Ctrl + A से Select All होता है।"}, {"q": "फाइल को सेव (Save) करने की शॉर्टकट कुंजी क्या है?", "opts": ["Ctrl + S", "Ctrl + P", "Ctrl + N", "Ctrl + O"], "ans": 0, "exp": "Ctrl + S से दस्तावेज सेव होता है।"}, {"q": "दस्तावेज को प्रिंट (Print) करने की शॉर्टकट कुंजी क्या है?", "opts": ["Ctrl + R", "Ctrl + P", "Ctrl + V", "Ctrl + T"], "ans": 1, "exp": "Ctrl + P से प्रिंट डायलॉग बॉक्स खुलता है।"}, {"q": "डॉक्यूमेंट में कोई शब्द खोजने (Find) की शॉर्टकट कुंजी क्या है?", "opts": ["Ctrl + F", "Ctrl + H", "Ctrl + G", "Ctrl + K"], "ans": 0, "exp": "Ctrl + F से Find तथा Ctrl + H से Find & Replace खुलता है।"}, {"q": "चयनित टेक्स्ट को गहरा (Bold) करने की शॉर्टकट की क्या है?", "opts": ["Ctrl + I", "Ctrl + B", "Ctrl + U", "Ctrl + L"], "ans": 1, "exp": "Ctrl + B से Bold, Ctrl + I से Italic और Ctrl + U से Underline होता है।"}, {"q": "नया डॉक्यूमेंट या नई विंडो खोलने के लिए किस शॉर्टकट की का प्रयोग होता है?", "opts": ["Ctrl + N", "Ctrl + O", "Ctrl + W", "Ctrl + Q"], "ans": 0, "exp": "Ctrl + N से New और Ctrl + O से Open होता है।"}, {"q": "विंडोज में किसी प्रोग्राम को बंद करने की शॉर्टकट कुंजी क्या है?", "opts": ["Alt + F4", "Ctrl + F4", "Shift + F4", "Tab + F4"], "ans": 0, "exp": "Alt + F4 सक्रिय एप्लीकेशन को बंद कर देता है।"}, {"q": "RAM का पूर्ण रूप क्या है?", "opts": ["Read Access Memory", "Random Access Memory", "Rapid Action Memory", "Run All Memory"], "ans": 1, "exp": "RAM = Random Access Memory."}, {"q": "ROM का पूर्ण रूप क्या है?", "opts": ["Random Only Memory", "Read Only Memory", "Read Output Memory", "Real Object Memory"], "ans": 1, "exp": "ROM = Read Only Memory."}, {"q": "CPU का पूर्ण रूप क्या है?", "opts": ["Central Processing Unit", "Computer Power Unit", "Control Program Unit", "Central Print Unit"], "ans": 0, "exp": "CPU = Central Processing Unit."}, {"q": "USB का पूर्ण रूप क्या है?", "opts": ["Universal Serial Bus", "United System Bus", "Universal System Board", "Ultra Speed Bus"], "ans": 0, "exp": "USB = Universal Serial Bus."}, {"q": "HTML का पूर्ण रूप क्या है?", "opts": ["Hyper Text Markup Language", "High Tech Machine Language", "Hyperlink Text Main Language", "Home Tool Markup Language"], "ans": 0, "exp": "वेबपेज बनाने की भाषा HTML = HyperText Markup Language है।"}, {"q": "IP Address में 'IP' का पूरा नाम क्या है?", "opts": ["Internet Provider", "Internet Protocol", "Internal Program", "Instant Port"], "ans": 1, "exp": "IP = Internet Protocol."}, {"q": "BIOS का पूर्ण रूप क्या है?", "opts": ["Basic Input Output System", "Binary Internal Operating System", "Basic Internal Output Setup", "Built-In Operating Software"], "ans": 0, "exp": "BIOS = Basic Input Output System."}, {"q": "Wi-Fi का पूर्ण रूप क्या है?", "opts": ["Wireless Fidelity", "Wired Fiber", "Wide Frequency", "Web Interface"], "ans": 0, "exp": "Wi-Fi = Wireless Fidelity."}, {"q": "ALU का पूर्ण रूप क्या है?", "opts": ["Arithmetic Logic Unit", "Advanced Local Unit", "Array Logic User", "Automatic Line Unit"], "ans": 0, "exp": "ALU = Arithmetic Logic Unit."}, {"q": "OTP का पूर्ण रूप क्या है?", "opts": ["One Time Password", "Only Text Pin", "Open Transfer Protocol", "Online Transaction Pin"], "ans": 0, "exp": "OTP = One Time Password."}]}, "maths_s1": {"title": "🔢 गणित (Maths) — सेट 1 (100 प्रश्न)", "questions": [{"q": "100 का 10% कितना होगा?", "opts": ["10", "25", "1", "40"], "ans": 0, "exp": "100 × 10 / 100 = 10."}, {"q": "200 का 10% कितना होगा?", "opts": ["35", "20", "10", "50"], "ans": 1, "exp": "200 × 10 / 100 = 20."}, {"q": "300 का 10% कितना होगा?", "opts": ["20", "45", "30", "60"], "ans": 2, "exp": "300 × 10 / 100 = 30."}, {"q": "400 का 10% कितना होगा?", "opts": ["70", "55", "30", "40"], "ans": 3, "exp": "400 × 10 / 100 = 40."}, {"q": "500 का 10% कितना होगा?", "opts": ["50", "65", "40", "80"], "ans": 0, "exp": "500 × 10 / 100 = 50."}, {"q": "600 का 10% कितना होगा?", "opts": ["75", "60", "50", "90"], "ans": 1, "exp": "600 × 10 / 100 = 60."}, {"q": "700 का 10% कितना होगा?", "opts": ["60", "85", "70", "100"], "ans": 2, "exp": "700 × 10 / 100 = 70."}, {"q": "800 का 10% कितना होगा?", "opts": ["110", "95", "70", "80"], "ans": 3, "exp": "800 × 10 / 100 = 80."}, {"q": "900 का 10% कितना होगा?", "opts": ["90", "105", "80", "120"], "ans": 0, "exp": "900 × 10 / 100 = 90."}, {"q": "1000 का 10% कितना होगा?", "opts": ["115", "100", "90", "130"], "ans": 1, "exp": "1000 × 10 / 100 = 100."}, {"q": "1100 का 10% कितना होगा?", "opts": ["100", "125", "110", "140"], "ans": 2, "exp": "1100 × 10 / 100 = 110."}, {"q": "1200 का 10% कितना होगा?", "opts": ["150", "135", "110", "120"], "ans": 3, "exp": "1200 × 10 / 100 = 120."}, {"q": "100 का 12% कितना होगा?", "opts": ["12", "27", "2", "42"], "ans": 0, "exp": "100 × 12 / 100 = 12."}, {"q": "200 का 12% कितना होगा?", "opts": ["39", "24", "14", "54"], "ans": 1, "exp": "200 × 12 / 100 = 24."}, {"q": "300 का 12% कितना होगा?", "opts": ["26", "51", "36", "66"], "ans": 2, "exp": "300 × 12 / 100 = 36."}, {"q": "400 का 12% कितना होगा?", "opts": ["78", "63", "38", "48"], "ans": 3, "exp": "400 × 12 / 100 = 48."}, {"q": "500 का 12% कितना होगा?", "opts": ["60", "75", "50", "90"], "ans": 0, "exp": "500 × 12 / 100 = 60."}, {"q": "600 का 12% कितना होगा?", "opts": ["87", "72", "62", "102"], "ans": 1, "exp": "600 × 12 / 100 = 72."}, {"q": "700 का 12% कितना होगा?", "opts": ["74", "99", "84", "114"], "ans": 2, "exp": "700 × 12 / 100 = 84."}, {"q": "800 का 12% कितना होगा?", "opts": ["126", "111", "86", "96"], "ans": 3, "exp": "800 × 12 / 100 = 96."}, {"q": "900 का 12% कितना होगा?", "opts": ["108", "123", "98", "138"], "ans": 0, "exp": "900 × 12 / 100 = 108."}, {"q": "1000 का 12% कितना होगा?", "opts": ["135", "120", "110", "150"], "ans": 1, "exp": "1000 × 12 / 100 = 120."}, {"q": "1100 का 12% कितना होगा?", "opts": ["122", "147", "132", "162"], "ans": 2, "exp": "1100 × 12 / 100 = 132."}, {"q": "1200 का 12% कितना होगा?", "opts": ["174", "159", "134", "144"], "ans": 3, "exp": "1200 × 12 / 100 = 144."}, {"q": "100 का 15% कितना होगा?", "opts": ["15", "30", "5", "45"], "ans": 0, "exp": "100 × 15 / 100 = 15."}, {"q": "200 का 15% कितना होगा?", "opts": ["45", "30", "20", "60"], "ans": 1, "exp": "200 × 15 / 100 = 30."}, {"q": "300 का 15% कितना होगा?", "opts": ["35", "60", "45", "75"], "ans": 2, "exp": "300 × 15 / 100 = 45."}, {"q": "400 का 15% कितना होगा?", "opts": ["90", "75", "50", "60"], "ans": 3, "exp": "400 × 15 / 100 = 60."}, {"q": "500 का 15% कितना होगा?", "opts": ["75", "90", "65", "105"], "ans": 0, "exp": "500 × 15 / 100 = 75."}, {"q": "600 का 15% कितना होगा?", "opts": ["105", "90", "80", "120"], "ans": 1, "exp": "600 × 15 / 100 = 90."}, {"q": "700 का 15% कितना होगा?", "opts": ["95", "120", "105", "135"], "ans": 2, "exp": "700 × 15 / 100 = 105."}, {"q": "800 का 15% कितना होगा?", "opts": ["150", "135", "110", "120"], "ans": 3, "exp": "800 × 15 / 100 = 120."}, {"q": "900 का 15% कितना होगा?", "opts": ["135", "150", "125", "165"], "ans": 0, "exp": "900 × 15 / 100 = 135."}, {"q": "1000 का 15% कितना होगा?", "opts": ["165", "150", "140", "180"], "ans": 1, "exp": "1000 × 15 / 100 = 150."}, {"q": "1100 का 15% कितना होगा?", "opts": ["155", "180", "165", "195"], "ans": 2, "exp": "1100 × 15 / 100 = 165."}, {"q": "1200 का 15% कितना होगा?", "opts": ["210", "195", "170", "180"], "ans": 3, "exp": "1200 × 15 / 100 = 180."}, {"q": "100 का 20% कितना होगा?", "opts": ["20", "35", "10", "50"], "ans": 0, "exp": "100 × 20 / 100 = 20."}, {"q": "200 का 20% कितना होगा?", "opts": ["55", "40", "30", "70"], "ans": 1, "exp": "200 × 20 / 100 = 40."}, {"q": "300 का 20% कितना होगा?", "opts": ["50", "75", "60", "90"], "ans": 2, "exp": "300 × 20 / 100 = 60."}, {"q": "400 का 20% कितना होगा?", "opts": ["110", "95", "70", "80"], "ans": 3, "exp": "400 × 20 / 100 = 80."}, {"q": "500 का 20% कितना होगा?", "opts": ["100", "115", "90", "130"], "ans": 0, "exp": "500 × 20 / 100 = 100."}, {"q": "600 का 20% कितना होगा?", "opts": ["135", "120", "110", "150"], "ans": 1, "exp": "600 × 20 / 100 = 120."}, {"q": "700 का 20% कितना होगा?", "opts": ["130", "155", "140", "170"], "ans": 2, "exp": "700 × 20 / 100 = 140."}, {"q": "800 का 20% कितना होगा?", "opts": ["190", "175", "150", "160"], "ans": 3, "exp": "800 × 20 / 100 = 160."}, {"q": "900 का 20% कितना होगा?", "opts": ["180", "195", "170", "210"], "ans": 0, "exp": "900 × 20 / 100 = 180."}, {"q": "1000 का 20% कितना होगा?", "opts": ["215", "200", "190", "230"], "ans": 1, "exp": "1000 × 20 / 100 = 200."}, {"q": "1100 का 20% कितना होगा?", "opts": ["210", "235", "220", "250"], "ans": 2, "exp": "1100 × 20 / 100 = 220."}, {"q": "1200 का 20% कितना होगा?", "opts": ["270", "255", "230", "240"], "ans": 3, "exp": "1200 × 20 / 100 = 240."}, {"q": "100 का 25% कितना होगा?", "opts": ["25", "40", "15", "55"], "ans": 0, "exp": "100 × 25 / 100 = 25."}, {"q": "200 का 25% कितना होगा?", "opts": ["65", "50", "40", "80"], "ans": 1, "exp": "200 × 25 / 100 = 50."}, {"q": "300 का 25% कितना होगा?", "opts": ["65", "90", "75", "105"], "ans": 2, "exp": "300 × 25 / 100 = 75."}, {"q": "400 का 25% कितना होगा?", "opts": ["130", "115", "90", "100"], "ans": 3, "exp": "400 × 25 / 100 = 100."}, {"q": "500 का 25% कितना होगा?", "opts": ["125", "140", "115", "155"], "ans": 0, "exp": "500 × 25 / 100 = 125."}, {"q": "600 का 25% कितना होगा?", "opts": ["165", "150", "140", "180"], "ans": 1, "exp": "600 × 25 / 100 = 150."}, {"q": "700 का 25% कितना होगा?", "opts": ["165", "190", "175", "205"], "ans": 2, "exp": "700 × 25 / 100 = 175."}, {"q": "800 का 25% कितना होगा?", "opts": ["230", "215", "190", "200"], "ans": 3, "exp": "800 × 25 / 100 = 200."}, {"q": "900 का 25% कितना होगा?", "opts": ["225", "240", "215", "255"], "ans": 0, "exp": "900 × 25 / 100 = 225."}, {"q": "1000 का 25% कितना होगा?", "opts": ["265", "250", "240", "280"], "ans": 1, "exp": "1000 × 25 / 100 = 250."}, {"q": "1100 का 25% कितना होगा?", "opts": ["265", "290", "275", "305"], "ans": 2, "exp": "1100 × 25 / 100 = 275."}, {"q": "1200 का 25% कितना होगा?", "opts": ["330", "315", "290", "300"], "ans": 3, "exp": "1200 × 25 / 100 = 300."}, {"q": "100 का 30% कितना होगा?", "opts": ["30", "45", "20", "60"], "ans": 0, "exp": "100 × 30 / 100 = 30."}, {"q": "200 का 30% कितना होगा?", "opts": ["75", "60", "50", "90"], "ans": 1, "exp": "200 × 30 / 100 = 60."}, {"q": "300 का 30% कितना होगा?", "opts": ["80", "105", "90", "120"], "ans": 2, "exp": "300 × 30 / 100 = 90."}, {"q": "400 का 30% कितना होगा?", "opts": ["150", "135", "110", "120"], "ans": 3, "exp": "400 × 30 / 100 = 120."}, {"q": "500 का 30% कितना होगा?", "opts": ["150", "165", "140", "180"], "ans": 0, "exp": "500 × 30 / 100 = 150."}, {"q": "600 का 30% कितना होगा?", "opts": ["195", "180", "170", "210"], "ans": 1, "exp": "600 × 30 / 100 = 180."}, {"q": "700 का 30% कितना होगा?", "opts": ["200", "225", "210", "240"], "ans": 2, "exp": "700 × 30 / 100 = 210."}, {"q": "800 का 30% कितना होगा?", "opts": ["270", "255", "230", "240"], "ans": 3, "exp": "800 × 30 / 100 = 240."}, {"q": "900 का 30% कितना होगा?", "opts": ["270", "285", "260", "300"], "ans": 0, "exp": "900 × 30 / 100 = 270."}, {"q": "1000 का 30% कितना होगा?", "opts": ["315", "300", "290", "330"], "ans": 1, "exp": "1000 × 30 / 100 = 300."}, {"q": "1100 का 30% कितना होगा?", "opts": ["320", "345", "330", "360"], "ans": 2, "exp": "1100 × 30 / 100 = 330."}, {"q": "1200 का 30% कितना होगा?", "opts": ["390", "375", "350", "360"], "ans": 3, "exp": "1200 × 30 / 100 = 360."}, {"q": "100 का 40% कितना होगा?", "opts": ["40", "55", "30", "70"], "ans": 0, "exp": "100 × 40 / 100 = 40."}, {"q": "200 का 40% कितना होगा?", "opts": ["95", "80", "70", "110"], "ans": 1, "exp": "200 × 40 / 100 = 80."}, {"q": "300 का 40% कितना होगा?", "opts": ["110", "135", "120", "150"], "ans": 2, "exp": "300 × 40 / 100 = 120."}, {"q": "400 का 40% कितना होगा?", "opts": ["190", "175", "150", "160"], "ans": 3, "exp": "400 × 40 / 100 = 160."}, {"q": "500 का 40% कितना होगा?", "opts": ["200", "215", "190", "230"], "ans": 0, "exp": "500 × 40 / 100 = 200."}, {"q": "600 का 40% कितना होगा?", "opts": ["255", "240", "230", "270"], "ans": 1, "exp": "600 × 40 / 100 = 240."}, {"q": "700 का 40% कितना होगा?", "opts": ["270", "295", "280", "310"], "ans": 2, "exp": "700 × 40 / 100 = 280."}, {"q": "800 का 40% कितना होगा?", "opts": ["350", "335", "310", "320"], "ans": 3, "exp": "800 × 40 / 100 = 320."}, {"q": "900 का 40% कितना होगा?", "opts": ["360", "375", "350", "390"], "ans": 0, "exp": "900 × 40 / 100 = 360."}, {"q": "1000 का 40% कितना होगा?", "opts": ["415", "400", "390", "430"], "ans": 1, "exp": "1000 × 40 / 100 = 400."}, {"q": "1100 का 40% कितना होगा?", "opts": ["430", "455", "440", "470"], "ans": 2, "exp": "1100 × 40 / 100 = 440."}, {"q": "1200 का 40% कितना होगा?", "opts": ["510", "495", "470", "480"], "ans": 3, "exp": "1200 × 40 / 100 = 480."}, {"q": "100 का 50% कितना होगा?", "opts": ["50", "65", "40", "80"], "ans": 0, "exp": "100 × 50 / 100 = 50."}, {"q": "200 का 50% कितना होगा?", "opts": ["115", "100", "90", "130"], "ans": 1, "exp": "200 × 50 / 100 = 100."}, {"q": "300 का 50% कितना होगा?", "opts": ["140", "165", "150", "180"], "ans": 2, "exp": "300 × 50 / 100 = 150."}, {"q": "400 का 50% कितना होगा?", "opts": ["230", "215", "190", "200"], "ans": 3, "exp": "400 × 50 / 100 = 200."}, {"q": "500 का 50% कितना होगा?", "opts": ["250", "265", "240", "280"], "ans": 0, "exp": "500 × 50 / 100 = 250."}, {"q": "600 का 50% कितना होगा?", "opts": ["315", "300", "290", "330"], "ans": 1, "exp": "600 × 50 / 100 = 300."}, {"q": "700 का 50% कितना होगा?", "opts": ["340", "365", "350", "380"], "ans": 2, "exp": "700 × 50 / 100 = 350."}, {"q": "800 का 50% कितना होगा?", "opts": ["430", "415", "390", "400"], "ans": 3, "exp": "800 × 50 / 100 = 400."}, {"q": "900 का 50% कितना होगा?", "opts": ["450", "465", "440", "480"], "ans": 0, "exp": "900 × 50 / 100 = 450."}, {"q": "1000 का 50% कितना होगा?", "opts": ["515", "500", "490", "530"], "ans": 1, "exp": "1000 × 50 / 100 = 500."}, {"q": "1100 का 50% कितना होगा?", "opts": ["540", "565", "550", "580"], "ans": 2, "exp": "1100 × 50 / 100 = 550."}, {"q": "1200 का 50% कितना होगा?", "opts": ["630", "615", "590", "600"], "ans": 3, "exp": "1200 × 50 / 100 = 600."}, {"q": "100 का 60% कितना होगा?", "opts": ["60", "75", "50", "90"], "ans": 0, "exp": "100 × 60 / 100 = 60."}, {"q": "200 का 60% कितना होगा?", "opts": ["135", "120", "110", "150"], "ans": 1, "exp": "200 × 60 / 100 = 120."}, {"q": "300 का 60% कितना होगा?", "opts": ["170", "195", "180", "210"], "ans": 2, "exp": "300 × 60 / 100 = 180."}, {"q": "400 का 60% कितना होगा?", "opts": ["270", "255", "230", "240"], "ans": 3, "exp": "400 × 60 / 100 = 240."}]}, "reasoning_s1": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 1 (100 प्रश्न)", "questions": [{"q": "श्रृंखला को पूरा करें: 2, 5, 8, 11, 14, ?", "opts": ["17", "19", "15", "20"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 14 + 3 = 17."}, {"q": "श्रृंखला को पूरा करें: 2, 6, 10, 14, 18, ?", "opts": ["24", "22", "20", "26"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 18 + 4 = 22."}, {"q": "श्रृंखला को पूरा करें: 2, 8, 14, 20, 26, ?", "opts": ["30", "34", "32", "38"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 26 + 6 = 32."}, {"q": "श्रृंखला को पूरा करें: 2, 9, 16, 23, 30, ?", "opts": ["44", "39", "35", "37"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 30 + 7 = 37."}, {"q": "श्रृंखला को पूरा करें: 2, 11, 20, 29, 38, ?", "opts": ["47", "49", "45", "56"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 38 + 9 = 47."}, {"q": "श्रृंखला को पूरा करें: 3, 6, 9, 12, 15, ?", "opts": ["20", "18", "16", "21"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 15 + 3 = 18."}, {"q": "श्रृंखला को पूरा करें: 3, 7, 11, 15, 19, ?", "opts": ["21", "25", "23", "27"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 19 + 4 = 23."}, {"q": "श्रृंखला को पूरा करें: 3, 9, 15, 21, 27, ?", "opts": ["39", "35", "31", "33"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 27 + 6 = 33."}, {"q": "श्रृंखला को पूरा करें: 3, 10, 17, 24, 31, ?", "opts": ["38", "40", "36", "45"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 31 + 7 = 38."}, {"q": "श्रृंखला को पूरा करें: 3, 12, 21, 30, 39, ?", "opts": ["50", "48", "46", "57"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 39 + 9 = 48."}, {"q": "श्रृंखला को पूरा करें: 4, 7, 10, 13, 16, ?", "opts": ["17", "21", "19", "22"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 16 + 3 = 19."}, {"q": "श्रृंखला को पूरा करें: 4, 8, 12, 16, 20, ?", "opts": ["28", "26", "22", "24"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 20 + 4 = 24."}, {"q": "श्रृंखला को पूरा करें: 4, 10, 16, 22, 28, ?", "opts": ["34", "36", "32", "40"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 28 + 6 = 34."}, {"q": "श्रृंखला को पूरा करें: 4, 11, 18, 25, 32, ?", "opts": ["41", "39", "37", "46"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 32 + 7 = 39."}, {"q": "श्रृंखला को पूरा करें: 4, 13, 22, 31, 40, ?", "opts": ["47", "51", "49", "58"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 40 + 9 = 49."}, {"q": "श्रृंखला को पूरा करें: 5, 8, 11, 14, 17, ?", "opts": ["23", "22", "18", "20"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 17 + 3 = 20."}, {"q": "श्रृंखला को पूरा करें: 5, 9, 13, 17, 21, ?", "opts": ["25", "27", "23", "29"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 21 + 4 = 25."}, {"q": "श्रृंखला को पूरा करें: 5, 11, 17, 23, 29, ?", "opts": ["37", "35", "33", "41"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 29 + 6 = 35."}, {"q": "श्रृंखला को पूरा करें: 5, 12, 19, 26, 33, ?", "opts": ["38", "42", "40", "47"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 33 + 7 = 40."}, {"q": "श्रृंखला को पूरा करें: 5, 14, 23, 32, 41, ?", "opts": ["59", "52", "48", "50"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 41 + 9 = 50."}, {"q": "श्रृंखला को पूरा करें: 6, 9, 12, 15, 18, ?", "opts": ["21", "23", "19", "24"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 18 + 3 = 21."}, {"q": "श्रृंखला को पूरा करें: 6, 10, 14, 18, 22, ?", "opts": ["28", "26", "24", "30"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 22 + 4 = 26."}, {"q": "श्रृंखला को पूरा करें: 6, 12, 18, 24, 30, ?", "opts": ["34", "38", "36", "42"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 30 + 6 = 36."}, {"q": "श्रृंखला को पूरा करें: 6, 13, 20, 27, 34, ?", "opts": ["48", "43", "39", "41"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 34 + 7 = 41."}, {"q": "श्रृंखला को पूरा करें: 6, 15, 24, 33, 42, ?", "opts": ["51", "53", "49", "60"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 42 + 9 = 51."}, {"q": "श्रृंखला को पूरा करें: 7, 10, 13, 16, 19, ?", "opts": ["24", "22", "20", "25"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 19 + 3 = 22."}, {"q": "श्रृंखला को पूरा करें: 7, 11, 15, 19, 23, ?", "opts": ["25", "29", "27", "31"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 23 + 4 = 27."}, {"q": "श्रृंखला को पूरा करें: 7, 13, 19, 25, 31, ?", "opts": ["43", "39", "35", "37"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 31 + 6 = 37."}, {"q": "श्रृंखला को पूरा करें: 7, 14, 21, 28, 35, ?", "opts": ["42", "44", "40", "49"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 35 + 7 = 42."}, {"q": "श्रृंखला को पूरा करें: 7, 16, 25, 34, 43, ?", "opts": ["54", "52", "50", "61"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 43 + 9 = 52."}, {"q": "श्रृंखला को पूरा करें: 8, 11, 14, 17, 20, ?", "opts": ["21", "25", "23", "26"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 20 + 3 = 23."}, {"q": "श्रृंखला को पूरा करें: 8, 12, 16, 20, 24, ?", "opts": ["32", "30", "26", "28"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 24 + 4 = 28."}, {"q": "श्रृंखला को पूरा करें: 8, 14, 20, 26, 32, ?", "opts": ["38", "40", "36", "44"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 32 + 6 = 38."}, {"q": "श्रृंखला को पूरा करें: 8, 15, 22, 29, 36, ?", "opts": ["45", "43", "41", "50"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 36 + 7 = 43."}, {"q": "श्रृंखला को पूरा करें: 8, 17, 26, 35, 44, ?", "opts": ["51", "55", "53", "62"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 44 + 9 = 53."}, {"q": "श्रृंखला को पूरा करें: 9, 12, 15, 18, 21, ?", "opts": ["27", "26", "22", "24"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 21 + 3 = 24."}, {"q": "श्रृंखला को पूरा करें: 9, 13, 17, 21, 25, ?", "opts": ["29", "31", "27", "33"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 25 + 4 = 29."}, {"q": "श्रृंखला को पूरा करें: 9, 15, 21, 27, 33, ?", "opts": ["41", "39", "37", "45"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 33 + 6 = 39."}, {"q": "श्रृंखला को पूरा करें: 9, 16, 23, 30, 37, ?", "opts": ["42", "46", "44", "51"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 37 + 7 = 44."}, {"q": "श्रृंखला को पूरा करें: 9, 18, 27, 36, 45, ?", "opts": ["63", "56", "52", "54"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 45 + 9 = 54."}, {"q": "श्रृंखला को पूरा करें: 10, 13, 16, 19, 22, ?", "opts": ["25", "27", "23", "28"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 22 + 3 = 25."}, {"q": "श्रृंखला को पूरा करें: 10, 14, 18, 22, 26, ?", "opts": ["32", "30", "28", "34"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 26 + 4 = 30."}, {"q": "श्रृंखला को पूरा करें: 10, 16, 22, 28, 34, ?", "opts": ["38", "42", "40", "46"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 34 + 6 = 40."}, {"q": "श्रृंखला को पूरा करें: 10, 17, 24, 31, 38, ?", "opts": ["52", "47", "43", "45"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 38 + 7 = 45."}, {"q": "श्रृंखला को पूरा करें: 10, 19, 28, 37, 46, ?", "opts": ["55", "57", "53", "64"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 46 + 9 = 55."}, {"q": "श्रृंखला को पूरा करें: 11, 14, 17, 20, 23, ?", "opts": ["28", "26", "24", "29"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 23 + 3 = 26."}, {"q": "श्रृंखला को पूरा करें: 11, 15, 19, 23, 27, ?", "opts": ["29", "33", "31", "35"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 27 + 4 = 31."}, {"q": "श्रृंखला को पूरा करें: 11, 17, 23, 29, 35, ?", "opts": ["47", "43", "39", "41"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 35 + 6 = 41."}, {"q": "श्रृंखला को पूरा करें: 11, 18, 25, 32, 39, ?", "opts": ["46", "48", "44", "53"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 39 + 7 = 46."}, {"q": "श्रृंखला को पूरा करें: 11, 20, 29, 38, 47, ?", "opts": ["58", "56", "54", "65"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 47 + 9 = 56."}, {"q": "श्रृंखला को पूरा करें: 12, 15, 18, 21, 24, ?", "opts": ["25", "29", "27", "30"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 24 + 3 = 27."}, {"q": "श्रृंखला को पूरा करें: 12, 16, 20, 24, 28, ?", "opts": ["36", "34", "30", "32"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 28 + 4 = 32."}, {"q": "श्रृंखला को पूरा करें: 12, 18, 24, 30, 36, ?", "opts": ["42", "44", "40", "48"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 36 + 6 = 42."}, {"q": "श्रृंखला को पूरा करें: 12, 19, 26, 33, 40, ?", "opts": ["49", "47", "45", "54"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 40 + 7 = 47."}, {"q": "श्रृंखला को पूरा करें: 12, 21, 30, 39, 48, ?", "opts": ["55", "59", "57", "66"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 48 + 9 = 57."}, {"q": "श्रृंखला को पूरा करें: 13, 16, 19, 22, 25, ?", "opts": ["31", "30", "26", "28"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 25 + 3 = 28."}, {"q": "श्रृंखला को पूरा करें: 13, 17, 21, 25, 29, ?", "opts": ["33", "35", "31", "37"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 29 + 4 = 33."}, {"q": "श्रृंखला को पूरा करें: 13, 19, 25, 31, 37, ?", "opts": ["45", "43", "41", "49"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 37 + 6 = 43."}, {"q": "श्रृंखला को पूरा करें: 13, 20, 27, 34, 41, ?", "opts": ["46", "50", "48", "55"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 41 + 7 = 48."}, {"q": "श्रृंखला को पूरा करें: 13, 22, 31, 40, 49, ?", "opts": ["67", "60", "56", "58"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 49 + 9 = 58."}, {"q": "श्रृंखला को पूरा करें: 14, 17, 20, 23, 26, ?", "opts": ["29", "31", "27", "32"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 26 + 3 = 29."}, {"q": "श्रृंखला को पूरा करें: 14, 18, 22, 26, 30, ?", "opts": ["36", "34", "32", "38"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 30 + 4 = 34."}, {"q": "श्रृंखला को पूरा करें: 14, 20, 26, 32, 38, ?", "opts": ["42", "46", "44", "50"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 38 + 6 = 44."}, {"q": "श्रृंखला को पूरा करें: 14, 21, 28, 35, 42, ?", "opts": ["56", "51", "47", "49"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 42 + 7 = 49."}, {"q": "श्रृंखला को पूरा करें: 14, 23, 32, 41, 50, ?", "opts": ["59", "61", "57", "68"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 50 + 9 = 59."}, {"q": "श्रृंखला को पूरा करें: 15, 18, 21, 24, 27, ?", "opts": ["32", "30", "28", "33"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 27 + 3 = 30."}, {"q": "श्रृंखला को पूरा करें: 15, 19, 23, 27, 31, ?", "opts": ["33", "37", "35", "39"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 31 + 4 = 35."}, {"q": "श्रृंखला को पूरा करें: 15, 21, 27, 33, 39, ?", "opts": ["51", "47", "43", "45"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 39 + 6 = 45."}, {"q": "श्रृंखला को पूरा करें: 15, 22, 29, 36, 43, ?", "opts": ["50", "52", "48", "57"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 43 + 7 = 50."}, {"q": "श्रृंखला को पूरा करें: 15, 24, 33, 42, 51, ?", "opts": ["62", "60", "58", "69"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 51 + 9 = 60."}, {"q": "श्रृंखला को पूरा करें: 16, 19, 22, 25, 28, ?", "opts": ["29", "33", "31", "34"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 28 + 3 = 31."}, {"q": "श्रृंखला को पूरा करें: 16, 20, 24, 28, 32, ?", "opts": ["40", "38", "34", "36"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 32 + 4 = 36."}, {"q": "श्रृंखला को पूरा करें: 16, 22, 28, 34, 40, ?", "opts": ["46", "48", "44", "52"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 40 + 6 = 46."}, {"q": "श्रृंखला को पूरा करें: 16, 23, 30, 37, 44, ?", "opts": ["53", "51", "49", "58"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 44 + 7 = 51."}, {"q": "श्रृंखला को पूरा करें: 16, 25, 34, 43, 52, ?", "opts": ["59", "63", "61", "70"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 52 + 9 = 61."}, {"q": "श्रृंखला को पूरा करें: 17, 20, 23, 26, 29, ?", "opts": ["35", "34", "30", "32"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 29 + 3 = 32."}, {"q": "श्रृंखला को पूरा करें: 17, 21, 25, 29, 33, ?", "opts": ["37", "39", "35", "41"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 33 + 4 = 37."}, {"q": "श्रृंखला को पूरा करें: 17, 23, 29, 35, 41, ?", "opts": ["49", "47", "45", "53"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 41 + 6 = 47."}, {"q": "श्रृंखला को पूरा करें: 17, 24, 31, 38, 45, ?", "opts": ["50", "54", "52", "59"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 45 + 7 = 52."}, {"q": "श्रृंखला को पूरा करें: 17, 26, 35, 44, 53, ?", "opts": ["71", "64", "60", "62"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 53 + 9 = 62."}, {"q": "श्रृंखला को पूरा करें: 18, 21, 24, 27, 30, ?", "opts": ["33", "35", "31", "36"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 30 + 3 = 33."}, {"q": "श्रृंखला को पूरा करें: 18, 22, 26, 30, 34, ?", "opts": ["40", "38", "36", "42"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 34 + 4 = 38."}, {"q": "श्रृंखला को पूरा करें: 18, 24, 30, 36, 42, ?", "opts": ["46", "50", "48", "54"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 42 + 6 = 48."}, {"q": "श्रृंखला को पूरा करें: 18, 25, 32, 39, 46, ?", "opts": ["60", "55", "51", "53"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 46 + 7 = 53."}, {"q": "श्रृंखला को पूरा करें: 18, 27, 36, 45, 54, ?", "opts": ["63", "65", "61", "72"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 54 + 9 = 63."}, {"q": "श्रृंखला को पूरा करें: 19, 22, 25, 28, 31, ?", "opts": ["36", "34", "32", "37"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 31 + 3 = 34."}, {"q": "श्रृंखला को पूरा करें: 19, 23, 27, 31, 35, ?", "opts": ["37", "41", "39", "43"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 35 + 4 = 39."}, {"q": "श्रृंखला को पूरा करें: 19, 25, 31, 37, 43, ?", "opts": ["55", "51", "47", "49"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 43 + 6 = 49."}, {"q": "श्रृंखला को पूरा करें: 19, 26, 33, 40, 47, ?", "opts": ["54", "56", "52", "61"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 47 + 7 = 54."}, {"q": "श्रृंखला को पूरा करें: 19, 28, 37, 46, 55, ?", "opts": ["66", "64", "62", "73"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 55 + 9 = 64."}, {"q": "श्रृंखला को पूरा करें: 20, 23, 26, 29, 32, ?", "opts": ["33", "37", "35", "38"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 32 + 3 = 35."}, {"q": "श्रृंखला को पूरा करें: 20, 24, 28, 32, 36, ?", "opts": ["44", "42", "38", "40"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 36 + 4 = 40."}, {"q": "श्रृंखला को पूरा करें: 20, 26, 32, 38, 44, ?", "opts": ["50", "52", "48", "56"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 44 + 6 = 50."}, {"q": "श्रृंखला को पूरा करें: 20, 27, 34, 41, 48, ?", "opts": ["57", "55", "53", "62"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 48 + 7 = 55."}, {"q": "श्रृंखला को पूरा करें: 20, 29, 38, 47, 56, ?", "opts": ["63", "67", "65", "74"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 56 + 9 = 65."}, {"q": "श्रृंखला को पूरा करें: 21, 24, 27, 30, 33, ?", "opts": ["39", "38", "34", "36"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 33 + 3 = 36."}, {"q": "श्रृंखला को पूरा करें: 21, 25, 29, 33, 37, ?", "opts": ["41", "43", "39", "45"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 37 + 4 = 41."}, {"q": "श्रृंखला को पूरा करें: 21, 27, 33, 39, 45, ?", "opts": ["53", "51", "49", "57"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 45 + 6 = 51."}, {"q": "श्रृंखला को पूरा करें: 21, 28, 35, 42, 49, ?", "opts": ["54", "58", "56", "63"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 49 + 7 = 56."}, {"q": "श्रृंखला को पूरा करें: 21, 30, 39, 48, 57, ?", "opts": ["75", "68", "64", "66"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 57 + 9 = 66."}]}, "maths_s2": {"title": "🔢 गणित (Maths) — सेट 2 (100 प्रश्न)", "questions": [{"q": "500 का 60% कितना होगा?", "opts": ["300", "315", "290", "330"], "ans": 0, "exp": "500 × 60 / 100 = 300."}, {"q": "600 का 60% कितना होगा?", "opts": ["375", "360", "350", "390"], "ans": 1, "exp": "600 × 60 / 100 = 360."}, {"q": "700 का 60% कितना होगा?", "opts": ["410", "435", "420", "450"], "ans": 2, "exp": "700 × 60 / 100 = 420."}, {"q": "800 का 60% कितना होगा?", "opts": ["510", "495", "470", "480"], "ans": 3, "exp": "800 × 60 / 100 = 480."}, {"q": "900 का 60% कितना होगा?", "opts": ["540", "555", "530", "570"], "ans": 0, "exp": "900 × 60 / 100 = 540."}, {"q": "1000 का 60% कितना होगा?", "opts": ["615", "600", "590", "630"], "ans": 1, "exp": "1000 × 60 / 100 = 600."}, {"q": "1100 का 60% कितना होगा?", "opts": ["650", "675", "660", "690"], "ans": 2, "exp": "1100 × 60 / 100 = 660."}, {"q": "1200 का 60% कितना होगा?", "opts": ["750", "735", "710", "720"], "ans": 3, "exp": "1200 × 60 / 100 = 720."}, {"q": "100 का 75% कितना होगा?", "opts": ["75", "90", "65", "105"], "ans": 0, "exp": "100 × 75 / 100 = 75."}, {"q": "200 का 75% कितना होगा?", "opts": ["165", "150", "140", "180"], "ans": 1, "exp": "200 × 75 / 100 = 150."}, {"q": "300 का 75% कितना होगा?", "opts": ["215", "240", "225", "255"], "ans": 2, "exp": "300 × 75 / 100 = 225."}, {"q": "400 का 75% कितना होगा?", "opts": ["330", "315", "290", "300"], "ans": 3, "exp": "400 × 75 / 100 = 300."}, {"q": "500 का 75% कितना होगा?", "opts": ["375", "390", "365", "405"], "ans": 0, "exp": "500 × 75 / 100 = 375."}, {"q": "600 का 75% कितना होगा?", "opts": ["465", "450", "440", "480"], "ans": 1, "exp": "600 × 75 / 100 = 450."}, {"q": "700 का 75% कितना होगा?", "opts": ["515", "540", "525", "555"], "ans": 2, "exp": "700 × 75 / 100 = 525."}, {"q": "800 का 75% कितना होगा?", "opts": ["630", "615", "590", "600"], "ans": 3, "exp": "800 × 75 / 100 = 600."}, {"q": "900 का 75% कितना होगा?", "opts": ["675", "690", "665", "705"], "ans": 0, "exp": "900 × 75 / 100 = 675."}, {"q": "1000 का 75% कितना होगा?", "opts": ["765", "750", "740", "780"], "ans": 1, "exp": "1000 × 75 / 100 = 750."}, {"q": "1100 का 75% कितना होगा?", "opts": ["815", "840", "825", "855"], "ans": 2, "exp": "1100 × 75 / 100 = 825."}, {"q": "1200 का 75% कितना होगा?", "opts": ["930", "915", "890", "900"], "ans": 3, "exp": "1200 × 75 / 100 = 900."}, {"q": "एक वस्तु ₹200 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹220", "₹240", "₹205", "₹270"], "ans": 0, "exp": "200 + 200×10% = ₹220."}, {"q": "एक वस्तु ₹200 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹250", "₹230", "₹215", "₹280"], "ans": 1, "exp": "200 + 200×15% = ₹230."}, {"q": "एक वस्तु ₹200 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹225", "₹260", "₹240", "₹290"], "ans": 2, "exp": "200 + 200×20% = ₹240."}, {"q": "एक वस्तु ₹200 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹300", "₹270", "₹235", "₹250"], "ans": 3, "exp": "200 + 200×25% = ₹250."}, {"q": "एक वस्तु ₹200 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹260", "₹280", "₹245", "₹310"], "ans": 0, "exp": "200 + 200×30% = ₹260."}, {"q": "एक वस्तु ₹200 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹300", "₹280", "₹265", "₹330"], "ans": 1, "exp": "200 + 200×40% = ₹280."}, {"q": "एक वस्तु ₹200 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹285", "₹320", "₹300", "₹350"], "ans": 2, "exp": "200 + 200×50% = ₹300."}, {"q": "एक वस्तु ₹200 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹260", "₹230", "₹195", "₹210"], "ans": 3, "exp": "200 + 200×5% = ₹210."}, {"q": "एक वस्तु ₹200 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹224", "₹244", "₹209", "₹274"], "ans": 0, "exp": "200 + 200×12% = ₹224."}, {"q": "एक वस्तु ₹200 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹236", "₹216", "₹201", "₹266"], "ans": 1, "exp": "200 + 200×8% = ₹216."}, {"q": "एक वस्तु ₹300 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹315", "₹350", "₹330", "₹380"], "ans": 2, "exp": "300 + 300×10% = ₹330."}, {"q": "एक वस्तु ₹300 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹395", "₹365", "₹330", "₹345"], "ans": 3, "exp": "300 + 300×15% = ₹345."}, {"q": "एक वस्तु ₹300 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹360", "₹380", "₹345", "₹410"], "ans": 0, "exp": "300 + 300×20% = ₹360."}, {"q": "एक वस्तु ₹300 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹395", "₹375", "₹360", "₹425"], "ans": 1, "exp": "300 + 300×25% = ₹375."}, {"q": "एक वस्तु ₹300 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹375", "₹410", "₹390", "₹440"], "ans": 2, "exp": "300 + 300×30% = ₹390."}, {"q": "एक वस्तु ₹300 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹470", "₹440", "₹405", "₹420"], "ans": 3, "exp": "300 + 300×40% = ₹420."}, {"q": "एक वस्तु ₹300 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹450", "₹470", "₹435", "₹500"], "ans": 0, "exp": "300 + 300×50% = ₹450."}, {"q": "एक वस्तु ₹300 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹335", "₹315", "₹300", "₹365"], "ans": 1, "exp": "300 + 300×5% = ₹315."}, {"q": "एक वस्तु ₹300 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹321", "₹356", "₹336", "₹386"], "ans": 2, "exp": "300 + 300×12% = ₹336."}, {"q": "एक वस्तु ₹300 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹374", "₹344", "₹309", "₹324"], "ans": 3, "exp": "300 + 300×8% = ₹324."}, {"q": "एक वस्तु ₹400 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹440", "₹460", "₹425", "₹490"], "ans": 0, "exp": "400 + 400×10% = ₹440."}, {"q": "एक वस्तु ₹400 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹480", "₹460", "₹445", "₹510"], "ans": 1, "exp": "400 + 400×15% = ₹460."}, {"q": "एक वस्तु ₹400 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹465", "₹500", "₹480", "₹530"], "ans": 2, "exp": "400 + 400×20% = ₹480."}, {"q": "एक वस्तु ₹400 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹550", "₹520", "₹485", "₹500"], "ans": 3, "exp": "400 + 400×25% = ₹500."}, {"q": "एक वस्तु ₹400 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹520", "₹540", "₹505", "₹570"], "ans": 0, "exp": "400 + 400×30% = ₹520."}, {"q": "एक वस्तु ₹400 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹580", "₹560", "₹545", "₹610"], "ans": 1, "exp": "400 + 400×40% = ₹560."}, {"q": "एक वस्तु ₹400 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹585", "₹620", "₹600", "₹650"], "ans": 2, "exp": "400 + 400×50% = ₹600."}, {"q": "एक वस्तु ₹400 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹470", "₹440", "₹405", "₹420"], "ans": 3, "exp": "400 + 400×5% = ₹420."}, {"q": "एक वस्तु ₹400 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹448", "₹468", "₹433", "₹498"], "ans": 0, "exp": "400 + 400×12% = ₹448."}, {"q": "एक वस्तु ₹400 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹452", "₹432", "₹417", "₹482"], "ans": 1, "exp": "400 + 400×8% = ₹432."}, {"q": "एक वस्तु ₹500 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹535", "₹570", "₹550", "₹600"], "ans": 2, "exp": "500 + 500×10% = ₹550."}, {"q": "एक वस्तु ₹500 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹625", "₹595", "₹560", "₹575"], "ans": 3, "exp": "500 + 500×15% = ₹575."}, {"q": "एक वस्तु ₹500 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹600", "₹620", "₹585", "₹650"], "ans": 0, "exp": "500 + 500×20% = ₹600."}, {"q": "एक वस्तु ₹500 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹645", "₹625", "₹610", "₹675"], "ans": 1, "exp": "500 + 500×25% = ₹625."}, {"q": "एक वस्तु ₹500 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹635", "₹670", "₹650", "₹700"], "ans": 2, "exp": "500 + 500×30% = ₹650."}, {"q": "एक वस्तु ₹500 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹750", "₹720", "₹685", "₹700"], "ans": 3, "exp": "500 + 500×40% = ₹700."}, {"q": "एक वस्तु ₹500 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹750", "₹770", "₹735", "₹800"], "ans": 0, "exp": "500 + 500×50% = ₹750."}, {"q": "एक वस्तु ₹500 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹545", "₹525", "₹510", "₹575"], "ans": 1, "exp": "500 + 500×5% = ₹525."}, {"q": "एक वस्तु ₹500 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹545", "₹580", "₹560", "₹610"], "ans": 2, "exp": "500 + 500×12% = ₹560."}, {"q": "एक वस्तु ₹500 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹590", "₹560", "₹525", "₹540"], "ans": 3, "exp": "500 + 500×8% = ₹540."}, {"q": "एक वस्तु ₹600 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹660", "₹680", "₹645", "₹710"], "ans": 0, "exp": "600 + 600×10% = ₹660."}, {"q": "एक वस्तु ₹600 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹710", "₹690", "₹675", "₹740"], "ans": 1, "exp": "600 + 600×15% = ₹690."}, {"q": "एक वस्तु ₹600 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹705", "₹740", "₹720", "₹770"], "ans": 2, "exp": "600 + 600×20% = ₹720."}, {"q": "एक वस्तु ₹600 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹800", "₹770", "₹735", "₹750"], "ans": 3, "exp": "600 + 600×25% = ₹750."}, {"q": "एक वस्तु ₹600 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹780", "₹800", "₹765", "₹830"], "ans": 0, "exp": "600 + 600×30% = ₹780."}, {"q": "एक वस्तु ₹600 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹860", "₹840", "₹825", "₹890"], "ans": 1, "exp": "600 + 600×40% = ₹840."}, {"q": "एक वस्तु ₹600 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹885", "₹920", "₹900", "₹950"], "ans": 2, "exp": "600 + 600×50% = ₹900."}, {"q": "एक वस्तु ₹600 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹680", "₹650", "₹615", "₹630"], "ans": 3, "exp": "600 + 600×5% = ₹630."}, {"q": "एक वस्तु ₹600 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹672", "₹692", "₹657", "₹722"], "ans": 0, "exp": "600 + 600×12% = ₹672."}, {"q": "एक वस्तु ₹600 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹668", "₹648", "₹633", "₹698"], "ans": 1, "exp": "600 + 600×8% = ₹648."}, {"q": "एक वस्तु ₹700 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹755", "₹790", "₹770", "₹820"], "ans": 2, "exp": "700 + 700×10% = ₹770."}, {"q": "एक वस्तु ₹700 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹855", "₹825", "₹790", "₹805"], "ans": 3, "exp": "700 + 700×15% = ₹805."}, {"q": "एक वस्तु ₹700 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹840", "₹860", "₹825", "₹890"], "ans": 0, "exp": "700 + 700×20% = ₹840."}, {"q": "एक वस्तु ₹700 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹895", "₹875", "₹860", "₹925"], "ans": 1, "exp": "700 + 700×25% = ₹875."}, {"q": "एक वस्तु ₹700 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹895", "₹930", "₹910", "₹960"], "ans": 2, "exp": "700 + 700×30% = ₹910."}, {"q": "एक वस्तु ₹700 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1030", "₹1000", "₹965", "₹980"], "ans": 3, "exp": "700 + 700×40% = ₹980."}, {"q": "एक वस्तु ₹700 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1050", "₹1070", "₹1035", "₹1100"], "ans": 0, "exp": "700 + 700×50% = ₹1050."}, {"q": "एक वस्तु ₹700 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹755", "₹735", "₹720", "₹785"], "ans": 1, "exp": "700 + 700×5% = ₹735."}, {"q": "एक वस्तु ₹700 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹769", "₹804", "₹784", "₹834"], "ans": 2, "exp": "700 + 700×12% = ₹784."}, {"q": "एक वस्तु ₹700 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹806", "₹776", "₹741", "₹756"], "ans": 3, "exp": "700 + 700×8% = ₹756."}, {"q": "एक वस्तु ₹800 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹880", "₹900", "₹865", "₹930"], "ans": 0, "exp": "800 + 800×10% = ₹880."}, {"q": "एक वस्तु ₹800 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹940", "₹920", "₹905", "₹970"], "ans": 1, "exp": "800 + 800×15% = ₹920."}, {"q": "एक वस्तु ₹800 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹945", "₹980", "₹960", "₹1010"], "ans": 2, "exp": "800 + 800×20% = ₹960."}, {"q": "एक वस्तु ₹800 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1050", "₹1020", "₹985", "₹1000"], "ans": 3, "exp": "800 + 800×25% = ₹1000."}, {"q": "एक वस्तु ₹800 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1040", "₹1060", "₹1025", "₹1090"], "ans": 0, "exp": "800 + 800×30% = ₹1040."}, {"q": "एक वस्तु ₹800 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1140", "₹1120", "₹1105", "₹1170"], "ans": 1, "exp": "800 + 800×40% = ₹1120."}, {"q": "एक वस्तु ₹800 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1185", "₹1220", "₹1200", "₹1250"], "ans": 2, "exp": "800 + 800×50% = ₹1200."}, {"q": "एक वस्तु ₹800 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹890", "₹860", "₹825", "₹840"], "ans": 3, "exp": "800 + 800×5% = ₹840."}, {"q": "एक वस्तु ₹800 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹896", "₹916", "₹881", "₹946"], "ans": 0, "exp": "800 + 800×12% = ₹896."}, {"q": "एक वस्तु ₹800 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹884", "₹864", "₹849", "₹914"], "ans": 1, "exp": "800 + 800×8% = ₹864."}, {"q": "एक वस्तु ₹900 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹975", "₹1010", "₹990", "₹1040"], "ans": 2, "exp": "900 + 900×10% = ₹990."}, {"q": "एक वस्तु ₹900 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1085", "₹1055", "₹1020", "₹1035"], "ans": 3, "exp": "900 + 900×15% = ₹1035."}, {"q": "एक वस्तु ₹900 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1080", "₹1100", "₹1065", "₹1130"], "ans": 0, "exp": "900 + 900×20% = ₹1080."}, {"q": "एक वस्तु ₹900 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1145", "₹1125", "₹1110", "₹1175"], "ans": 1, "exp": "900 + 900×25% = ₹1125."}, {"q": "एक वस्तु ₹900 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1155", "₹1190", "₹1170", "₹1220"], "ans": 2, "exp": "900 + 900×30% = ₹1170."}, {"q": "एक वस्तु ₹900 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1310", "₹1280", "₹1245", "₹1260"], "ans": 3, "exp": "900 + 900×40% = ₹1260."}, {"q": "एक वस्तु ₹900 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1350", "₹1370", "₹1335", "₹1400"], "ans": 0, "exp": "900 + 900×50% = ₹1350."}, {"q": "एक वस्तु ₹900 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹965", "₹945", "₹930", "₹995"], "ans": 1, "exp": "900 + 900×5% = ₹945."}, {"q": "एक वस्तु ₹900 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹993", "₹1028", "₹1008", "₹1058"], "ans": 2, "exp": "900 + 900×12% = ₹1008."}, {"q": "एक वस्तु ₹900 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1022", "₹992", "₹957", "₹972"], "ans": 3, "exp": "900 + 900×8% = ₹972."}]}, "reasoning_s2": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 2 (100 प्रश्न)", "questions": [{"q": "श्रृंखला को पूरा करें: 22, 25, 28, 31, 34, ?", "opts": ["37", "39", "35", "40"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 34 + 3 = 37."}, {"q": "श्रृंखला को पूरा करें: 22, 26, 30, 34, 38, ?", "opts": ["44", "42", "40", "46"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 38 + 4 = 42."}, {"q": "श्रृंखला को पूरा करें: 22, 28, 34, 40, 46, ?", "opts": ["50", "54", "52", "58"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 46 + 6 = 52."}, {"q": "श्रृंखला को पूरा करें: 22, 29, 36, 43, 50, ?", "opts": ["64", "59", "55", "57"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 50 + 7 = 57."}, {"q": "श्रृंखला को पूरा करें: 22, 31, 40, 49, 58, ?", "opts": ["67", "69", "65", "76"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 58 + 9 = 67."}, {"q": "श्रृंखला को पूरा करें: 23, 26, 29, 32, 35, ?", "opts": ["40", "38", "36", "41"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 35 + 3 = 38."}, {"q": "श्रृंखला को पूरा करें: 23, 27, 31, 35, 39, ?", "opts": ["41", "45", "43", "47"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 39 + 4 = 43."}, {"q": "श्रृंखला को पूरा करें: 23, 29, 35, 41, 47, ?", "opts": ["59", "55", "51", "53"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 47 + 6 = 53."}, {"q": "श्रृंखला को पूरा करें: 23, 30, 37, 44, 51, ?", "opts": ["58", "60", "56", "65"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 51 + 7 = 58."}, {"q": "श्रृंखला को पूरा करें: 23, 32, 41, 50, 59, ?", "opts": ["70", "68", "66", "77"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 59 + 9 = 68."}, {"q": "श्रृंखला को पूरा करें: 24, 27, 30, 33, 36, ?", "opts": ["37", "41", "39", "42"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 36 + 3 = 39."}, {"q": "श्रृंखला को पूरा करें: 24, 28, 32, 36, 40, ?", "opts": ["48", "46", "42", "44"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 40 + 4 = 44."}, {"q": "श्रृंखला को पूरा करें: 24, 30, 36, 42, 48, ?", "opts": ["54", "56", "52", "60"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 48 + 6 = 54."}, {"q": "श्रृंखला को पूरा करें: 24, 31, 38, 45, 52, ?", "opts": ["61", "59", "57", "66"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 52 + 7 = 59."}, {"q": "श्रृंखला को पूरा करें: 24, 33, 42, 51, 60, ?", "opts": ["67", "71", "69", "78"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 60 + 9 = 69."}, {"q": "श्रृंखला को पूरा करें: 25, 28, 31, 34, 37, ?", "opts": ["43", "42", "38", "40"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 37 + 3 = 40."}, {"q": "श्रृंखला को पूरा करें: 25, 29, 33, 37, 41, ?", "opts": ["45", "47", "43", "49"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 41 + 4 = 45."}, {"q": "श्रृंखला को पूरा करें: 25, 31, 37, 43, 49, ?", "opts": ["57", "55", "53", "61"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 49 + 6 = 55."}, {"q": "श्रृंखला को पूरा करें: 25, 32, 39, 46, 53, ?", "opts": ["58", "62", "60", "67"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 53 + 7 = 60."}, {"q": "श्रृंखला को पूरा करें: 25, 34, 43, 52, 61, ?", "opts": ["79", "72", "68", "70"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 61 + 9 = 70."}, {"q": "श्रृंखला को पूरा करें: 26, 29, 32, 35, 38, ?", "opts": ["41", "43", "39", "44"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 38 + 3 = 41."}, {"q": "श्रृंखला को पूरा करें: 26, 30, 34, 38, 42, ?", "opts": ["48", "46", "44", "50"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 42 + 4 = 46."}, {"q": "श्रृंखला को पूरा करें: 26, 32, 38, 44, 50, ?", "opts": ["54", "58", "56", "62"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 50 + 6 = 56."}, {"q": "श्रृंखला को पूरा करें: 26, 33, 40, 47, 54, ?", "opts": ["68", "63", "59", "61"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 54 + 7 = 61."}, {"q": "श्रृंखला को पूरा करें: 26, 35, 44, 53, 62, ?", "opts": ["71", "73", "69", "80"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 62 + 9 = 71."}, {"q": "श्रृंखला को पूरा करें: 27, 30, 33, 36, 39, ?", "opts": ["44", "42", "40", "45"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 39 + 3 = 42."}, {"q": "श्रृंखला को पूरा करें: 27, 31, 35, 39, 43, ?", "opts": ["45", "49", "47", "51"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 43 + 4 = 47."}, {"q": "श्रृंखला को पूरा करें: 27, 33, 39, 45, 51, ?", "opts": ["63", "59", "55", "57"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 51 + 6 = 57."}, {"q": "श्रृंखला को पूरा करें: 27, 34, 41, 48, 55, ?", "opts": ["62", "64", "60", "69"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 55 + 7 = 62."}, {"q": "श्रृंखला को पूरा करें: 27, 36, 45, 54, 63, ?", "opts": ["74", "72", "70", "81"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 63 + 9 = 72."}, {"q": "श्रृंखला को पूरा करें: 28, 31, 34, 37, 40, ?", "opts": ["41", "45", "43", "46"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 40 + 3 = 43."}, {"q": "श्रृंखला को पूरा करें: 28, 32, 36, 40, 44, ?", "opts": ["52", "50", "46", "48"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 44 + 4 = 48."}, {"q": "श्रृंखला को पूरा करें: 28, 34, 40, 46, 52, ?", "opts": ["58", "60", "56", "64"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 52 + 6 = 58."}, {"q": "श्रृंखला को पूरा करें: 28, 35, 42, 49, 56, ?", "opts": ["65", "63", "61", "70"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 56 + 7 = 63."}, {"q": "श्रृंखला को पूरा करें: 28, 37, 46, 55, 64, ?", "opts": ["71", "75", "73", "82"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 64 + 9 = 73."}, {"q": "श्रृंखला को पूरा करें: 29, 32, 35, 38, 41, ?", "opts": ["47", "46", "42", "44"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 41 + 3 = 44."}, {"q": "श्रृंखला को पूरा करें: 29, 33, 37, 41, 45, ?", "opts": ["49", "51", "47", "53"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 45 + 4 = 49."}, {"q": "श्रृंखला को पूरा करें: 29, 35, 41, 47, 53, ?", "opts": ["61", "59", "57", "65"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 53 + 6 = 59."}, {"q": "श्रृंखला को पूरा करें: 29, 36, 43, 50, 57, ?", "opts": ["62", "66", "64", "71"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 57 + 7 = 64."}, {"q": "श्रृंखला को पूरा करें: 29, 38, 47, 56, 65, ?", "opts": ["83", "76", "72", "74"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 65 + 9 = 74."}, {"q": "श्रृंखला को पूरा करें: 30, 33, 36, 39, 42, ?", "opts": ["45", "47", "43", "48"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 42 + 3 = 45."}, {"q": "श्रृंखला को पूरा करें: 30, 34, 38, 42, 46, ?", "opts": ["52", "50", "48", "54"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 46 + 4 = 50."}, {"q": "श्रृंखला को पूरा करें: 30, 36, 42, 48, 54, ?", "opts": ["58", "62", "60", "66"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 54 + 6 = 60."}, {"q": "श्रृंखला को पूरा करें: 30, 37, 44, 51, 58, ?", "opts": ["72", "67", "63", "65"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 58 + 7 = 65."}, {"q": "श्रृंखला को पूरा करें: 30, 39, 48, 57, 66, ?", "opts": ["75", "77", "73", "84"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 66 + 9 = 75."}, {"q": "श्रृंखला को पूरा करें: 31, 34, 37, 40, 43, ?", "opts": ["48", "46", "44", "49"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 43 + 3 = 46."}, {"q": "श्रृंखला को पूरा करें: 31, 35, 39, 43, 47, ?", "opts": ["49", "53", "51", "55"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 47 + 4 = 51."}, {"q": "श्रृंखला को पूरा करें: 31, 37, 43, 49, 55, ?", "opts": ["67", "63", "59", "61"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 55 + 6 = 61."}, {"q": "श्रृंखला को पूरा करें: 31, 38, 45, 52, 59, ?", "opts": ["66", "68", "64", "73"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 59 + 7 = 66."}, {"q": "श्रृंखला को पूरा करें: 31, 40, 49, 58, 67, ?", "opts": ["78", "76", "74", "85"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 67 + 9 = 76."}, {"q": "श्रृंखला को पूरा करें: 32, 35, 38, 41, 44, ?", "opts": ["45", "49", "47", "50"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 44 + 3 = 47."}, {"q": "श्रृंखला को पूरा करें: 32, 36, 40, 44, 48, ?", "opts": ["56", "54", "50", "52"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 48 + 4 = 52."}, {"q": "श्रृंखला को पूरा करें: 32, 38, 44, 50, 56, ?", "opts": ["62", "64", "60", "68"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 56 + 6 = 62."}, {"q": "श्रृंखला को पूरा करें: 32, 39, 46, 53, 60, ?", "opts": ["69", "67", "65", "74"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 60 + 7 = 67."}, {"q": "श्रृंखला को पूरा करें: 32, 41, 50, 59, 68, ?", "opts": ["75", "79", "77", "86"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 68 + 9 = 77."}, {"q": "श्रृंखला को पूरा करें: 33, 36, 39, 42, 45, ?", "opts": ["51", "50", "46", "48"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 45 + 3 = 48."}, {"q": "श्रृंखला को पूरा करें: 33, 37, 41, 45, 49, ?", "opts": ["53", "55", "51", "57"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 49 + 4 = 53."}, {"q": "श्रृंखला को पूरा करें: 33, 39, 45, 51, 57, ?", "opts": ["65", "63", "61", "69"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 57 + 6 = 63."}, {"q": "श्रृंखला को पूरा करें: 33, 40, 47, 54, 61, ?", "opts": ["66", "70", "68", "75"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 61 + 7 = 68."}, {"q": "श्रृंखला को पूरा करें: 33, 42, 51, 60, 69, ?", "opts": ["87", "80", "76", "78"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 69 + 9 = 78."}, {"q": "श्रृंखला को पूरा करें: 34, 37, 40, 43, 46, ?", "opts": ["49", "51", "47", "52"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 46 + 3 = 49."}, {"q": "श्रृंखला को पूरा करें: 34, 38, 42, 46, 50, ?", "opts": ["56", "54", "52", "58"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 50 + 4 = 54."}, {"q": "श्रृंखला को पूरा करें: 34, 40, 46, 52, 58, ?", "opts": ["62", "66", "64", "70"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 58 + 6 = 64."}, {"q": "श्रृंखला को पूरा करें: 34, 41, 48, 55, 62, ?", "opts": ["76", "71", "67", "69"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 62 + 7 = 69."}, {"q": "श्रृंखला को पूरा करें: 34, 43, 52, 61, 70, ?", "opts": ["79", "81", "77", "88"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 70 + 9 = 79."}, {"q": "श्रृंखला को पूरा करें: 35, 38, 41, 44, 47, ?", "opts": ["52", "50", "48", "53"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 47 + 3 = 50."}, {"q": "श्रृंखला को पूरा करें: 35, 39, 43, 47, 51, ?", "opts": ["53", "57", "55", "59"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 51 + 4 = 55."}, {"q": "श्रृंखला को पूरा करें: 35, 41, 47, 53, 59, ?", "opts": ["71", "67", "63", "65"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 59 + 6 = 65."}, {"q": "श्रृंखला को पूरा करें: 35, 42, 49, 56, 63, ?", "opts": ["70", "72", "68", "77"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 63 + 7 = 70."}, {"q": "श्रृंखला को पूरा करें: 35, 44, 53, 62, 71, ?", "opts": ["82", "80", "78", "89"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 71 + 9 = 80."}, {"q": "श्रृंखला को पूरा करें: 36, 39, 42, 45, 48, ?", "opts": ["49", "53", "51", "54"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 48 + 3 = 51."}, {"q": "श्रृंखला को पूरा करें: 36, 40, 44, 48, 52, ?", "opts": ["60", "58", "54", "56"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 52 + 4 = 56."}, {"q": "श्रृंखला को पूरा करें: 36, 42, 48, 54, 60, ?", "opts": ["66", "68", "64", "72"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 60 + 6 = 66."}, {"q": "श्रृंखला को पूरा करें: 36, 43, 50, 57, 64, ?", "opts": ["73", "71", "69", "78"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 64 + 7 = 71."}, {"q": "श्रृंखला को पूरा करें: 36, 45, 54, 63, 72, ?", "opts": ["79", "83", "81", "90"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 72 + 9 = 81."}, {"q": "श्रृंखला को पूरा करें: 37, 40, 43, 46, 49, ?", "opts": ["55", "54", "50", "52"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 49 + 3 = 52."}, {"q": "श्रृंखला को पूरा करें: 37, 41, 45, 49, 53, ?", "opts": ["57", "59", "55", "61"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 53 + 4 = 57."}, {"q": "श्रृंखला को पूरा करें: 37, 43, 49, 55, 61, ?", "opts": ["69", "67", "65", "73"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 61 + 6 = 67."}, {"q": "श्रृंखला को पूरा करें: 37, 44, 51, 58, 65, ?", "opts": ["70", "74", "72", "79"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 65 + 7 = 72."}, {"q": "श्रृंखला को पूरा करें: 37, 46, 55, 64, 73, ?", "opts": ["91", "84", "80", "82"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 73 + 9 = 82."}, {"q": "श्रृंखला को पूरा करें: 38, 41, 44, 47, 50, ?", "opts": ["53", "55", "51", "56"], "ans": 0, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 50 + 3 = 53."}, {"q": "श्रृंखला को पूरा करें: 38, 42, 46, 50, 54, ?", "opts": ["60", "58", "56", "62"], "ans": 1, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 54 + 4 = 58."}, {"q": "श्रृंखला को पूरा करें: 38, 44, 50, 56, 62, ?", "opts": ["66", "70", "68", "74"], "ans": 2, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 62 + 6 = 68."}, {"q": "श्रृंखला को पूरा करें: 38, 45, 52, 59, 66, ?", "opts": ["80", "75", "71", "73"], "ans": 3, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 66 + 7 = 73."}, {"q": "श्रृंखला को पूरा करें: 38, 47, 56, 65, 74, ?", "opts": ["83", "85", "81", "92"], "ans": 0, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 74 + 9 = 83."}, {"q": "श्रृंखला को पूरा करें: 39, 42, 45, 48, 51, ?", "opts": ["56", "54", "52", "57"], "ans": 1, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 51 + 3 = 54."}, {"q": "श्रृंखला को पूरा करें: 39, 43, 47, 51, 55, ?", "opts": ["57", "61", "59", "63"], "ans": 2, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 55 + 4 = 59."}, {"q": "श्रृंखला को पूरा करें: 39, 45, 51, 57, 63, ?", "opts": ["75", "71", "67", "69"], "ans": 3, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 63 + 6 = 69."}, {"q": "श्रृंखला को पूरा करें: 39, 46, 53, 60, 67, ?", "opts": ["74", "76", "72", "81"], "ans": 0, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 67 + 7 = 74."}, {"q": "श्रृंखला को पूरा करें: 39, 48, 57, 66, 75, ?", "opts": ["86", "84", "82", "93"], "ans": 1, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 75 + 9 = 84."}, {"q": "श्रृंखला को पूरा करें: 40, 43, 46, 49, 52, ?", "opts": ["53", "57", "55", "58"], "ans": 2, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 52 + 3 = 55."}, {"q": "श्रृंखला को पूरा करें: 40, 44, 48, 52, 56, ?", "opts": ["64", "62", "58", "60"], "ans": 3, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 56 + 4 = 60."}, {"q": "श्रृंखला को पूरा करें: 40, 46, 52, 58, 64, ?", "opts": ["70", "72", "68", "76"], "ans": 0, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 64 + 6 = 70."}, {"q": "श्रृंखला को पूरा करें: 40, 47, 54, 61, 68, ?", "opts": ["77", "75", "73", "82"], "ans": 1, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 68 + 7 = 75."}, {"q": "श्रृंखला को पूरा करें: 40, 49, 58, 67, 76, ?", "opts": ["83", "87", "85", "94"], "ans": 2, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 76 + 9 = 85."}, {"q": "श्रृंखला को पूरा करें: 41, 44, 47, 50, 53, ?", "opts": ["59", "58", "54", "56"], "ans": 3, "exp": "प्रत्येक पद में +3 जुड़ रहा है: 53 + 3 = 56."}, {"q": "श्रृंखला को पूरा करें: 41, 45, 49, 53, 57, ?", "opts": ["61", "63", "59", "65"], "ans": 0, "exp": "प्रत्येक पद में +4 जुड़ रहा है: 57 + 4 = 61."}, {"q": "श्रृंखला को पूरा करें: 41, 47, 53, 59, 65, ?", "opts": ["73", "71", "69", "77"], "ans": 1, "exp": "प्रत्येक पद में +6 जुड़ रहा है: 65 + 6 = 71."}, {"q": "श्रृंखला को पूरा करें: 41, 48, 55, 62, 69, ?", "opts": ["74", "78", "76", "83"], "ans": 2, "exp": "प्रत्येक पद में +7 जुड़ रहा है: 69 + 7 = 76."}, {"q": "श्रृंखला को पूरा करें: 41, 50, 59, 68, 77, ?", "opts": ["95", "88", "84", "86"], "ans": 3, "exp": "प्रत्येक पद में +9 जुड़ रहा है: 77 + 9 = 86."}]}, "maths_s3": {"title": "🔢 गणित (Maths) — सेट 3 (100 प्रश्न)", "questions": [{"q": "एक वस्तु ₹1000 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1100", "₹1120", "₹1085", "₹1150"], "ans": 0, "exp": "1000 + 1000×10% = ₹1100."}, {"q": "एक वस्तु ₹1000 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1170", "₹1150", "₹1135", "₹1200"], "ans": 1, "exp": "1000 + 1000×15% = ₹1150."}, {"q": "एक वस्तु ₹1000 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1185", "₹1220", "₹1200", "₹1250"], "ans": 2, "exp": "1000 + 1000×20% = ₹1200."}, {"q": "एक वस्तु ₹1000 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1300", "₹1270", "₹1235", "₹1250"], "ans": 3, "exp": "1000 + 1000×25% = ₹1250."}, {"q": "एक वस्तु ₹1000 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1300", "₹1320", "₹1285", "₹1350"], "ans": 0, "exp": "1000 + 1000×30% = ₹1300."}, {"q": "एक वस्तु ₹1000 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1420", "₹1400", "₹1385", "₹1450"], "ans": 1, "exp": "1000 + 1000×40% = ₹1400."}, {"q": "एक वस्तु ₹1000 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1485", "₹1520", "₹1500", "₹1550"], "ans": 2, "exp": "1000 + 1000×50% = ₹1500."}, {"q": "एक वस्तु ₹1000 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1100", "₹1070", "₹1035", "₹1050"], "ans": 3, "exp": "1000 + 1000×5% = ₹1050."}, {"q": "एक वस्तु ₹1000 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1120", "₹1140", "₹1105", "₹1170"], "ans": 0, "exp": "1000 + 1000×12% = ₹1120."}, {"q": "एक वस्तु ₹1000 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1100", "₹1080", "₹1065", "₹1130"], "ans": 1, "exp": "1000 + 1000×8% = ₹1080."}, {"q": "एक वस्तु ₹1100 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1195", "₹1230", "₹1210", "₹1260"], "ans": 2, "exp": "1100 + 1100×10% = ₹1210."}, {"q": "एक वस्तु ₹1100 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1315", "₹1285", "₹1250", "₹1265"], "ans": 3, "exp": "1100 + 1100×15% = ₹1265."}, {"q": "एक वस्तु ₹1100 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1320", "₹1340", "₹1305", "₹1370"], "ans": 0, "exp": "1100 + 1100×20% = ₹1320."}, {"q": "एक वस्तु ₹1100 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1395", "₹1375", "₹1360", "₹1425"], "ans": 1, "exp": "1100 + 1100×25% = ₹1375."}, {"q": "एक वस्तु ₹1100 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1415", "₹1450", "₹1430", "₹1480"], "ans": 2, "exp": "1100 + 1100×30% = ₹1430."}, {"q": "एक वस्तु ₹1100 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1590", "₹1560", "₹1525", "₹1540"], "ans": 3, "exp": "1100 + 1100×40% = ₹1540."}, {"q": "एक वस्तु ₹1100 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1650", "₹1670", "₹1635", "₹1700"], "ans": 0, "exp": "1100 + 1100×50% = ₹1650."}, {"q": "एक वस्तु ₹1100 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1175", "₹1155", "₹1140", "₹1205"], "ans": 1, "exp": "1100 + 1100×5% = ₹1155."}, {"q": "एक वस्तु ₹1100 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1217", "₹1252", "₹1232", "₹1282"], "ans": 2, "exp": "1100 + 1100×12% = ₹1232."}, {"q": "एक वस्तु ₹1100 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1238", "₹1208", "₹1173", "₹1188"], "ans": 3, "exp": "1100 + 1100×8% = ₹1188."}, {"q": "एक वस्तु ₹1200 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1320", "₹1340", "₹1305", "₹1370"], "ans": 0, "exp": "1200 + 1200×10% = ₹1320."}, {"q": "एक वस्तु ₹1200 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1400", "₹1380", "₹1365", "₹1430"], "ans": 1, "exp": "1200 + 1200×15% = ₹1380."}, {"q": "एक वस्तु ₹1200 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1425", "₹1460", "₹1440", "₹1490"], "ans": 2, "exp": "1200 + 1200×20% = ₹1440."}, {"q": "एक वस्तु ₹1200 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1550", "₹1520", "₹1485", "₹1500"], "ans": 3, "exp": "1200 + 1200×25% = ₹1500."}, {"q": "एक वस्तु ₹1200 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1560", "₹1580", "₹1545", "₹1610"], "ans": 0, "exp": "1200 + 1200×30% = ₹1560."}, {"q": "एक वस्तु ₹1200 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1700", "₹1680", "₹1665", "₹1730"], "ans": 1, "exp": "1200 + 1200×40% = ₹1680."}, {"q": "एक वस्तु ₹1200 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1785", "₹1820", "₹1800", "₹1850"], "ans": 2, "exp": "1200 + 1200×50% = ₹1800."}, {"q": "एक वस्तु ₹1200 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1310", "₹1280", "₹1245", "₹1260"], "ans": 3, "exp": "1200 + 1200×5% = ₹1260."}, {"q": "एक वस्तु ₹1200 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1344", "₹1364", "₹1329", "₹1394"], "ans": 0, "exp": "1200 + 1200×12% = ₹1344."}, {"q": "एक वस्तु ₹1200 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1316", "₹1296", "₹1281", "₹1346"], "ans": 1, "exp": "1200 + 1200×8% = ₹1296."}, {"q": "एक वस्तु ₹1300 में खरीदकर 10% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1415", "₹1450", "₹1430", "₹1480"], "ans": 2, "exp": "1300 + 1300×10% = ₹1430."}, {"q": "एक वस्तु ₹1300 में खरीदकर 15% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1545", "₹1515", "₹1480", "₹1495"], "ans": 3, "exp": "1300 + 1300×15% = ₹1495."}, {"q": "एक वस्तु ₹1300 में खरीदकर 20% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1560", "₹1580", "₹1545", "₹1610"], "ans": 0, "exp": "1300 + 1300×20% = ₹1560."}, {"q": "एक वस्तु ₹1300 में खरीदकर 25% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1645", "₹1625", "₹1610", "₹1675"], "ans": 1, "exp": "1300 + 1300×25% = ₹1625."}, {"q": "एक वस्तु ₹1300 में खरीदकर 30% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1675", "₹1710", "₹1690", "₹1740"], "ans": 2, "exp": "1300 + 1300×30% = ₹1690."}, {"q": "एक वस्तु ₹1300 में खरीदकर 40% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1870", "₹1840", "₹1805", "₹1820"], "ans": 3, "exp": "1300 + 1300×40% = ₹1820."}, {"q": "एक वस्तु ₹1300 में खरीदकर 50% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1950", "₹1970", "₹1935", "₹2000"], "ans": 0, "exp": "1300 + 1300×50% = ₹1950."}, {"q": "एक वस्तु ₹1300 में खरीदकर 5% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1385", "₹1365", "₹1350", "₹1415"], "ans": 1, "exp": "1300 + 1300×5% = ₹1365."}, {"q": "एक वस्तु ₹1300 में खरीदकर 12% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1441", "₹1476", "₹1456", "₹1506"], "ans": 2, "exp": "1300 + 1300×12% = ₹1456."}, {"q": "एक वस्तु ₹1300 में खरीदकर 8% लाभ पर बेची गई, तो विक्रय मूल्य क्या होगा?", "opts": ["₹1454", "₹1424", "₹1389", "₹1404"], "ans": 3, "exp": "1300 + 1300×8% = ₹1404."}, {"q": "₹1000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹80", "₹130", "₹40", "₹180"], "ans": 0, "exp": "SI = (1000×4×2)/100 = ₹80."}, {"q": "₹1000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹170", "₹120", "₹80", "₹220"], "ans": 1, "exp": "SI = (1000×4×3)/100 = ₹120."}, {"q": "₹1000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹60", "₹150", "₹100", "₹200"], "ans": 2, "exp": "SI = (1000×5×2)/100 = ₹100."}, {"q": "₹1000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹250", "₹200", "₹110", "₹150"], "ans": 3, "exp": "SI = (1000×5×3)/100 = ₹150."}, {"q": "₹1000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹120", "₹170", "₹80", "₹220"], "ans": 0, "exp": "SI = (1000×6×2)/100 = ₹120."}, {"q": "₹1000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹230", "₹180", "₹140", "₹280"], "ans": 1, "exp": "SI = (1000×6×3)/100 = ₹180."}, {"q": "₹1000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹120", "₹210", "₹160", "₹260"], "ans": 2, "exp": "SI = (1000×8×2)/100 = ₹160."}, {"q": "₹1000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹340", "₹290", "₹200", "₹240"], "ans": 3, "exp": "SI = (1000×8×3)/100 = ₹240."}, {"q": "₹1000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹200", "₹250", "₹160", "₹300"], "ans": 0, "exp": "SI = (1000×10×2)/100 = ₹200."}, {"q": "₹1000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹350", "₹300", "₹260", "₹400"], "ans": 1, "exp": "SI = (1000×10×3)/100 = ₹300."}, {"q": "₹1000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹200", "₹290", "₹240", "₹340"], "ans": 2, "exp": "SI = (1000×12×2)/100 = ₹240."}, {"q": "₹1000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹460", "₹410", "₹320", "₹360"], "ans": 3, "exp": "SI = (1000×12×3)/100 = ₹360."}, {"q": "₹1500 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹120", "₹170", "₹80", "₹220"], "ans": 0, "exp": "SI = (1500×4×2)/100 = ₹120."}, {"q": "₹1500 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹230", "₹180", "₹140", "₹280"], "ans": 1, "exp": "SI = (1500×4×3)/100 = ₹180."}, {"q": "₹1500 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹110", "₹200", "₹150", "₹250"], "ans": 2, "exp": "SI = (1500×5×2)/100 = ₹150."}, {"q": "₹1500 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹325", "₹275", "₹185", "₹225"], "ans": 3, "exp": "SI = (1500×5×3)/100 = ₹225."}, {"q": "₹1500 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹180", "₹230", "₹140", "₹280"], "ans": 0, "exp": "SI = (1500×6×2)/100 = ₹180."}, {"q": "₹1500 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹320", "₹270", "₹230", "₹370"], "ans": 1, "exp": "SI = (1500×6×3)/100 = ₹270."}, {"q": "₹1500 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹200", "₹290", "₹240", "₹340"], "ans": 2, "exp": "SI = (1500×8×2)/100 = ₹240."}, {"q": "₹1500 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹460", "₹410", "₹320", "₹360"], "ans": 3, "exp": "SI = (1500×8×3)/100 = ₹360."}, {"q": "₹1500 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹300", "₹350", "₹260", "₹400"], "ans": 0, "exp": "SI = (1500×10×2)/100 = ₹300."}, {"q": "₹1500 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹500", "₹450", "₹410", "₹550"], "ans": 1, "exp": "SI = (1500×10×3)/100 = ₹450."}, {"q": "₹1500 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹320", "₹410", "₹360", "₹460"], "ans": 2, "exp": "SI = (1500×12×2)/100 = ₹360."}, {"q": "₹1500 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹640", "₹590", "₹500", "₹540"], "ans": 3, "exp": "SI = (1500×12×3)/100 = ₹540."}, {"q": "₹2000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹160", "₹210", "₹120", "₹260"], "ans": 0, "exp": "SI = (2000×4×2)/100 = ₹160."}, {"q": "₹2000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹290", "₹240", "₹200", "₹340"], "ans": 1, "exp": "SI = (2000×4×3)/100 = ₹240."}, {"q": "₹2000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹160", "₹250", "₹200", "₹300"], "ans": 2, "exp": "SI = (2000×5×2)/100 = ₹200."}, {"q": "₹2000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹400", "₹350", "₹260", "₹300"], "ans": 3, "exp": "SI = (2000×5×3)/100 = ₹300."}, {"q": "₹2000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹240", "₹290", "₹200", "₹340"], "ans": 0, "exp": "SI = (2000×6×2)/100 = ₹240."}, {"q": "₹2000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹410", "₹360", "₹320", "₹460"], "ans": 1, "exp": "SI = (2000×6×3)/100 = ₹360."}, {"q": "₹2000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹280", "₹370", "₹320", "₹420"], "ans": 2, "exp": "SI = (2000×8×2)/100 = ₹320."}, {"q": "₹2000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹580", "₹530", "₹440", "₹480"], "ans": 3, "exp": "SI = (2000×8×3)/100 = ₹480."}, {"q": "₹2000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹400", "₹450", "₹360", "₹500"], "ans": 0, "exp": "SI = (2000×10×2)/100 = ₹400."}, {"q": "₹2000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹650", "₹600", "₹560", "₹700"], "ans": 1, "exp": "SI = (2000×10×3)/100 = ₹600."}, {"q": "₹2000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹440", "₹530", "₹480", "₹580"], "ans": 2, "exp": "SI = (2000×12×2)/100 = ₹480."}, {"q": "₹2000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹820", "₹770", "₹680", "₹720"], "ans": 3, "exp": "SI = (2000×12×3)/100 = ₹720."}, {"q": "₹2500 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹200", "₹250", "₹160", "₹300"], "ans": 0, "exp": "SI = (2500×4×2)/100 = ₹200."}, {"q": "₹2500 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹350", "₹300", "₹260", "₹400"], "ans": 1, "exp": "SI = (2500×4×3)/100 = ₹300."}, {"q": "₹2500 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹210", "₹300", "₹250", "₹350"], "ans": 2, "exp": "SI = (2500×5×2)/100 = ₹250."}, {"q": "₹2500 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹475", "₹425", "₹335", "₹375"], "ans": 3, "exp": "SI = (2500×5×3)/100 = ₹375."}, {"q": "₹2500 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹300", "₹350", "₹260", "₹400"], "ans": 0, "exp": "SI = (2500×6×2)/100 = ₹300."}, {"q": "₹2500 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹500", "₹450", "₹410", "₹550"], "ans": 1, "exp": "SI = (2500×6×3)/100 = ₹450."}, {"q": "₹2500 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹360", "₹450", "₹400", "₹500"], "ans": 2, "exp": "SI = (2500×8×2)/100 = ₹400."}, {"q": "₹2500 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹700", "₹650", "₹560", "₹600"], "ans": 3, "exp": "SI = (2500×8×3)/100 = ₹600."}, {"q": "₹2500 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹500", "₹550", "₹460", "₹600"], "ans": 0, "exp": "SI = (2500×10×2)/100 = ₹500."}, {"q": "₹2500 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹800", "₹750", "₹710", "₹850"], "ans": 1, "exp": "SI = (2500×10×3)/100 = ₹750."}, {"q": "₹2500 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹560", "₹650", "₹600", "₹700"], "ans": 2, "exp": "SI = (2500×12×2)/100 = ₹600."}, {"q": "₹2500 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1000", "₹950", "₹860", "₹900"], "ans": 3, "exp": "SI = (2500×12×3)/100 = ₹900."}, {"q": "₹3000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹240", "₹290", "₹200", "₹340"], "ans": 0, "exp": "SI = (3000×4×2)/100 = ₹240."}, {"q": "₹3000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹410", "₹360", "₹320", "₹460"], "ans": 1, "exp": "SI = (3000×4×3)/100 = ₹360."}, {"q": "₹3000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹260", "₹350", "₹300", "₹400"], "ans": 2, "exp": "SI = (3000×5×2)/100 = ₹300."}, {"q": "₹3000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹550", "₹500", "₹410", "₹450"], "ans": 3, "exp": "SI = (3000×5×3)/100 = ₹450."}, {"q": "₹3000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹360", "₹410", "₹320", "₹460"], "ans": 0, "exp": "SI = (3000×6×2)/100 = ₹360."}, {"q": "₹3000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹590", "₹540", "₹500", "₹640"], "ans": 1, "exp": "SI = (3000×6×3)/100 = ₹540."}, {"q": "₹3000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹440", "₹530", "₹480", "₹580"], "ans": 2, "exp": "SI = (3000×8×2)/100 = ₹480."}, {"q": "₹3000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹820", "₹770", "₹680", "₹720"], "ans": 3, "exp": "SI = (3000×8×3)/100 = ₹720."}, {"q": "₹3000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹600", "₹650", "₹560", "₹700"], "ans": 0, "exp": "SI = (3000×10×2)/100 = ₹600."}, {"q": "₹3000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹950", "₹900", "₹860", "₹1000"], "ans": 1, "exp": "SI = (3000×10×3)/100 = ₹900."}, {"q": "₹3000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹680", "₹770", "₹720", "₹820"], "ans": 2, "exp": "SI = (3000×12×2)/100 = ₹720."}, {"q": "₹3000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1180", "₹1130", "₹1040", "₹1080"], "ans": 3, "exp": "SI = (3000×12×3)/100 = ₹1080."}]}, "reasoning_s3": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 3 (100 प्रश्न)", "questions": [{"q": "अगली संख्या ज्ञात करें: 1, 3, 7, 13, 21, ?", "opts": ["31", "32", "30", "33"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 31."}, {"q": "अगली संख्या ज्ञात करें: 1, 4, 10, 19, 31, ?", "opts": ["47", "46", "45", "49"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 46."}, {"q": "अगली संख्या ज्ञात करें: 2, 4, 8, 14, 22, ?", "opts": ["31", "33", "32", "34"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 32."}, {"q": "अगली संख्या ज्ञात करें: 2, 5, 11, 20, 32, ?", "opts": ["50", "48", "46", "47"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 47."}, {"q": "अगली संख्या ज्ञात करें: 3, 5, 9, 15, 23, ?", "opts": ["33", "34", "32", "35"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 33."}, {"q": "अगली संख्या ज्ञात करें: 3, 6, 12, 21, 33, ?", "opts": ["49", "48", "47", "51"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 48."}, {"q": "अगली संख्या ज्ञात करें: 4, 6, 10, 16, 24, ?", "opts": ["33", "35", "34", "36"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 34."}, {"q": "अगली संख्या ज्ञात करें: 4, 7, 13, 22, 34, ?", "opts": ["52", "50", "48", "49"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 49."}, {"q": "अगली संख्या ज्ञात करें: 5, 7, 11, 17, 25, ?", "opts": ["35", "36", "34", "37"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 35."}, {"q": "अगली संख्या ज्ञात करें: 5, 8, 14, 23, 35, ?", "opts": ["51", "50", "49", "53"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 50."}, {"q": "अगली संख्या ज्ञात करें: 6, 8, 12, 18, 26, ?", "opts": ["35", "37", "36", "38"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 36."}, {"q": "अगली संख्या ज्ञात करें: 6, 9, 15, 24, 36, ?", "opts": ["54", "52", "50", "51"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 51."}, {"q": "अगली संख्या ज्ञात करें: 7, 9, 13, 19, 27, ?", "opts": ["37", "38", "36", "39"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 37."}, {"q": "अगली संख्या ज्ञात करें: 7, 10, 16, 25, 37, ?", "opts": ["53", "52", "51", "55"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 52."}, {"q": "अगली संख्या ज्ञात करें: 8, 10, 14, 20, 28, ?", "opts": ["37", "39", "38", "40"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 38."}, {"q": "अगली संख्या ज्ञात करें: 8, 11, 17, 26, 38, ?", "opts": ["56", "54", "52", "53"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 53."}, {"q": "अगली संख्या ज्ञात करें: 9, 11, 15, 21, 29, ?", "opts": ["39", "40", "38", "41"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 39."}, {"q": "अगली संख्या ज्ञात करें: 9, 12, 18, 27, 39, ?", "opts": ["55", "54", "53", "57"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 54."}, {"q": "अगली संख्या ज्ञात करें: 10, 12, 16, 22, 30, ?", "opts": ["39", "41", "40", "42"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 40."}, {"q": "अगली संख्या ज्ञात करें: 10, 13, 19, 28, 40, ?", "opts": ["58", "56", "54", "55"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 55."}, {"q": "अगली संख्या ज्ञात करें: 11, 13, 17, 23, 31, ?", "opts": ["41", "42", "40", "43"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 41."}, {"q": "अगली संख्या ज्ञात करें: 11, 14, 20, 29, 41, ?", "opts": ["57", "56", "55", "59"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 56."}, {"q": "अगली संख्या ज्ञात करें: 12, 14, 18, 24, 32, ?", "opts": ["41", "43", "42", "44"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 42."}, {"q": "अगली संख्या ज्ञात करें: 12, 15, 21, 30, 42, ?", "opts": ["60", "58", "56", "57"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 57."}, {"q": "अगली संख्या ज्ञात करें: 13, 15, 19, 25, 33, ?", "opts": ["43", "44", "42", "45"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 43."}, {"q": "अगली संख्या ज्ञात करें: 13, 16, 22, 31, 43, ?", "opts": ["59", "58", "57", "61"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 58."}, {"q": "अगली संख्या ज्ञात करें: 14, 16, 20, 26, 34, ?", "opts": ["43", "45", "44", "46"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 44."}, {"q": "अगली संख्या ज्ञात करें: 14, 17, 23, 32, 44, ?", "opts": ["62", "60", "58", "59"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 59."}, {"q": "अगली संख्या ज्ञात करें: 15, 17, 21, 27, 35, ?", "opts": ["45", "46", "44", "47"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 45."}, {"q": "अगली संख्या ज्ञात करें: 15, 18, 24, 33, 45, ?", "opts": ["61", "60", "59", "63"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 60."}, {"q": "अगली संख्या ज्ञात करें: 16, 18, 22, 28, 36, ?", "opts": ["45", "47", "46", "48"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 46."}, {"q": "अगली संख्या ज्ञात करें: 16, 19, 25, 34, 46, ?", "opts": ["64", "62", "60", "61"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 61."}, {"q": "अगली संख्या ज्ञात करें: 17, 19, 23, 29, 37, ?", "opts": ["47", "48", "46", "49"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 47."}, {"q": "अगली संख्या ज्ञात करें: 17, 20, 26, 35, 47, ?", "opts": ["63", "62", "61", "65"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 62."}, {"q": "अगली संख्या ज्ञात करें: 18, 20, 24, 30, 38, ?", "opts": ["47", "49", "48", "50"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 48."}, {"q": "अगली संख्या ज्ञात करें: 18, 21, 27, 36, 48, ?", "opts": ["66", "64", "62", "63"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 63."}, {"q": "अगली संख्या ज्ञात करें: 19, 21, 25, 31, 39, ?", "opts": ["49", "50", "48", "51"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 49."}, {"q": "अगली संख्या ज्ञात करें: 19, 22, 28, 37, 49, ?", "opts": ["65", "64", "63", "67"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 64."}, {"q": "अगली संख्या ज्ञात करें: 20, 22, 26, 32, 40, ?", "opts": ["49", "51", "50", "52"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 50."}, {"q": "अगली संख्या ज्ञात करें: 20, 23, 29, 38, 50, ?", "opts": ["68", "66", "64", "65"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 65."}, {"q": "अगली संख्या ज्ञात करें: 21, 23, 27, 33, 41, ?", "opts": ["51", "52", "50", "53"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 51."}, {"q": "अगली संख्या ज्ञात करें: 21, 24, 30, 39, 51, ?", "opts": ["67", "66", "65", "69"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 66."}, {"q": "अगली संख्या ज्ञात करें: 22, 24, 28, 34, 42, ?", "opts": ["51", "53", "52", "54"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 52."}, {"q": "अगली संख्या ज्ञात करें: 22, 25, 31, 40, 52, ?", "opts": ["70", "68", "66", "67"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 67."}, {"q": "अगली संख्या ज्ञात करें: 23, 25, 29, 35, 43, ?", "opts": ["53", "54", "52", "55"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 53."}, {"q": "अगली संख्या ज्ञात करें: 23, 26, 32, 41, 53, ?", "opts": ["69", "68", "67", "71"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 68."}, {"q": "अगली संख्या ज्ञात करें: 24, 26, 30, 36, 44, ?", "opts": ["53", "55", "54", "56"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 54."}, {"q": "अगली संख्या ज्ञात करें: 24, 27, 33, 42, 54, ?", "opts": ["72", "70", "68", "69"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 69."}, {"q": "अगली संख्या ज्ञात करें: 25, 27, 31, 37, 45, ?", "opts": ["55", "56", "54", "57"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 55."}, {"q": "अगली संख्या ज्ञात करें: 25, 28, 34, 43, 55, ?", "opts": ["71", "70", "69", "73"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 70."}, {"q": "अगली संख्या ज्ञात करें: 26, 28, 32, 38, 46, ?", "opts": ["55", "57", "56", "58"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 56."}, {"q": "अगली संख्या ज्ञात करें: 26, 29, 35, 44, 56, ?", "opts": ["74", "72", "70", "71"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 71."}, {"q": "अगली संख्या ज्ञात करें: 27, 29, 33, 39, 47, ?", "opts": ["57", "58", "56", "59"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 57."}, {"q": "अगली संख्या ज्ञात करें: 27, 30, 36, 45, 57, ?", "opts": ["73", "72", "71", "75"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 72."}, {"q": "अगली संख्या ज्ञात करें: 28, 30, 34, 40, 48, ?", "opts": ["57", "59", "58", "60"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 58."}, {"q": "अगली संख्या ज्ञात करें: 28, 31, 37, 46, 58, ?", "opts": ["76", "74", "72", "73"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 73."}, {"q": "अगली संख्या ज्ञात करें: 29, 31, 35, 41, 49, ?", "opts": ["59", "60", "58", "61"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 59."}, {"q": "अगली संख्या ज्ञात करें: 29, 32, 38, 47, 59, ?", "opts": ["75", "74", "73", "77"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 74."}, {"q": "अगली संख्या ज्ञात करें: 30, 32, 36, 42, 50, ?", "opts": ["59", "61", "60", "62"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 60."}, {"q": "अगली संख्या ज्ञात करें: 30, 33, 39, 48, 60, ?", "opts": ["78", "76", "74", "75"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 75."}, {"q": "अगली संख्या ज्ञात करें: 31, 33, 37, 43, 51, ?", "opts": ["61", "62", "60", "63"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 61."}, {"q": "अगली संख्या ज्ञात करें: 31, 34, 40, 49, 61, ?", "opts": ["77", "76", "75", "79"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 76."}, {"q": "अगली संख्या ज्ञात करें: 32, 34, 38, 44, 52, ?", "opts": ["61", "63", "62", "64"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 62."}, {"q": "अगली संख्या ज्ञात करें: 32, 35, 41, 50, 62, ?", "opts": ["80", "78", "76", "77"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 77."}, {"q": "अगली संख्या ज्ञात करें: 33, 35, 39, 45, 53, ?", "opts": ["63", "64", "62", "65"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 63."}, {"q": "अगली संख्या ज्ञात करें: 33, 36, 42, 51, 63, ?", "opts": ["79", "78", "77", "81"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 78."}, {"q": "अगली संख्या ज्ञात करें: 34, 36, 40, 46, 54, ?", "opts": ["63", "65", "64", "66"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 64."}, {"q": "अगली संख्या ज्ञात करें: 34, 37, 43, 52, 64, ?", "opts": ["82", "80", "78", "79"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 79."}, {"q": "अगली संख्या ज्ञात करें: 35, 37, 41, 47, 55, ?", "opts": ["65", "66", "64", "67"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 65."}, {"q": "अगली संख्या ज्ञात करें: 35, 38, 44, 53, 65, ?", "opts": ["81", "80", "79", "83"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 80."}, {"q": "अगली संख्या ज्ञात करें: 36, 38, 42, 48, 56, ?", "opts": ["65", "67", "66", "68"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 66."}, {"q": "अगली संख्या ज्ञात करें: 36, 39, 45, 54, 66, ?", "opts": ["84", "82", "80", "81"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 81."}, {"q": "अगली संख्या ज्ञात करें: 37, 39, 43, 49, 57, ?", "opts": ["67", "68", "66", "69"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 67."}, {"q": "अगली संख्या ज्ञात करें: 37, 40, 46, 55, 67, ?", "opts": ["83", "82", "81", "85"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 82."}, {"q": "अगली संख्या ज्ञात करें: 38, 40, 44, 50, 58, ?", "opts": ["67", "69", "68", "70"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 68."}, {"q": "अगली संख्या ज्ञात करें: 38, 41, 47, 56, 68, ?", "opts": ["86", "84", "82", "83"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 83."}, {"q": "अगली संख्या ज्ञात करें: 39, 41, 45, 51, 59, ?", "opts": ["69", "70", "68", "71"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 69."}, {"q": "अगली संख्या ज्ञात करें: 39, 42, 48, 57, 69, ?", "opts": ["85", "84", "83", "87"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 84."}, {"q": "अगली संख्या ज्ञात करें: 40, 42, 46, 52, 60, ?", "opts": ["69", "71", "70", "72"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 70."}, {"q": "अगली संख्या ज्ञात करें: 40, 43, 49, 58, 70, ?", "opts": ["88", "86", "84", "85"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 85."}, {"q": "अगली संख्या ज्ञात करें: 41, 43, 47, 53, 61, ?", "opts": ["71", "72", "70", "73"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 71."}, {"q": "अगली संख्या ज्ञात करें: 41, 44, 50, 59, 71, ?", "opts": ["87", "86", "85", "89"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 86."}, {"q": "अगली संख्या ज्ञात करें: 42, 44, 48, 54, 62, ?", "opts": ["71", "73", "72", "74"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 72."}, {"q": "अगली संख्या ज्ञात करें: 42, 45, 51, 60, 72, ?", "opts": ["90", "88", "86", "87"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 87."}, {"q": "अगली संख्या ज्ञात करें: 43, 45, 49, 55, 63, ?", "opts": ["73", "74", "72", "75"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 73."}, {"q": "अगली संख्या ज्ञात करें: 43, 46, 52, 61, 73, ?", "opts": ["89", "88", "87", "91"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 88."}, {"q": "अगली संख्या ज्ञात करें: 44, 46, 50, 56, 64, ?", "opts": ["73", "75", "74", "76"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 74."}, {"q": "अगली संख्या ज्ञात करें: 44, 47, 53, 62, 74, ?", "opts": ["92", "90", "88", "89"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 89."}, {"q": "अगली संख्या ज्ञात करें: 45, 47, 51, 57, 65, ?", "opts": ["75", "76", "74", "77"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 75."}, {"q": "अगली संख्या ज्ञात करें: 45, 48, 54, 63, 75, ?", "opts": ["91", "90", "89", "93"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 90."}, {"q": "अगली संख्या ज्ञात करें: 46, 48, 52, 58, 66, ?", "opts": ["75", "77", "76", "78"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 76."}, {"q": "अगली संख्या ज्ञात करें: 46, 49, 55, 64, 76, ?", "opts": ["94", "92", "90", "91"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 91."}, {"q": "अगली संख्या ज्ञात करें: 47, 49, 53, 59, 67, ?", "opts": ["77", "78", "76", "79"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 77."}, {"q": "अगली संख्या ज्ञात करें: 47, 50, 56, 65, 77, ?", "opts": ["93", "92", "91", "95"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 92."}, {"q": "अगली संख्या ज्ञात करें: 48, 50, 54, 60, 68, ?", "opts": ["77", "79", "78", "80"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 78."}, {"q": "अगली संख्या ज्ञात करें: 48, 51, 57, 66, 78, ?", "opts": ["96", "94", "92", "93"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 93."}, {"q": "अगली संख्या ज्ञात करें: 49, 51, 55, 61, 69, ?", "opts": ["79", "80", "78", "81"], "ans": 0, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 79."}, {"q": "अगली संख्या ज्ञात करें: 49, 52, 58, 67, 79, ?", "opts": ["95", "94", "93", "97"], "ans": 1, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 94."}, {"q": "अगली संख्या ज्ञात करें: 50, 52, 56, 62, 70, ?", "opts": ["79", "81", "80", "82"], "ans": 2, "exp": "अंतर क्रमशः +2, +4, +6, +8, अतः अगला +10 => 80."}, {"q": "अगली संख्या ज्ञात करें: 50, 53, 59, 68, 80, ?", "opts": ["98", "96", "94", "95"], "ans": 3, "exp": "अंतर क्रमशः +3, +6, +9, +12, अतः अगला +15 => 95."}]}, "maths_s4": {"title": "🔢 गणित (Maths) — सेट 4 (100 प्रश्न)", "questions": [{"q": "₹4000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹320", "₹370", "₹280", "₹420"], "ans": 0, "exp": "SI = (4000×4×2)/100 = ₹320."}, {"q": "₹4000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹530", "₹480", "₹440", "₹580"], "ans": 1, "exp": "SI = (4000×4×3)/100 = ₹480."}, {"q": "₹4000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹360", "₹450", "₹400", "₹500"], "ans": 2, "exp": "SI = (4000×5×2)/100 = ₹400."}, {"q": "₹4000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹700", "₹650", "₹560", "₹600"], "ans": 3, "exp": "SI = (4000×5×3)/100 = ₹600."}, {"q": "₹4000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹480", "₹530", "₹440", "₹580"], "ans": 0, "exp": "SI = (4000×6×2)/100 = ₹480."}, {"q": "₹4000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹770", "₹720", "₹680", "₹820"], "ans": 1, "exp": "SI = (4000×6×3)/100 = ₹720."}, {"q": "₹4000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹600", "₹690", "₹640", "₹740"], "ans": 2, "exp": "SI = (4000×8×2)/100 = ₹640."}, {"q": "₹4000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1060", "₹1010", "₹920", "₹960"], "ans": 3, "exp": "SI = (4000×8×3)/100 = ₹960."}, {"q": "₹4000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹800", "₹850", "₹760", "₹900"], "ans": 0, "exp": "SI = (4000×10×2)/100 = ₹800."}, {"q": "₹4000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1250", "₹1200", "₹1160", "₹1300"], "ans": 1, "exp": "SI = (4000×10×3)/100 = ₹1200."}, {"q": "₹4000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹920", "₹1010", "₹960", "₹1060"], "ans": 2, "exp": "SI = (4000×12×2)/100 = ₹960."}, {"q": "₹4000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1540", "₹1490", "₹1400", "₹1440"], "ans": 3, "exp": "SI = (4000×12×3)/100 = ₹1440."}, {"q": "₹5000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹400", "₹450", "₹360", "₹500"], "ans": 0, "exp": "SI = (5000×4×2)/100 = ₹400."}, {"q": "₹5000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹650", "₹600", "₹560", "₹700"], "ans": 1, "exp": "SI = (5000×4×3)/100 = ₹600."}, {"q": "₹5000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹460", "₹550", "₹500", "₹600"], "ans": 2, "exp": "SI = (5000×5×2)/100 = ₹500."}, {"q": "₹5000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹850", "₹800", "₹710", "₹750"], "ans": 3, "exp": "SI = (5000×5×3)/100 = ₹750."}, {"q": "₹5000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹600", "₹650", "₹560", "₹700"], "ans": 0, "exp": "SI = (5000×6×2)/100 = ₹600."}, {"q": "₹5000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹950", "₹900", "₹860", "₹1000"], "ans": 1, "exp": "SI = (5000×6×3)/100 = ₹900."}, {"q": "₹5000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹760", "₹850", "₹800", "₹900"], "ans": 2, "exp": "SI = (5000×8×2)/100 = ₹800."}, {"q": "₹5000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1300", "₹1250", "₹1160", "₹1200"], "ans": 3, "exp": "SI = (5000×8×3)/100 = ₹1200."}, {"q": "₹5000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1000", "₹1050", "₹960", "₹1100"], "ans": 0, "exp": "SI = (5000×10×2)/100 = ₹1000."}, {"q": "₹5000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1550", "₹1500", "₹1460", "₹1600"], "ans": 1, "exp": "SI = (5000×10×3)/100 = ₹1500."}, {"q": "₹5000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1160", "₹1250", "₹1200", "₹1300"], "ans": 2, "exp": "SI = (5000×12×2)/100 = ₹1200."}, {"q": "₹5000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1900", "₹1850", "₹1760", "₹1800"], "ans": 3, "exp": "SI = (5000×12×3)/100 = ₹1800."}, {"q": "₹6000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹480", "₹530", "₹440", "₹580"], "ans": 0, "exp": "SI = (6000×4×2)/100 = ₹480."}, {"q": "₹6000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹770", "₹720", "₹680", "₹820"], "ans": 1, "exp": "SI = (6000×4×3)/100 = ₹720."}, {"q": "₹6000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹560", "₹650", "₹600", "₹700"], "ans": 2, "exp": "SI = (6000×5×2)/100 = ₹600."}, {"q": "₹6000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1000", "₹950", "₹860", "₹900"], "ans": 3, "exp": "SI = (6000×5×3)/100 = ₹900."}, {"q": "₹6000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹720", "₹770", "₹680", "₹820"], "ans": 0, "exp": "SI = (6000×6×2)/100 = ₹720."}, {"q": "₹6000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1130", "₹1080", "₹1040", "₹1180"], "ans": 1, "exp": "SI = (6000×6×3)/100 = ₹1080."}, {"q": "₹6000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹920", "₹1010", "₹960", "₹1060"], "ans": 2, "exp": "SI = (6000×8×2)/100 = ₹960."}, {"q": "₹6000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1540", "₹1490", "₹1400", "₹1440"], "ans": 3, "exp": "SI = (6000×8×3)/100 = ₹1440."}, {"q": "₹6000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1200", "₹1250", "₹1160", "₹1300"], "ans": 0, "exp": "SI = (6000×10×2)/100 = ₹1200."}, {"q": "₹6000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1850", "₹1800", "₹1760", "₹1900"], "ans": 1, "exp": "SI = (6000×10×3)/100 = ₹1800."}, {"q": "₹6000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1400", "₹1490", "₹1440", "₹1540"], "ans": 2, "exp": "SI = (6000×12×2)/100 = ₹1440."}, {"q": "₹6000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2260", "₹2210", "₹2120", "₹2160"], "ans": 3, "exp": "SI = (6000×12×3)/100 = ₹2160."}, {"q": "₹8000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹640", "₹690", "₹600", "₹740"], "ans": 0, "exp": "SI = (8000×4×2)/100 = ₹640."}, {"q": "₹8000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1010", "₹960", "₹920", "₹1060"], "ans": 1, "exp": "SI = (8000×4×3)/100 = ₹960."}, {"q": "₹8000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹760", "₹850", "₹800", "₹900"], "ans": 2, "exp": "SI = (8000×5×2)/100 = ₹800."}, {"q": "₹8000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1300", "₹1250", "₹1160", "₹1200"], "ans": 3, "exp": "SI = (8000×5×3)/100 = ₹1200."}, {"q": "₹8000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹960", "₹1010", "₹920", "₹1060"], "ans": 0, "exp": "SI = (8000×6×2)/100 = ₹960."}, {"q": "₹8000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1490", "₹1440", "₹1400", "₹1540"], "ans": 1, "exp": "SI = (8000×6×3)/100 = ₹1440."}, {"q": "₹8000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1240", "₹1330", "₹1280", "₹1380"], "ans": 2, "exp": "SI = (8000×8×2)/100 = ₹1280."}, {"q": "₹8000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2020", "₹1970", "₹1880", "₹1920"], "ans": 3, "exp": "SI = (8000×8×3)/100 = ₹1920."}, {"q": "₹8000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1600", "₹1650", "₹1560", "₹1700"], "ans": 0, "exp": "SI = (8000×10×2)/100 = ₹1600."}, {"q": "₹8000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2450", "₹2400", "₹2360", "₹2500"], "ans": 1, "exp": "SI = (8000×10×3)/100 = ₹2400."}, {"q": "₹8000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1880", "₹1970", "₹1920", "₹2020"], "ans": 2, "exp": "SI = (8000×12×2)/100 = ₹1920."}, {"q": "₹8000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2980", "₹2930", "₹2840", "₹2880"], "ans": 3, "exp": "SI = (8000×12×3)/100 = ₹2880."}, {"q": "₹10000 पर 4% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹800", "₹850", "₹760", "₹900"], "ans": 0, "exp": "SI = (10000×4×2)/100 = ₹800."}, {"q": "₹10000 पर 4% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1250", "₹1200", "₹1160", "₹1300"], "ans": 1, "exp": "SI = (10000×4×3)/100 = ₹1200."}, {"q": "₹10000 पर 5% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹960", "₹1050", "₹1000", "₹1100"], "ans": 2, "exp": "SI = (10000×5×2)/100 = ₹1000."}, {"q": "₹10000 पर 5% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1600", "₹1550", "₹1460", "₹1500"], "ans": 3, "exp": "SI = (10000×5×3)/100 = ₹1500."}, {"q": "₹10000 पर 6% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1200", "₹1250", "₹1160", "₹1300"], "ans": 0, "exp": "SI = (10000×6×2)/100 = ₹1200."}, {"q": "₹10000 पर 6% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1850", "₹1800", "₹1760", "₹1900"], "ans": 1, "exp": "SI = (10000×6×3)/100 = ₹1800."}, {"q": "₹10000 पर 8% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹1560", "₹1650", "₹1600", "₹1700"], "ans": 2, "exp": "SI = (10000×8×2)/100 = ₹1600."}, {"q": "₹10000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2500", "₹2450", "₹2360", "₹2400"], "ans": 3, "exp": "SI = (10000×8×3)/100 = ₹2400."}, {"q": "₹10000 पर 10% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2000", "₹2050", "₹1960", "₹2100"], "ans": 0, "exp": "SI = (10000×10×2)/100 = ₹2000."}, {"q": "₹10000 पर 10% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹3050", "₹3000", "₹2960", "₹3100"], "ans": 1, "exp": "SI = (10000×10×3)/100 = ₹3000."}, {"q": "₹10000 पर 12% वार्षिक दर से 2 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹2360", "₹2450", "₹2400", "₹2500"], "ans": 2, "exp": "SI = (10000×12×2)/100 = ₹2400."}, {"q": "₹10000 पर 12% वार्षिक दर से 3 वर्ष का साधारण ब्याज कितना होगा?", "opts": ["₹3700", "₹3650", "₹3560", "₹3600"], "ans": 3, "exp": "SI = (10000×12×3)/100 = ₹3600."}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["60 किमी", "85 किमी", "40 किमी", "110 किमी"], "ans": 0, "exp": "दूरी = 30 × 2 = 60 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["115 किमी", "90 किमी", "70 किमी", "140 किमी"], "ans": 1, "exp": "दूरी = 30 × 3 = 90 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["100 किमी", "145 किमी", "120 किमी", "170 किमी"], "ans": 2, "exp": "दूरी = 30 × 4 = 120 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["200 किमी", "175 किमी", "130 किमी", "150 किमी"], "ans": 3, "exp": "दूरी = 30 × 5 = 150 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["180 किमी", "205 किमी", "160 किमी", "230 किमी"], "ans": 0, "exp": "दूरी = 30 × 6 = 180 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["235 किमी", "210 किमी", "190 किमी", "260 किमी"], "ans": 1, "exp": "दूरी = 30 × 7 = 210 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["220 किमी", "265 किमी", "240 किमी", "290 किमी"], "ans": 2, "exp": "दूरी = 30 × 8 = 240 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["320 किमी", "295 किमी", "250 किमी", "270 किमी"], "ans": 3, "exp": "दूरी = 30 × 9 = 270 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["300 किमी", "325 किमी", "280 किमी", "350 किमी"], "ans": 0, "exp": "दूरी = 30 × 10 = 300 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["355 किमी", "330 किमी", "310 किमी", "380 किमी"], "ans": 1, "exp": "दूरी = 30 × 11 = 330 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["340 किमी", "385 किमी", "360 किमी", "410 किमी"], "ans": 2, "exp": "दूरी = 30 × 12 = 360 किमी।"}, {"q": "एक वाहन 30 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["440 किमी", "415 किमी", "370 किमी", "390 किमी"], "ans": 3, "exp": "दूरी = 30 × 13 = 390 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["80 किमी", "105 किमी", "60 किमी", "130 किमी"], "ans": 0, "exp": "दूरी = 40 × 2 = 80 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["145 किमी", "120 किमी", "100 किमी", "170 किमी"], "ans": 1, "exp": "दूरी = 40 × 3 = 120 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["140 किमी", "185 किमी", "160 किमी", "210 किमी"], "ans": 2, "exp": "दूरी = 40 × 4 = 160 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["250 किमी", "225 किमी", "180 किमी", "200 किमी"], "ans": 3, "exp": "दूरी = 40 × 5 = 200 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["240 किमी", "265 किमी", "220 किमी", "290 किमी"], "ans": 0, "exp": "दूरी = 40 × 6 = 240 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["305 किमी", "280 किमी", "260 किमी", "330 किमी"], "ans": 1, "exp": "दूरी = 40 × 7 = 280 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["300 किमी", "345 किमी", "320 किमी", "370 किमी"], "ans": 2, "exp": "दूरी = 40 × 8 = 320 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["410 किमी", "385 किमी", "340 किमी", "360 किमी"], "ans": 3, "exp": "दूरी = 40 × 9 = 360 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["400 किमी", "425 किमी", "380 किमी", "450 किमी"], "ans": 0, "exp": "दूरी = 40 × 10 = 400 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["465 किमी", "440 किमी", "420 किमी", "490 किमी"], "ans": 1, "exp": "दूरी = 40 × 11 = 440 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["460 किमी", "505 किमी", "480 किमी", "530 किमी"], "ans": 2, "exp": "दूरी = 40 × 12 = 480 किमी।"}, {"q": "एक वाहन 40 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["570 किमी", "545 किमी", "500 किमी", "520 किमी"], "ans": 3, "exp": "दूरी = 40 × 13 = 520 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["90 किमी", "115 किमी", "70 किमी", "140 किमी"], "ans": 0, "exp": "दूरी = 45 × 2 = 90 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["160 किमी", "135 किमी", "115 किमी", "185 किमी"], "ans": 1, "exp": "दूरी = 45 × 3 = 135 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["160 किमी", "205 किमी", "180 किमी", "230 किमी"], "ans": 2, "exp": "दूरी = 45 × 4 = 180 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["275 किमी", "250 किमी", "205 किमी", "225 किमी"], "ans": 3, "exp": "दूरी = 45 × 5 = 225 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["270 किमी", "295 किमी", "250 किमी", "320 किमी"], "ans": 0, "exp": "दूरी = 45 × 6 = 270 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["340 किमी", "315 किमी", "295 किमी", "365 किमी"], "ans": 1, "exp": "दूरी = 45 × 7 = 315 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["340 किमी", "385 किमी", "360 किमी", "410 किमी"], "ans": 2, "exp": "दूरी = 45 × 8 = 360 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["455 किमी", "430 किमी", "385 किमी", "405 किमी"], "ans": 3, "exp": "दूरी = 45 × 9 = 405 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["450 किमी", "475 किमी", "430 किमी", "500 किमी"], "ans": 0, "exp": "दूरी = 45 × 10 = 450 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["520 किमी", "495 किमी", "475 किमी", "545 किमी"], "ans": 1, "exp": "दूरी = 45 × 11 = 495 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["520 किमी", "565 किमी", "540 किमी", "590 किमी"], "ans": 2, "exp": "दूरी = 45 × 12 = 540 किमी।"}, {"q": "एक वाहन 45 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["635 किमी", "610 किमी", "565 किमी", "585 किमी"], "ans": 3, "exp": "दूरी = 45 × 13 = 585 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["100 किमी", "125 किमी", "80 किमी", "150 किमी"], "ans": 0, "exp": "दूरी = 50 × 2 = 100 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["175 किमी", "150 किमी", "130 किमी", "200 किमी"], "ans": 1, "exp": "दूरी = 50 × 3 = 150 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["180 किमी", "225 किमी", "200 किमी", "250 किमी"], "ans": 2, "exp": "दूरी = 50 × 4 = 200 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["300 किमी", "275 किमी", "230 किमी", "250 किमी"], "ans": 3, "exp": "दूरी = 50 × 5 = 250 किमी।"}]}, "reasoning_s4": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 4 (100 प्रश्न)", "questions": [{"q": "यदि किसी घड़ी में वास्तविक समय 1:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:55", "11:55", "10:05", "11:00"], "ans": 0, "exp": "11:60 में से 1:05 घटाने पर 10:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:51", "10:51", "10:01", "11:56"], "ans": 1, "exp": "11:60 में से 1:09 घटाने पर 10:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:57", "11:47", "10:47", "11:52"], "ans": 2, "exp": "11:60 में से 1:13 घटाने पर 10:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:48", "11:43", "10:53", "10:43"], "ans": 3, "exp": "11:60 में से 1:17 घटाने पर 10:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:39", "11:39", "10:49", "11:44"], "ans": 0, "exp": "11:60 में से 1:21 घटाने पर 10:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:35", "10:35", "10:45", "11:40"], "ans": 1, "exp": "11:60 में से 1:25 घटाने पर 10:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:41", "11:31", "10:31", "11:36"], "ans": 2, "exp": "11:60 में से 1:29 घटाने पर 10:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:32", "11:27", "10:37", "10:27"], "ans": 3, "exp": "11:60 में से 1:33 घटाने पर 10:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:23", "11:23", "10:33", "11:28"], "ans": 0, "exp": "11:60 में से 1:37 घटाने पर 10:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:19", "10:19", "10:29", "11:24"], "ans": 1, "exp": "11:60 में से 1:41 घटाने पर 10:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:25", "11:15", "10:15", "11:20"], "ans": 2, "exp": "11:60 में से 1:45 घटाने पर 10:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:16", "11:11", "10:21", "10:11"], "ans": 3, "exp": "11:60 में से 1:49 घटाने पर 10:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:07", "11:07", "10:17", "11:12"], "ans": 0, "exp": "11:60 में से 1:53 घटाने पर 10:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 1:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["11:03", "10:03", "10:13", "11:08"], "ans": 1, "exp": "11:60 में से 1:57 घटाने पर 10:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:05", "10:55", "9:55", "10:00"], "ans": 2, "exp": "11:60 में से 2:05 घटाने पर 9:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:56", "10:51", "9:01", "9:51"], "ans": 3, "exp": "11:60 में से 2:09 घटाने पर 9:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:47", "10:47", "9:57", "10:52"], "ans": 0, "exp": "11:60 में से 2:13 घटाने पर 9:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:43", "9:43", "9:53", "10:48"], "ans": 1, "exp": "11:60 में से 2:17 घटाने पर 9:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:49", "10:39", "9:39", "10:44"], "ans": 2, "exp": "11:60 में से 2:21 घटाने पर 9:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:40", "10:35", "9:45", "9:35"], "ans": 3, "exp": "11:60 में से 2:25 घटाने पर 9:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:31", "10:31", "9:41", "10:36"], "ans": 0, "exp": "11:60 में से 2:29 घटाने पर 9:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:27", "9:27", "9:37", "10:32"], "ans": 1, "exp": "11:60 में से 2:33 घटाने पर 9:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:33", "10:23", "9:23", "10:28"], "ans": 2, "exp": "11:60 में से 2:37 घटाने पर 9:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:24", "10:19", "9:29", "9:19"], "ans": 3, "exp": "11:60 में से 2:41 घटाने पर 9:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:15", "10:15", "9:25", "10:20"], "ans": 0, "exp": "11:60 में से 2:45 घटाने पर 9:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:11", "9:11", "9:21", "10:16"], "ans": 1, "exp": "11:60 में से 2:49 घटाने पर 9:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:17", "10:07", "9:07", "10:12"], "ans": 2, "exp": "11:60 में से 2:53 घटाने पर 9:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 2:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["10:08", "10:03", "9:13", "9:03"], "ans": 3, "exp": "11:60 में से 2:57 घटाने पर 9:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:55", "9:55", "8:05", "9:00"], "ans": 0, "exp": "11:60 में से 3:05 घटाने पर 8:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:51", "8:51", "8:01", "9:56"], "ans": 1, "exp": "11:60 में से 3:09 घटाने पर 8:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:57", "9:47", "8:47", "9:52"], "ans": 2, "exp": "11:60 में से 3:13 घटाने पर 8:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:48", "9:43", "8:53", "8:43"], "ans": 3, "exp": "11:60 में से 3:17 घटाने पर 8:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:39", "9:39", "8:49", "9:44"], "ans": 0, "exp": "11:60 में से 3:21 घटाने पर 8:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:35", "8:35", "8:45", "9:40"], "ans": 1, "exp": "11:60 में से 3:25 घटाने पर 8:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:41", "9:31", "8:31", "9:36"], "ans": 2, "exp": "11:60 में से 3:29 घटाने पर 8:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:32", "9:27", "8:37", "8:27"], "ans": 3, "exp": "11:60 में से 3:33 घटाने पर 8:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:23", "9:23", "8:33", "9:28"], "ans": 0, "exp": "11:60 में से 3:37 घटाने पर 8:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:19", "8:19", "8:29", "9:24"], "ans": 1, "exp": "11:60 में से 3:41 घटाने पर 8:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:25", "9:15", "8:15", "9:20"], "ans": 2, "exp": "11:60 में से 3:45 घटाने पर 8:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:16", "9:11", "8:21", "8:11"], "ans": 3, "exp": "11:60 में से 3:49 घटाने पर 8:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:07", "9:07", "8:17", "9:12"], "ans": 0, "exp": "11:60 में से 3:53 घटाने पर 8:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 3:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["9:03", "8:03", "8:13", "9:08"], "ans": 1, "exp": "11:60 में से 3:57 घटाने पर 8:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:05", "8:55", "7:55", "8:00"], "ans": 2, "exp": "11:60 में से 4:05 घटाने पर 7:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:56", "8:51", "7:01", "7:51"], "ans": 3, "exp": "11:60 में से 4:09 घटाने पर 7:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:47", "8:47", "7:57", "8:52"], "ans": 0, "exp": "11:60 में से 4:13 घटाने पर 7:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:43", "7:43", "7:53", "8:48"], "ans": 1, "exp": "11:60 में से 4:17 घटाने पर 7:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:49", "8:39", "7:39", "8:44"], "ans": 2, "exp": "11:60 में से 4:21 घटाने पर 7:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:40", "8:35", "7:45", "7:35"], "ans": 3, "exp": "11:60 में से 4:25 घटाने पर 7:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:31", "8:31", "7:41", "8:36"], "ans": 0, "exp": "11:60 में से 4:29 घटाने पर 7:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:27", "7:27", "7:37", "8:32"], "ans": 1, "exp": "11:60 में से 4:33 घटाने पर 7:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:33", "8:23", "7:23", "8:28"], "ans": 2, "exp": "11:60 में से 4:37 घटाने पर 7:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:24", "8:19", "7:29", "7:19"], "ans": 3, "exp": "11:60 में से 4:41 घटाने पर 7:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:15", "8:15", "7:25", "8:20"], "ans": 0, "exp": "11:60 में से 4:45 घटाने पर 7:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:11", "7:11", "7:21", "8:16"], "ans": 1, "exp": "11:60 में से 4:49 घटाने पर 7:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:17", "8:07", "7:07", "8:12"], "ans": 2, "exp": "11:60 में से 4:53 घटाने पर 7:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 4:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["8:08", "8:03", "7:13", "7:03"], "ans": 3, "exp": "11:60 में से 4:57 घटाने पर 7:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:55", "7:55", "6:05", "7:00"], "ans": 0, "exp": "11:60 में से 5:05 घटाने पर 6:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:51", "6:51", "6:01", "7:56"], "ans": 1, "exp": "11:60 में से 5:09 घटाने पर 6:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:57", "7:47", "6:47", "7:52"], "ans": 2, "exp": "11:60 में से 5:13 घटाने पर 6:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:48", "7:43", "6:53", "6:43"], "ans": 3, "exp": "11:60 में से 5:17 घटाने पर 6:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:39", "7:39", "6:49", "7:44"], "ans": 0, "exp": "11:60 में से 5:21 घटाने पर 6:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:35", "6:35", "6:45", "7:40"], "ans": 1, "exp": "11:60 में से 5:25 घटाने पर 6:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:41", "7:31", "6:31", "7:36"], "ans": 2, "exp": "11:60 में से 5:29 घटाने पर 6:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:32", "7:27", "6:37", "6:27"], "ans": 3, "exp": "11:60 में से 5:33 घटाने पर 6:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:23", "7:23", "6:33", "7:28"], "ans": 0, "exp": "11:60 में से 5:37 घटाने पर 6:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:19", "6:19", "6:29", "7:24"], "ans": 1, "exp": "11:60 में से 5:41 घटाने पर 6:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:25", "7:15", "6:15", "7:20"], "ans": 2, "exp": "11:60 में से 5:45 घटाने पर 6:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:16", "7:11", "6:21", "6:11"], "ans": 3, "exp": "11:60 में से 5:49 घटाने पर 6:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:07", "7:07", "6:17", "7:12"], "ans": 0, "exp": "11:60 में से 5:53 घटाने पर 6:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 5:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["7:03", "6:03", "6:13", "7:08"], "ans": 1, "exp": "11:60 में से 5:57 घटाने पर 6:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:05", "6:55", "5:55", "6:00"], "ans": 2, "exp": "11:60 में से 6:05 घटाने पर 5:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:56", "6:51", "5:01", "5:51"], "ans": 3, "exp": "11:60 में से 6:09 घटाने पर 5:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:47", "6:47", "5:57", "6:52"], "ans": 0, "exp": "11:60 में से 6:13 घटाने पर 5:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:43", "5:43", "5:53", "6:48"], "ans": 1, "exp": "11:60 में से 6:17 घटाने पर 5:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:49", "6:39", "5:39", "6:44"], "ans": 2, "exp": "11:60 में से 6:21 घटाने पर 5:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:40", "6:35", "5:45", "5:35"], "ans": 3, "exp": "11:60 में से 6:25 घटाने पर 5:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:31", "6:31", "5:41", "6:36"], "ans": 0, "exp": "11:60 में से 6:29 घटाने पर 5:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:27", "5:27", "5:37", "6:32"], "ans": 1, "exp": "11:60 में से 6:33 घटाने पर 5:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:33", "6:23", "5:23", "6:28"], "ans": 2, "exp": "11:60 में से 6:37 घटाने पर 5:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:24", "6:19", "5:29", "5:19"], "ans": 3, "exp": "11:60 में से 6:41 घटाने पर 5:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:15", "6:15", "5:25", "6:20"], "ans": 0, "exp": "11:60 में से 6:45 घटाने पर 5:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:11", "5:11", "5:21", "6:16"], "ans": 1, "exp": "11:60 में से 6:49 घटाने पर 5:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:17", "6:07", "5:07", "6:12"], "ans": 2, "exp": "11:60 में से 6:53 घटाने पर 5:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 6:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["6:08", "6:03", "5:13", "5:03"], "ans": 3, "exp": "11:60 में से 6:57 घटाने पर 5:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:55", "5:55", "4:05", "5:00"], "ans": 0, "exp": "11:60 में से 7:05 घटाने पर 4:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:51", "4:51", "4:01", "5:56"], "ans": 1, "exp": "11:60 में से 7:09 घटाने पर 4:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:57", "5:47", "4:47", "5:52"], "ans": 2, "exp": "11:60 में से 7:13 घटाने पर 4:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:48", "5:43", "4:53", "4:43"], "ans": 3, "exp": "11:60 में से 7:17 घटाने पर 4:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:39", "5:39", "4:49", "5:44"], "ans": 0, "exp": "11:60 में से 7:21 घटाने पर 4:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:35", "4:35", "4:45", "5:40"], "ans": 1, "exp": "11:60 में से 7:25 घटाने पर 4:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:41", "5:31", "4:31", "5:36"], "ans": 2, "exp": "11:60 में से 7:29 घटाने पर 4:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:32", "5:27", "4:37", "4:27"], "ans": 3, "exp": "11:60 में से 7:33 घटाने पर 4:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:23", "5:23", "4:33", "5:28"], "ans": 0, "exp": "11:60 में से 7:37 घटाने पर 4:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:19", "4:19", "4:29", "5:24"], "ans": 1, "exp": "11:60 में से 7:41 घटाने पर 4:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:25", "5:15", "4:15", "5:20"], "ans": 2, "exp": "11:60 में से 7:45 घटाने पर 4:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:16", "5:11", "4:21", "4:11"], "ans": 3, "exp": "11:60 में से 7:49 घटाने पर 4:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:07", "5:07", "4:17", "5:12"], "ans": 0, "exp": "11:60 में से 7:53 घटाने पर 4:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 7:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["5:03", "4:03", "4:13", "5:08"], "ans": 1, "exp": "11:60 में से 7:57 घटाने पर 4:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:05", "4:55", "3:55", "4:00"], "ans": 2, "exp": "11:60 में से 8:05 घटाने पर 3:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:56", "4:51", "3:01", "3:51"], "ans": 3, "exp": "11:60 में से 8:09 घटाने पर 3:51 प्राप्त होता है।"}]}, "maths_s5": {"title": "🔢 गणित (Maths) — सेट 5 (100 प्रश्न)", "questions": [{"q": "एक वाहन 50 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["300 किमी", "325 किमी", "280 किमी", "350 किमी"], "ans": 0, "exp": "दूरी = 50 × 6 = 300 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["375 किमी", "350 किमी", "330 किमी", "400 किमी"], "ans": 1, "exp": "दूरी = 50 × 7 = 350 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["380 किमी", "425 किमी", "400 किमी", "450 किमी"], "ans": 2, "exp": "दूरी = 50 × 8 = 400 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["500 किमी", "475 किमी", "430 किमी", "450 किमी"], "ans": 3, "exp": "दूरी = 50 × 9 = 450 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["500 किमी", "525 किमी", "480 किमी", "550 किमी"], "ans": 0, "exp": "दूरी = 50 × 10 = 500 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["575 किमी", "550 किमी", "530 किमी", "600 किमी"], "ans": 1, "exp": "दूरी = 50 × 11 = 550 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["580 किमी", "625 किमी", "600 किमी", "650 किमी"], "ans": 2, "exp": "दूरी = 50 × 12 = 600 किमी।"}, {"q": "एक वाहन 50 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["700 किमी", "675 किमी", "630 किमी", "650 किमी"], "ans": 3, "exp": "दूरी = 50 × 13 = 650 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["120 किमी", "145 किमी", "100 किमी", "170 किमी"], "ans": 0, "exp": "दूरी = 60 × 2 = 120 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["205 किमी", "180 किमी", "160 किमी", "230 किमी"], "ans": 1, "exp": "दूरी = 60 × 3 = 180 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["220 किमी", "265 किमी", "240 किमी", "290 किमी"], "ans": 2, "exp": "दूरी = 60 × 4 = 240 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["350 किमी", "325 किमी", "280 किमी", "300 किमी"], "ans": 3, "exp": "दूरी = 60 × 5 = 300 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["360 किमी", "385 किमी", "340 किमी", "410 किमी"], "ans": 0, "exp": "दूरी = 60 × 6 = 360 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["445 किमी", "420 किमी", "400 किमी", "470 किमी"], "ans": 1, "exp": "दूरी = 60 × 7 = 420 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["460 किमी", "505 किमी", "480 किमी", "530 किमी"], "ans": 2, "exp": "दूरी = 60 × 8 = 480 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["590 किमी", "565 किमी", "520 किमी", "540 किमी"], "ans": 3, "exp": "दूरी = 60 × 9 = 540 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["600 किमी", "625 किमी", "580 किमी", "650 किमी"], "ans": 0, "exp": "दूरी = 60 × 10 = 600 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["685 किमी", "660 किमी", "640 किमी", "710 किमी"], "ans": 1, "exp": "दूरी = 60 × 11 = 660 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["700 किमी", "745 किमी", "720 किमी", "770 किमी"], "ans": 2, "exp": "दूरी = 60 × 12 = 720 किमी।"}, {"q": "एक वाहन 60 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["830 किमी", "805 किमी", "760 किमी", "780 किमी"], "ans": 3, "exp": "दूरी = 60 × 13 = 780 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["140 किमी", "165 किमी", "120 किमी", "190 किमी"], "ans": 0, "exp": "दूरी = 70 × 2 = 140 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["235 किमी", "210 किमी", "190 किमी", "260 किमी"], "ans": 1, "exp": "दूरी = 70 × 3 = 210 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["260 किमी", "305 किमी", "280 किमी", "330 किमी"], "ans": 2, "exp": "दूरी = 70 × 4 = 280 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["400 किमी", "375 किमी", "330 किमी", "350 किमी"], "ans": 3, "exp": "दूरी = 70 × 5 = 350 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["420 किमी", "445 किमी", "400 किमी", "470 किमी"], "ans": 0, "exp": "दूरी = 70 × 6 = 420 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["515 किमी", "490 किमी", "470 किमी", "540 किमी"], "ans": 1, "exp": "दूरी = 70 × 7 = 490 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["540 किमी", "585 किमी", "560 किमी", "610 किमी"], "ans": 2, "exp": "दूरी = 70 × 8 = 560 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["680 किमी", "655 किमी", "610 किमी", "630 किमी"], "ans": 3, "exp": "दूरी = 70 × 9 = 630 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["700 किमी", "725 किमी", "680 किमी", "750 किमी"], "ans": 0, "exp": "दूरी = 70 × 10 = 700 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["795 किमी", "770 किमी", "750 किमी", "820 किमी"], "ans": 1, "exp": "दूरी = 70 × 11 = 770 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["820 किमी", "865 किमी", "840 किमी", "890 किमी"], "ans": 2, "exp": "दूरी = 70 × 12 = 840 किमी।"}, {"q": "एक वाहन 70 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["960 किमी", "935 किमी", "890 किमी", "910 किमी"], "ans": 3, "exp": "दूरी = 70 × 13 = 910 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["150 किमी", "175 किमी", "130 किमी", "200 किमी"], "ans": 0, "exp": "दूरी = 75 × 2 = 150 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["250 किमी", "225 किमी", "205 किमी", "275 किमी"], "ans": 1, "exp": "दूरी = 75 × 3 = 225 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["280 किमी", "325 किमी", "300 किमी", "350 किमी"], "ans": 2, "exp": "दूरी = 75 × 4 = 300 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["425 किमी", "400 किमी", "355 किमी", "375 किमी"], "ans": 3, "exp": "दूरी = 75 × 5 = 375 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["450 किमी", "475 किमी", "430 किमी", "500 किमी"], "ans": 0, "exp": "दूरी = 75 × 6 = 450 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["550 किमी", "525 किमी", "505 किमी", "575 किमी"], "ans": 1, "exp": "दूरी = 75 × 7 = 525 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["580 किमी", "625 किमी", "600 किमी", "650 किमी"], "ans": 2, "exp": "दूरी = 75 × 8 = 600 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["725 किमी", "700 किमी", "655 किमी", "675 किमी"], "ans": 3, "exp": "दूरी = 75 × 9 = 675 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["750 किमी", "775 किमी", "730 किमी", "800 किमी"], "ans": 0, "exp": "दूरी = 75 × 10 = 750 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["850 किमी", "825 किमी", "805 किमी", "875 किमी"], "ans": 1, "exp": "दूरी = 75 × 11 = 825 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["880 किमी", "925 किमी", "900 किमी", "950 किमी"], "ans": 2, "exp": "दूरी = 75 × 12 = 900 किमी।"}, {"q": "एक वाहन 75 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["1025 किमी", "1000 किमी", "955 किमी", "975 किमी"], "ans": 3, "exp": "दूरी = 75 × 13 = 975 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["160 किमी", "185 किमी", "140 किमी", "210 किमी"], "ans": 0, "exp": "दूरी = 80 × 2 = 160 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["265 किमी", "240 किमी", "220 किमी", "290 किमी"], "ans": 1, "exp": "दूरी = 80 × 3 = 240 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["300 किमी", "345 किमी", "320 किमी", "370 किमी"], "ans": 2, "exp": "दूरी = 80 × 4 = 320 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["450 किमी", "425 किमी", "380 किमी", "400 किमी"], "ans": 3, "exp": "दूरी = 80 × 5 = 400 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["480 किमी", "505 किमी", "460 किमी", "530 किमी"], "ans": 0, "exp": "दूरी = 80 × 6 = 480 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["585 किमी", "560 किमी", "540 किमी", "610 किमी"], "ans": 1, "exp": "दूरी = 80 × 7 = 560 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["620 किमी", "665 किमी", "640 किमी", "690 किमी"], "ans": 2, "exp": "दूरी = 80 × 8 = 640 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["770 किमी", "745 किमी", "700 किमी", "720 किमी"], "ans": 3, "exp": "दूरी = 80 × 9 = 720 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["800 किमी", "825 किमी", "780 किमी", "850 किमी"], "ans": 0, "exp": "दूरी = 80 × 10 = 800 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["905 किमी", "880 किमी", "860 किमी", "930 किमी"], "ans": 1, "exp": "दूरी = 80 × 11 = 880 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["940 किमी", "985 किमी", "960 किमी", "1010 किमी"], "ans": 2, "exp": "दूरी = 80 × 12 = 960 किमी।"}, {"q": "एक वाहन 80 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["1090 किमी", "1065 किमी", "1020 किमी", "1040 किमी"], "ans": 3, "exp": "दूरी = 80 × 13 = 1040 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["180 किमी", "205 किमी", "160 किमी", "230 किमी"], "ans": 0, "exp": "दूरी = 90 × 2 = 180 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["295 किमी", "270 किमी", "250 किमी", "320 किमी"], "ans": 1, "exp": "दूरी = 90 × 3 = 270 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["340 किमी", "385 किमी", "360 किमी", "410 किमी"], "ans": 2, "exp": "दूरी = 90 × 4 = 360 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["500 किमी", "475 किमी", "430 किमी", "450 किमी"], "ans": 3, "exp": "दूरी = 90 × 5 = 450 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["540 किमी", "565 किमी", "520 किमी", "590 किमी"], "ans": 0, "exp": "दूरी = 90 × 6 = 540 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["655 किमी", "630 किमी", "610 किमी", "680 किमी"], "ans": 1, "exp": "दूरी = 90 × 7 = 630 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["700 किमी", "745 किमी", "720 किमी", "770 किमी"], "ans": 2, "exp": "दूरी = 90 × 8 = 720 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["860 किमी", "835 किमी", "790 किमी", "810 किमी"], "ans": 3, "exp": "दूरी = 90 × 9 = 810 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["900 किमी", "925 किमी", "880 किमी", "950 किमी"], "ans": 0, "exp": "दूरी = 90 × 10 = 900 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["1015 किमी", "990 किमी", "970 किमी", "1040 किमी"], "ans": 1, "exp": "दूरी = 90 × 11 = 990 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["1060 किमी", "1105 किमी", "1080 किमी", "1130 किमी"], "ans": 2, "exp": "दूरी = 90 × 12 = 1080 किमी।"}, {"q": "एक वाहन 90 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["1220 किमी", "1195 किमी", "1150 किमी", "1170 किमी"], "ans": 3, "exp": "दूरी = 90 × 13 = 1170 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 2 घंटे में कितनी दूरी तय करेगा?", "opts": ["200 किमी", "225 किमी", "180 किमी", "250 किमी"], "ans": 0, "exp": "दूरी = 100 × 2 = 200 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 3 घंटे में कितनी दूरी तय करेगा?", "opts": ["325 किमी", "300 किमी", "280 किमी", "350 किमी"], "ans": 1, "exp": "दूरी = 100 × 3 = 300 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 4 घंटे में कितनी दूरी तय करेगा?", "opts": ["380 किमी", "425 किमी", "400 किमी", "450 किमी"], "ans": 2, "exp": "दूरी = 100 × 4 = 400 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 5 घंटे में कितनी दूरी तय करेगा?", "opts": ["550 किमी", "525 किमी", "480 किमी", "500 किमी"], "ans": 3, "exp": "दूरी = 100 × 5 = 500 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 6 घंटे में कितनी दूरी तय करेगा?", "opts": ["600 किमी", "625 किमी", "580 किमी", "650 किमी"], "ans": 0, "exp": "दूरी = 100 × 6 = 600 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 7 घंटे में कितनी दूरी तय करेगा?", "opts": ["725 किमी", "700 किमी", "680 किमी", "750 किमी"], "ans": 1, "exp": "दूरी = 100 × 7 = 700 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 8 घंटे में कितनी दूरी तय करेगा?", "opts": ["780 किमी", "825 किमी", "800 किमी", "850 किमी"], "ans": 2, "exp": "दूरी = 100 × 8 = 800 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 9 घंटे में कितनी दूरी तय करेगा?", "opts": ["950 किमी", "925 किमी", "880 किमी", "900 किमी"], "ans": 3, "exp": "दूरी = 100 × 9 = 900 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 10 घंटे में कितनी दूरी तय करेगा?", "opts": ["1000 किमी", "1025 किमी", "980 किमी", "1050 किमी"], "ans": 0, "exp": "दूरी = 100 × 10 = 1000 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 11 घंटे में कितनी दूरी तय करेगा?", "opts": ["1125 किमी", "1100 किमी", "1080 किमी", "1150 किमी"], "ans": 1, "exp": "दूरी = 100 × 11 = 1100 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 12 घंटे में कितनी दूरी तय करेगा?", "opts": ["1180 किमी", "1225 किमी", "1200 किमी", "1250 किमी"], "ans": 2, "exp": "दूरी = 100 × 12 = 1200 किमी।"}, {"q": "एक वाहन 100 किमी/घंटा की चाल से 13 घंटे में कितनी दूरी तय करेगा?", "opts": ["1350 किमी", "1325 किमी", "1280 किमी", "1300 किमी"], "ans": 3, "exp": "दूरी = 100 × 13 = 1300 किमी।"}, {"q": "संख्याओं 2, 3, 4, 5 और 6 का औसत क्या होगा?", "opts": ["4", "5", "3", "6"], "ans": 0, "exp": "योग 20 ÷ 5 = 4."}, {"q": "संख्याओं 3, 4, 5, 6 और 7 का औसत क्या होगा?", "opts": ["6", "5", "4", "7"], "ans": 1, "exp": "योग 25 ÷ 5 = 5."}, {"q": "संख्याओं 4, 5, 6, 7 और 8 का औसत क्या होगा?", "opts": ["5", "7", "6", "8"], "ans": 2, "exp": "योग 30 ÷ 5 = 6."}, {"q": "संख्याओं 5, 6, 7, 8 और 9 का औसत क्या होगा?", "opts": ["9", "8", "6", "7"], "ans": 3, "exp": "योग 35 ÷ 5 = 7."}, {"q": "संख्याओं 6, 7, 8, 9 और 10 का औसत क्या होगा?", "opts": ["8", "9", "7", "10"], "ans": 0, "exp": "योग 40 ÷ 5 = 8."}, {"q": "संख्याओं 7, 8, 9, 10 और 11 का औसत क्या होगा?", "opts": ["10", "9", "8", "11"], "ans": 1, "exp": "योग 45 ÷ 5 = 9."}, {"q": "संख्याओं 8, 9, 10, 11 और 12 का औसत क्या होगा?", "opts": ["9", "11", "10", "12"], "ans": 2, "exp": "योग 50 ÷ 5 = 10."}, {"q": "संख्याओं 9, 10, 11, 12 और 13 का औसत क्या होगा?", "opts": ["13", "12", "10", "11"], "ans": 3, "exp": "योग 55 ÷ 5 = 11."}, {"q": "संख्याओं 10, 11, 12, 13 और 14 का औसत क्या होगा?", "opts": ["12", "13", "11", "14"], "ans": 0, "exp": "योग 60 ÷ 5 = 12."}, {"q": "संख्याओं 11, 12, 13, 14 और 15 का औसत क्या होगा?", "opts": ["14", "13", "12", "15"], "ans": 1, "exp": "योग 65 ÷ 5 = 13."}, {"q": "संख्याओं 12, 13, 14, 15 और 16 का औसत क्या होगा?", "opts": ["13", "15", "14", "16"], "ans": 2, "exp": "योग 70 ÷ 5 = 14."}, {"q": "संख्याओं 13, 14, 15, 16 और 17 का औसत क्या होगा?", "opts": ["17", "16", "14", "15"], "ans": 3, "exp": "योग 75 ÷ 5 = 15."}, {"q": "संख्याओं 14, 15, 16, 17 और 18 का औसत क्या होगा?", "opts": ["16", "17", "15", "18"], "ans": 0, "exp": "योग 80 ÷ 5 = 16."}, {"q": "संख्याओं 15, 16, 17, 18 और 19 का औसत क्या होगा?", "opts": ["18", "17", "16", "19"], "ans": 1, "exp": "योग 85 ÷ 5 = 17."}, {"q": "संख्याओं 16, 17, 18, 19 और 20 का औसत क्या होगा?", "opts": ["17", "19", "18", "20"], "ans": 2, "exp": "योग 90 ÷ 5 = 18."}, {"q": "संख्याओं 17, 18, 19, 20 और 21 का औसत क्या होगा?", "opts": ["21", "20", "18", "19"], "ans": 3, "exp": "योग 95 ÷ 5 = 19."}, {"q": "संख्याओं 18, 19, 20, 21 और 22 का औसत क्या होगा?", "opts": ["20", "21", "19", "22"], "ans": 0, "exp": "योग 100 ÷ 5 = 20."}, {"q": "संख्याओं 19, 20, 21, 22 और 23 का औसत क्या होगा?", "opts": ["22", "21", "20", "23"], "ans": 1, "exp": "योग 105 ÷ 5 = 21."}, {"q": "संख्याओं 20, 21, 22, 23 और 24 का औसत क्या होगा?", "opts": ["21", "23", "22", "24"], "ans": 2, "exp": "योग 110 ÷ 5 = 22."}, {"q": "संख्याओं 21, 22, 23, 24 और 25 का औसत क्या होगा?", "opts": ["25", "24", "22", "23"], "ans": 3, "exp": "योग 115 ÷ 5 = 23."}]}, "reasoning_s5": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 5 (100 प्रश्न)", "questions": [{"q": "यदि किसी घड़ी में वास्तविक समय 8:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:47", "4:47", "3:57", "4:52"], "ans": 0, "exp": "11:60 में से 8:13 घटाने पर 3:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:43", "3:43", "3:53", "4:48"], "ans": 1, "exp": "11:60 में से 8:17 घटाने पर 3:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:49", "4:39", "3:39", "4:44"], "ans": 2, "exp": "11:60 में से 8:21 घटाने पर 3:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:40", "4:35", "3:45", "3:35"], "ans": 3, "exp": "11:60 में से 8:25 घटाने पर 3:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:31", "4:31", "3:41", "4:36"], "ans": 0, "exp": "11:60 में से 8:29 घटाने पर 3:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:27", "3:27", "3:37", "4:32"], "ans": 1, "exp": "11:60 में से 8:33 घटाने पर 3:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:33", "4:23", "3:23", "4:28"], "ans": 2, "exp": "11:60 में से 8:37 घटाने पर 3:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:24", "4:19", "3:29", "3:19"], "ans": 3, "exp": "11:60 में से 8:41 घटाने पर 3:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:15", "4:15", "3:25", "4:20"], "ans": 0, "exp": "11:60 में से 8:45 घटाने पर 3:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:11", "3:11", "3:21", "4:16"], "ans": 1, "exp": "11:60 में से 8:49 घटाने पर 3:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:17", "4:07", "3:07", "4:12"], "ans": 2, "exp": "11:60 में से 8:53 घटाने पर 3:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 8:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["4:08", "4:03", "3:13", "3:03"], "ans": 3, "exp": "11:60 में से 8:57 घटाने पर 3:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:55", "3:55", "2:05", "3:00"], "ans": 0, "exp": "11:60 में से 9:05 घटाने पर 2:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:51", "2:51", "2:01", "3:56"], "ans": 1, "exp": "11:60 में से 9:09 घटाने पर 2:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:57", "3:47", "2:47", "3:52"], "ans": 2, "exp": "11:60 में से 9:13 घटाने पर 2:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:48", "3:43", "2:53", "2:43"], "ans": 3, "exp": "11:60 में से 9:17 घटाने पर 2:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:39", "3:39", "2:49", "3:44"], "ans": 0, "exp": "11:60 में से 9:21 घटाने पर 2:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:35", "2:35", "2:45", "3:40"], "ans": 1, "exp": "11:60 में से 9:25 घटाने पर 2:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:41", "3:31", "2:31", "3:36"], "ans": 2, "exp": "11:60 में से 9:29 घटाने पर 2:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:32", "3:27", "2:37", "2:27"], "ans": 3, "exp": "11:60 में से 9:33 घटाने पर 2:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:23", "3:23", "2:33", "3:28"], "ans": 0, "exp": "11:60 में से 9:37 घटाने पर 2:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:19", "2:19", "2:29", "3:24"], "ans": 1, "exp": "11:60 में से 9:41 घटाने पर 2:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:25", "3:15", "2:15", "3:20"], "ans": 2, "exp": "11:60 में से 9:45 घटाने पर 2:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:16", "3:11", "2:21", "2:11"], "ans": 3, "exp": "11:60 में से 9:49 घटाने पर 2:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:07", "3:07", "2:17", "3:12"], "ans": 0, "exp": "11:60 में से 9:53 घटाने पर 2:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 9:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["3:03", "2:03", "2:13", "3:08"], "ans": 1, "exp": "11:60 में से 9:57 घटाने पर 2:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:05", "2:55", "1:55", "2:00"], "ans": 2, "exp": "11:60 में से 10:05 घटाने पर 1:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:56", "2:51", "1:01", "1:51"], "ans": 3, "exp": "11:60 में से 10:09 घटाने पर 1:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:47", "2:47", "1:57", "2:52"], "ans": 0, "exp": "11:60 में से 10:13 घटाने पर 1:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:43", "1:43", "1:53", "2:48"], "ans": 1, "exp": "11:60 में से 10:17 घटाने पर 1:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:49", "2:39", "1:39", "2:44"], "ans": 2, "exp": "11:60 में से 10:21 घटाने पर 1:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:40", "2:35", "1:45", "1:35"], "ans": 3, "exp": "11:60 में से 10:25 घटाने पर 1:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:31", "2:31", "1:41", "2:36"], "ans": 0, "exp": "11:60 में से 10:29 घटाने पर 1:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:27", "1:27", "1:37", "2:32"], "ans": 1, "exp": "11:60 में से 10:33 घटाने पर 1:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:33", "2:23", "1:23", "2:28"], "ans": 2, "exp": "11:60 में से 10:37 घटाने पर 1:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:24", "2:19", "1:29", "1:19"], "ans": 3, "exp": "11:60 में से 10:41 घटाने पर 1:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:15", "2:15", "1:25", "2:20"], "ans": 0, "exp": "11:60 में से 10:45 घटाने पर 1:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:11", "1:11", "1:21", "2:16"], "ans": 1, "exp": "11:60 में से 10:49 घटाने पर 1:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:17", "2:07", "1:07", "2:12"], "ans": 2, "exp": "11:60 में से 10:53 घटाने पर 1:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 10:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["2:08", "2:03", "1:13", "1:03"], "ans": 3, "exp": "11:60 में से 10:57 घटाने पर 1:03 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:05 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:55", "1:55", "12:05", "1:00"], "ans": 0, "exp": "11:60 में से 11:05 घटाने पर 12:55 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:09 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:51", "12:51", "12:01", "1:56"], "ans": 1, "exp": "11:60 में से 11:09 घटाने पर 12:51 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:13 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:57", "1:47", "12:47", "1:52"], "ans": 2, "exp": "11:60 में से 11:13 घटाने पर 12:47 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:17 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:48", "1:43", "12:53", "12:43"], "ans": 3, "exp": "11:60 में से 11:17 घटाने पर 12:43 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:21 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:39", "1:39", "12:49", "1:44"], "ans": 0, "exp": "11:60 में से 11:21 घटाने पर 12:39 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:25 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:35", "12:35", "12:45", "1:40"], "ans": 1, "exp": "11:60 में से 11:25 घटाने पर 12:35 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:29 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:41", "1:31", "12:31", "1:36"], "ans": 2, "exp": "11:60 में से 11:29 घटाने पर 12:31 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:33 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:32", "1:27", "12:37", "12:27"], "ans": 3, "exp": "11:60 में से 11:33 घटाने पर 12:27 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:37 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:23", "1:23", "12:33", "1:28"], "ans": 0, "exp": "11:60 में से 11:37 घटाने पर 12:23 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:41 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:19", "12:19", "12:29", "1:24"], "ans": 1, "exp": "11:60 में से 11:41 घटाने पर 12:19 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:45 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:25", "1:15", "12:15", "1:20"], "ans": 2, "exp": "11:60 में से 11:45 घटाने पर 12:15 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:49 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:16", "1:11", "12:21", "12:11"], "ans": 3, "exp": "11:60 में से 11:49 घटाने पर 12:11 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:53 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["12:07", "1:07", "12:17", "1:12"], "ans": 0, "exp": "11:60 में से 11:53 घटाने पर 12:07 प्राप्त होता है।"}, {"q": "यदि किसी घड़ी में वास्तविक समय 11:57 हो रहा है, तो दर्पण में क्या समय दिखेगा?", "opts": ["1:03", "12:03", "12:13", "1:08"], "ans": 1, "exp": "11:60 में से 11:57 घटाने पर 12:03 प्राप्त होता है।"}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["9", "11", "10", "12"], "ans": 2, "exp": "कुल = (5 + 6) - 1 = 10."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["13", "12", "10", "11"], "ans": 3, "exp": "कुल = (5 + 7) - 1 = 11."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["12", "13", "11", "14"], "ans": 0, "exp": "कुल = (5 + 8) - 1 = 12."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["14", "13", "12", "15"], "ans": 1, "exp": "कुल = (5 + 9) - 1 = 13."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["13", "15", "14", "16"], "ans": 2, "exp": "कुल = (5 + 10) - 1 = 14."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "16", "14", "15"], "ans": 3, "exp": "कुल = (5 + 11) - 1 = 15."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["16", "17", "15", "18"], "ans": 0, "exp": "कुल = (5 + 12) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "17", "16", "19"], "ans": 1, "exp": "कुल = (5 + 13) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "19", "18", "20"], "ans": 2, "exp": "कुल = (5 + 14) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "20", "18", "19"], "ans": 3, "exp": "कुल = (5 + 15) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "21", "19", "22"], "ans": 0, "exp": "कुल = (5 + 16) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "21", "20", "23"], "ans": 1, "exp": "कुल = (5 + 17) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "23", "22", "24"], "ans": 2, "exp": "कुल = (5 + 18) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "22", "23"], "ans": 3, "exp": "कुल = (5 + 19) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "25", "23", "26"], "ans": 0, "exp": "कुल = (5 + 20) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "24", "27"], "ans": 1, "exp": "कुल = (5 + 21) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "27", "26", "28"], "ans": 2, "exp": "कुल = (5 + 22) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "26", "27"], "ans": 3, "exp": "कुल = (5 + 23) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "29", "27", "30"], "ans": 0, "exp": "कुल = (5 + 24) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 5वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "28", "31"], "ans": 1, "exp": "कुल = (5 + 25) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["10", "12", "11", "13"], "ans": 2, "exp": "कुल = (6 + 6) - 1 = 11."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["14", "13", "11", "12"], "ans": 3, "exp": "कुल = (6 + 7) - 1 = 12."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["13", "14", "12", "15"], "ans": 0, "exp": "कुल = (6 + 8) - 1 = 13."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["15", "14", "13", "16"], "ans": 1, "exp": "कुल = (6 + 9) - 1 = 14."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["14", "16", "15", "17"], "ans": 2, "exp": "कुल = (6 + 10) - 1 = 15."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "17", "15", "16"], "ans": 3, "exp": "कुल = (6 + 11) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "18", "16", "19"], "ans": 0, "exp": "कुल = (6 + 12) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "18", "17", "20"], "ans": 1, "exp": "कुल = (6 + 13) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "20", "19", "21"], "ans": 2, "exp": "कुल = (6 + 14) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "21", "19", "20"], "ans": 3, "exp": "कुल = (6 + 15) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "22", "20", "23"], "ans": 0, "exp": "कुल = (6 + 16) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "22", "21", "24"], "ans": 1, "exp": "कुल = (6 + 17) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "24", "23", "25"], "ans": 2, "exp": "कुल = (6 + 18) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "23", "24"], "ans": 3, "exp": "कुल = (6 + 19) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "26", "24", "27"], "ans": 0, "exp": "कुल = (6 + 20) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "25", "28"], "ans": 1, "exp": "कुल = (6 + 21) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "28", "27", "29"], "ans": 2, "exp": "कुल = (6 + 22) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "27", "28"], "ans": 3, "exp": "कुल = (6 + 23) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "30", "28", "31"], "ans": 0, "exp": "कुल = (6 + 24) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 6वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "29", "32"], "ans": 1, "exp": "कुल = (6 + 25) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["11", "13", "12", "14"], "ans": 2, "exp": "कुल = (7 + 6) - 1 = 12."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["15", "14", "12", "13"], "ans": 3, "exp": "कुल = (7 + 7) - 1 = 13."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["14", "15", "13", "16"], "ans": 0, "exp": "कुल = (7 + 8) - 1 = 14."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["16", "15", "14", "17"], "ans": 1, "exp": "कुल = (7 + 9) - 1 = 15."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["15", "17", "16", "18"], "ans": 2, "exp": "कुल = (7 + 10) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "18", "16", "17"], "ans": 3, "exp": "कुल = (7 + 11) - 1 = 17."}]}, "maths_s6": {"title": "🔢 गणित (Maths) — सेट 6 (100 प्रश्न)", "questions": [{"q": "संख्याओं 22, 23, 24, 25 और 26 का औसत क्या होगा?", "opts": ["24", "25", "23", "26"], "ans": 0, "exp": "योग 120 ÷ 5 = 24."}, {"q": "संख्याओं 23, 24, 25, 26 और 27 का औसत क्या होगा?", "opts": ["26", "25", "24", "27"], "ans": 1, "exp": "योग 125 ÷ 5 = 25."}, {"q": "संख्याओं 24, 25, 26, 27 और 28 का औसत क्या होगा?", "opts": ["25", "27", "26", "28"], "ans": 2, "exp": "योग 130 ÷ 5 = 26."}, {"q": "संख्याओं 25, 26, 27, 28 और 29 का औसत क्या होगा?", "opts": ["29", "28", "26", "27"], "ans": 3, "exp": "योग 135 ÷ 5 = 27."}, {"q": "संख्याओं 26, 27, 28, 29 और 30 का औसत क्या होगा?", "opts": ["28", "29", "27", "30"], "ans": 0, "exp": "योग 140 ÷ 5 = 28."}, {"q": "संख्याओं 27, 28, 29, 30 और 31 का औसत क्या होगा?", "opts": ["30", "29", "28", "31"], "ans": 1, "exp": "योग 145 ÷ 5 = 29."}, {"q": "संख्याओं 28, 29, 30, 31 और 32 का औसत क्या होगा?", "opts": ["29", "31", "30", "32"], "ans": 2, "exp": "योग 150 ÷ 5 = 30."}, {"q": "संख्याओं 29, 30, 31, 32 और 33 का औसत क्या होगा?", "opts": ["33", "32", "30", "31"], "ans": 3, "exp": "योग 155 ÷ 5 = 31."}, {"q": "संख्याओं 30, 31, 32, 33 और 34 का औसत क्या होगा?", "opts": ["32", "33", "31", "34"], "ans": 0, "exp": "योग 160 ÷ 5 = 32."}, {"q": "संख्याओं 31, 32, 33, 34 और 35 का औसत क्या होगा?", "opts": ["34", "33", "32", "35"], "ans": 1, "exp": "योग 165 ÷ 5 = 33."}, {"q": "संख्याओं 32, 33, 34, 35 और 36 का औसत क्या होगा?", "opts": ["33", "35", "34", "36"], "ans": 2, "exp": "योग 170 ÷ 5 = 34."}, {"q": "संख्याओं 33, 34, 35, 36 और 37 का औसत क्या होगा?", "opts": ["37", "36", "34", "35"], "ans": 3, "exp": "योग 175 ÷ 5 = 35."}, {"q": "संख्याओं 34, 35, 36, 37 और 38 का औसत क्या होगा?", "opts": ["36", "37", "35", "38"], "ans": 0, "exp": "योग 180 ÷ 5 = 36."}, {"q": "संख्याओं 35, 36, 37, 38 और 39 का औसत क्या होगा?", "opts": ["38", "37", "36", "39"], "ans": 1, "exp": "योग 185 ÷ 5 = 37."}, {"q": "संख्याओं 36, 37, 38, 39 और 40 का औसत क्या होगा?", "opts": ["37", "39", "38", "40"], "ans": 2, "exp": "योग 190 ÷ 5 = 38."}, {"q": "संख्याओं 37, 38, 39, 40 और 41 का औसत क्या होगा?", "opts": ["41", "40", "38", "39"], "ans": 3, "exp": "योग 195 ÷ 5 = 39."}, {"q": "संख्याओं 38, 39, 40, 41 और 42 का औसत क्या होगा?", "opts": ["40", "41", "39", "42"], "ans": 0, "exp": "योग 200 ÷ 5 = 40."}, {"q": "संख्याओं 39, 40, 41, 42 और 43 का औसत क्या होगा?", "opts": ["42", "41", "40", "43"], "ans": 1, "exp": "योग 205 ÷ 5 = 41."}, {"q": "संख्याओं 40, 41, 42, 43 और 44 का औसत क्या होगा?", "opts": ["41", "43", "42", "44"], "ans": 2, "exp": "योग 210 ÷ 5 = 42."}, {"q": "संख्याओं 41, 42, 43, 44 और 45 का औसत क्या होगा?", "opts": ["45", "44", "42", "43"], "ans": 3, "exp": "योग 215 ÷ 5 = 43."}, {"q": "संख्याओं 42, 43, 44, 45 और 46 का औसत क्या होगा?", "opts": ["44", "45", "43", "46"], "ans": 0, "exp": "योग 220 ÷ 5 = 44."}, {"q": "संख्याओं 43, 44, 45, 46 और 47 का औसत क्या होगा?", "opts": ["46", "45", "44", "47"], "ans": 1, "exp": "योग 225 ÷ 5 = 45."}, {"q": "संख्याओं 44, 45, 46, 47 और 48 का औसत क्या होगा?", "opts": ["45", "47", "46", "48"], "ans": 2, "exp": "योग 230 ÷ 5 = 46."}, {"q": "संख्याओं 45, 46, 47, 48 और 49 का औसत क्या होगा?", "opts": ["49", "48", "46", "47"], "ans": 3, "exp": "योग 235 ÷ 5 = 47."}, {"q": "संख्याओं 46, 47, 48, 49 और 50 का औसत क्या होगा?", "opts": ["48", "49", "47", "50"], "ans": 0, "exp": "योग 240 ÷ 5 = 48."}, {"q": "संख्याओं 47, 48, 49, 50 और 51 का औसत क्या होगा?", "opts": ["50", "49", "48", "51"], "ans": 1, "exp": "योग 245 ÷ 5 = 49."}, {"q": "संख्याओं 48, 49, 50, 51 और 52 का औसत क्या होगा?", "opts": ["49", "51", "50", "52"], "ans": 2, "exp": "योग 250 ÷ 5 = 50."}, {"q": "संख्याओं 49, 50, 51, 52 और 53 का औसत क्या होगा?", "opts": ["53", "52", "50", "51"], "ans": 3, "exp": "योग 255 ÷ 5 = 51."}, {"q": "संख्याओं 50, 51, 52, 53 और 54 का औसत क्या होगा?", "opts": ["52", "53", "51", "54"], "ans": 0, "exp": "योग 260 ÷ 5 = 52."}, {"q": "संख्याओं 51, 52, 53, 54 और 55 का औसत क्या होगा?", "opts": ["54", "53", "52", "55"], "ans": 1, "exp": "योग 265 ÷ 5 = 53."}, {"q": "संख्याओं 52, 53, 54, 55 और 56 का औसत क्या होगा?", "opts": ["53", "55", "54", "56"], "ans": 2, "exp": "योग 270 ÷ 5 = 54."}, {"q": "संख्याओं 53, 54, 55, 56 और 57 का औसत क्या होगा?", "opts": ["57", "56", "54", "55"], "ans": 3, "exp": "योग 275 ÷ 5 = 55."}, {"q": "संख्याओं 54, 55, 56, 57 और 58 का औसत क्या होगा?", "opts": ["56", "57", "55", "58"], "ans": 0, "exp": "योग 280 ÷ 5 = 56."}, {"q": "संख्याओं 55, 56, 57, 58 और 59 का औसत क्या होगा?", "opts": ["58", "57", "56", "59"], "ans": 1, "exp": "योग 285 ÷ 5 = 57."}, {"q": "संख्याओं 56, 57, 58, 59 और 60 का औसत क्या होगा?", "opts": ["57", "59", "58", "60"], "ans": 2, "exp": "योग 290 ÷ 5 = 58."}, {"q": "संख्याओं 57, 58, 59, 60 और 61 का औसत क्या होगा?", "opts": ["61", "60", "58", "59"], "ans": 3, "exp": "योग 295 ÷ 5 = 59."}, {"q": "संख्याओं 58, 59, 60, 61 और 62 का औसत क्या होगा?", "opts": ["60", "61", "59", "62"], "ans": 0, "exp": "योग 300 ÷ 5 = 60."}, {"q": "संख्याओं 59, 60, 61, 62 और 63 का औसत क्या होगा?", "opts": ["62", "61", "60", "63"], "ans": 1, "exp": "योग 305 ÷ 5 = 61."}, {"q": "संख्याओं 60, 61, 62, 63 और 64 का औसत क्या होगा?", "opts": ["61", "63", "62", "64"], "ans": 2, "exp": "योग 310 ÷ 5 = 62."}, {"q": "संख्याओं 61, 62, 63, 64 और 65 का औसत क्या होगा?", "opts": ["65", "64", "62", "63"], "ans": 3, "exp": "योग 315 ÷ 5 = 63."}, {"q": "संख्याओं 62, 63, 64, 65 और 66 का औसत क्या होगा?", "opts": ["64", "65", "63", "66"], "ans": 0, "exp": "योग 320 ÷ 5 = 64."}, {"q": "संख्याओं 63, 64, 65, 66 और 67 का औसत क्या होगा?", "opts": ["66", "65", "64", "67"], "ans": 1, "exp": "योग 325 ÷ 5 = 65."}, {"q": "संख्याओं 64, 65, 66, 67 और 68 का औसत क्या होगा?", "opts": ["65", "67", "66", "68"], "ans": 2, "exp": "योग 330 ÷ 5 = 66."}, {"q": "संख्याओं 65, 66, 67, 68 और 69 का औसत क्या होगा?", "opts": ["69", "68", "66", "67"], "ans": 3, "exp": "योग 335 ÷ 5 = 67."}, {"q": "संख्याओं 66, 67, 68, 69 और 70 का औसत क्या होगा?", "opts": ["68", "69", "67", "70"], "ans": 0, "exp": "योग 340 ÷ 5 = 68."}, {"q": "संख्याओं 67, 68, 69, 70 और 71 का औसत क्या होगा?", "opts": ["70", "69", "68", "71"], "ans": 1, "exp": "योग 345 ÷ 5 = 69."}, {"q": "संख्याओं 68, 69, 70, 71 और 72 का औसत क्या होगा?", "opts": ["69", "71", "70", "72"], "ans": 2, "exp": "योग 350 ÷ 5 = 70."}, {"q": "संख्याओं 69, 70, 71, 72 और 73 का औसत क्या होगा?", "opts": ["73", "72", "70", "71"], "ans": 3, "exp": "योग 355 ÷ 5 = 71."}, {"q": "संख्याओं 70, 71, 72, 73 और 74 का औसत क्या होगा?", "opts": ["72", "73", "71", "74"], "ans": 0, "exp": "योग 360 ÷ 5 = 72."}, {"q": "संख्याओं 71, 72, 73, 74 और 75 का औसत क्या होगा?", "opts": ["74", "73", "72", "75"], "ans": 1, "exp": "योग 365 ÷ 5 = 73."}, {"q": "संख्याओं 72, 73, 74, 75 और 76 का औसत क्या होगा?", "opts": ["73", "75", "74", "76"], "ans": 2, "exp": "योग 370 ÷ 5 = 74."}, {"q": "संख्याओं 73, 74, 75, 76 और 77 का औसत क्या होगा?", "opts": ["77", "76", "74", "75"], "ans": 3, "exp": "योग 375 ÷ 5 = 75."}, {"q": "संख्याओं 74, 75, 76, 77 और 78 का औसत क्या होगा?", "opts": ["76", "77", "75", "78"], "ans": 0, "exp": "योग 380 ÷ 5 = 76."}, {"q": "संख्याओं 75, 76, 77, 78 और 79 का औसत क्या होगा?", "opts": ["78", "77", "76", "79"], "ans": 1, "exp": "योग 385 ÷ 5 = 77."}, {"q": "संख्याओं 76, 77, 78, 79 और 80 का औसत क्या होगा?", "opts": ["77", "79", "78", "80"], "ans": 2, "exp": "योग 390 ÷ 5 = 78."}, {"q": "संख्याओं 77, 78, 79, 80 और 81 का औसत क्या होगा?", "opts": ["81", "80", "78", "79"], "ans": 3, "exp": "योग 395 ÷ 5 = 79."}, {"q": "संख्याओं 78, 79, 80, 81 और 82 का औसत क्या होगा?", "opts": ["80", "81", "79", "82"], "ans": 0, "exp": "योग 400 ÷ 5 = 80."}, {"q": "संख्याओं 79, 80, 81, 82 और 83 का औसत क्या होगा?", "opts": ["82", "81", "80", "83"], "ans": 1, "exp": "योग 405 ÷ 5 = 81."}, {"q": "संख्याओं 80, 81, 82, 83 और 84 का औसत क्या होगा?", "opts": ["81", "83", "82", "84"], "ans": 2, "exp": "योग 410 ÷ 5 = 82."}, {"q": "संख्याओं 81, 82, 83, 84 और 85 का औसत क्या होगा?", "opts": ["85", "84", "82", "83"], "ans": 3, "exp": "योग 415 ÷ 5 = 83."}, {"q": "संख्याओं 82, 83, 84, 85 और 86 का औसत क्या होगा?", "opts": ["84", "85", "83", "86"], "ans": 0, "exp": "योग 420 ÷ 5 = 84."}, {"q": "संख्याओं 83, 84, 85, 86 और 87 का औसत क्या होगा?", "opts": ["86", "85", "84", "87"], "ans": 1, "exp": "योग 425 ÷ 5 = 85."}, {"q": "संख्याओं 84, 85, 86, 87 और 88 का औसत क्या होगा?", "opts": ["85", "87", "86", "88"], "ans": 2, "exp": "योग 430 ÷ 5 = 86."}, {"q": "संख्याओं 85, 86, 87, 88 और 89 का औसत क्या होगा?", "opts": ["89", "88", "86", "87"], "ans": 3, "exp": "योग 435 ÷ 5 = 87."}, {"q": "संख्याओं 86, 87, 88, 89 और 90 का औसत क्या होगा?", "opts": ["88", "89", "87", "90"], "ans": 0, "exp": "योग 440 ÷ 5 = 88."}, {"q": "संख्याओं 87, 88, 89, 90 और 91 का औसत क्या होगा?", "opts": ["90", "89", "88", "91"], "ans": 1, "exp": "योग 445 ÷ 5 = 89."}, {"q": "संख्याओं 88, 89, 90, 91 और 92 का औसत क्या होगा?", "opts": ["89", "91", "90", "92"], "ans": 2, "exp": "योग 450 ÷ 5 = 90."}, {"q": "संख्याओं 89, 90, 91, 92 और 93 का औसत क्या होगा?", "opts": ["93", "92", "90", "91"], "ans": 3, "exp": "योग 455 ÷ 5 = 91."}, {"q": "संख्याओं 90, 91, 92, 93 और 94 का औसत क्या होगा?", "opts": ["92", "93", "91", "94"], "ans": 0, "exp": "योग 460 ÷ 5 = 92."}, {"q": "संख्याओं 91, 92, 93, 94 और 95 का औसत क्या होगा?", "opts": ["94", "93", "92", "95"], "ans": 1, "exp": "योग 465 ÷ 5 = 93."}, {"q": "संख्याओं 92, 93, 94, 95 और 96 का औसत क्या होगा?", "opts": ["93", "95", "94", "96"], "ans": 2, "exp": "योग 470 ÷ 5 = 94."}, {"q": "संख्याओं 93, 94, 95, 96 और 97 का औसत क्या होगा?", "opts": ["97", "96", "94", "95"], "ans": 3, "exp": "योग 475 ÷ 5 = 95."}, {"q": "संख्याओं 94, 95, 96, 97 और 98 का औसत क्या होगा?", "opts": ["96", "97", "95", "98"], "ans": 0, "exp": "योग 480 ÷ 5 = 96."}, {"q": "संख्याओं 95, 96, 97, 98 और 99 का औसत क्या होगा?", "opts": ["98", "97", "96", "99"], "ans": 1, "exp": "योग 485 ÷ 5 = 97."}, {"q": "संख्याओं 96, 97, 98, 99 और 100 का औसत क्या होगा?", "opts": ["97", "99", "98", "100"], "ans": 2, "exp": "योग 490 ÷ 5 = 98."}, {"q": "संख्याओं 97, 98, 99, 100 और 101 का औसत क्या होगा?", "opts": ["101", "100", "98", "99"], "ans": 3, "exp": "योग 495 ÷ 5 = 99."}, {"q": "संख्याओं 98, 99, 100, 101 और 102 का औसत क्या होगा?", "opts": ["100", "101", "99", "102"], "ans": 0, "exp": "योग 500 ÷ 5 = 100."}, {"q": "संख्याओं 99, 100, 101, 102 और 103 का औसत क्या होगा?", "opts": ["102", "101", "100", "103"], "ans": 1, "exp": "योग 505 ÷ 5 = 101."}, {"q": "संख्याओं 100, 101, 102, 103 और 104 का औसत क्या होगा?", "opts": ["101", "103", "102", "104"], "ans": 2, "exp": "योग 510 ÷ 5 = 102."}, {"q": "संख्याओं 101, 102, 103, 104 और 105 का औसत क्या होगा?", "opts": ["105", "104", "102", "103"], "ans": 3, "exp": "योग 515 ÷ 5 = 103."}, {"q": "संख्याओं 102, 103, 104, 105 और 106 का औसत क्या होगा?", "opts": ["104", "105", "103", "106"], "ans": 0, "exp": "योग 520 ÷ 5 = 104."}, {"q": "संख्याओं 103, 104, 105, 106 और 107 का औसत क्या होगा?", "opts": ["106", "105", "104", "107"], "ans": 1, "exp": "योग 525 ÷ 5 = 105."}, {"q": "संख्याओं 104, 105, 106, 107 और 108 का औसत क्या होगा?", "opts": ["105", "107", "106", "108"], "ans": 2, "exp": "योग 530 ÷ 5 = 106."}, {"q": "संख्याओं 105, 106, 107, 108 और 109 का औसत क्या होगा?", "opts": ["109", "108", "106", "107"], "ans": 3, "exp": "योग 535 ÷ 5 = 107."}, {"q": "संख्याओं 106, 107, 108, 109 और 110 का औसत क्या होगा?", "opts": ["108", "109", "107", "110"], "ans": 0, "exp": "योग 540 ÷ 5 = 108."}, {"q": "संख्याओं 107, 108, 109, 110 और 111 का औसत क्या होगा?", "opts": ["110", "109", "108", "111"], "ans": 1, "exp": "योग 545 ÷ 5 = 109."}, {"q": "संख्याओं 108, 109, 110, 111 और 112 का औसत क्या होगा?", "opts": ["109", "111", "110", "112"], "ans": 2, "exp": "योग 550 ÷ 5 = 110."}, {"q": "संख्याओं 109, 110, 111, 112 और 113 का औसत क्या होगा?", "opts": ["113", "112", "110", "111"], "ans": 3, "exp": "योग 555 ÷ 5 = 111."}, {"q": "संख्याओं 110, 111, 112, 113 और 114 का औसत क्या होगा?", "opts": ["112", "113", "111", "114"], "ans": 0, "exp": "योग 560 ÷ 5 = 112."}, {"q": "संख्याओं 111, 112, 113, 114 और 115 का औसत क्या होगा?", "opts": ["114", "113", "112", "115"], "ans": 1, "exp": "योग 565 ÷ 5 = 113."}, {"q": "यदि ₹50 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹10", "₹35", "₹20", "₹30"], "ans": 2, "exp": "A का हिस्सा = 50 × 2/5 = ₹20."}, {"q": "यदि ₹100 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹60", "₹55", "₹30", "₹40"], "ans": 3, "exp": "A का हिस्सा = 100 × 2/5 = ₹40."}, {"q": "यदि ₹150 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹60", "₹75", "₹50", "₹90"], "ans": 0, "exp": "A का हिस्सा = 150 × 2/5 = ₹60."}, {"q": "यदि ₹200 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹95", "₹80", "₹70", "₹120"], "ans": 1, "exp": "A का हिस्सा = 200 × 2/5 = ₹80."}, {"q": "यदि ₹250 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹90", "₹115", "₹100", "₹150"], "ans": 2, "exp": "A का हिस्सा = 250 × 2/5 = ₹100."}, {"q": "यदि ₹300 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹180", "₹135", "₹110", "₹120"], "ans": 3, "exp": "A का हिस्सा = 300 × 2/5 = ₹120."}, {"q": "यदि ₹350 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹140", "₹155", "₹130", "₹210"], "ans": 0, "exp": "A का हिस्सा = 350 × 2/5 = ₹140."}, {"q": "यदि ₹400 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹175", "₹160", "₹150", "₹240"], "ans": 1, "exp": "A का हिस्सा = 400 × 2/5 = ₹160."}, {"q": "यदि ₹450 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹170", "₹195", "₹180", "₹270"], "ans": 2, "exp": "A का हिस्सा = 450 × 2/5 = ₹180."}, {"q": "यदि ₹500 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹300", "₹215", "₹190", "₹200"], "ans": 3, "exp": "A का हिस्सा = 500 × 2/5 = ₹200."}]}, "reasoning_s6": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 6 (100 प्रश्न)", "questions": [{"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "19", "17", "20"], "ans": 0, "exp": "कुल = (7 + 12) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "19", "18", "21"], "ans": 1, "exp": "कुल = (7 + 13) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "21", "20", "22"], "ans": 2, "exp": "कुल = (7 + 14) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "22", "20", "21"], "ans": 3, "exp": "कुल = (7 + 15) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "23", "21", "24"], "ans": 0, "exp": "कुल = (7 + 16) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "23", "22", "25"], "ans": 1, "exp": "कुल = (7 + 17) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "25", "24", "26"], "ans": 2, "exp": "कुल = (7 + 18) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "24", "25"], "ans": 3, "exp": "कुल = (7 + 19) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "27", "25", "28"], "ans": 0, "exp": "कुल = (7 + 20) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "26", "29"], "ans": 1, "exp": "कुल = (7 + 21) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "29", "28", "30"], "ans": 2, "exp": "कुल = (7 + 22) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "28", "29"], "ans": 3, "exp": "कुल = (7 + 23) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "31", "29", "32"], "ans": 0, "exp": "कुल = (7 + 24) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 7वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "30", "33"], "ans": 1, "exp": "कुल = (7 + 25) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["12", "14", "13", "15"], "ans": 2, "exp": "कुल = (8 + 6) - 1 = 13."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["16", "15", "13", "14"], "ans": 3, "exp": "कुल = (8 + 7) - 1 = 14."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["15", "16", "14", "17"], "ans": 0, "exp": "कुल = (8 + 8) - 1 = 15."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "16", "15", "18"], "ans": 1, "exp": "कुल = (8 + 9) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["16", "18", "17", "19"], "ans": 2, "exp": "कुल = (8 + 10) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "19", "17", "18"], "ans": 3, "exp": "कुल = (8 + 11) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "20", "18", "21"], "ans": 0, "exp": "कुल = (8 + 12) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "20", "19", "22"], "ans": 1, "exp": "कुल = (8 + 13) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "22", "21", "23"], "ans": 2, "exp": "कुल = (8 + 14) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "23", "21", "22"], "ans": 3, "exp": "कुल = (8 + 15) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "24", "22", "25"], "ans": 0, "exp": "कुल = (8 + 16) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "23", "26"], "ans": 1, "exp": "कुल = (8 + 17) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "26", "25", "27"], "ans": 2, "exp": "कुल = (8 + 18) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "25", "26"], "ans": 3, "exp": "कुल = (8 + 19) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "28", "26", "29"], "ans": 0, "exp": "कुल = (8 + 20) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "27", "30"], "ans": 1, "exp": "कुल = (8 + 21) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "30", "29", "31"], "ans": 2, "exp": "कुल = (8 + 22) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "29", "30"], "ans": 3, "exp": "कुल = (8 + 23) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "32", "30", "33"], "ans": 0, "exp": "कुल = (8 + 24) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 8वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "31", "34"], "ans": 1, "exp": "कुल = (8 + 25) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["13", "15", "14", "16"], "ans": 2, "exp": "कुल = (9 + 6) - 1 = 14."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "16", "14", "15"], "ans": 3, "exp": "कुल = (9 + 7) - 1 = 15."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["16", "17", "15", "18"], "ans": 0, "exp": "कुल = (9 + 8) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "17", "16", "19"], "ans": 1, "exp": "कुल = (9 + 9) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "19", "18", "20"], "ans": 2, "exp": "कुल = (9 + 10) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "20", "18", "19"], "ans": 3, "exp": "कुल = (9 + 11) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "21", "19", "22"], "ans": 0, "exp": "कुल = (9 + 12) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "21", "20", "23"], "ans": 1, "exp": "कुल = (9 + 13) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "23", "22", "24"], "ans": 2, "exp": "कुल = (9 + 14) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "22", "23"], "ans": 3, "exp": "कुल = (9 + 15) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "25", "23", "26"], "ans": 0, "exp": "कुल = (9 + 16) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "24", "27"], "ans": 1, "exp": "कुल = (9 + 17) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "27", "26", "28"], "ans": 2, "exp": "कुल = (9 + 18) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "26", "27"], "ans": 3, "exp": "कुल = (9 + 19) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "29", "27", "30"], "ans": 0, "exp": "कुल = (9 + 20) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "28", "31"], "ans": 1, "exp": "कुल = (9 + 21) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "31", "30", "32"], "ans": 2, "exp": "कुल = (9 + 22) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "30", "31"], "ans": 3, "exp": "कुल = (9 + 23) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "33", "31", "34"], "ans": 0, "exp": "कुल = (9 + 24) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 9वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "32", "35"], "ans": 1, "exp": "कुल = (9 + 25) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["14", "16", "15", "17"], "ans": 2, "exp": "कुल = (10 + 6) - 1 = 15."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "17", "15", "16"], "ans": 3, "exp": "कुल = (10 + 7) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "18", "16", "19"], "ans": 0, "exp": "कुल = (10 + 8) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "18", "17", "20"], "ans": 1, "exp": "कुल = (10 + 9) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "20", "19", "21"], "ans": 2, "exp": "कुल = (10 + 10) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "21", "19", "20"], "ans": 3, "exp": "कुल = (10 + 11) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "22", "20", "23"], "ans": 0, "exp": "कुल = (10 + 12) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "22", "21", "24"], "ans": 1, "exp": "कुल = (10 + 13) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "24", "23", "25"], "ans": 2, "exp": "कुल = (10 + 14) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "23", "24"], "ans": 3, "exp": "कुल = (10 + 15) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "26", "24", "27"], "ans": 0, "exp": "कुल = (10 + 16) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "25", "28"], "ans": 1, "exp": "कुल = (10 + 17) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "28", "27", "29"], "ans": 2, "exp": "कुल = (10 + 18) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "27", "28"], "ans": 3, "exp": "कुल = (10 + 19) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "30", "28", "31"], "ans": 0, "exp": "कुल = (10 + 20) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "29", "32"], "ans": 1, "exp": "कुल = (10 + 21) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "32", "31", "33"], "ans": 2, "exp": "कुल = (10 + 22) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "31", "32"], "ans": 3, "exp": "कुल = (10 + 23) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "34", "32", "35"], "ans": 0, "exp": "कुल = (10 + 24) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 10वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "33", "36"], "ans": 1, "exp": "कुल = (10 + 25) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["15", "17", "16", "18"], "ans": 2, "exp": "कुल = (11 + 6) - 1 = 16."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "18", "16", "17"], "ans": 3, "exp": "कुल = (11 + 7) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "19", "17", "20"], "ans": 0, "exp": "कुल = (11 + 8) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "19", "18", "21"], "ans": 1, "exp": "कुल = (11 + 9) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "21", "20", "22"], "ans": 2, "exp": "कुल = (11 + 10) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "22", "20", "21"], "ans": 3, "exp": "कुल = (11 + 11) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "23", "21", "24"], "ans": 0, "exp": "कुल = (11 + 12) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "23", "22", "25"], "ans": 1, "exp": "कुल = (11 + 13) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "25", "24", "26"], "ans": 2, "exp": "कुल = (11 + 14) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "24", "25"], "ans": 3, "exp": "कुल = (11 + 15) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "27", "25", "28"], "ans": 0, "exp": "कुल = (11 + 16) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "26", "29"], "ans": 1, "exp": "कुल = (11 + 17) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "29", "28", "30"], "ans": 2, "exp": "कुल = (11 + 18) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "28", "29"], "ans": 3, "exp": "कुल = (11 + 19) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "31", "29", "32"], "ans": 0, "exp": "कुल = (11 + 20) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "30", "33"], "ans": 1, "exp": "कुल = (11 + 21) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "33", "32", "34"], "ans": 2, "exp": "कुल = (11 + 22) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "32", "33"], "ans": 3, "exp": "कुल = (11 + 23) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "35", "33", "36"], "ans": 0, "exp": "कुल = (11 + 24) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 11वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "34", "37"], "ans": 1, "exp": "कुल = (11 + 25) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["16", "18", "17", "19"], "ans": 2, "exp": "कुल = (12 + 6) - 1 = 17."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "19", "17", "18"], "ans": 3, "exp": "कुल = (12 + 7) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "20", "18", "21"], "ans": 0, "exp": "कुल = (12 + 8) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "20", "19", "22"], "ans": 1, "exp": "कुल = (12 + 9) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "22", "21", "23"], "ans": 2, "exp": "कुल = (12 + 10) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "23", "21", "22"], "ans": 3, "exp": "कुल = (12 + 11) - 1 = 22."}]}, "maths_s7": {"title": "🔢 गणित (Maths) — सेट 7 (100 प्रश्न)", "questions": [{"q": "यदि ₹550 को A और B में 2 : 3 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹220", "₹235", "₹210", "₹330"], "ans": 0, "exp": "A का हिस्सा = 550 × 2/5 = ₹220."}, {"q": "यदि ₹70 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹45", "₹30", "₹20", "₹40"], "ans": 1, "exp": "A का हिस्सा = 70 × 3/7 = ₹30."}, {"q": "यदि ₹140 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹50", "₹75", "₹60", "₹80"], "ans": 2, "exp": "A का हिस्सा = 140 × 3/7 = ₹60."}, {"q": "यदि ₹210 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹120", "₹105", "₹80", "₹90"], "ans": 3, "exp": "A का हिस्सा = 210 × 3/7 = ₹90."}, {"q": "यदि ₹280 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹120", "₹135", "₹110", "₹160"], "ans": 0, "exp": "A का हिस्सा = 280 × 3/7 = ₹120."}, {"q": "यदि ₹350 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹165", "₹150", "₹140", "₹200"], "ans": 1, "exp": "A का हिस्सा = 350 × 3/7 = ₹150."}, {"q": "यदि ₹420 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹170", "₹195", "₹180", "₹240"], "ans": 2, "exp": "A का हिस्सा = 420 × 3/7 = ₹180."}, {"q": "यदि ₹490 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹280", "₹225", "₹200", "₹210"], "ans": 3, "exp": "A का हिस्सा = 490 × 3/7 = ₹210."}, {"q": "यदि ₹560 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹240", "₹255", "₹230", "₹320"], "ans": 0, "exp": "A का हिस्सा = 560 × 3/7 = ₹240."}, {"q": "यदि ₹630 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹285", "₹270", "₹260", "₹360"], "ans": 1, "exp": "A का हिस्सा = 630 × 3/7 = ₹270."}, {"q": "यदि ₹700 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹290", "₹315", "₹300", "₹400"], "ans": 2, "exp": "A का हिस्सा = 700 × 3/7 = ₹300."}, {"q": "यदि ₹770 को A और B में 3 : 4 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹440", "₹345", "₹320", "₹330"], "ans": 3, "exp": "A का हिस्सा = 770 × 3/7 = ₹330."}, {"q": "यदि ₹90 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹40", "₹55", "₹30", "₹50"], "ans": 0, "exp": "A का हिस्सा = 90 × 4/9 = ₹40."}, {"q": "यदि ₹180 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹95", "₹80", "₹70", "₹100"], "ans": 1, "exp": "A का हिस्सा = 180 × 4/9 = ₹80."}, {"q": "यदि ₹270 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹110", "₹135", "₹120", "₹150"], "ans": 2, "exp": "A का हिस्सा = 270 × 4/9 = ₹120."}, {"q": "यदि ₹360 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹200", "₹175", "₹150", "₹160"], "ans": 3, "exp": "A का हिस्सा = 360 × 4/9 = ₹160."}, {"q": "यदि ₹450 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹200", "₹215", "₹190", "₹250"], "ans": 0, "exp": "A का हिस्सा = 450 × 4/9 = ₹200."}, {"q": "यदि ₹540 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹255", "₹240", "₹230", "₹300"], "ans": 1, "exp": "A का हिस्सा = 540 × 4/9 = ₹240."}, {"q": "यदि ₹630 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹270", "₹295", "₹280", "₹350"], "ans": 2, "exp": "A का हिस्सा = 630 × 4/9 = ₹280."}, {"q": "यदि ₹720 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹400", "₹335", "₹310", "₹320"], "ans": 3, "exp": "A का हिस्सा = 720 × 4/9 = ₹320."}, {"q": "यदि ₹810 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹360", "₹375", "₹350", "₹450"], "ans": 0, "exp": "A का हिस्सा = 810 × 4/9 = ₹360."}, {"q": "यदि ₹900 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹415", "₹400", "₹390", "₹500"], "ans": 1, "exp": "A का हिस्सा = 900 × 4/9 = ₹400."}, {"q": "यदि ₹990 को A और B में 4 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹430", "₹455", "₹440", "₹550"], "ans": 2, "exp": "A का हिस्सा = 990 × 4/9 = ₹440."}, {"q": "यदि ₹110 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹60", "₹65", "₹40", "₹50"], "ans": 3, "exp": "A का हिस्सा = 110 × 5/11 = ₹50."}, {"q": "यदि ₹220 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹100", "₹115", "₹90", "₹120"], "ans": 0, "exp": "A का हिस्सा = 220 × 5/11 = ₹100."}, {"q": "यदि ₹330 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹165", "₹150", "₹140", "₹180"], "ans": 1, "exp": "A का हिस्सा = 330 × 5/11 = ₹150."}, {"q": "यदि ₹440 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹190", "₹215", "₹200", "₹240"], "ans": 2, "exp": "A का हिस्सा = 440 × 5/11 = ₹200."}, {"q": "यदि ₹550 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹300", "₹265", "₹240", "₹250"], "ans": 3, "exp": "A का हिस्सा = 550 × 5/11 = ₹250."}, {"q": "यदि ₹660 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹300", "₹315", "₹290", "₹360"], "ans": 0, "exp": "A का हिस्सा = 660 × 5/11 = ₹300."}, {"q": "यदि ₹770 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹365", "₹350", "₹340", "₹420"], "ans": 1, "exp": "A का हिस्सा = 770 × 5/11 = ₹350."}, {"q": "यदि ₹880 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹390", "₹415", "₹400", "₹480"], "ans": 2, "exp": "A का हिस्सा = 880 × 5/11 = ₹400."}, {"q": "यदि ₹990 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹540", "₹465", "₹440", "₹450"], "ans": 3, "exp": "A का हिस्सा = 990 × 5/11 = ₹450."}, {"q": "यदि ₹1100 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹500", "₹515", "₹490", "₹600"], "ans": 0, "exp": "A का हिस्सा = 1100 × 5/11 = ₹500."}, {"q": "यदि ₹1210 को A और B में 5 : 6 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹565", "₹550", "₹540", "₹660"], "ans": 1, "exp": "A का हिस्सा = 1210 × 5/11 = ₹550."}, {"q": "यदि ₹80 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹20", "₹45", "₹30", "₹50"], "ans": 2, "exp": "A का हिस्सा = 80 × 3/8 = ₹30."}, {"q": "यदि ₹160 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹100", "₹75", "₹50", "₹60"], "ans": 3, "exp": "A का हिस्सा = 160 × 3/8 = ₹60."}, {"q": "यदि ₹240 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹90", "₹105", "₹80", "₹150"], "ans": 0, "exp": "A का हिस्सा = 240 × 3/8 = ₹90."}, {"q": "यदि ₹320 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹135", "₹120", "₹110", "₹200"], "ans": 1, "exp": "A का हिस्सा = 320 × 3/8 = ₹120."}, {"q": "यदि ₹400 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹140", "₹165", "₹150", "₹250"], "ans": 2, "exp": "A का हिस्सा = 400 × 3/8 = ₹150."}, {"q": "यदि ₹480 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹300", "₹195", "₹170", "₹180"], "ans": 3, "exp": "A का हिस्सा = 480 × 3/8 = ₹180."}, {"q": "यदि ₹560 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹210", "₹225", "₹200", "₹350"], "ans": 0, "exp": "A का हिस्सा = 560 × 3/8 = ₹210."}, {"q": "यदि ₹640 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹255", "₹240", "₹230", "₹400"], "ans": 1, "exp": "A का हिस्सा = 640 × 3/8 = ₹240."}, {"q": "यदि ₹720 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹260", "₹285", "₹270", "₹450"], "ans": 2, "exp": "A का हिस्सा = 720 × 3/8 = ₹270."}, {"q": "यदि ₹800 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹500", "₹315", "₹290", "₹300"], "ans": 3, "exp": "A का हिस्सा = 800 × 3/8 = ₹300."}, {"q": "यदि ₹880 को A और B में 3 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹330", "₹345", "₹320", "₹550"], "ans": 0, "exp": "A का हिस्सा = 880 × 3/8 = ₹330."}, {"q": "यदि ₹70 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹35", "₹20", "₹10", "₹50"], "ans": 1, "exp": "A का हिस्सा = 70 × 2/7 = ₹20."}, {"q": "यदि ₹140 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹30", "₹55", "₹40", "₹100"], "ans": 2, "exp": "A का हिस्सा = 140 × 2/7 = ₹40."}, {"q": "यदि ₹210 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹150", "₹75", "₹50", "₹60"], "ans": 3, "exp": "A का हिस्सा = 210 × 2/7 = ₹60."}, {"q": "यदि ₹280 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹80", "₹95", "₹70", "₹200"], "ans": 0, "exp": "A का हिस्सा = 280 × 2/7 = ₹80."}, {"q": "यदि ₹350 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹115", "₹100", "₹90", "₹250"], "ans": 1, "exp": "A का हिस्सा = 350 × 2/7 = ₹100."}, {"q": "यदि ₹420 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹110", "₹135", "₹120", "₹300"], "ans": 2, "exp": "A का हिस्सा = 420 × 2/7 = ₹120."}, {"q": "यदि ₹490 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹350", "₹155", "₹130", "₹140"], "ans": 3, "exp": "A का हिस्सा = 490 × 2/7 = ₹140."}, {"q": "यदि ₹560 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹160", "₹175", "₹150", "₹400"], "ans": 0, "exp": "A का हिस्सा = 560 × 2/7 = ₹160."}, {"q": "यदि ₹630 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹195", "₹180", "₹170", "₹450"], "ans": 1, "exp": "A का हिस्सा = 630 × 2/7 = ₹180."}, {"q": "यदि ₹700 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹190", "₹215", "₹200", "₹500"], "ans": 2, "exp": "A का हिस्सा = 700 × 2/7 = ₹200."}, {"q": "यदि ₹770 को A और B में 2 : 5 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹550", "₹235", "₹210", "₹220"], "ans": 3, "exp": "A का हिस्सा = 770 × 2/7 = ₹220."}, {"q": "यदि ₹120 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹50", "₹65", "₹40", "₹70"], "ans": 0, "exp": "A का हिस्सा = 120 × 5/12 = ₹50."}, {"q": "यदि ₹240 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹115", "₹100", "₹90", "₹140"], "ans": 1, "exp": "A का हिस्सा = 240 × 5/12 = ₹100."}, {"q": "यदि ₹360 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹140", "₹165", "₹150", "₹210"], "ans": 2, "exp": "A का हिस्सा = 360 × 5/12 = ₹150."}, {"q": "यदि ₹480 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹280", "₹215", "₹190", "₹200"], "ans": 3, "exp": "A का हिस्सा = 480 × 5/12 = ₹200."}, {"q": "यदि ₹600 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹250", "₹265", "₹240", "₹350"], "ans": 0, "exp": "A का हिस्सा = 600 × 5/12 = ₹250."}, {"q": "यदि ₹720 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹315", "₹300", "₹290", "₹420"], "ans": 1, "exp": "A का हिस्सा = 720 × 5/12 = ₹300."}, {"q": "यदि ₹840 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹340", "₹365", "₹350", "₹490"], "ans": 2, "exp": "A का हिस्सा = 840 × 5/12 = ₹350."}, {"q": "यदि ₹960 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹560", "₹415", "₹390", "₹400"], "ans": 3, "exp": "A का हिस्सा = 960 × 5/12 = ₹400."}, {"q": "यदि ₹1080 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹450", "₹465", "₹440", "₹630"], "ans": 0, "exp": "A का हिस्सा = 1080 × 5/12 = ₹450."}, {"q": "यदि ₹1200 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹515", "₹500", "₹490", "₹700"], "ans": 1, "exp": "A का हिस्सा = 1200 × 5/12 = ₹500."}, {"q": "यदि ₹1320 को A और B में 5 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹540", "₹565", "₹550", "₹770"], "ans": 2, "exp": "A का हिस्सा = 1320 × 5/12 = ₹550."}, {"q": "यदि ₹110 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹70", "₹55", "₹30", "₹40"], "ans": 3, "exp": "A का हिस्सा = 110 × 4/11 = ₹40."}, {"q": "यदि ₹220 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹80", "₹95", "₹70", "₹140"], "ans": 0, "exp": "A का हिस्सा = 220 × 4/11 = ₹80."}, {"q": "यदि ₹330 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹135", "₹120", "₹110", "₹210"], "ans": 1, "exp": "A का हिस्सा = 330 × 4/11 = ₹120."}, {"q": "यदि ₹440 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹150", "₹175", "₹160", "₹280"], "ans": 2, "exp": "A का हिस्सा = 440 × 4/11 = ₹160."}, {"q": "यदि ₹550 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹350", "₹215", "₹190", "₹200"], "ans": 3, "exp": "A का हिस्सा = 550 × 4/11 = ₹200."}, {"q": "यदि ₹660 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹240", "₹255", "₹230", "₹420"], "ans": 0, "exp": "A का हिस्सा = 660 × 4/11 = ₹240."}, {"q": "यदि ₹770 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹295", "₹280", "₹270", "₹490"], "ans": 1, "exp": "A का हिस्सा = 770 × 4/11 = ₹280."}, {"q": "यदि ₹880 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹310", "₹335", "₹320", "₹560"], "ans": 2, "exp": "A का हिस्सा = 880 × 4/11 = ₹320."}, {"q": "यदि ₹990 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹630", "₹375", "₹350", "₹360"], "ans": 3, "exp": "A का हिस्सा = 990 × 4/11 = ₹360."}, {"q": "यदि ₹1100 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹400", "₹415", "₹390", "₹700"], "ans": 0, "exp": "A का हिस्सा = 1100 × 4/11 = ₹400."}, {"q": "यदि ₹1210 को A और B में 4 : 7 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹455", "₹440", "₹430", "₹770"], "ans": 1, "exp": "A का हिस्सा = 1210 × 4/11 = ₹440."}, {"q": "यदि ₹150 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹60", "₹85", "₹70", "₹80"], "ans": 2, "exp": "A का हिस्सा = 150 × 7/15 = ₹70."}, {"q": "यदि ₹300 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹160", "₹155", "₹130", "₹140"], "ans": 3, "exp": "A का हिस्सा = 300 × 7/15 = ₹140."}, {"q": "यदि ₹450 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹210", "₹225", "₹200", "₹240"], "ans": 0, "exp": "A का हिस्सा = 450 × 7/15 = ₹210."}, {"q": "यदि ₹600 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹295", "₹280", "₹270", "₹320"], "ans": 1, "exp": "A का हिस्सा = 600 × 7/15 = ₹280."}, {"q": "यदि ₹750 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹340", "₹365", "₹350", "₹400"], "ans": 2, "exp": "A का हिस्सा = 750 × 7/15 = ₹350."}, {"q": "यदि ₹900 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹480", "₹435", "₹410", "₹420"], "ans": 3, "exp": "A का हिस्सा = 900 × 7/15 = ₹420."}, {"q": "यदि ₹1050 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹490", "₹505", "₹480", "₹560"], "ans": 0, "exp": "A का हिस्सा = 1050 × 7/15 = ₹490."}, {"q": "यदि ₹1200 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹575", "₹560", "₹550", "₹640"], "ans": 1, "exp": "A का हिस्सा = 1200 × 7/15 = ₹560."}, {"q": "यदि ₹1350 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹620", "₹645", "₹630", "₹720"], "ans": 2, "exp": "A का हिस्सा = 1350 × 7/15 = ₹630."}, {"q": "यदि ₹1500 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹800", "₹715", "₹690", "₹700"], "ans": 3, "exp": "A का हिस्सा = 1500 × 7/15 = ₹700."}, {"q": "यदि ₹1650 को A और B में 7 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹770", "₹785", "₹760", "₹880"], "ans": 0, "exp": "A का हिस्सा = 1650 × 7/15 = ₹770."}, {"q": "यदि ₹130 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹65", "₹50", "₹40", "₹80"], "ans": 1, "exp": "A का हिस्सा = 130 × 5/13 = ₹50."}, {"q": "यदि ₹260 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹90", "₹115", "₹100", "₹160"], "ans": 2, "exp": "A का हिस्सा = 260 × 5/13 = ₹100."}, {"q": "यदि ₹390 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹240", "₹165", "₹140", "₹150"], "ans": 3, "exp": "A का हिस्सा = 390 × 5/13 = ₹150."}, {"q": "यदि ₹520 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹200", "₹215", "₹190", "₹320"], "ans": 0, "exp": "A का हिस्सा = 520 × 5/13 = ₹200."}, {"q": "यदि ₹650 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹265", "₹250", "₹240", "₹400"], "ans": 1, "exp": "A का हिस्सा = 650 × 5/13 = ₹250."}, {"q": "यदि ₹780 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹290", "₹315", "₹300", "₹480"], "ans": 2, "exp": "A का हिस्सा = 780 × 5/13 = ₹300."}, {"q": "यदि ₹910 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹560", "₹365", "₹340", "₹350"], "ans": 3, "exp": "A का हिस्सा = 910 × 5/13 = ₹350."}, {"q": "यदि ₹1040 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹400", "₹415", "₹390", "₹640"], "ans": 0, "exp": "A का हिस्सा = 1040 × 5/13 = ₹400."}, {"q": "यदि ₹1170 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹465", "₹450", "₹440", "₹720"], "ans": 1, "exp": "A का हिस्सा = 1170 × 5/13 = ₹450."}, {"q": "यदि ₹1300 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹490", "₹515", "₹500", "₹800"], "ans": 2, "exp": "A का हिस्सा = 1300 × 5/13 = ₹500."}, {"q": "यदि ₹1430 को A और B में 5 : 8 के अनुपात में बाँटा जाए, तो A को कितने रुपये मिलेंगे?", "opts": ["₹880", "₹565", "₹540", "₹550"], "ans": 3, "exp": "A का हिस्सा = 1430 × 5/13 = ₹550."}]}, "reasoning_s7": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 7 (100 प्रश्न)", "questions": [{"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "24", "22", "25"], "ans": 0, "exp": "कुल = (12 + 12) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "23", "26"], "ans": 1, "exp": "कुल = (12 + 13) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "26", "25", "27"], "ans": 2, "exp": "कुल = (12 + 14) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "25", "26"], "ans": 3, "exp": "कुल = (12 + 15) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "28", "26", "29"], "ans": 0, "exp": "कुल = (12 + 16) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "27", "30"], "ans": 1, "exp": "कुल = (12 + 17) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "30", "29", "31"], "ans": 2, "exp": "कुल = (12 + 18) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "29", "30"], "ans": 3, "exp": "कुल = (12 + 19) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "32", "30", "33"], "ans": 0, "exp": "कुल = (12 + 20) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "31", "34"], "ans": 1, "exp": "कुल = (12 + 21) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "34", "33", "35"], "ans": 2, "exp": "कुल = (12 + 22) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "33", "34"], "ans": 3, "exp": "कुल = (12 + 23) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "36", "34", "37"], "ans": 0, "exp": "कुल = (12 + 24) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 12वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "35", "38"], "ans": 1, "exp": "कुल = (12 + 25) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["17", "19", "18", "20"], "ans": 2, "exp": "कुल = (13 + 6) - 1 = 18."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "20", "18", "19"], "ans": 3, "exp": "कुल = (13 + 7) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "21", "19", "22"], "ans": 0, "exp": "कुल = (13 + 8) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "21", "20", "23"], "ans": 1, "exp": "कुल = (13 + 9) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "23", "22", "24"], "ans": 2, "exp": "कुल = (13 + 10) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "22", "23"], "ans": 3, "exp": "कुल = (13 + 11) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "25", "23", "26"], "ans": 0, "exp": "कुल = (13 + 12) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "24", "27"], "ans": 1, "exp": "कुल = (13 + 13) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "27", "26", "28"], "ans": 2, "exp": "कुल = (13 + 14) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "26", "27"], "ans": 3, "exp": "कुल = (13 + 15) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "29", "27", "30"], "ans": 0, "exp": "कुल = (13 + 16) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "28", "31"], "ans": 1, "exp": "कुल = (13 + 17) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "31", "30", "32"], "ans": 2, "exp": "कुल = (13 + 18) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "30", "31"], "ans": 3, "exp": "कुल = (13 + 19) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "33", "31", "34"], "ans": 0, "exp": "कुल = (13 + 20) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "32", "35"], "ans": 1, "exp": "कुल = (13 + 21) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "35", "34", "36"], "ans": 2, "exp": "कुल = (13 + 22) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "34", "35"], "ans": 3, "exp": "कुल = (13 + 23) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "37", "35", "38"], "ans": 0, "exp": "कुल = (13 + 24) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 13वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "37", "36", "39"], "ans": 1, "exp": "कुल = (13 + 25) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["18", "20", "19", "21"], "ans": 2, "exp": "कुल = (14 + 6) - 1 = 19."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "21", "19", "20"], "ans": 3, "exp": "कुल = (14 + 7) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "22", "20", "23"], "ans": 0, "exp": "कुल = (14 + 8) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "22", "21", "24"], "ans": 1, "exp": "कुल = (14 + 9) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "24", "23", "25"], "ans": 2, "exp": "कुल = (14 + 10) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "23", "24"], "ans": 3, "exp": "कुल = (14 + 11) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "26", "24", "27"], "ans": 0, "exp": "कुल = (14 + 12) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "25", "28"], "ans": 1, "exp": "कुल = (14 + 13) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "28", "27", "29"], "ans": 2, "exp": "कुल = (14 + 14) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "27", "28"], "ans": 3, "exp": "कुल = (14 + 15) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "30", "28", "31"], "ans": 0, "exp": "कुल = (14 + 16) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "29", "32"], "ans": 1, "exp": "कुल = (14 + 17) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "32", "31", "33"], "ans": 2, "exp": "कुल = (14 + 18) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "31", "32"], "ans": 3, "exp": "कुल = (14 + 19) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "34", "32", "35"], "ans": 0, "exp": "कुल = (14 + 20) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "33", "36"], "ans": 1, "exp": "कुल = (14 + 21) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "36", "35", "37"], "ans": 2, "exp": "कुल = (14 + 22) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "37", "35", "36"], "ans": 3, "exp": "कुल = (14 + 23) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "38", "36", "39"], "ans": 0, "exp": "कुल = (14 + 24) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 14वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "38", "37", "40"], "ans": 1, "exp": "कुल = (14 + 25) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["19", "21", "20", "22"], "ans": 2, "exp": "कुल = (15 + 6) - 1 = 20."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "22", "20", "21"], "ans": 3, "exp": "कुल = (15 + 7) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "23", "21", "24"], "ans": 0, "exp": "कुल = (15 + 8) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "23", "22", "25"], "ans": 1, "exp": "कुल = (15 + 9) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "25", "24", "26"], "ans": 2, "exp": "कुल = (15 + 10) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "24", "25"], "ans": 3, "exp": "कुल = (15 + 11) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "27", "25", "28"], "ans": 0, "exp": "कुल = (15 + 12) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "26", "29"], "ans": 1, "exp": "कुल = (15 + 13) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "29", "28", "30"], "ans": 2, "exp": "कुल = (15 + 14) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "28", "29"], "ans": 3, "exp": "कुल = (15 + 15) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "31", "29", "32"], "ans": 0, "exp": "कुल = (15 + 16) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "30", "33"], "ans": 1, "exp": "कुल = (15 + 17) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "33", "32", "34"], "ans": 2, "exp": "कुल = (15 + 18) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "32", "33"], "ans": 3, "exp": "कुल = (15 + 19) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "35", "33", "36"], "ans": 0, "exp": "कुल = (15 + 20) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "34", "37"], "ans": 1, "exp": "कुल = (15 + 21) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "37", "36", "38"], "ans": 2, "exp": "कुल = (15 + 22) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "38", "36", "37"], "ans": 3, "exp": "कुल = (15 + 23) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "39", "37", "40"], "ans": 0, "exp": "कुल = (15 + 24) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 15वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "39", "38", "41"], "ans": 1, "exp": "कुल = (15 + 25) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["20", "22", "21", "23"], "ans": 2, "exp": "कुल = (16 + 6) - 1 = 21."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "23", "21", "22"], "ans": 3, "exp": "कुल = (16 + 7) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "24", "22", "25"], "ans": 0, "exp": "कुल = (16 + 8) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "23", "26"], "ans": 1, "exp": "कुल = (16 + 9) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "26", "25", "27"], "ans": 2, "exp": "कुल = (16 + 10) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "25", "26"], "ans": 3, "exp": "कुल = (16 + 11) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "28", "26", "29"], "ans": 0, "exp": "कुल = (16 + 12) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "27", "30"], "ans": 1, "exp": "कुल = (16 + 13) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "30", "29", "31"], "ans": 2, "exp": "कुल = (16 + 14) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "29", "30"], "ans": 3, "exp": "कुल = (16 + 15) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "32", "30", "33"], "ans": 0, "exp": "कुल = (16 + 16) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "31", "34"], "ans": 1, "exp": "कुल = (16 + 17) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "34", "33", "35"], "ans": 2, "exp": "कुल = (16 + 18) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "33", "34"], "ans": 3, "exp": "कुल = (16 + 19) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "36", "34", "37"], "ans": 0, "exp": "कुल = (16 + 20) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "35", "38"], "ans": 1, "exp": "कुल = (16 + 21) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "38", "37", "39"], "ans": 2, "exp": "कुल = (16 + 22) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "39", "37", "38"], "ans": 3, "exp": "कुल = (16 + 23) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "40", "38", "41"], "ans": 0, "exp": "कुल = (16 + 24) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 16वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "40", "39", "42"], "ans": 1, "exp": "कुल = (16 + 25) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["21", "23", "22", "24"], "ans": 2, "exp": "कुल = (17 + 6) - 1 = 22."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "24", "22", "23"], "ans": 3, "exp": "कुल = (17 + 7) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "25", "23", "26"], "ans": 0, "exp": "कुल = (17 + 8) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "24", "27"], "ans": 1, "exp": "कुल = (17 + 9) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "27", "26", "28"], "ans": 2, "exp": "कुल = (17 + 10) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "26", "27"], "ans": 3, "exp": "कुल = (17 + 11) - 1 = 27."}]}, "maths_s8": {"title": "🔢 गणित (Maths) — सेट 8 (100 प्रश्न)", "questions": [{"q": "A किसी कार्य को 4 दिन में और B उसे 12 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["3 दिन", "5 दिन", "7 दिन", "2 दिन"], "ans": 0, "exp": "(4×12)/(4+12) = 3 दिन।"}, {"q": "A किसी कार्य को 5 दिन में और B उसे 20 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["6 दिन", "4 दिन", "8 दिन", "3 दिन"], "ans": 1, "exp": "(5×20)/(5+20) = 4 दिन।"}, {"q": "A किसी कार्य को 6 दिन में और B उसे 12 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["8 दिन", "6 दिन", "4 दिन", "3 दिन"], "ans": 2, "exp": "(6×12)/(6+12) = 4 दिन।"}, {"q": "A किसी कार्य को 8 दिन में और B उसे 24 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["5 दिन", "8 दिन", "10 दिन", "6 दिन"], "ans": 3, "exp": "(8×24)/(8+24) = 6 दिन।"}, {"q": "A किसी कार्य को 9 दिन में और B उसे 18 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["6 दिन", "8 दिन", "10 दिन", "5 दिन"], "ans": 0, "exp": "(9×18)/(9+18) = 6 दिन।"}, {"q": "A किसी कार्य को 10 दिन में और B उसे 15 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["8 दिन", "6 दिन", "10 दिन", "5 दिन"], "ans": 1, "exp": "(10×15)/(10+15) = 6 दिन।"}, {"q": "A किसी कार्य को 12 दिन में और B उसे 24 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["12 दिन", "10 दिन", "8 दिन", "7 दिन"], "ans": 2, "exp": "(12×24)/(12+24) = 8 दिन।"}, {"q": "A किसी कार्य को 21 दिन में और B उसे 28 दिन में करता है। दोनों मिलकर उसे कितने दिन में करेंगे?", "opts": ["11 दिन", "14 दिन", "16 दिन", "12 दिन"], "ans": 3, "exp": "(21×28)/(21+28) = 12 दिन।"}, {"q": "एक वर्ग की भुजा 6 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["36 वर्ग सेमी", "46 वर्ग सेमी", "24 वर्ग सेमी", "31 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 6² = 36 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 7 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["59 वर्ग सेमी", "49 वर्ग सेमी", "28 वर्ग सेमी", "44 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 7² = 49 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 8 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["32 वर्ग सेमी", "74 वर्ग सेमी", "64 वर्ग सेमी", "59 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 8² = 64 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 9 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["76 वर्ग सेमी", "91 वर्ग सेमी", "36 वर्ग सेमी", "81 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 9² = 81 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 10 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["100 वर्ग सेमी", "110 वर्ग सेमी", "40 वर्ग सेमी", "95 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 10² = 100 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 11 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["131 वर्ग सेमी", "121 वर्ग सेमी", "44 वर्ग सेमी", "116 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 11² = 121 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 12 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["48 वर्ग सेमी", "154 वर्ग सेमी", "144 वर्ग सेमी", "139 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 12² = 144 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 13 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["164 वर्ग सेमी", "179 वर्ग सेमी", "52 वर्ग सेमी", "169 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 13² = 169 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 14 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["196 वर्ग सेमी", "206 वर्ग सेमी", "56 वर्ग सेमी", "191 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 14² = 196 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 15 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["235 वर्ग सेमी", "225 वर्ग सेमी", "60 वर्ग सेमी", "220 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 15² = 225 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 16 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["64 वर्ग सेमी", "266 वर्ग सेमी", "256 वर्ग सेमी", "251 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 16² = 256 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 17 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["284 वर्ग सेमी", "299 वर्ग सेमी", "68 वर्ग सेमी", "289 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 17² = 289 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 18 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["324 वर्ग सेमी", "334 वर्ग सेमी", "72 वर्ग सेमी", "319 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 18² = 324 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 19 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["371 वर्ग सेमी", "361 वर्ग सेमी", "76 वर्ग सेमी", "356 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 19² = 361 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 20 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["80 वर्ग सेमी", "410 वर्ग सेमी", "400 वर्ग सेमी", "395 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 20² = 400 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 21 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["436 वर्ग सेमी", "451 वर्ग सेमी", "84 वर्ग सेमी", "441 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 21² = 441 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 22 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["484 वर्ग सेमी", "494 वर्ग सेमी", "88 वर्ग सेमी", "479 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 22² = 484 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 23 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["539 वर्ग सेमी", "529 वर्ग सेमी", "92 वर्ग सेमी", "524 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 23² = 529 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 24 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["96 वर्ग सेमी", "586 वर्ग सेमी", "576 वर्ग सेमी", "571 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 24² = 576 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 25 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["620 वर्ग सेमी", "635 वर्ग सेमी", "100 वर्ग सेमी", "625 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 25² = 625 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 26 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["676 वर्ग सेमी", "686 वर्ग सेमी", "104 वर्ग सेमी", "671 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 26² = 676 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 27 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["739 वर्ग सेमी", "729 वर्ग सेमी", "108 वर्ग सेमी", "724 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 27² = 729 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 28 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["112 वर्ग सेमी", "794 वर्ग सेमी", "784 वर्ग सेमी", "779 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 28² = 784 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 29 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["836 वर्ग सेमी", "851 वर्ग सेमी", "116 वर्ग सेमी", "841 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 29² = 841 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 30 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["900 वर्ग सेमी", "910 वर्ग सेमी", "120 वर्ग सेमी", "895 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 30² = 900 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 31 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["971 वर्ग सेमी", "961 वर्ग सेमी", "124 वर्ग सेमी", "956 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 31² = 961 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 32 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["128 वर्ग सेमी", "1034 वर्ग सेमी", "1024 वर्ग सेमी", "1019 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 32² = 1024 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 33 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1084 वर्ग सेमी", "1099 वर्ग सेमी", "132 वर्ग सेमी", "1089 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 33² = 1089 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 34 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1156 वर्ग सेमी", "1166 वर्ग सेमी", "136 वर्ग सेमी", "1151 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 34² = 1156 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 35 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1235 वर्ग सेमी", "1225 वर्ग सेमी", "140 वर्ग सेमी", "1220 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 35² = 1225 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 36 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["144 वर्ग सेमी", "1306 वर्ग सेमी", "1296 वर्ग सेमी", "1291 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 36² = 1296 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 37 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1364 वर्ग सेमी", "1379 वर्ग सेमी", "148 वर्ग सेमी", "1369 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 37² = 1369 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 38 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1444 वर्ग सेमी", "1454 वर्ग सेमी", "152 वर्ग सेमी", "1439 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 38² = 1444 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 39 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1531 वर्ग सेमी", "1521 वर्ग सेमी", "156 वर्ग सेमी", "1516 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 39² = 1521 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 40 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["160 वर्ग सेमी", "1610 वर्ग सेमी", "1600 वर्ग सेमी", "1595 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 40² = 1600 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 41 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1676 वर्ग सेमी", "1691 वर्ग सेमी", "164 वर्ग सेमी", "1681 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 41² = 1681 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 42 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1764 वर्ग सेमी", "1774 वर्ग सेमी", "168 वर्ग सेमी", "1759 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 42² = 1764 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 43 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["1859 वर्ग सेमी", "1849 वर्ग सेमी", "172 वर्ग सेमी", "1844 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 43² = 1849 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 44 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["176 वर्ग सेमी", "1946 वर्ग सेमी", "1936 वर्ग सेमी", "1931 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 44² = 1936 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 45 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2020 वर्ग सेमी", "2035 वर्ग सेमी", "180 वर्ग सेमी", "2025 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 45² = 2025 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 46 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2116 वर्ग सेमी", "2126 वर्ग सेमी", "184 वर्ग सेमी", "2111 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 46² = 2116 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 47 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2219 वर्ग सेमी", "2209 वर्ग सेमी", "188 वर्ग सेमी", "2204 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 47² = 2209 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 48 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["192 वर्ग सेमी", "2314 वर्ग सेमी", "2304 वर्ग सेमी", "2299 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 48² = 2304 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 49 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2396 वर्ग सेमी", "2411 वर्ग सेमी", "196 वर्ग सेमी", "2401 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 49² = 2401 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 50 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2500 वर्ग सेमी", "2510 वर्ग सेमी", "200 वर्ग सेमी", "2495 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 50² = 2500 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 51 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2611 वर्ग सेमी", "2601 वर्ग सेमी", "204 वर्ग सेमी", "2596 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 51² = 2601 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 52 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["208 वर्ग सेमी", "2714 वर्ग सेमी", "2704 वर्ग सेमी", "2699 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 52² = 2704 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 53 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2804 वर्ग सेमी", "2819 वर्ग सेमी", "212 वर्ग सेमी", "2809 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 53² = 2809 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 54 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["2916 वर्ग सेमी", "2926 वर्ग सेमी", "216 वर्ग सेमी", "2911 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 54² = 2916 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 55 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3035 वर्ग सेमी", "3025 वर्ग सेमी", "220 वर्ग सेमी", "3020 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 55² = 3025 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 56 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["224 वर्ग सेमी", "3146 वर्ग सेमी", "3136 वर्ग सेमी", "3131 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 56² = 3136 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 57 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3244 वर्ग सेमी", "3259 वर्ग सेमी", "228 वर्ग सेमी", "3249 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 57² = 3249 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 58 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3364 वर्ग सेमी", "3374 वर्ग सेमी", "232 वर्ग सेमी", "3359 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 58² = 3364 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 59 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3491 वर्ग सेमी", "3481 वर्ग सेमी", "236 वर्ग सेमी", "3476 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 59² = 3481 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 60 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["240 वर्ग सेमी", "3610 वर्ग सेमी", "3600 वर्ग सेमी", "3595 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 60² = 3600 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 61 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3716 वर्ग सेमी", "3731 वर्ग सेमी", "244 वर्ग सेमी", "3721 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 61² = 3721 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 62 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3844 वर्ग सेमी", "3854 वर्ग सेमी", "248 वर्ग सेमी", "3839 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 62² = 3844 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 63 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["3979 वर्ग सेमी", "3969 वर्ग सेमी", "252 वर्ग सेमी", "3964 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 63² = 3969 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 64 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["256 वर्ग सेमी", "4106 वर्ग सेमी", "4096 वर्ग सेमी", "4091 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 64² = 4096 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 65 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["4220 वर्ग सेमी", "4235 वर्ग सेमी", "260 वर्ग सेमी", "4225 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 65² = 4225 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 66 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["4356 वर्ग सेमी", "4366 वर्ग सेमी", "264 वर्ग सेमी", "4351 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 66² = 4356 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 67 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["4499 वर्ग सेमी", "4489 वर्ग सेमी", "268 वर्ग सेमी", "4484 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 67² = 4489 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 68 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["272 वर्ग सेमी", "4634 वर्ग सेमी", "4624 वर्ग सेमी", "4619 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 68² = 4624 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 69 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["4756 वर्ग सेमी", "4771 वर्ग सेमी", "276 वर्ग सेमी", "4761 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 69² = 4761 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 70 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["4900 वर्ग सेमी", "4910 वर्ग सेमी", "280 वर्ग सेमी", "4895 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 70² = 4900 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 71 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["5051 वर्ग सेमी", "5041 वर्ग सेमी", "284 वर्ग सेमी", "5036 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 71² = 5041 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 72 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["288 वर्ग सेमी", "5194 वर्ग सेमी", "5184 वर्ग सेमी", "5179 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 72² = 5184 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 73 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["5324 वर्ग सेमी", "5339 वर्ग सेमी", "292 वर्ग सेमी", "5329 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 73² = 5329 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 74 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["5476 वर्ग सेमी", "5486 वर्ग सेमी", "296 वर्ग सेमी", "5471 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 74² = 5476 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 75 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["5635 वर्ग सेमी", "5625 वर्ग सेमी", "300 वर्ग सेमी", "5620 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 75² = 5625 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 76 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["304 वर्ग सेमी", "5786 वर्ग सेमी", "5776 वर्ग सेमी", "5771 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 76² = 5776 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 77 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["5924 वर्ग सेमी", "5939 वर्ग सेमी", "308 वर्ग सेमी", "5929 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 77² = 5929 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 78 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["6084 वर्ग सेमी", "6094 वर्ग सेमी", "312 वर्ग सेमी", "6079 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 78² = 6084 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 79 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["6251 वर्ग सेमी", "6241 वर्ग सेमी", "316 वर्ग सेमी", "6236 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 79² = 6241 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 80 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["320 वर्ग सेमी", "6410 वर्ग सेमी", "6400 वर्ग सेमी", "6395 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 80² = 6400 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 81 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["6556 वर्ग सेमी", "6571 वर्ग सेमी", "324 वर्ग सेमी", "6561 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 81² = 6561 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 82 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["6724 वर्ग सेमी", "6734 वर्ग सेमी", "328 वर्ग सेमी", "6719 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 82² = 6724 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 83 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["6899 वर्ग सेमी", "6889 वर्ग सेमी", "332 वर्ग सेमी", "6884 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 83² = 6889 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 84 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["336 वर्ग सेमी", "7066 वर्ग सेमी", "7056 वर्ग सेमी", "7051 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 84² = 7056 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 85 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["7220 वर्ग सेमी", "7235 वर्ग सेमी", "340 वर्ग सेमी", "7225 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 85² = 7225 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 86 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["7396 वर्ग सेमी", "7406 वर्ग सेमी", "344 वर्ग सेमी", "7391 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 86² = 7396 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 87 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["7579 वर्ग सेमी", "7569 वर्ग सेमी", "348 वर्ग सेमी", "7564 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 87² = 7569 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 88 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["352 वर्ग सेमी", "7754 वर्ग सेमी", "7744 वर्ग सेमी", "7739 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 88² = 7744 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 89 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["7916 वर्ग सेमी", "7931 वर्ग सेमी", "356 वर्ग सेमी", "7921 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 89² = 7921 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 90 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["8100 वर्ग सेमी", "8110 वर्ग सेमी", "360 वर्ग सेमी", "8095 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 90² = 8100 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 91 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["8291 वर्ग सेमी", "8281 वर्ग सेमी", "364 वर्ग सेमी", "8276 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 91² = 8281 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 92 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["368 वर्ग सेमी", "8474 वर्ग सेमी", "8464 वर्ग सेमी", "8459 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 92² = 8464 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 93 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["8644 वर्ग सेमी", "8659 वर्ग सेमी", "372 वर्ग सेमी", "8649 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 93² = 8649 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 94 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["8836 वर्ग सेमी", "8846 वर्ग सेमी", "376 वर्ग सेमी", "8831 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 94² = 8836 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 95 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["9035 वर्ग सेमी", "9025 वर्ग सेमी", "380 वर्ग सेमी", "9020 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 95² = 9025 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 96 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["384 वर्ग सेमी", "9226 वर्ग सेमी", "9216 वर्ग सेमी", "9211 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 96² = 9216 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 97 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["9404 वर्ग सेमी", "9419 वर्ग सेमी", "388 वर्ग सेमी", "9409 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 97² = 9409 वर्ग सेमी।"}]}, "reasoning_s8": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 8 (100 प्रश्न)", "questions": [{"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "29", "27", "30"], "ans": 0, "exp": "कुल = (17 + 12) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "28", "31"], "ans": 1, "exp": "कुल = (17 + 13) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "31", "30", "32"], "ans": 2, "exp": "कुल = (17 + 14) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "30", "31"], "ans": 3, "exp": "कुल = (17 + 15) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "33", "31", "34"], "ans": 0, "exp": "कुल = (17 + 16) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "32", "35"], "ans": 1, "exp": "कुल = (17 + 17) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "35", "34", "36"], "ans": 2, "exp": "कुल = (17 + 18) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "34", "35"], "ans": 3, "exp": "कुल = (17 + 19) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "37", "35", "38"], "ans": 0, "exp": "कुल = (17 + 20) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "37", "36", "39"], "ans": 1, "exp": "कुल = (17 + 21) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "39", "38", "40"], "ans": 2, "exp": "कुल = (17 + 22) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "40", "38", "39"], "ans": 3, "exp": "कुल = (17 + 23) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "41", "39", "42"], "ans": 0, "exp": "कुल = (17 + 24) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 17वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "41", "40", "43"], "ans": 1, "exp": "कुल = (17 + 25) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["22", "24", "23", "25"], "ans": 2, "exp": "कुल = (18 + 6) - 1 = 23."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "25", "23", "24"], "ans": 3, "exp": "कुल = (18 + 7) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "26", "24", "27"], "ans": 0, "exp": "कुल = (18 + 8) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "25", "28"], "ans": 1, "exp": "कुल = (18 + 9) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "28", "27", "29"], "ans": 2, "exp": "कुल = (18 + 10) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "27", "28"], "ans": 3, "exp": "कुल = (18 + 11) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "30", "28", "31"], "ans": 0, "exp": "कुल = (18 + 12) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "29", "32"], "ans": 1, "exp": "कुल = (18 + 13) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "32", "31", "33"], "ans": 2, "exp": "कुल = (18 + 14) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "31", "32"], "ans": 3, "exp": "कुल = (18 + 15) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "34", "32", "35"], "ans": 0, "exp": "कुल = (18 + 16) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "33", "36"], "ans": 1, "exp": "कुल = (18 + 17) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "36", "35", "37"], "ans": 2, "exp": "कुल = (18 + 18) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "37", "35", "36"], "ans": 3, "exp": "कुल = (18 + 19) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "38", "36", "39"], "ans": 0, "exp": "कुल = (18 + 20) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "38", "37", "40"], "ans": 1, "exp": "कुल = (18 + 21) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "40", "39", "41"], "ans": 2, "exp": "कुल = (18 + 22) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "41", "39", "40"], "ans": 3, "exp": "कुल = (18 + 23) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "42", "40", "43"], "ans": 0, "exp": "कुल = (18 + 24) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 18वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "42", "41", "44"], "ans": 1, "exp": "कुल = (18 + 25) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["23", "25", "24", "26"], "ans": 2, "exp": "कुल = (19 + 6) - 1 = 24."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "26", "24", "25"], "ans": 3, "exp": "कुल = (19 + 7) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "27", "25", "28"], "ans": 0, "exp": "कुल = (19 + 8) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "26", "29"], "ans": 1, "exp": "कुल = (19 + 9) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "29", "28", "30"], "ans": 2, "exp": "कुल = (19 + 10) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "28", "29"], "ans": 3, "exp": "कुल = (19 + 11) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "31", "29", "32"], "ans": 0, "exp": "कुल = (19 + 12) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "30", "33"], "ans": 1, "exp": "कुल = (19 + 13) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "33", "32", "34"], "ans": 2, "exp": "कुल = (19 + 14) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "32", "33"], "ans": 3, "exp": "कुल = (19 + 15) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "35", "33", "36"], "ans": 0, "exp": "कुल = (19 + 16) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "34", "37"], "ans": 1, "exp": "कुल = (19 + 17) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "37", "36", "38"], "ans": 2, "exp": "कुल = (19 + 18) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "38", "36", "37"], "ans": 3, "exp": "कुल = (19 + 19) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "39", "37", "40"], "ans": 0, "exp": "कुल = (19 + 20) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "39", "38", "41"], "ans": 1, "exp": "कुल = (19 + 21) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "41", "40", "42"], "ans": 2, "exp": "कुल = (19 + 22) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "42", "40", "41"], "ans": 3, "exp": "कुल = (19 + 23) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "43", "41", "44"], "ans": 0, "exp": "कुल = (19 + 24) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 19वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["44", "43", "42", "45"], "ans": 1, "exp": "कुल = (19 + 25) - 1 = 43."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["24", "26", "25", "27"], "ans": 2, "exp": "कुल = (20 + 6) - 1 = 25."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "27", "25", "26"], "ans": 3, "exp": "कुल = (20 + 7) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "28", "26", "29"], "ans": 0, "exp": "कुल = (20 + 8) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "27", "30"], "ans": 1, "exp": "कुल = (20 + 9) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "30", "29", "31"], "ans": 2, "exp": "कुल = (20 + 10) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "29", "30"], "ans": 3, "exp": "कुल = (20 + 11) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "32", "30", "33"], "ans": 0, "exp": "कुल = (20 + 12) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "31", "34"], "ans": 1, "exp": "कुल = (20 + 13) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "34", "33", "35"], "ans": 2, "exp": "कुल = (20 + 14) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "33", "34"], "ans": 3, "exp": "कुल = (20 + 15) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "36", "34", "37"], "ans": 0, "exp": "कुल = (20 + 16) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "35", "38"], "ans": 1, "exp": "कुल = (20 + 17) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "38", "37", "39"], "ans": 2, "exp": "कुल = (20 + 18) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "39", "37", "38"], "ans": 3, "exp": "कुल = (20 + 19) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "40", "38", "41"], "ans": 0, "exp": "कुल = (20 + 20) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "40", "39", "42"], "ans": 1, "exp": "कुल = (20 + 21) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "42", "41", "43"], "ans": 2, "exp": "कुल = (20 + 22) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["44", "43", "41", "42"], "ans": 3, "exp": "कुल = (20 + 23) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "44", "42", "45"], "ans": 0, "exp": "कुल = (20 + 24) - 1 = 43."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 20वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["45", "44", "43", "46"], "ans": 1, "exp": "कुल = (20 + 25) - 1 = 44."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["25", "27", "26", "28"], "ans": 2, "exp": "कुल = (21 + 6) - 1 = 26."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "28", "26", "27"], "ans": 3, "exp": "कुल = (21 + 7) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "29", "27", "30"], "ans": 0, "exp": "कुल = (21 + 8) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "28", "31"], "ans": 1, "exp": "कुल = (21 + 9) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "31", "30", "32"], "ans": 2, "exp": "कुल = (21 + 10) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "30", "31"], "ans": 3, "exp": "कुल = (21 + 11) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "33", "31", "34"], "ans": 0, "exp": "कुल = (21 + 12) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "32", "35"], "ans": 1, "exp": "कुल = (21 + 13) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "35", "34", "36"], "ans": 2, "exp": "कुल = (21 + 14) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "34", "35"], "ans": 3, "exp": "कुल = (21 + 15) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "37", "35", "38"], "ans": 0, "exp": "कुल = (21 + 16) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "37", "36", "39"], "ans": 1, "exp": "कुल = (21 + 17) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "39", "38", "40"], "ans": 2, "exp": "कुल = (21 + 18) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "40", "38", "39"], "ans": 3, "exp": "कुल = (21 + 19) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "41", "39", "42"], "ans": 0, "exp": "कुल = (21 + 20) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "41", "40", "43"], "ans": 1, "exp": "कुल = (21 + 21) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "43", "42", "44"], "ans": 2, "exp": "कुल = (21 + 22) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["45", "44", "42", "43"], "ans": 3, "exp": "कुल = (21 + 23) - 1 = 43."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["44", "45", "43", "46"], "ans": 0, "exp": "कुल = (21 + 24) - 1 = 44."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 21वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["46", "45", "44", "47"], "ans": 1, "exp": "कुल = (21 + 25) - 1 = 45."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["26", "28", "27", "29"], "ans": 2, "exp": "कुल = (22 + 6) - 1 = 27."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "29", "27", "28"], "ans": 3, "exp": "कुल = (22 + 7) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["29", "30", "28", "31"], "ans": 0, "exp": "कुल = (22 + 8) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "29", "32"], "ans": 1, "exp": "कुल = (22 + 9) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "32", "31", "33"], "ans": 2, "exp": "कुल = (22 + 10) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "33", "31", "32"], "ans": 3, "exp": "कुल = (22 + 11) - 1 = 32."}]}, "maths_s9": {"title": "🔢 गणित (Maths) — सेट 9 (100 प्रश्न)", "questions": [{"q": "एक वर्ग की भुजा 98 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["9604 वर्ग सेमी", "9614 वर्ग सेमी", "392 वर्ग सेमी", "9599 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 98² = 9604 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 99 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["9811 वर्ग सेमी", "9801 वर्ग सेमी", "396 वर्ग सेमी", "9796 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 99² = 9801 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 100 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["400 वर्ग सेमी", "10010 वर्ग सेमी", "10000 वर्ग सेमी", "9995 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 100² = 10000 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 101 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["10196 वर्ग सेमी", "10211 वर्ग सेमी", "404 वर्ग सेमी", "10201 वर्ग सेमी"], "ans": 3, "exp": "क्षेत्रफल = 101² = 10201 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 102 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["10404 वर्ग सेमी", "10414 वर्ग सेमी", "408 वर्ग सेमी", "10399 वर्ग सेमी"], "ans": 0, "exp": "क्षेत्रफल = 102² = 10404 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 103 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["10619 वर्ग सेमी", "10609 वर्ग सेमी", "412 वर्ग सेमी", "10604 वर्ग सेमी"], "ans": 1, "exp": "क्षेत्रफल = 103² = 10609 वर्ग सेमी।"}, {"q": "एक वर्ग की भुजा 104 सेमी है, तो उसका क्षेत्रफल कितना होगा?", "opts": ["416 वर्ग सेमी", "10826 वर्ग सेमी", "10816 वर्ग सेमी", "10811 वर्ग सेमी"], "ans": 2, "exp": "क्षेत्रफल = 104² = 10816 वर्ग सेमी।"}, {"q": "एक आयत की लंबाई 6 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["20 सेमी", "30 सेमी", "26 सेमी", "22 सेमी"], "ans": 3, "exp": "परिमाप = 2(6+5) = 22 सेमी।"}, {"q": "एक आयत की लंबाई 6 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["26 सेमी", "42 सेमी", "30 सेमी", "24 सेमी"], "ans": 0, "exp": "परिमाप = 2(6+7) = 26 सेमी।"}, {"q": "एक आयत की लंबाई 6 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["54 सेमी", "30 सेमी", "34 सेमी", "28 सेमी"], "ans": 1, "exp": "परिमाप = 2(6+9) = 30 सेमी।"}, {"q": "एक आयत की लंबाई 7 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["26 सेमी", "28 सेमी", "22 सेमी", "20 सेमी"], "ans": 2, "exp": "परिमाप = 2(7+4) = 22 सेमी।"}, {"q": "एक आयत की लंबाई 7 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["22 सेमी", "35 सेमी", "28 सेमी", "24 सेमी"], "ans": 3, "exp": "परिमाप = 2(7+5) = 24 सेमी।"}, {"q": "एक आयत की लंबाई 7 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["28 सेमी", "49 सेमी", "32 सेमी", "26 सेमी"], "ans": 0, "exp": "परिमाप = 2(7+7) = 28 सेमी।"}, {"q": "एक आयत की लंबाई 7 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["63 सेमी", "32 सेमी", "36 सेमी", "30 सेमी"], "ans": 1, "exp": "परिमाप = 2(7+9) = 32 सेमी।"}, {"q": "एक आयत की लंबाई 8 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["28 सेमी", "32 सेमी", "24 सेमी", "22 सेमी"], "ans": 2, "exp": "परिमाप = 2(8+4) = 24 सेमी।"}, {"q": "एक आयत की लंबाई 8 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["24 सेमी", "40 सेमी", "30 सेमी", "26 सेमी"], "ans": 3, "exp": "परिमाप = 2(8+5) = 26 सेमी।"}, {"q": "एक आयत की लंबाई 8 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["30 सेमी", "56 सेमी", "34 सेमी", "28 सेमी"], "ans": 0, "exp": "परिमाप = 2(8+7) = 30 सेमी।"}, {"q": "एक आयत की लंबाई 8 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["72 सेमी", "34 सेमी", "38 सेमी", "32 सेमी"], "ans": 1, "exp": "परिमाप = 2(8+9) = 34 सेमी।"}, {"q": "एक आयत की लंबाई 9 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["30 सेमी", "36 सेमी", "26 सेमी", "24 सेमी"], "ans": 2, "exp": "परिमाप = 2(9+4) = 26 सेमी।"}, {"q": "एक आयत की लंबाई 9 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["26 सेमी", "45 सेमी", "32 सेमी", "28 सेमी"], "ans": 3, "exp": "परिमाप = 2(9+5) = 28 सेमी।"}, {"q": "एक आयत की लंबाई 9 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["32 सेमी", "63 सेमी", "36 सेमी", "30 सेमी"], "ans": 0, "exp": "परिमाप = 2(9+7) = 32 सेमी।"}, {"q": "एक आयत की लंबाई 9 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["81 सेमी", "36 सेमी", "40 सेमी", "34 सेमी"], "ans": 1, "exp": "परिमाप = 2(9+9) = 36 सेमी।"}, {"q": "एक आयत की लंबाई 10 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["32 सेमी", "40 सेमी", "28 सेमी", "26 सेमी"], "ans": 2, "exp": "परिमाप = 2(10+4) = 28 सेमी।"}, {"q": "एक आयत की लंबाई 10 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["28 सेमी", "50 सेमी", "34 सेमी", "30 सेमी"], "ans": 3, "exp": "परिमाप = 2(10+5) = 30 सेमी।"}, {"q": "एक आयत की लंबाई 10 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["34 सेमी", "70 सेमी", "38 सेमी", "32 सेमी"], "ans": 0, "exp": "परिमाप = 2(10+7) = 34 सेमी।"}, {"q": "एक आयत की लंबाई 10 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["90 सेमी", "38 सेमी", "42 सेमी", "36 सेमी"], "ans": 1, "exp": "परिमाप = 2(10+9) = 38 सेमी।"}, {"q": "एक आयत की लंबाई 11 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["34 सेमी", "44 सेमी", "30 सेमी", "28 सेमी"], "ans": 2, "exp": "परिमाप = 2(11+4) = 30 सेमी।"}, {"q": "एक आयत की लंबाई 11 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["30 सेमी", "55 सेमी", "36 सेमी", "32 सेमी"], "ans": 3, "exp": "परिमाप = 2(11+5) = 32 सेमी।"}, {"q": "एक आयत की लंबाई 11 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["36 सेमी", "77 सेमी", "40 सेमी", "34 सेमी"], "ans": 0, "exp": "परिमाप = 2(11+7) = 36 सेमी।"}, {"q": "एक आयत की लंबाई 11 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["99 सेमी", "40 सेमी", "44 सेमी", "38 सेमी"], "ans": 1, "exp": "परिमाप = 2(11+9) = 40 सेमी।"}, {"q": "एक आयत की लंबाई 12 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["36 सेमी", "48 सेमी", "32 सेमी", "30 सेमी"], "ans": 2, "exp": "परिमाप = 2(12+4) = 32 सेमी।"}, {"q": "एक आयत की लंबाई 12 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["32 सेमी", "60 सेमी", "38 सेमी", "34 सेमी"], "ans": 3, "exp": "परिमाप = 2(12+5) = 34 सेमी।"}, {"q": "एक आयत की लंबाई 12 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["38 सेमी", "84 सेमी", "42 सेमी", "36 सेमी"], "ans": 0, "exp": "परिमाप = 2(12+7) = 38 सेमी।"}, {"q": "एक आयत की लंबाई 12 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["108 सेमी", "42 सेमी", "46 सेमी", "40 सेमी"], "ans": 1, "exp": "परिमाप = 2(12+9) = 42 सेमी।"}, {"q": "एक आयत की लंबाई 13 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["38 सेमी", "52 सेमी", "34 सेमी", "32 सेमी"], "ans": 2, "exp": "परिमाप = 2(13+4) = 34 सेमी।"}, {"q": "एक आयत की लंबाई 13 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["34 सेमी", "65 सेमी", "40 सेमी", "36 सेमी"], "ans": 3, "exp": "परिमाप = 2(13+5) = 36 सेमी।"}, {"q": "एक आयत की लंबाई 13 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["40 सेमी", "91 सेमी", "44 सेमी", "38 सेमी"], "ans": 0, "exp": "परिमाप = 2(13+7) = 40 सेमी।"}, {"q": "एक आयत की लंबाई 13 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["117 सेमी", "44 सेमी", "48 सेमी", "42 सेमी"], "ans": 1, "exp": "परिमाप = 2(13+9) = 44 सेमी।"}, {"q": "एक आयत की लंबाई 14 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["40 सेमी", "56 सेमी", "36 सेमी", "34 सेमी"], "ans": 2, "exp": "परिमाप = 2(14+4) = 36 सेमी।"}, {"q": "एक आयत की लंबाई 14 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["36 सेमी", "70 सेमी", "42 सेमी", "38 सेमी"], "ans": 3, "exp": "परिमाप = 2(14+5) = 38 सेमी।"}, {"q": "एक आयत की लंबाई 14 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["42 सेमी", "98 सेमी", "46 सेमी", "40 सेमी"], "ans": 0, "exp": "परिमाप = 2(14+7) = 42 सेमी।"}, {"q": "एक आयत की लंबाई 14 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["126 सेमी", "46 सेमी", "50 सेमी", "44 सेमी"], "ans": 1, "exp": "परिमाप = 2(14+9) = 46 सेमी।"}, {"q": "एक आयत की लंबाई 15 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["42 सेमी", "60 सेमी", "38 सेमी", "36 सेमी"], "ans": 2, "exp": "परिमाप = 2(15+4) = 38 सेमी।"}, {"q": "एक आयत की लंबाई 15 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["38 सेमी", "75 सेमी", "44 सेमी", "40 सेमी"], "ans": 3, "exp": "परिमाप = 2(15+5) = 40 सेमी।"}, {"q": "एक आयत की लंबाई 15 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["44 सेमी", "105 सेमी", "48 सेमी", "42 सेमी"], "ans": 0, "exp": "परिमाप = 2(15+7) = 44 सेमी।"}, {"q": "एक आयत की लंबाई 15 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["135 सेमी", "48 सेमी", "52 सेमी", "46 सेमी"], "ans": 1, "exp": "परिमाप = 2(15+9) = 48 सेमी।"}, {"q": "एक आयत की लंबाई 16 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["44 सेमी", "64 सेमी", "40 सेमी", "38 सेमी"], "ans": 2, "exp": "परिमाप = 2(16+4) = 40 सेमी।"}, {"q": "एक आयत की लंबाई 16 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["40 सेमी", "80 सेमी", "46 सेमी", "42 सेमी"], "ans": 3, "exp": "परिमाप = 2(16+5) = 42 सेमी।"}, {"q": "एक आयत की लंबाई 16 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["46 सेमी", "112 सेमी", "50 सेमी", "44 सेमी"], "ans": 0, "exp": "परिमाप = 2(16+7) = 46 सेमी।"}, {"q": "एक आयत की लंबाई 16 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["144 सेमी", "50 सेमी", "54 सेमी", "48 सेमी"], "ans": 1, "exp": "परिमाप = 2(16+9) = 50 सेमी।"}, {"q": "एक आयत की लंबाई 17 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["46 सेमी", "68 सेमी", "42 सेमी", "40 सेमी"], "ans": 2, "exp": "परिमाप = 2(17+4) = 42 सेमी।"}, {"q": "एक आयत की लंबाई 17 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["42 सेमी", "85 सेमी", "48 सेमी", "44 सेमी"], "ans": 3, "exp": "परिमाप = 2(17+5) = 44 सेमी।"}, {"q": "एक आयत की लंबाई 17 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["48 सेमी", "119 सेमी", "52 सेमी", "46 सेमी"], "ans": 0, "exp": "परिमाप = 2(17+7) = 48 सेमी।"}, {"q": "एक आयत की लंबाई 17 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["153 सेमी", "52 सेमी", "56 सेमी", "50 सेमी"], "ans": 1, "exp": "परिमाप = 2(17+9) = 52 सेमी।"}, {"q": "एक आयत की लंबाई 18 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["48 सेमी", "72 सेमी", "44 सेमी", "42 सेमी"], "ans": 2, "exp": "परिमाप = 2(18+4) = 44 सेमी।"}, {"q": "एक आयत की लंबाई 18 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["44 सेमी", "90 सेमी", "50 सेमी", "46 सेमी"], "ans": 3, "exp": "परिमाप = 2(18+5) = 46 सेमी।"}, {"q": "एक आयत की लंबाई 18 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["50 सेमी", "126 सेमी", "54 सेमी", "48 सेमी"], "ans": 0, "exp": "परिमाप = 2(18+7) = 50 सेमी।"}, {"q": "एक आयत की लंबाई 18 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["162 सेमी", "54 सेमी", "58 सेमी", "52 सेमी"], "ans": 1, "exp": "परिमाप = 2(18+9) = 54 सेमी।"}, {"q": "एक आयत की लंबाई 19 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["50 सेमी", "76 सेमी", "46 सेमी", "44 सेमी"], "ans": 2, "exp": "परिमाप = 2(19+4) = 46 सेमी।"}, {"q": "एक आयत की लंबाई 19 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["46 सेमी", "95 सेमी", "52 सेमी", "48 सेमी"], "ans": 3, "exp": "परिमाप = 2(19+5) = 48 सेमी।"}, {"q": "एक आयत की लंबाई 19 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["52 सेमी", "133 सेमी", "56 सेमी", "50 सेमी"], "ans": 0, "exp": "परिमाप = 2(19+7) = 52 सेमी।"}, {"q": "एक आयत की लंबाई 19 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["171 सेमी", "56 सेमी", "60 सेमी", "54 सेमी"], "ans": 1, "exp": "परिमाप = 2(19+9) = 56 सेमी।"}, {"q": "एक आयत की लंबाई 20 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["52 सेमी", "80 सेमी", "48 सेमी", "46 सेमी"], "ans": 2, "exp": "परिमाप = 2(20+4) = 48 सेमी।"}, {"q": "एक आयत की लंबाई 20 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["48 सेमी", "100 सेमी", "54 सेमी", "50 सेमी"], "ans": 3, "exp": "परिमाप = 2(20+5) = 50 सेमी।"}, {"q": "एक आयत की लंबाई 20 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["54 सेमी", "140 सेमी", "58 सेमी", "52 सेमी"], "ans": 0, "exp": "परिमाप = 2(20+7) = 54 सेमी।"}, {"q": "एक आयत की लंबाई 20 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["180 सेमी", "58 सेमी", "62 सेमी", "56 सेमी"], "ans": 1, "exp": "परिमाप = 2(20+9) = 58 सेमी।"}, {"q": "एक आयत की लंबाई 21 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["54 सेमी", "84 सेमी", "50 सेमी", "48 सेमी"], "ans": 2, "exp": "परिमाप = 2(21+4) = 50 सेमी।"}, {"q": "एक आयत की लंबाई 21 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["50 सेमी", "105 सेमी", "56 सेमी", "52 सेमी"], "ans": 3, "exp": "परिमाप = 2(21+5) = 52 सेमी।"}, {"q": "एक आयत की लंबाई 21 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["56 सेमी", "147 सेमी", "60 सेमी", "54 सेमी"], "ans": 0, "exp": "परिमाप = 2(21+7) = 56 सेमी।"}, {"q": "एक आयत की लंबाई 21 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["189 सेमी", "60 सेमी", "64 सेमी", "58 सेमी"], "ans": 1, "exp": "परिमाप = 2(21+9) = 60 सेमी।"}, {"q": "एक आयत की लंबाई 22 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["56 सेमी", "88 सेमी", "52 सेमी", "50 सेमी"], "ans": 2, "exp": "परिमाप = 2(22+4) = 52 सेमी।"}, {"q": "एक आयत की लंबाई 22 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["52 सेमी", "110 सेमी", "58 सेमी", "54 सेमी"], "ans": 3, "exp": "परिमाप = 2(22+5) = 54 सेमी।"}, {"q": "एक आयत की लंबाई 22 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["58 सेमी", "154 सेमी", "62 सेमी", "56 सेमी"], "ans": 0, "exp": "परिमाप = 2(22+7) = 58 सेमी।"}, {"q": "एक आयत की लंबाई 22 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["198 सेमी", "62 सेमी", "66 सेमी", "60 सेमी"], "ans": 1, "exp": "परिमाप = 2(22+9) = 62 सेमी।"}, {"q": "एक आयत की लंबाई 23 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["58 सेमी", "92 सेमी", "54 सेमी", "52 सेमी"], "ans": 2, "exp": "परिमाप = 2(23+4) = 54 सेमी।"}, {"q": "एक आयत की लंबाई 23 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["54 सेमी", "115 सेमी", "60 सेमी", "56 सेमी"], "ans": 3, "exp": "परिमाप = 2(23+5) = 56 सेमी।"}, {"q": "एक आयत की लंबाई 23 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["60 सेमी", "161 सेमी", "64 सेमी", "58 सेमी"], "ans": 0, "exp": "परिमाप = 2(23+7) = 60 सेमी।"}, {"q": "एक आयत की लंबाई 23 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["207 सेमी", "64 सेमी", "68 सेमी", "62 सेमी"], "ans": 1, "exp": "परिमाप = 2(23+9) = 64 सेमी।"}, {"q": "एक आयत की लंबाई 24 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["60 सेमी", "96 सेमी", "56 सेमी", "54 सेमी"], "ans": 2, "exp": "परिमाप = 2(24+4) = 56 सेमी।"}, {"q": "एक आयत की लंबाई 24 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["56 सेमी", "120 सेमी", "62 सेमी", "58 सेमी"], "ans": 3, "exp": "परिमाप = 2(24+5) = 58 सेमी।"}, {"q": "एक आयत की लंबाई 24 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["62 सेमी", "168 सेमी", "66 सेमी", "60 सेमी"], "ans": 0, "exp": "परिमाप = 2(24+7) = 62 सेमी।"}, {"q": "एक आयत की लंबाई 24 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["216 सेमी", "66 सेमी", "70 सेमी", "64 सेमी"], "ans": 1, "exp": "परिमाप = 2(24+9) = 66 सेमी।"}, {"q": "एक आयत की लंबाई 25 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["62 सेमी", "100 सेमी", "58 सेमी", "56 सेमी"], "ans": 2, "exp": "परिमाप = 2(25+4) = 58 सेमी।"}, {"q": "एक आयत की लंबाई 25 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["58 सेमी", "125 सेमी", "64 सेमी", "60 सेमी"], "ans": 3, "exp": "परिमाप = 2(25+5) = 60 सेमी।"}, {"q": "एक आयत की लंबाई 25 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["64 सेमी", "175 सेमी", "68 सेमी", "62 सेमी"], "ans": 0, "exp": "परिमाप = 2(25+7) = 64 सेमी।"}, {"q": "एक आयत की लंबाई 25 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["225 सेमी", "68 सेमी", "72 सेमी", "66 सेमी"], "ans": 1, "exp": "परिमाप = 2(25+9) = 68 सेमी।"}, {"q": "एक आयत की लंबाई 26 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["64 सेमी", "104 सेमी", "60 सेमी", "58 सेमी"], "ans": 2, "exp": "परिमाप = 2(26+4) = 60 सेमी।"}, {"q": "एक आयत की लंबाई 26 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["60 सेमी", "130 सेमी", "66 सेमी", "62 सेमी"], "ans": 3, "exp": "परिमाप = 2(26+5) = 62 सेमी।"}, {"q": "एक आयत की लंबाई 26 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["66 सेमी", "182 सेमी", "70 सेमी", "64 सेमी"], "ans": 0, "exp": "परिमाप = 2(26+7) = 66 सेमी।"}, {"q": "एक आयत की लंबाई 26 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["234 सेमी", "70 सेमी", "74 सेमी", "68 सेमी"], "ans": 1, "exp": "परिमाप = 2(26+9) = 70 सेमी।"}, {"q": "एक आयत की लंबाई 27 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["66 सेमी", "108 सेमी", "62 सेमी", "60 सेमी"], "ans": 2, "exp": "परिमाप = 2(27+4) = 62 सेमी।"}, {"q": "एक आयत की लंबाई 27 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["62 सेमी", "135 सेमी", "68 सेमी", "64 सेमी"], "ans": 3, "exp": "परिमाप = 2(27+5) = 64 सेमी।"}, {"q": "एक आयत की लंबाई 27 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["68 सेमी", "189 सेमी", "72 सेमी", "66 सेमी"], "ans": 0, "exp": "परिमाप = 2(27+7) = 68 सेमी।"}, {"q": "एक आयत की लंबाई 27 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["243 सेमी", "72 सेमी", "76 सेमी", "70 सेमी"], "ans": 1, "exp": "परिमाप = 2(27+9) = 72 सेमी।"}, {"q": "एक आयत की लंबाई 28 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["68 सेमी", "112 सेमी", "64 सेमी", "62 सेमी"], "ans": 2, "exp": "परिमाप = 2(28+4) = 64 सेमी।"}, {"q": "एक आयत की लंबाई 28 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["64 सेमी", "140 सेमी", "70 सेमी", "66 सेमी"], "ans": 3, "exp": "परिमाप = 2(28+5) = 66 सेमी।"}, {"q": "एक आयत की लंबाई 28 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["70 सेमी", "196 सेमी", "74 सेमी", "68 सेमी"], "ans": 0, "exp": "परिमाप = 2(28+7) = 70 सेमी।"}, {"q": "एक आयत की लंबाई 28 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["252 सेमी", "74 सेमी", "78 सेमी", "72 सेमी"], "ans": 1, "exp": "परिमाप = 2(28+9) = 74 सेमी।"}, {"q": "एक आयत की लंबाई 29 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["70 सेमी", "116 सेमी", "66 सेमी", "64 सेमी"], "ans": 2, "exp": "परिमाप = 2(29+4) = 66 सेमी।"}, {"q": "एक आयत की लंबाई 29 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["66 सेमी", "145 सेमी", "72 सेमी", "68 सेमी"], "ans": 3, "exp": "परिमाप = 2(29+5) = 68 सेमी।"}]}, "reasoning_s9": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 9 (100 प्रश्न)", "questions": [{"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "34", "32", "35"], "ans": 0, "exp": "कुल = (22 + 12) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "33", "36"], "ans": 1, "exp": "कुल = (22 + 13) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "36", "35", "37"], "ans": 2, "exp": "कुल = (22 + 14) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "37", "35", "36"], "ans": 3, "exp": "कुल = (22 + 15) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "38", "36", "39"], "ans": 0, "exp": "कुल = (22 + 16) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "38", "37", "40"], "ans": 1, "exp": "कुल = (22 + 17) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "40", "39", "41"], "ans": 2, "exp": "कुल = (22 + 18) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "41", "39", "40"], "ans": 3, "exp": "कुल = (22 + 19) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "42", "40", "43"], "ans": 0, "exp": "कुल = (22 + 20) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "42", "41", "44"], "ans": 1, "exp": "कुल = (22 + 21) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "44", "43", "45"], "ans": 2, "exp": "कुल = (22 + 22) - 1 = 43."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["46", "45", "43", "44"], "ans": 3, "exp": "कुल = (22 + 23) - 1 = 44."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["45", "46", "44", "47"], "ans": 0, "exp": "कुल = (22 + 24) - 1 = 45."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 22वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["47", "46", "45", "48"], "ans": 1, "exp": "कुल = (22 + 25) - 1 = 46."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["27", "29", "28", "30"], "ans": 2, "exp": "कुल = (23 + 6) - 1 = 28."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "30", "28", "29"], "ans": 3, "exp": "कुल = (23 + 7) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["30", "31", "29", "32"], "ans": 0, "exp": "कुल = (23 + 8) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "30", "33"], "ans": 1, "exp": "कुल = (23 + 9) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "33", "32", "34"], "ans": 2, "exp": "कुल = (23 + 10) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "34", "32", "33"], "ans": 3, "exp": "कुल = (23 + 11) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["34", "35", "33", "36"], "ans": 0, "exp": "कुल = (23 + 12) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "34", "37"], "ans": 1, "exp": "कुल = (23 + 13) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "37", "36", "38"], "ans": 2, "exp": "कुल = (23 + 14) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "38", "36", "37"], "ans": 3, "exp": "कुल = (23 + 15) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["38", "39", "37", "40"], "ans": 0, "exp": "कुल = (23 + 16) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "39", "38", "41"], "ans": 1, "exp": "कुल = (23 + 17) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "41", "40", "42"], "ans": 2, "exp": "कुल = (23 + 18) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "42", "40", "41"], "ans": 3, "exp": "कुल = (23 + 19) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["42", "43", "41", "44"], "ans": 0, "exp": "कुल = (23 + 20) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["44", "43", "42", "45"], "ans": 1, "exp": "कुल = (23 + 21) - 1 = 43."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "45", "44", "46"], "ans": 2, "exp": "कुल = (23 + 22) - 1 = 44."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["47", "46", "44", "45"], "ans": 3, "exp": "कुल = (23 + 23) - 1 = 45."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["46", "47", "45", "48"], "ans": 0, "exp": "कुल = (23 + 24) - 1 = 46."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 23वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["48", "47", "46", "49"], "ans": 1, "exp": "कुल = (23 + 25) - 1 = 47."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 6वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["28", "30", "29", "31"], "ans": 2, "exp": "कुल = (24 + 6) - 1 = 29."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 7वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "31", "29", "30"], "ans": 3, "exp": "कुल = (24 + 7) - 1 = 30."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 8वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["31", "32", "30", "33"], "ans": 0, "exp": "कुल = (24 + 8) - 1 = 31."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 9वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["33", "32", "31", "34"], "ans": 1, "exp": "कुल = (24 + 9) - 1 = 32."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 10वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["32", "34", "33", "35"], "ans": 2, "exp": "कुल = (24 + 10) - 1 = 33."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 11वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "35", "33", "34"], "ans": 3, "exp": "कुल = (24 + 11) - 1 = 34."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 12वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["35", "36", "34", "37"], "ans": 0, "exp": "कुल = (24 + 12) - 1 = 35."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 13वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["37", "36", "35", "38"], "ans": 1, "exp": "कुल = (24 + 13) - 1 = 36."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 14वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["36", "38", "37", "39"], "ans": 2, "exp": "कुल = (24 + 14) - 1 = 37."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 15वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "39", "37", "38"], "ans": 3, "exp": "कुल = (24 + 15) - 1 = 38."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 16वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["39", "40", "38", "41"], "ans": 0, "exp": "कुल = (24 + 16) - 1 = 39."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 17वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["41", "40", "39", "42"], "ans": 1, "exp": "कुल = (24 + 17) - 1 = 40."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 18वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["40", "42", "41", "43"], "ans": 2, "exp": "कुल = (24 + 18) - 1 = 41."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 19वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["44", "43", "41", "42"], "ans": 3, "exp": "कुल = (24 + 19) - 1 = 42."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 20वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["43", "44", "42", "45"], "ans": 0, "exp": "कुल = (24 + 20) - 1 = 43."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 21वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["45", "44", "43", "46"], "ans": 1, "exp": "कुल = (24 + 21) - 1 = 44."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 22वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["44", "46", "45", "47"], "ans": 2, "exp": "कुल = (24 + 22) - 1 = 45."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 23वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["48", "47", "45", "46"], "ans": 3, "exp": "कुल = (24 + 23) - 1 = 46."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 24वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["47", "48", "46", "49"], "ans": 0, "exp": "कुल = (24 + 24) - 1 = 47."}, {"q": "एक पंक्ति में किसी विद्यार्थी का स्थान बाएँ से 24वां और दाएँ से 25वां है। पंक्ति में कुल कितने विद्यार्थी हैं?", "opts": ["49", "48", "47", "50"], "ans": 1, "exp": "कुल = (24 + 25) - 1 = 48."}, {"q": "सादृश्यता पूर्ण करें: 2 : 7 :: 4 : ?", "opts": ["17", "21", "19", "16"], "ans": 2, "exp": "नियम n² + 3: 4² + 3 = 19."}, {"q": "सादृश्यता पूर्ण करें: 2 : 8 :: 4 : ?", "opts": ["16", "22", "18", "20"], "ans": 3, "exp": "नियम n² + 4: 4² + 4 = 20."}, {"q": "सादृश्यता पूर्ण करें: 2 : 9 :: 4 : ?", "opts": ["21", "23", "19", "16"], "ans": 0, "exp": "नियम n² + 5: 4² + 5 = 21."}, {"q": "सादृश्यता पूर्ण करें: 2 : 10 :: 4 : ?", "opts": ["24", "22", "20", "16"], "ans": 1, "exp": "नियम n² + 6: 4² + 6 = 22."}, {"q": "सादृश्यता पूर्ण करें: 3 : 12 :: 5 : ?", "opts": ["26", "30", "28", "25"], "ans": 2, "exp": "नियम n² + 3: 5² + 3 = 28."}, {"q": "सादृश्यता पूर्ण करें: 3 : 13 :: 5 : ?", "opts": ["25", "31", "27", "29"], "ans": 3, "exp": "नियम n² + 4: 5² + 4 = 29."}, {"q": "सादृश्यता पूर्ण करें: 3 : 14 :: 5 : ?", "opts": ["30", "32", "28", "25"], "ans": 0, "exp": "नियम n² + 5: 5² + 5 = 30."}, {"q": "सादृश्यता पूर्ण करें: 3 : 15 :: 5 : ?", "opts": ["33", "31", "29", "25"], "ans": 1, "exp": "नियम n² + 6: 5² + 6 = 31."}, {"q": "सादृश्यता पूर्ण करें: 4 : 19 :: 6 : ?", "opts": ["37", "41", "39", "36"], "ans": 2, "exp": "नियम n² + 3: 6² + 3 = 39."}, {"q": "सादृश्यता पूर्ण करें: 4 : 20 :: 6 : ?", "opts": ["36", "42", "38", "40"], "ans": 3, "exp": "नियम n² + 4: 6² + 4 = 40."}, {"q": "सादृश्यता पूर्ण करें: 4 : 21 :: 6 : ?", "opts": ["41", "43", "39", "36"], "ans": 0, "exp": "नियम n² + 5: 6² + 5 = 41."}, {"q": "सादृश्यता पूर्ण करें: 4 : 22 :: 6 : ?", "opts": ["44", "42", "40", "36"], "ans": 1, "exp": "नियम n² + 6: 6² + 6 = 42."}, {"q": "सादृश्यता पूर्ण करें: 5 : 28 :: 7 : ?", "opts": ["50", "54", "52", "49"], "ans": 2, "exp": "नियम n² + 3: 7² + 3 = 52."}, {"q": "सादृश्यता पूर्ण करें: 5 : 29 :: 7 : ?", "opts": ["49", "55", "51", "53"], "ans": 3, "exp": "नियम n² + 4: 7² + 4 = 53."}, {"q": "सादृश्यता पूर्ण करें: 5 : 30 :: 7 : ?", "opts": ["54", "56", "52", "49"], "ans": 0, "exp": "नियम n² + 5: 7² + 5 = 54."}, {"q": "सादृश्यता पूर्ण करें: 5 : 31 :: 7 : ?", "opts": ["57", "55", "53", "49"], "ans": 1, "exp": "नियम n² + 6: 7² + 6 = 55."}, {"q": "सादृश्यता पूर्ण करें: 6 : 39 :: 8 : ?", "opts": ["65", "69", "67", "64"], "ans": 2, "exp": "नियम n² + 3: 8² + 3 = 67."}, {"q": "सादृश्यता पूर्ण करें: 6 : 40 :: 8 : ?", "opts": ["64", "70", "66", "68"], "ans": 3, "exp": "नियम n² + 4: 8² + 4 = 68."}, {"q": "सादृश्यता पूर्ण करें: 6 : 41 :: 8 : ?", "opts": ["69", "71", "67", "64"], "ans": 0, "exp": "नियम n² + 5: 8² + 5 = 69."}, {"q": "सादृश्यता पूर्ण करें: 6 : 42 :: 8 : ?", "opts": ["72", "70", "68", "64"], "ans": 1, "exp": "नियम n² + 6: 8² + 6 = 70."}, {"q": "सादृश्यता पूर्ण करें: 7 : 52 :: 9 : ?", "opts": ["82", "86", "84", "81"], "ans": 2, "exp": "नियम n² + 3: 9² + 3 = 84."}, {"q": "सादृश्यता पूर्ण करें: 7 : 53 :: 9 : ?", "opts": ["81", "87", "83", "85"], "ans": 3, "exp": "नियम n² + 4: 9² + 4 = 85."}, {"q": "सादृश्यता पूर्ण करें: 7 : 54 :: 9 : ?", "opts": ["86", "88", "84", "81"], "ans": 0, "exp": "नियम n² + 5: 9² + 5 = 86."}, {"q": "सादृश्यता पूर्ण करें: 7 : 55 :: 9 : ?", "opts": ["89", "87", "85", "81"], "ans": 1, "exp": "नियम n² + 6: 9² + 6 = 87."}, {"q": "सादृश्यता पूर्ण करें: 8 : 67 :: 10 : ?", "opts": ["101", "105", "103", "100"], "ans": 2, "exp": "नियम n² + 3: 10² + 3 = 103."}, {"q": "सादृश्यता पूर्ण करें: 8 : 68 :: 10 : ?", "opts": ["100", "106", "102", "104"], "ans": 3, "exp": "नियम n² + 4: 10² + 4 = 104."}, {"q": "सादृश्यता पूर्ण करें: 8 : 69 :: 10 : ?", "opts": ["105", "107", "103", "100"], "ans": 0, "exp": "नियम n² + 5: 10² + 5 = 105."}, {"q": "सादृश्यता पूर्ण करें: 8 : 70 :: 10 : ?", "opts": ["108", "106", "104", "100"], "ans": 1, "exp": "नियम n² + 6: 10² + 6 = 106."}, {"q": "सादृश्यता पूर्ण करें: 9 : 84 :: 11 : ?", "opts": ["122", "126", "124", "121"], "ans": 2, "exp": "नियम n² + 3: 11² + 3 = 124."}, {"q": "सादृश्यता पूर्ण करें: 9 : 85 :: 11 : ?", "opts": ["121", "127", "123", "125"], "ans": 3, "exp": "नियम n² + 4: 11² + 4 = 125."}, {"q": "सादृश्यता पूर्ण करें: 9 : 86 :: 11 : ?", "opts": ["126", "128", "124", "121"], "ans": 0, "exp": "नियम n² + 5: 11² + 5 = 126."}, {"q": "सादृश्यता पूर्ण करें: 9 : 87 :: 11 : ?", "opts": ["129", "127", "125", "121"], "ans": 1, "exp": "नियम n² + 6: 11² + 6 = 127."}, {"q": "सादृश्यता पूर्ण करें: 10 : 103 :: 12 : ?", "opts": ["145", "149", "147", "144"], "ans": 2, "exp": "नियम n² + 3: 12² + 3 = 147."}, {"q": "सादृश्यता पूर्ण करें: 10 : 104 :: 12 : ?", "opts": ["144", "150", "146", "148"], "ans": 3, "exp": "नियम n² + 4: 12² + 4 = 148."}, {"q": "सादृश्यता पूर्ण करें: 10 : 105 :: 12 : ?", "opts": ["149", "151", "147", "144"], "ans": 0, "exp": "नियम n² + 5: 12² + 5 = 149."}, {"q": "सादृश्यता पूर्ण करें: 10 : 106 :: 12 : ?", "opts": ["152", "150", "148", "144"], "ans": 1, "exp": "नियम n² + 6: 12² + 6 = 150."}, {"q": "सादृश्यता पूर्ण करें: 11 : 124 :: 13 : ?", "opts": ["170", "174", "172", "169"], "ans": 2, "exp": "नियम n² + 3: 13² + 3 = 172."}, {"q": "सादृश्यता पूर्ण करें: 11 : 125 :: 13 : ?", "opts": ["169", "175", "171", "173"], "ans": 3, "exp": "नियम n² + 4: 13² + 4 = 173."}, {"q": "सादृश्यता पूर्ण करें: 11 : 126 :: 13 : ?", "opts": ["174", "176", "172", "169"], "ans": 0, "exp": "नियम n² + 5: 13² + 5 = 174."}, {"q": "सादृश्यता पूर्ण करें: 11 : 127 :: 13 : ?", "opts": ["177", "175", "173", "169"], "ans": 1, "exp": "नियम n² + 6: 13² + 6 = 175."}, {"q": "सादृश्यता पूर्ण करें: 12 : 147 :: 14 : ?", "opts": ["197", "201", "199", "196"], "ans": 2, "exp": "नियम n² + 3: 14² + 3 = 199."}, {"q": "सादृश्यता पूर्ण करें: 12 : 148 :: 14 : ?", "opts": ["196", "202", "198", "200"], "ans": 3, "exp": "नियम n² + 4: 14² + 4 = 200."}, {"q": "सादृश्यता पूर्ण करें: 12 : 149 :: 14 : ?", "opts": ["201", "203", "199", "196"], "ans": 0, "exp": "नियम n² + 5: 14² + 5 = 201."}, {"q": "सादृश्यता पूर्ण करें: 12 : 150 :: 14 : ?", "opts": ["204", "202", "200", "196"], "ans": 1, "exp": "नियम n² + 6: 14² + 6 = 202."}, {"q": "सादृश्यता पूर्ण करें: 13 : 172 :: 15 : ?", "opts": ["226", "230", "228", "225"], "ans": 2, "exp": "नियम n² + 3: 15² + 3 = 228."}, {"q": "सादृश्यता पूर्ण करें: 13 : 173 :: 15 : ?", "opts": ["225", "231", "227", "229"], "ans": 3, "exp": "नियम n² + 4: 15² + 4 = 229."}]}, "maths_s10": {"title": "🔢 गणित (Maths) — सेट 10 (100 प्रश्न)", "questions": [{"q": "एक आयत की लंबाई 29 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["72 सेमी", "203 सेमी", "76 सेमी", "70 सेमी"], "ans": 0, "exp": "परिमाप = 2(29+7) = 72 सेमी।"}, {"q": "एक आयत की लंबाई 29 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["261 सेमी", "76 सेमी", "80 सेमी", "74 सेमी"], "ans": 1, "exp": "परिमाप = 2(29+9) = 76 सेमी।"}, {"q": "एक आयत की लंबाई 30 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["72 सेमी", "120 सेमी", "68 सेमी", "66 सेमी"], "ans": 2, "exp": "परिमाप = 2(30+4) = 68 सेमी।"}, {"q": "एक आयत की लंबाई 30 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["68 सेमी", "150 सेमी", "74 सेमी", "70 सेमी"], "ans": 3, "exp": "परिमाप = 2(30+5) = 70 सेमी।"}, {"q": "एक आयत की लंबाई 30 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["74 सेमी", "210 सेमी", "78 सेमी", "72 सेमी"], "ans": 0, "exp": "परिमाप = 2(30+7) = 74 सेमी।"}, {"q": "एक आयत की लंबाई 30 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["270 सेमी", "78 सेमी", "82 सेमी", "76 सेमी"], "ans": 1, "exp": "परिमाप = 2(30+9) = 78 सेमी।"}, {"q": "एक आयत की लंबाई 31 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["74 सेमी", "124 सेमी", "70 सेमी", "68 सेमी"], "ans": 2, "exp": "परिमाप = 2(31+4) = 70 सेमी।"}, {"q": "एक आयत की लंबाई 31 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["70 सेमी", "155 सेमी", "76 सेमी", "72 सेमी"], "ans": 3, "exp": "परिमाप = 2(31+5) = 72 सेमी।"}, {"q": "एक आयत की लंबाई 31 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["76 सेमी", "217 सेमी", "80 सेमी", "74 सेमी"], "ans": 0, "exp": "परिमाप = 2(31+7) = 76 सेमी।"}, {"q": "एक आयत की लंबाई 31 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["279 सेमी", "80 सेमी", "84 सेमी", "78 सेमी"], "ans": 1, "exp": "परिमाप = 2(31+9) = 80 सेमी।"}, {"q": "एक आयत की लंबाई 32 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["76 सेमी", "128 सेमी", "72 सेमी", "70 सेमी"], "ans": 2, "exp": "परिमाप = 2(32+4) = 72 सेमी।"}, {"q": "एक आयत की लंबाई 32 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["72 सेमी", "160 सेमी", "78 सेमी", "74 सेमी"], "ans": 3, "exp": "परिमाप = 2(32+5) = 74 सेमी।"}, {"q": "एक आयत की लंबाई 32 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["78 सेमी", "224 सेमी", "82 सेमी", "76 सेमी"], "ans": 0, "exp": "परिमाप = 2(32+7) = 78 सेमी।"}, {"q": "एक आयत की लंबाई 32 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["288 सेमी", "82 सेमी", "86 सेमी", "80 सेमी"], "ans": 1, "exp": "परिमाप = 2(32+9) = 82 सेमी।"}, {"q": "एक आयत की लंबाई 33 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["78 सेमी", "132 सेमी", "74 सेमी", "72 सेमी"], "ans": 2, "exp": "परिमाप = 2(33+4) = 74 सेमी।"}, {"q": "एक आयत की लंबाई 33 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["74 सेमी", "165 सेमी", "80 सेमी", "76 सेमी"], "ans": 3, "exp": "परिमाप = 2(33+5) = 76 सेमी।"}, {"q": "एक आयत की लंबाई 33 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["80 सेमी", "231 सेमी", "84 सेमी", "78 सेमी"], "ans": 0, "exp": "परिमाप = 2(33+7) = 80 सेमी।"}, {"q": "एक आयत की लंबाई 33 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["297 सेमी", "84 सेमी", "88 सेमी", "82 सेमी"], "ans": 1, "exp": "परिमाप = 2(33+9) = 84 सेमी।"}, {"q": "एक आयत की लंबाई 34 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["80 सेमी", "136 सेमी", "76 सेमी", "74 सेमी"], "ans": 2, "exp": "परिमाप = 2(34+4) = 76 सेमी।"}, {"q": "एक आयत की लंबाई 34 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["76 सेमी", "170 सेमी", "82 सेमी", "78 सेमी"], "ans": 3, "exp": "परिमाप = 2(34+5) = 78 सेमी।"}, {"q": "एक आयत की लंबाई 34 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["82 सेमी", "238 सेमी", "86 सेमी", "80 सेमी"], "ans": 0, "exp": "परिमाप = 2(34+7) = 82 सेमी।"}, {"q": "एक आयत की लंबाई 34 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["306 सेमी", "86 सेमी", "90 सेमी", "84 सेमी"], "ans": 1, "exp": "परिमाप = 2(34+9) = 86 सेमी।"}, {"q": "एक आयत की लंबाई 35 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["82 सेमी", "140 सेमी", "78 सेमी", "76 सेमी"], "ans": 2, "exp": "परिमाप = 2(35+4) = 78 सेमी।"}, {"q": "एक आयत की लंबाई 35 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["78 सेमी", "175 सेमी", "84 सेमी", "80 सेमी"], "ans": 3, "exp": "परिमाप = 2(35+5) = 80 सेमी।"}, {"q": "एक आयत की लंबाई 35 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["84 सेमी", "245 सेमी", "88 सेमी", "82 सेमी"], "ans": 0, "exp": "परिमाप = 2(35+7) = 84 सेमी।"}, {"q": "एक आयत की लंबाई 35 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["315 सेमी", "88 सेमी", "92 सेमी", "86 सेमी"], "ans": 1, "exp": "परिमाप = 2(35+9) = 88 सेमी।"}, {"q": "एक आयत की लंबाई 36 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["84 सेमी", "144 सेमी", "80 सेमी", "78 सेमी"], "ans": 2, "exp": "परिमाप = 2(36+4) = 80 सेमी।"}, {"q": "एक आयत की लंबाई 36 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["80 सेमी", "180 सेमी", "86 सेमी", "82 सेमी"], "ans": 3, "exp": "परिमाप = 2(36+5) = 82 सेमी।"}, {"q": "एक आयत की लंबाई 36 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["86 सेमी", "252 सेमी", "90 सेमी", "84 सेमी"], "ans": 0, "exp": "परिमाप = 2(36+7) = 86 सेमी।"}, {"q": "एक आयत की लंबाई 36 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["324 सेमी", "90 सेमी", "94 सेमी", "88 सेमी"], "ans": 1, "exp": "परिमाप = 2(36+9) = 90 सेमी।"}, {"q": "एक आयत की लंबाई 37 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["86 सेमी", "148 सेमी", "82 सेमी", "80 सेमी"], "ans": 2, "exp": "परिमाप = 2(37+4) = 82 सेमी।"}, {"q": "एक आयत की लंबाई 37 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["82 सेमी", "185 सेमी", "88 सेमी", "84 सेमी"], "ans": 3, "exp": "परिमाप = 2(37+5) = 84 सेमी।"}, {"q": "एक आयत की लंबाई 37 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["88 सेमी", "259 सेमी", "92 सेमी", "86 सेमी"], "ans": 0, "exp": "परिमाप = 2(37+7) = 88 सेमी।"}, {"q": "एक आयत की लंबाई 37 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["333 सेमी", "92 सेमी", "96 सेमी", "90 सेमी"], "ans": 1, "exp": "परिमाप = 2(37+9) = 92 सेमी।"}, {"q": "एक आयत की लंबाई 38 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["88 सेमी", "152 सेमी", "84 सेमी", "82 सेमी"], "ans": 2, "exp": "परिमाप = 2(38+4) = 84 सेमी।"}, {"q": "एक आयत की लंबाई 38 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["84 सेमी", "190 सेमी", "90 सेमी", "86 सेमी"], "ans": 3, "exp": "परिमाप = 2(38+5) = 86 सेमी।"}, {"q": "एक आयत की लंबाई 38 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["90 सेमी", "266 सेमी", "94 सेमी", "88 सेमी"], "ans": 0, "exp": "परिमाप = 2(38+7) = 90 सेमी।"}, {"q": "एक आयत की लंबाई 38 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["342 सेमी", "94 सेमी", "98 सेमी", "92 सेमी"], "ans": 1, "exp": "परिमाप = 2(38+9) = 94 सेमी।"}, {"q": "एक आयत की लंबाई 39 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["90 सेमी", "156 सेमी", "86 सेमी", "84 सेमी"], "ans": 2, "exp": "परिमाप = 2(39+4) = 86 सेमी।"}, {"q": "एक आयत की लंबाई 39 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["86 सेमी", "195 सेमी", "92 सेमी", "88 सेमी"], "ans": 3, "exp": "परिमाप = 2(39+5) = 88 सेमी।"}, {"q": "एक आयत की लंबाई 39 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["92 सेमी", "273 सेमी", "96 सेमी", "90 सेमी"], "ans": 0, "exp": "परिमाप = 2(39+7) = 92 सेमी।"}, {"q": "एक आयत की लंबाई 39 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["351 सेमी", "96 सेमी", "100 सेमी", "94 सेमी"], "ans": 1, "exp": "परिमाप = 2(39+9) = 96 सेमी।"}, {"q": "एक आयत की लंबाई 40 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["92 सेमी", "160 सेमी", "88 सेमी", "86 सेमी"], "ans": 2, "exp": "परिमाप = 2(40+4) = 88 सेमी।"}, {"q": "एक आयत की लंबाई 40 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["88 सेमी", "200 सेमी", "94 सेमी", "90 सेमी"], "ans": 3, "exp": "परिमाप = 2(40+5) = 90 सेमी।"}, {"q": "एक आयत की लंबाई 40 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["94 सेमी", "280 सेमी", "98 सेमी", "92 सेमी"], "ans": 0, "exp": "परिमाप = 2(40+7) = 94 सेमी।"}, {"q": "एक आयत की लंबाई 40 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["360 सेमी", "98 सेमी", "102 सेमी", "96 सेमी"], "ans": 1, "exp": "परिमाप = 2(40+9) = 98 सेमी।"}, {"q": "एक आयत की लंबाई 41 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["94 सेमी", "164 सेमी", "90 सेमी", "88 सेमी"], "ans": 2, "exp": "परिमाप = 2(41+4) = 90 सेमी।"}, {"q": "एक आयत की लंबाई 41 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["90 सेमी", "205 सेमी", "96 सेमी", "92 सेमी"], "ans": 3, "exp": "परिमाप = 2(41+5) = 92 सेमी।"}, {"q": "एक आयत की लंबाई 41 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["96 सेमी", "287 सेमी", "100 सेमी", "94 सेमी"], "ans": 0, "exp": "परिमाप = 2(41+7) = 96 सेमी।"}, {"q": "एक आयत की लंबाई 41 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["369 सेमी", "100 सेमी", "104 सेमी", "98 सेमी"], "ans": 1, "exp": "परिमाप = 2(41+9) = 100 सेमी।"}, {"q": "एक आयत की लंबाई 42 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["96 सेमी", "168 सेमी", "92 सेमी", "90 सेमी"], "ans": 2, "exp": "परिमाप = 2(42+4) = 92 सेमी।"}, {"q": "एक आयत की लंबाई 42 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["92 सेमी", "210 सेमी", "98 सेमी", "94 सेमी"], "ans": 3, "exp": "परिमाप = 2(42+5) = 94 सेमी।"}, {"q": "एक आयत की लंबाई 42 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["98 सेमी", "294 सेमी", "102 सेमी", "96 सेमी"], "ans": 0, "exp": "परिमाप = 2(42+7) = 98 सेमी।"}, {"q": "एक आयत की लंबाई 42 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["378 सेमी", "102 सेमी", "106 सेमी", "100 सेमी"], "ans": 1, "exp": "परिमाप = 2(42+9) = 102 सेमी।"}, {"q": "एक आयत की लंबाई 43 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["98 सेमी", "172 सेमी", "94 सेमी", "92 सेमी"], "ans": 2, "exp": "परिमाप = 2(43+4) = 94 सेमी।"}, {"q": "एक आयत की लंबाई 43 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["94 सेमी", "215 सेमी", "100 सेमी", "96 सेमी"], "ans": 3, "exp": "परिमाप = 2(43+5) = 96 सेमी।"}, {"q": "एक आयत की लंबाई 43 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["100 सेमी", "301 सेमी", "104 सेमी", "98 सेमी"], "ans": 0, "exp": "परिमाप = 2(43+7) = 100 सेमी।"}, {"q": "एक आयत की लंबाई 43 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["387 सेमी", "104 सेमी", "108 सेमी", "102 सेमी"], "ans": 1, "exp": "परिमाप = 2(43+9) = 104 सेमी।"}, {"q": "एक आयत की लंबाई 44 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["100 सेमी", "176 सेमी", "96 सेमी", "94 सेमी"], "ans": 2, "exp": "परिमाप = 2(44+4) = 96 सेमी।"}, {"q": "एक आयत की लंबाई 44 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["96 सेमी", "220 सेमी", "102 सेमी", "98 सेमी"], "ans": 3, "exp": "परिमाप = 2(44+5) = 98 सेमी।"}, {"q": "एक आयत की लंबाई 44 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["102 सेमी", "308 सेमी", "106 सेमी", "100 सेमी"], "ans": 0, "exp": "परिमाप = 2(44+7) = 102 सेमी।"}, {"q": "एक आयत की लंबाई 44 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["396 सेमी", "106 सेमी", "110 सेमी", "104 सेमी"], "ans": 1, "exp": "परिमाप = 2(44+9) = 106 सेमी।"}, {"q": "एक आयत की लंबाई 45 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["102 सेमी", "180 सेमी", "98 सेमी", "96 सेमी"], "ans": 2, "exp": "परिमाप = 2(45+4) = 98 सेमी।"}, {"q": "एक आयत की लंबाई 45 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["98 सेमी", "225 सेमी", "104 सेमी", "100 सेमी"], "ans": 3, "exp": "परिमाप = 2(45+5) = 100 सेमी।"}, {"q": "एक आयत की लंबाई 45 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["104 सेमी", "315 सेमी", "108 सेमी", "102 सेमी"], "ans": 0, "exp": "परिमाप = 2(45+7) = 104 सेमी।"}, {"q": "एक आयत की लंबाई 45 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["405 सेमी", "108 सेमी", "112 सेमी", "106 सेमी"], "ans": 1, "exp": "परिमाप = 2(45+9) = 108 सेमी।"}, {"q": "एक आयत की लंबाई 46 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["104 सेमी", "184 सेमी", "100 सेमी", "98 सेमी"], "ans": 2, "exp": "परिमाप = 2(46+4) = 100 सेमी।"}, {"q": "एक आयत की लंबाई 46 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["100 सेमी", "230 सेमी", "106 सेमी", "102 सेमी"], "ans": 3, "exp": "परिमाप = 2(46+5) = 102 सेमी।"}, {"q": "एक आयत की लंबाई 46 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["106 सेमी", "322 सेमी", "110 सेमी", "104 सेमी"], "ans": 0, "exp": "परिमाप = 2(46+7) = 106 सेमी।"}, {"q": "एक आयत की लंबाई 46 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["414 सेमी", "110 सेमी", "114 सेमी", "108 सेमी"], "ans": 1, "exp": "परिमाप = 2(46+9) = 110 सेमी।"}, {"q": "एक आयत की लंबाई 47 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["106 सेमी", "188 सेमी", "102 सेमी", "100 सेमी"], "ans": 2, "exp": "परिमाप = 2(47+4) = 102 सेमी।"}, {"q": "एक आयत की लंबाई 47 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["102 सेमी", "235 सेमी", "108 सेमी", "104 सेमी"], "ans": 3, "exp": "परिमाप = 2(47+5) = 104 सेमी।"}, {"q": "एक आयत की लंबाई 47 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["108 सेमी", "329 सेमी", "112 सेमी", "106 सेमी"], "ans": 0, "exp": "परिमाप = 2(47+7) = 108 सेमी।"}, {"q": "एक आयत की लंबाई 47 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["423 सेमी", "112 सेमी", "116 सेमी", "110 सेमी"], "ans": 1, "exp": "परिमाप = 2(47+9) = 112 सेमी।"}, {"q": "एक आयत की लंबाई 48 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["108 सेमी", "192 सेमी", "104 सेमी", "102 सेमी"], "ans": 2, "exp": "परिमाप = 2(48+4) = 104 सेमी।"}, {"q": "एक आयत की लंबाई 48 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["104 सेमी", "240 सेमी", "110 सेमी", "106 सेमी"], "ans": 3, "exp": "परिमाप = 2(48+5) = 106 सेमी।"}, {"q": "एक आयत की लंबाई 48 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["110 सेमी", "336 सेमी", "114 सेमी", "108 सेमी"], "ans": 0, "exp": "परिमाप = 2(48+7) = 110 सेमी।"}, {"q": "एक आयत की लंबाई 48 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["432 सेमी", "114 सेमी", "118 सेमी", "112 सेमी"], "ans": 1, "exp": "परिमाप = 2(48+9) = 114 सेमी।"}, {"q": "एक आयत की लंबाई 49 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["110 सेमी", "196 सेमी", "106 सेमी", "104 सेमी"], "ans": 2, "exp": "परिमाप = 2(49+4) = 106 सेमी।"}, {"q": "एक आयत की लंबाई 49 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["106 सेमी", "245 सेमी", "112 सेमी", "108 सेमी"], "ans": 3, "exp": "परिमाप = 2(49+5) = 108 सेमी।"}, {"q": "एक आयत की लंबाई 49 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["112 सेमी", "343 सेमी", "116 सेमी", "110 सेमी"], "ans": 0, "exp": "परिमाप = 2(49+7) = 112 सेमी।"}, {"q": "एक आयत की लंबाई 49 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["441 सेमी", "116 सेमी", "120 सेमी", "114 सेमी"], "ans": 1, "exp": "परिमाप = 2(49+9) = 116 सेमी।"}, {"q": "एक आयत की लंबाई 50 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["112 सेमी", "200 सेमी", "108 सेमी", "106 सेमी"], "ans": 2, "exp": "परिमाप = 2(50+4) = 108 सेमी।"}, {"q": "एक आयत की लंबाई 50 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["108 सेमी", "250 सेमी", "114 सेमी", "110 सेमी"], "ans": 3, "exp": "परिमाप = 2(50+5) = 110 सेमी।"}, {"q": "एक आयत की लंबाई 50 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["114 सेमी", "350 सेमी", "118 सेमी", "112 सेमी"], "ans": 0, "exp": "परिमाप = 2(50+7) = 114 सेमी।"}, {"q": "एक आयत की लंबाई 50 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["450 सेमी", "118 सेमी", "122 सेमी", "116 सेमी"], "ans": 1, "exp": "परिमाप = 2(50+9) = 118 सेमी।"}, {"q": "एक आयत की लंबाई 51 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["114 सेमी", "204 सेमी", "110 सेमी", "108 सेमी"], "ans": 2, "exp": "परिमाप = 2(51+4) = 110 सेमी।"}, {"q": "एक आयत की लंबाई 51 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["110 सेमी", "255 सेमी", "116 सेमी", "112 सेमी"], "ans": 3, "exp": "परिमाप = 2(51+5) = 112 सेमी।"}, {"q": "एक आयत की लंबाई 51 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["116 सेमी", "357 सेमी", "120 सेमी", "114 सेमी"], "ans": 0, "exp": "परिमाप = 2(51+7) = 116 सेमी।"}, {"q": "एक आयत की लंबाई 51 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["459 सेमी", "120 सेमी", "124 सेमी", "118 सेमी"], "ans": 1, "exp": "परिमाप = 2(51+9) = 120 सेमी।"}, {"q": "एक आयत की लंबाई 52 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["116 सेमी", "208 सेमी", "112 सेमी", "110 सेमी"], "ans": 2, "exp": "परिमाप = 2(52+4) = 112 सेमी।"}, {"q": "एक आयत की लंबाई 52 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["112 सेमी", "260 सेमी", "118 सेमी", "114 सेमी"], "ans": 3, "exp": "परिमाप = 2(52+5) = 114 सेमी।"}, {"q": "एक आयत की लंबाई 52 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["118 सेमी", "364 सेमी", "122 सेमी", "116 सेमी"], "ans": 0, "exp": "परिमाप = 2(52+7) = 118 सेमी।"}, {"q": "एक आयत की लंबाई 52 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["468 सेमी", "122 सेमी", "126 सेमी", "120 सेमी"], "ans": 1, "exp": "परिमाप = 2(52+9) = 122 सेमी।"}, {"q": "एक आयत की लंबाई 53 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["118 सेमी", "212 सेमी", "114 सेमी", "112 सेमी"], "ans": 2, "exp": "परिमाप = 2(53+4) = 114 सेमी।"}, {"q": "एक आयत की लंबाई 53 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["114 सेमी", "265 सेमी", "120 सेमी", "116 सेमी"], "ans": 3, "exp": "परिमाप = 2(53+5) = 116 सेमी।"}, {"q": "एक आयत की लंबाई 53 सेमी और चौड़ाई 7 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["120 सेमी", "371 सेमी", "124 सेमी", "118 सेमी"], "ans": 0, "exp": "परिमाप = 2(53+7) = 120 सेमी।"}, {"q": "एक आयत की लंबाई 53 सेमी और चौड़ाई 9 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["477 सेमी", "124 सेमी", "128 सेमी", "122 सेमी"], "ans": 1, "exp": "परिमाप = 2(53+9) = 124 सेमी।"}, {"q": "एक आयत की लंबाई 54 सेमी और चौड़ाई 4 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["120 सेमी", "216 सेमी", "116 सेमी", "114 सेमी"], "ans": 2, "exp": "परिमाप = 2(54+4) = 116 सेमी।"}, {"q": "एक आयत की लंबाई 54 सेमी और चौड़ाई 5 सेमी है, तो उसका परिमाप क्या होगा?", "opts": ["116 सेमी", "270 सेमी", "122 सेमी", "118 सेमी"], "ans": 3, "exp": "परिमाप = 2(54+5) = 118 सेमी।"}]}, "reasoning_s10": {"title": "🧠 तार्किक क्षमता (Reasoning) — सेट 10 (100 प्रश्न)", "questions": [{"q": "सादृश्यता पूर्ण करें: 13 : 174 :: 15 : ?", "opts": ["230", "232", "228", "225"], "ans": 0, "exp": "नियम n² + 5: 15² + 5 = 230."}, {"q": "सादृश्यता पूर्ण करें: 13 : 175 :: 15 : ?", "opts": ["233", "231", "229", "225"], "ans": 1, "exp": "नियम n² + 6: 15² + 6 = 231."}, {"q": "सादृश्यता पूर्ण करें: 14 : 199 :: 16 : ?", "opts": ["257", "261", "259", "256"], "ans": 2, "exp": "नियम n² + 3: 16² + 3 = 259."}, {"q": "सादृश्यता पूर्ण करें: 14 : 200 :: 16 : ?", "opts": ["256", "262", "258", "260"], "ans": 3, "exp": "नियम n² + 4: 16² + 4 = 260."}, {"q": "सादृश्यता पूर्ण करें: 14 : 201 :: 16 : ?", "opts": ["261", "263", "259", "256"], "ans": 0, "exp": "नियम n² + 5: 16² + 5 = 261."}, {"q": "सादृश्यता पूर्ण करें: 14 : 202 :: 16 : ?", "opts": ["264", "262", "260", "256"], "ans": 1, "exp": "नियम n² + 6: 16² + 6 = 262."}, {"q": "सादृश्यता पूर्ण करें: 15 : 228 :: 17 : ?", "opts": ["290", "294", "292", "289"], "ans": 2, "exp": "नियम n² + 3: 17² + 3 = 292."}, {"q": "सादृश्यता पूर्ण करें: 15 : 229 :: 17 : ?", "opts": ["289", "295", "291", "293"], "ans": 3, "exp": "नियम n² + 4: 17² + 4 = 293."}, {"q": "सादृश्यता पूर्ण करें: 15 : 230 :: 17 : ?", "opts": ["294", "296", "292", "289"], "ans": 0, "exp": "नियम n² + 5: 17² + 5 = 294."}, {"q": "सादृश्यता पूर्ण करें: 15 : 231 :: 17 : ?", "opts": ["297", "295", "293", "289"], "ans": 1, "exp": "नियम n² + 6: 17² + 6 = 295."}, {"q": "सादृश्यता पूर्ण करें: 16 : 259 :: 18 : ?", "opts": ["325", "329", "327", "324"], "ans": 2, "exp": "नियम n² + 3: 18² + 3 = 327."}, {"q": "सादृश्यता पूर्ण करें: 16 : 260 :: 18 : ?", "opts": ["324", "330", "326", "328"], "ans": 3, "exp": "नियम n² + 4: 18² + 4 = 328."}, {"q": "सादृश्यता पूर्ण करें: 16 : 261 :: 18 : ?", "opts": ["329", "331", "327", "324"], "ans": 0, "exp": "नियम n² + 5: 18² + 5 = 329."}, {"q": "सादृश्यता पूर्ण करें: 16 : 262 :: 18 : ?", "opts": ["332", "330", "328", "324"], "ans": 1, "exp": "नियम n² + 6: 18² + 6 = 330."}, {"q": "सादृश्यता पूर्ण करें: 17 : 292 :: 19 : ?", "opts": ["362", "366", "364", "361"], "ans": 2, "exp": "नियम n² + 3: 19² + 3 = 364."}, {"q": "सादृश्यता पूर्ण करें: 17 : 293 :: 19 : ?", "opts": ["361", "367", "363", "365"], "ans": 3, "exp": "नियम n² + 4: 19² + 4 = 365."}, {"q": "सादृश्यता पूर्ण करें: 17 : 294 :: 19 : ?", "opts": ["366", "368", "364", "361"], "ans": 0, "exp": "नियम n² + 5: 19² + 5 = 366."}, {"q": "सादृश्यता पूर्ण करें: 17 : 295 :: 19 : ?", "opts": ["369", "367", "365", "361"], "ans": 1, "exp": "नियम n² + 6: 19² + 6 = 367."}, {"q": "सादृश्यता पूर्ण करें: 18 : 327 :: 20 : ?", "opts": ["401", "405", "403", "400"], "ans": 2, "exp": "नियम n² + 3: 20² + 3 = 403."}, {"q": "सादृश्यता पूर्ण करें: 18 : 328 :: 20 : ?", "opts": ["400", "406", "402", "404"], "ans": 3, "exp": "नियम n² + 4: 20² + 4 = 404."}, {"q": "सादृश्यता पूर्ण करें: 18 : 329 :: 20 : ?", "opts": ["405", "407", "403", "400"], "ans": 0, "exp": "नियम n² + 5: 20² + 5 = 405."}, {"q": "सादृश्यता पूर्ण करें: 18 : 330 :: 20 : ?", "opts": ["408", "406", "404", "400"], "ans": 1, "exp": "नियम n² + 6: 20² + 6 = 406."}, {"q": "सादृश्यता पूर्ण करें: 19 : 364 :: 21 : ?", "opts": ["442", "446", "444", "441"], "ans": 2, "exp": "नियम n² + 3: 21² + 3 = 444."}, {"q": "सादृश्यता पूर्ण करें: 19 : 365 :: 21 : ?", "opts": ["441", "447", "443", "445"], "ans": 3, "exp": "नियम n² + 4: 21² + 4 = 445."}, {"q": "सादृश्यता पूर्ण करें: 19 : 366 :: 21 : ?", "opts": ["446", "448", "444", "441"], "ans": 0, "exp": "नियम n² + 5: 21² + 5 = 446."}, {"q": "सादृश्यता पूर्ण करें: 19 : 367 :: 21 : ?", "opts": ["449", "447", "445", "441"], "ans": 1, "exp": "नियम n² + 6: 21² + 6 = 447."}, {"q": "सादृश्यता पूर्ण करें: 20 : 403 :: 22 : ?", "opts": ["485", "489", "487", "484"], "ans": 2, "exp": "नियम n² + 3: 22² + 3 = 487."}, {"q": "सादृश्यता पूर्ण करें: 20 : 404 :: 22 : ?", "opts": ["484", "490", "486", "488"], "ans": 3, "exp": "नियम n² + 4: 22² + 4 = 488."}, {"q": "सादृश्यता पूर्ण करें: 20 : 405 :: 22 : ?", "opts": ["489", "491", "487", "484"], "ans": 0, "exp": "नियम n² + 5: 22² + 5 = 489."}, {"q": "सादृश्यता पूर्ण करें: 20 : 406 :: 22 : ?", "opts": ["492", "490", "488", "484"], "ans": 1, "exp": "नियम n² + 6: 22² + 6 = 490."}, {"q": "सादृश्यता पूर्ण करें: 21 : 444 :: 23 : ?", "opts": ["530", "534", "532", "529"], "ans": 2, "exp": "नियम n² + 3: 23² + 3 = 532."}, {"q": "सादृश्यता पूर्ण करें: 21 : 445 :: 23 : ?", "opts": ["529", "535", "531", "533"], "ans": 3, "exp": "नियम n² + 4: 23² + 4 = 533."}, {"q": "सादृश्यता पूर्ण करें: 21 : 446 :: 23 : ?", "opts": ["534", "536", "532", "529"], "ans": 0, "exp": "नियम n² + 5: 23² + 5 = 534."}, {"q": "सादृश्यता पूर्ण करें: 21 : 447 :: 23 : ?", "opts": ["537", "535", "533", "529"], "ans": 1, "exp": "नियम n² + 6: 23² + 6 = 535."}, {"q": "सादृश्यता पूर्ण करें: 22 : 487 :: 24 : ?", "opts": ["577", "581", "579", "576"], "ans": 2, "exp": "नियम n² + 3: 24² + 3 = 579."}, {"q": "सादृश्यता पूर्ण करें: 22 : 488 :: 24 : ?", "opts": ["576", "582", "578", "580"], "ans": 3, "exp": "नियम n² + 4: 24² + 4 = 580."}, {"q": "सादृश्यता पूर्ण करें: 22 : 489 :: 24 : ?", "opts": ["581", "583", "579", "576"], "ans": 0, "exp": "नियम n² + 5: 24² + 5 = 581."}, {"q": "सादृश्यता पूर्ण करें: 22 : 490 :: 24 : ?", "opts": ["584", "582", "580", "576"], "ans": 1, "exp": "नियम n² + 6: 24² + 6 = 582."}, {"q": "सादृश्यता पूर्ण करें: 23 : 532 :: 25 : ?", "opts": ["626", "630", "628", "625"], "ans": 2, "exp": "नियम n² + 3: 25² + 3 = 628."}, {"q": "सादृश्यता पूर्ण करें: 23 : 533 :: 25 : ?", "opts": ["625", "631", "627", "629"], "ans": 3, "exp": "नियम n² + 4: 25² + 4 = 629."}, {"q": "सादृश्यता पूर्ण करें: 23 : 534 :: 25 : ?", "opts": ["630", "632", "628", "625"], "ans": 0, "exp": "नियम n² + 5: 25² + 5 = 630."}, {"q": "सादृश्यता पूर्ण करें: 23 : 535 :: 25 : ?", "opts": ["633", "631", "629", "625"], "ans": 1, "exp": "नियम n² + 6: 25² + 6 = 631."}, {"q": "सादृश्यता पूर्ण करें: 24 : 579 :: 26 : ?", "opts": ["677", "681", "679", "676"], "ans": 2, "exp": "नियम n² + 3: 26² + 3 = 679."}, {"q": "सादृश्यता पूर्ण करें: 24 : 580 :: 26 : ?", "opts": ["676", "682", "678", "680"], "ans": 3, "exp": "नियम n² + 4: 26² + 4 = 680."}, {"q": "सादृश्यता पूर्ण करें: 24 : 581 :: 26 : ?", "opts": ["681", "683", "679", "676"], "ans": 0, "exp": "नियम n² + 5: 26² + 5 = 681."}, {"q": "सादृश्यता पूर्ण करें: 24 : 582 :: 26 : ?", "opts": ["684", "682", "680", "676"], "ans": 1, "exp": "नियम n² + 6: 26² + 6 = 682."}, {"q": "सादृश्यता पूर्ण करें: 25 : 628 :: 27 : ?", "opts": ["730", "734", "732", "729"], "ans": 2, "exp": "नियम n² + 3: 27² + 3 = 732."}, {"q": "सादृश्यता पूर्ण करें: 25 : 629 :: 27 : ?", "opts": ["729", "735", "731", "733"], "ans": 3, "exp": "नियम n² + 4: 27² + 4 = 733."}, {"q": "सादृश्यता पूर्ण करें: 25 : 630 :: 27 : ?", "opts": ["734", "736", "732", "729"], "ans": 0, "exp": "नियम n² + 5: 27² + 5 = 734."}, {"q": "सादृश्यता पूर्ण करें: 25 : 631 :: 27 : ?", "opts": ["737", "735", "733", "729"], "ans": 1, "exp": "नियम n² + 6: 27² + 6 = 735."}, {"q": "सादृश्यता पूर्ण करें: 26 : 679 :: 28 : ?", "opts": ["785", "789", "787", "784"], "ans": 2, "exp": "नियम n² + 3: 28² + 3 = 787."}, {"q": "सादृश्यता पूर्ण करें: 26 : 680 :: 28 : ?", "opts": ["784", "790", "786", "788"], "ans": 3, "exp": "नियम n² + 4: 28² + 4 = 788."}, {"q": "सादृश्यता पूर्ण करें: 26 : 681 :: 28 : ?", "opts": ["789", "791", "787", "784"], "ans": 0, "exp": "नियम n² + 5: 28² + 5 = 789."}, {"q": "सादृश्यता पूर्ण करें: 26 : 682 :: 28 : ?", "opts": ["792", "790", "788", "784"], "ans": 1, "exp": "नियम n² + 6: 28² + 6 = 790."}, {"q": "सादृश्यता पूर्ण करें: 27 : 732 :: 29 : ?", "opts": ["842", "846", "844", "841"], "ans": 2, "exp": "नियम n² + 3: 29² + 3 = 844."}, {"q": "सादृश्यता पूर्ण करें: 27 : 733 :: 29 : ?", "opts": ["841", "847", "843", "845"], "ans": 3, "exp": "नियम n² + 4: 29² + 4 = 845."}, {"q": "सादृश्यता पूर्ण करें: 27 : 734 :: 29 : ?", "opts": ["846", "848", "844", "841"], "ans": 0, "exp": "नियम n² + 5: 29² + 5 = 846."}, {"q": "सादृश्यता पूर्ण करें: 27 : 735 :: 29 : ?", "opts": ["849", "847", "845", "841"], "ans": 1, "exp": "नियम n² + 6: 29² + 6 = 847."}, {"q": "सादृश्यता पूर्ण करें: 28 : 787 :: 30 : ?", "opts": ["901", "905", "903", "900"], "ans": 2, "exp": "नियम n² + 3: 30² + 3 = 903."}, {"q": "सादृश्यता पूर्ण करें: 28 : 788 :: 30 : ?", "opts": ["900", "906", "902", "904"], "ans": 3, "exp": "नियम n² + 4: 30² + 4 = 904."}, {"q": "सादृश्यता पूर्ण करें: 28 : 789 :: 30 : ?", "opts": ["905", "907", "903", "900"], "ans": 0, "exp": "नियम n² + 5: 30² + 5 = 905."}, {"q": "सादृश्यता पूर्ण करें: 28 : 790 :: 30 : ?", "opts": ["908", "906", "904", "900"], "ans": 1, "exp": "नियम n² + 6: 30² + 6 = 906."}, {"q": "सादृश्यता पूर्ण करें: 29 : 844 :: 31 : ?", "opts": ["962", "966", "964", "961"], "ans": 2, "exp": "नियम n² + 3: 31² + 3 = 964."}, {"q": "सादृश्यता पूर्ण करें: 29 : 845 :: 31 : ?", "opts": ["961", "967", "963", "965"], "ans": 3, "exp": "नियम n² + 4: 31² + 4 = 965."}, {"q": "सादृश्यता पूर्ण करें: 29 : 846 :: 31 : ?", "opts": ["966", "968", "964", "961"], "ans": 0, "exp": "नियम n² + 5: 31² + 5 = 966."}, {"q": "सादृश्यता पूर्ण करें: 29 : 847 :: 31 : ?", "opts": ["969", "967", "965", "961"], "ans": 1, "exp": "नियम n² + 6: 31² + 6 = 967."}, {"q": "सादृश्यता पूर्ण करें: 30 : 903 :: 32 : ?", "opts": ["1025", "1029", "1027", "1024"], "ans": 2, "exp": "नियम n² + 3: 32² + 3 = 1027."}, {"q": "सादृश्यता पूर्ण करें: 30 : 904 :: 32 : ?", "opts": ["1024", "1030", "1026", "1028"], "ans": 3, "exp": "नियम n² + 4: 32² + 4 = 1028."}, {"q": "सादृश्यता पूर्ण करें: 30 : 905 :: 32 : ?", "opts": ["1029", "1031", "1027", "1024"], "ans": 0, "exp": "नियम n² + 5: 32² + 5 = 1029."}, {"q": "सादृश्यता पूर्ण करें: 30 : 906 :: 32 : ?", "opts": ["1032", "1030", "1028", "1024"], "ans": 1, "exp": "नियम n² + 6: 32² + 6 = 1030."}, {"q": "सादृश्यता पूर्ण करें: 31 : 964 :: 33 : ?", "opts": ["1090", "1094", "1092", "1089"], "ans": 2, "exp": "नियम n² + 3: 33² + 3 = 1092."}, {"q": "सादृश्यता पूर्ण करें: 31 : 965 :: 33 : ?", "opts": ["1089", "1095", "1091", "1093"], "ans": 3, "exp": "नियम n² + 4: 33² + 4 = 1093."}, {"q": "सादृश्यता पूर्ण करें: 31 : 966 :: 33 : ?", "opts": ["1094", "1096", "1092", "1089"], "ans": 0, "exp": "नियम n² + 5: 33² + 5 = 1094."}, {"q": "सादृश्यता पूर्ण करें: 31 : 967 :: 33 : ?", "opts": ["1097", "1095", "1093", "1089"], "ans": 1, "exp": "नियम n² + 6: 33² + 6 = 1095."}, {"q": "यदि किसी सांकेतिक भाषा में 'BOOK' को 'CPPL' लिखा जाता है, तो 'TREE' को क्या लिखा जाएगा?", "opts": ["ZXKK", "VTGG", "USFF", "FFSU"], "ans": 2, "exp": "प्रत्येक अक्षर को +1 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'BOOK' को 'DQQM' लिखा जाता है, तो 'TREE' को क्या लिखा जाएगा?", "opts": ["GGTV", "WUHH", "USFF", "VTGG"], "ans": 3, "exp": "प्रत्येक अक्षर को +2 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'BOOK' को 'ERRN' लिखा जाता है, तो 'TREE' को क्या लिखा जाएगा?", "opts": ["WUHH", "XVII", "VTGG", "HHUW"], "ans": 0, "exp": "प्रत्येक अक्षर को +3 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'BOOK' को 'FSSO' लिखा जाता है, तो 'TREE' को क्या लिखा जाएगा?", "opts": ["YWJJ", "XVII", "WUHH", "IIVX"], "ans": 1, "exp": "प्रत्येक अक्षर को +4 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'BOOK' को 'GTTP' लिखा जाता है, तो 'TREE' को क्या लिखा जाएगा?", "opts": ["XVII", "ZXKK", "YWJJ", "JJWY"], "ans": 2, "exp": "प्रत्येक अक्षर को +5 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'HAND' को 'IBOE' लिखा जाता है, तो 'BIRD' को क्या लिखा जाएगा?", "opts": ["ESJC", "DKTF", "HOXJ", "CJSE"], "ans": 3, "exp": "प्रत्येक अक्षर को +1 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'HAND' को 'JCPF' लिखा जाता है, तो 'BIRD' को क्या लिखा जाएगा?", "opts": ["DKTF", "ELUG", "CJSE", "FTKD"], "ans": 0, "exp": "प्रत्येक अक्षर को +2 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'HAND' को 'KDQG' लिखा जाता है, तो 'BIRD' को क्या लिखा जाएगा?", "opts": ["FMVH", "ELUG", "DKTF", "GULE"], "ans": 1, "exp": "प्रत्येक अक्षर को +3 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'HAND' को 'LERH' लिखा जाता है, तो 'BIRD' को क्या लिखा जाएगा?", "opts": ["ELUG", "GNWI", "FMVH", "HVMF"], "ans": 2, "exp": "प्रत्येक अक्षर को +4 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'HAND' को 'MFSI' लिखा जाता है, तो 'BIRD' को क्या लिखा जाएगा?", "opts": ["IWNG", "HOXJ", "FMVH", "GNWI"], "ans": 3, "exp": "प्रत्येक अक्षर को +5 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'MIND' को 'NJOE' लिखा जाता है, तो 'FISH' को क्या लिखा जाएगा?", "opts": ["GJTI", "HKUJ", "LOYN", "ITJG"], "ans": 0, "exp": "प्रत्येक अक्षर को +1 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'MIND' को 'OKPF' लिखा जाता है, तो 'FISH' को क्या लिखा जाएगा?", "opts": ["ILVK", "HKUJ", "GJTI", "JUKH"], "ans": 1, "exp": "प्रत्येक अक्षर को +2 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'MIND' को 'PLQG' लिखा जाता है, तो 'FISH' को क्या लिखा जाएगा?", "opts": ["HKUJ", "JMWL", "ILVK", "KVLI"], "ans": 2, "exp": "प्रत्येक अक्षर को +3 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'MIND' को 'QMRH' लिखा जाता है, तो 'FISH' को क्या लिखा जाएगा?", "opts": ["LWMJ", "KNXM", "ILVK", "JMWL"], "ans": 3, "exp": "प्रत्येक अक्षर को +4 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'MIND' को 'RNSI' लिखा जाता है, तो 'FISH' को क्या लिखा जाएगा?", "opts": ["KNXM", "LOYN", "JMWL", "MXNK"], "ans": 0, "exp": "प्रत्येक अक्षर को +5 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'ROAD' को 'SPBE' लिखा जाता है, तो 'LAMP' को क्या लिखा जाएगा?", "opts": ["NCOR", "MBNQ", "RGSV", "QNBM"], "ans": 1, "exp": "प्रत्येक अक्षर को +1 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'ROAD' को 'TQCF' लिखा जाता है, तो 'LAMP' को क्या लिखा जाएगा?", "opts": ["MBNQ", "ODPS", "NCOR", "ROCN"], "ans": 2, "exp": "प्रत्येक अक्षर को +2 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'ROAD' को 'URDG' लिखा जाता है, तो 'LAMP' को क्या लिखा जाएगा?", "opts": ["SPDO", "PEQT", "NCOR", "ODPS"], "ans": 3, "exp": "प्रत्येक अक्षर को +3 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'ROAD' को 'VSEH' लिखा जाता है, तो 'LAMP' को क्या लिखा जाएगा?", "opts": ["PEQT", "QFRU", "ODPS", "TQEP"], "ans": 0, "exp": "प्रत्येक अक्षर को +4 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'ROAD' को 'WTFI' लिखा जाता है, तो 'LAMP' को क्या लिखा जाएगा?", "opts": ["RGSV", "QFRU", "PEQT", "URFQ"], "ans": 1, "exp": "प्रत्येक अक्षर को +5 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'STAR' को 'TUBS' लिखा जाता है, तो 'DESK' को क्या लिखा जाएगा?", "opts": ["JKYQ", "FGUM", "EFTL", "LTFE"], "ans": 2, "exp": "प्रत्येक अक्षर को +1 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'STAR' को 'UVCT' लिखा जाता है, तो 'DESK' को क्या लिखा जाएगा?", "opts": ["MUGF", "GHVN", "EFTL", "FGUM"], "ans": 3, "exp": "प्रत्येक अक्षर को +2 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'STAR' को 'VWDU' लिखा जाता है, तो 'DESK' को क्या लिखा जाएगा?", "opts": ["GHVN", "HIWO", "FGUM", "NVHG"], "ans": 0, "exp": "प्रत्येक अक्षर को +3 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'STAR' को 'WXEV' लिखा जाता है, तो 'DESK' को क्या लिखा जाएगा?", "opts": ["IJXP", "HIWO", "GHVN", "OWIH"], "ans": 1, "exp": "प्रत्येक अक्षर को +4 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'STAR' को 'XYFW' लिखा जाता है, तो 'DESK' को क्या लिखा जाएगा?", "opts": ["HIWO", "JKYQ", "IJXP", "PXJI"], "ans": 2, "exp": "प्रत्येक अक्षर को +5 आगे बढ़ाया गया है।"}, {"q": "यदि किसी सांकेतिक भाषा में 'GOLD' को 'HPME' लिखा जाता है, तो 'KING' को क्या लिखा जाएगा?", "opts": ["HOJL", "MKPI", "QOTM", "LJOH"], "ans": 3, "exp": "प्रत्येक अक्षर को +1 आगे बढ़ाया गया है।"}]}};

let activeTestKey = null;
let activeTestIdx = 0;
let activeTestAnswers = [];
let activeTestTimer = null;
let activeTestSecondsLeft = 1200;

function startMockTest(catKey) {
    const testObj = MOCK_TEST_BANK[catKey];
    if (!testObj) return;

    activeTestKey = catKey;
    activeTestIdx = 0;
    activeTestAnswers = new Array(testObj.questions.length).fill(null);
    activeTestSecondsLeft = testObj.questions.length * 60;

    if ($("testMenuArea")) $("testMenuArea").style.display = "none";
    if ($("testResultArea")) $("testResultArea").style.display = "none";
    if ($("testQuizArea")) $("testQuizArea").style.display = "block";
    text("quizTitleText", testObj.title);

    clearInterval(activeTestTimer);
    updateQuizTimerDisplay();
    activeTestTimer = setInterval(() => {
        activeTestSecondsLeft--;
        updateQuizTimerDisplay();
        if (activeTestSecondsLeft <= 0) {
            clearInterval(activeTestTimer);
            toast("⏱️ समय समाप्त! आपका टेस्ट स्वतः सबमिट हो रहा है।", "info");
            submitMockTest();
        }
    }, 1000);

    renderQuizQuestion();
}
window.startMockTest = startMockTest;

function updateQuizTimerDisplay() {
    const m = Math.floor(Math.max(0, activeTestSecondsLeft) / 60);
    const s = Math.max(0, activeTestSecondsLeft) % 60;
    text("quizTimerText", `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
}

function renderQuizQuestion() {
    const testObj = MOCK_TEST_BANK[activeTestKey];
    if (!testObj) return;
    const total = testObj.questions.length;
    const qObj = testObj.questions[activeTestIdx];

    text("quizCounterText", `प्रश्न ${activeTestIdx + 1} / ${total}`);
    if ($("quizProgressFill")) {
        $("quizProgressFill").style.width = `${((activeTestIdx + 1) / total) * 100}%`;
    }
    text("quizQuestionText", `Q${activeTestIdx + 1}. ${qObj.q}`);

    const letters = ["A", "B", "C", "D"];
    const wrap = $("quizOptionsWrap");
    if (wrap) {
        wrap.innerHTML = qObj.opts.map((optText, i) => {
            const isSel = activeTestAnswers[activeTestIdx] === i;
            return `
                <button type="button" class="test-opt-btn ${isSel ? "selected" : ""}" onclick="selectTestOption(${i})">
                    <span class="test-opt-letter">${letters[i]}</span>
                    <span>${escapeHTML(optText)}</span>
                </button>
            `;
        }).join("");
    }

    if ($("quizPrevBtn")) $("quizPrevBtn").disabled = activeTestIdx === 0;
    if ($("quizNextBtn")) $("quizNextBtn").style.display = activeTestIdx < total - 1 ? "inline-flex" : "none";
    if ($("quizSubmitBtn")) $("quizSubmitBtn").style.display = activeTestIdx === total - 1 ? "inline-flex" : "none";

    const pal = $("quizPaletteGrid");
    if (pal) {
        pal.innerHTML = testObj.questions.map((_, i) => {
            const cls = i === activeTestIdx ? "current" : (activeTestAnswers[i] !== null ? "answered" : "");
            return `<button type="button" class="quiz-q-dot ${cls}" onclick="jumpToTestQuestion(${i})">${i + 1}</button>`;
        }).join("");
    }
}

function jumpToTestQuestion(idx) {
    const testObj = MOCK_TEST_BANK[activeTestKey];
    if (testObj && idx >= 0 && idx < testObj.questions.length) {
        activeTestIdx = idx;
        renderQuizQuestion();
    }
}
window.jumpToTestQuestion = jumpToTestQuestion;

function selectTestOption(optIdx) {
    activeTestAnswers[activeTestIdx] = optIdx;
    renderQuizQuestion();
}
window.selectTestOption = selectTestOption;

function prevTestQuestion() {
    if (activeTestIdx > 0) {
        activeTestIdx--;
        renderQuizQuestion();
    }
}
window.prevTestQuestion = prevTestQuestion;

function nextTestQuestion() {
    const testObj = MOCK_TEST_BANK[activeTestKey];
    if (testObj && activeTestIdx < testObj.questions.length - 1) {
        activeTestIdx++;
        renderQuizQuestion();
    }
}
window.nextTestQuestion = nextTestQuestion;

function submitMockTest() {
    clearInterval(activeTestTimer);
    const testObj = MOCK_TEST_BANK[activeTestKey];
    if (!testObj) return;

    let score = 0;
    const total = testObj.questions.length;
    const letters = ["A", "B", "C", "D"];

    const reviewHTML = testObj.questions.map((qObj, idx) => {
        const userAns = activeTestAnswers[idx];
        const isCorrect = userAns === qObj.ans;
        if (isCorrect) score++;

        return `
            <div class="test-review-item ${isCorrect ? "correct" : "wrong"}">
                <div style="font-weight:800; font-size:13px; color:#0f172a; margin-bottom:4px;">
                    Q${idx + 1}. ${escapeHTML(qObj.q)}
                </div>
                <div style="font-size:12px; margin-bottom:3px;">
                    <b>आपका उत्तर:</b> ${userAns !== null ? `${letters[userAns]}. ${escapeHTML(qObj.opts[userAns])}` : "अनुत्तरित (Skipped)"}
                    ${isCorrect ? " ✅" : " ❌"}
                </div>
                ${!isCorrect ? `<div style="font-size:12px; color:#15803d; font-weight:700; margin-bottom:3px;">सही उत्तर: ${letters[qObj.ans]}. ${escapeHTML(qObj.opts[qObj.ans])}</div>` : ""}
                <div style="font-size:11.5px; color:#475569; margin-top:4px;">💡 ${escapeHTML(qObj.exp)}</div>
            </div>
        `;
    }).join("");

    const pct = Math.round((score / total) * 100);
    let remark = "अच्छा प्रयास! नियमित अभ्यास जारी रखें।";
    if (pct >= 80) remark = "🏆 उत्कृष्ट प्रदर्शन! आपकी तैयारी शानदार है।";
    else if (pct >= 50) remark = "👍 बढ़िया! थोड़ा और रिवीजन आपको टॉप पर ले जाएगा।";

    if ($("testQuizArea")) $("testQuizArea").style.display = "none";
    if ($("testResultArea")) $("testResultArea").style.display = "block";

    text("resQuizTitle", testObj.title);
    text("resScoreText", `${score} / ${total}`);
    text("resPercentText", `प्राप्तांक: ${pct}%`);
    text("resRemarkText", remark);
    if ($("resReviewList")) $("resReviewList").innerHTML = reviewHTML;

    // Save score in localStorage
    try {
        const key = "vidya_test_history_" + (currentUser?.phoneNumber || "guest");
        const hist = JSON.parse(localStorage.getItem(key) || "[]");
        hist.unshift({
            title: testObj.title,
            score,
            total,
            pct,
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        });
        localStorage.setItem(key, JSON.stringify(hist.slice(0, 10)));
    } catch (e) {}

    window.scrollTo({ top: 0, behavior: "smooth" });
}
window.submitMockTest = submitMockTest;

function retakeCurrentTest() {
    if (activeTestKey) startMockTest(activeTestKey);
}
window.retakeCurrentTest = retakeCurrentTest;

function backToTestMenu() {
    clearInterval(activeTestTimer);
    if ($("testQuizArea")) $("testQuizArea").style.display = "none";
    if ($("testResultArea")) $("testResultArea").style.display = "none";
    if ($("testMenuArea")) $("testMenuArea").style.display = "block";
    renderTestHistory();
}
window.backToTestMenu = backToTestMenu;

function renderTestHistory() {
    const box = $("testHistoryBox");
    if (!box) return;
    try {
        const key = "vidya_test_history_" + (currentUser?.phoneNumber || "guest");
        const hist = JSON.parse(localStorage.getItem(key) || "[]");
        if (!hist.length) {
            box.innerHTML = `<div class="empty" style="padding:12px;">आपने अभी तक कोई टेस्ट नहीं दिया है। ऊपर से कोई भी विषय चुनकर टेस्ट शुरू करें!</div>`;
            return;
        }
        box.innerHTML = hist.map(h => `
            <div class="summary-row" style="padding:8px 0; border-bottom:1px dashed #e2e8f0;">
                <div>
                    <strong style="font-size:13px; color:var(--navy); display:block;">${escapeHTML(h.title)}</strong>
                    <small class="muted">${escapeHTML(h.date)}</small>
                </div>
                <strong style="color:#15803d; font-size:14px;">${h.score}/${h.total} (${h.pct}%)</strong>
            </div>
        `).join("");
    } catch (e) {}
}
window.renderTestHistory = renderTestHistory;
