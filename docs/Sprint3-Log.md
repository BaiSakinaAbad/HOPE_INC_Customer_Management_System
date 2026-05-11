# Sprint 3 Official Log: [TITLE PENDING]
**Dates:** May 1, 2026 – May 10, 2026  
**Status:** Completed

---

## 1. Sprint Overview
Sprint 3 was the final sprint of the HOPE, INC. Customer Management System project. The focus was on completing the customer analytics module, implementing session management and security hardening, resolving all outstanding authentication and data-fetching bugs, refining the dashboard UI, and delivering all final project deliverables — including the user manual, end-to-end production test report, and the final defense presentation slides. The sprint concluded with the production release deployed to Vercel.

---

## 2. Team Contributions

| Member | Role | Primary Deliverables (Based on Standups) |
| :--- | :--- | :--- |
| **Sakina** | M1 (Lead) | Fixed routing bugs, restricted dashboards to superadmins, built customer analytics module, implemented session limits and auto-logout, resolved chart hover UI issues, and led end-to-end testing and final bug fixing. |
| **Saira** | M2 (Frontend) | Designed brand logo and typography, exported high-quality SVG and PNG assets, and refined charts on the main dashboard. |
| **Peja** | M3 (Backend) | Organized database structure and table views, collaborated with M4 to fix login and signup flows, structured Supabase database, refined main table views, and maintained prompt logs. |
| **Vinz** | M4 (Auth) | Fixed data fetching issues, implemented audit logs, repaired signup and login errors in collaboration with M3, and contributed to comprehensive end-to-end testing and bug fixes. |
| **Klyne** | M5 (QA) | Monitored and approved pull requests, completed the first draft and final version of the user manual, conducted manual QA testing, and completed all remaining project documentation. |

---

## 3. Tasks Completed (Summary)

- **Customer Analytics:** Customer analytics module fully built and integrated into the dashboard.
- **Session Management:** Session limits and auto-logout implemented to enforce security policies.
- **Dashboard UI:** Chart hover UI issues resolved; dashboard charts refined and finalized by M2.
- **Brand Assets:** Brand logo, text, and typography finalized; high-quality SVG and PNG assets exported.
- **Authentication Flows:** Signup and login errors fully resolved through M3 and M4 collaboration; data fetching issues fixed.
- **Audit Logs:** Audit log implementation completed and confirmed by M4.
- **Database:** Supabase database structure finalized; main table views refined; prompt logs maintained by M3.
- **Routing & Access Control:** Routing bugs fixed; dashboard access restricted to SUPERADMIN role only.
- **QA — Manual Testing:** Full manual QA pass conducted across all modules and user roles.
- **QA — E2E Production Test:** End-to-end production test report completed and submitted.
- **Documentation:** User manual finalized and submitted.
- **Presentation:** 12-slide final defense presentation deck completed.
- **Deployment:** Production build deployed to Vercel; `RELEASE 1` merged to `main`.

---

## 4. Blockers & Resolutions

| Blocker | Resolution |
| :--- | :--- |
| Access denied on customer analytics due to a mismatched user authentication table (M1). | Resolved by M1 in coordination with the database layer; confirmed cleared by Sprint 3 Week 2. |
| Account login issues for new users affecting M2's workflow. | Resolved through M3 and M4's joint fix of the signup and login flow. |
| Database synchronization issues blocking M4's auth and data-fetching work. | M3 and M4 collaborated to realign Supabase database structure and table views; resolved by Week 2. |

---

## 5. Final Project Status

This was the last sprint of the project. All planned deliverables have been completed and submitted:

- ✅ Customer Analytics Module
- ✅ Session Limits and Auto-Logout
- ✅ Audit Logs
- ✅ Final Dashboard UI
- ✅ Brand Logo and Assets
- ✅ User Manual
- ✅ End-to-End Production Test Report
- ✅ Final Defense Presentation (12 slides)
- ✅ Production Deployment on Vercel
- ✅ Final merge to `main` — v1.0.0 released

---

*Checked by: M1 and M5*