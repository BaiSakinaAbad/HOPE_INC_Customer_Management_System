
# Bitelog | Customer Management System

**Bitelog** is a high-performance, secure Customer Management System (CMS) designed to provide actionable insights through data logging and visualization. Built with a modern tech stack, it ensures seamless customer tracking, audit transparency, and role-based access control.

Live app here: [hope-inc-customer-management-system.vercel.app](https://hope-inc-customer-management-system.vercel.app/)

---

## Academic Context

This project was developed by **3rd Year Computer Science students** from **New Era University**. It serves as a major requirement, demonstrating proficiency in full-stack development, database architecture, and secure software engineering practices.


### The Team SaaSy

* **[M1: Sakina (@BaiSakinaAbad)](https://github.com/BaiSakinaAbad)** – Project Lead & Full Stack Developer
* **[M2: Saira (@sairarat)](https://github.com/sairarat)** – UI/UX Design & Branding
* **[M3: Peja (@PejaLattrell)](https://github.com/PejaLattrell)** – Database Architecture & Logic
* **[M4: Vinz (@solanov)](https://github.com/solanov)** – Authentication & Session Management 
* **[M5: Klyne (@KlyneZyro)](https://github.com/KlyneZyro)** – Quality Assurance & Documentation

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Tailored dashboards for `SUPERADMIN`, `ADMIN`, and `USER` roles.
* **Interactive Analytics:** Real-time data visualization using dynamic charts for revenue and transaction tracking.
* **Secure Authentication:** Powered by Supabase Auth with custom session timeouts and inactivity auto-logout (60-minute limit).
* **Audit Logging:** Full transparency with a dedicated system to track data changes and user actions.
* **Responsive Design:** A fully adaptive UI built with React and Tailwind CSS.

---

## 🛠️ Setup and Installation

Follow these steps to set up your local development environment.

### 1. Clone the Repository

```bash
git clone https://github.com/BaiSakinaAbad/HOPE_INC_Customer_Management_System.git
cd hopecms

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```

> **Note:** Please coordinate with **M3 (Peja)** or **M4 (Vinz)** to obtain the necessary API keys.

### 4. Run the Project

```bash
npm run dev

```

The application will be available at `http://localhost:5173`.

### 5. Run Tests

To ensure system stability, execute the test suite:

```bash
npm run test

```

---

## 💻 Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend/Database:** Supabase (PostgreSQL)
* **State Management:** React Hooks / Context API
* **Deployment:** Vercel

---

## 📄 License

This project is for academic purposes. All rights reserved by the development team and New Era University, 2026.

---

**Bitelog** — *Transforming bytes of data into bite-sized insights.*