# Vidya Library Rajnandgaon – The Study Zone

**Official Website & Student Portal:** [www.vidyalibraryrjn.com](https://www.vidyalibraryrjn.com)

---

## 👤 Ownership & Development Credits
- **Owner / Director (संचालक / मालिक):** **Shekhar Vinayak (शेखर विनायक)**
- **Developer (डेवलपर):** **Chudamani (चूड़ामणि)**
- **Official Contacts:** `9111701828`, `7000545675`
- **Admin Email:** `vidyalibrary005@gmail.com`

---

## 📍 Library Full Address & Timings
- **Address:** 1st Floor, Near Digvijay College, Front of Durga Mandir, Shiv Towar, Rajnandgaon (C.G.) - 491441
- **Opening Hours (समय):** **24/7 Open (दिन-रात 24 घंटे खुला)**

---

## 🗄️ Database & Technical Architecture
- **Database:** **Google Firebase Realtime Database** (`vidya-library-7aeb7-default-rtdb.firebaseio.com`, Firebase Web SDK v13.1.0)
- **Live Sync:** Real-time synchronization between the **Student Website** (`vidya_library`) and the **Vidya Library Malik App** (Web PWA & Android APK).
  - `users/{phone}` — Student KYC profile (Name, Mobile, 12-digit Aadhaar, Selfie Photo, Password, Deposit Status, Bookings)
  - `bookingRequests/{bookingId}` — Online UPI/UTR & Counter bookings with live approval status
  - `public/availability/{seats,lockers}` — Real-time 80 Seats & 24 Lockers floor map status
  - `public/counters/receiptCounter` — Sequential receipt numbering
  - `complaints` — Student Helpdesk & issue tracking
  - `bookIssues` — 58-Book Free Reading Register

---

## 🏛️ About Vidya Library – Facilities & Features
1. **80 AC Study Cabins & 24 Personal Lockers:** Quiet, disciplined self-study environment with live seat & locker selection map.
2. **Essential Amenities:** High-speed Wi-Fi, RO drinking water, CCTV surveillance, comfortable seating, and 24/7 power & study access.
3. **Membership Plans & Security Deposit:**
   - Flexible plans: **1 Month (30 Days)**, **2 Months (60 Days)**, **3 Months (90 Days)**, and **4+2 Month Offer (6 Months / 180 Days)**.
   - **₹300 One-Time Refundable Security Deposit** (charged only on the first booking; `₹0` on renewals while active).
4. **Student Self-Registration & Security (KYC):**
   - Students register directly using **Full Name, 10-digit Mobile Number, 12-digit Aadhaar Card Number, Live Selfie/Photo Upload, and Strong Password**.
5. **Online Payment & Half-A4 PDF Receipts:**
   - UPI / QR payment with UTR submission, instant PDF receipt download (`html2pdf.js`), WhatsApp receipt sharing, and systematic **Half-A4 print slip** (2 receipts per A4 page) with official circular seal.
6. **Free Competitive Exam Mock Test Series (`📝 टेस्ट`):**
   - Online Hindi mock tests with countdown timer, question palette, and result analysis across **7 subjects**: CG GK, Indian GK, Maths, Reasoning, Hindi, English, and Computer.
7. **58-Book Library Catalog & Student Helpdesk:**
   - Searchable 58-book competitive exam catalog and direct Helpdesk/WhatsApp support.

---

## 🚀 How to Publish on GitHub Pages (1-Click Guide)
1. Push all files in this repository (or extract `vidya_library.zip` and commit to your repository's `main` branch).
2. Go to your repository **Settings** -> **Pages**.
3. Under **Branch**, select `main` (root `/`) and click **Save**.
4. The `.nojekyll` file included in this repository automatically disables Jekyll so all HTML, CSS, JavaScript, and image assets load cleanly without broken links.
5. Your website will be live at `https://<your-username>.github.io/<your-repo>/`.

## 🚀 How to Publish on Netlify
1. Log into your Netlify account.
2. Go to **Deploys** or **Add new site** -> **Deploy manually**.
3. Drag and drop this extracted folder (or the `vidya_library.zip` file).
4. The website will be instantly live with all real photos, Firebase sync, and navigation active!
