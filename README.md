# 🚴 CycleAway

**CycleAway** is a full-featured cycle rental web application built from the ground up to simulate a real-world rental platform. It includes real-time booking logic, role-based dashboards, Stripe test-mode payments, location autocomplete via open-source APIs, and print support — all designed as part of a personal full-stack learning project.

---

## 🔧 Tech Stack

- **Frontend:** React, Vite, JavaScript
- **Styling:** Tailwind CSS, DaisyUI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Payments:** Stripe Integration (Sandbox/Test Mode)
- **APIs:** OpenStreetMap (maps & address autocomplete)
- **Deployment:** Vercel & Netlify
- **Version Control:** Git + GitHub

---

## 👥 Roles & Key Features

### 🔹 Customers

- Search cycles by location, date, and type
- View cycle availability and details
- Book cycles with optional accessories (helmet, GPS, lock, etc.)
- Manage and print bookings (edit, cancel, check-in/out)
- Address autocomplete for streamlined search

### 🔹 Employees

- Role-aware login and dashboard
- View and filter all bookings (confirmed → active → complete)
- Full CRUD: cycles, locations, accessories
- Manage cycle availability and images
- Print booking views for internal use

---

## 🧱 App Structure

- **Layouts:** Role-based (`PublicLayout`, `CustomerLayout`, etc.)
- **Pages:** Homepage, Booking Flow, Manage Bookings, Dashboard, Auth, FAQ, etc.
- **Components:** Navbar, CycleCard, SearchBar, BookingSummary, DashboardTable, PrintButton, Toasts

---

## ✅ Highlights

- 🔐 Supabase Auth with secure role-based routing
- 📍 Address autocomplete + map markers using OpenStreetMap
- 💳 Stripe payment integration (test mode)
- 🖨️ Booking pages printable (customer and employee)
- 🧰 Full-featured admin dashboard
- 📱 Responsive design across all devices
- 🔁 Versioned and deployed using GitHub + Vercel

---

## 🚀 Getting Started

1. **Clone the repo**  
   `git clone https://github.com/your-username/cycleaway.git`

2. **Install dependencies**  
   `yarn`

3. **Add environment variables**  
   Create a `.env` file with your Supabase keys and Stripe test key

4. **Run the app**  
   `yarn dev`

---

## 📌 Status

CycleAway is feature-complete and fully deployed. It serves as a comprehensive showcase of full-stack development, component design, API integration, database security, and real-world UI/UX.

---
