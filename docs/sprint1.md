
# SPRINT 1: PLANNING
**Date:** March 28, 2026 – April 11, 2026  
**Project:** Customer Management System (HOPECMS) <br>
**Sprint Goal:** Establish the technical foundation, project architecture, and core authentication flow. <br>
**Prepared by:** @BaiSakinaAbad 

##  Sprint Backlog

| Member | Primary Task | Success Criteria |
| :--- | :--- | :--- |
| **Sakina [M1]** | Project Scaffolding & PRD | React/Vite/Tailwind setup + Branch rules active. |
| **Saira [M2]** | Auth UI & Wireframing | Functional Login/Register pages (Light & Dark mode). |
| **Peja [M3]** | Database Seeding & RLS | 5 core HopeDB tables seeded with active security. |
| **Vinz [M4]** | Auth Logic & Providers | Google Sign-in and email/password flow functional. |
| **Klyne [M5]** | Quality Assurance | Test cases for Sprints 1-3 drafted |

## Infrastructure Requirements
* **Tech Stack:** React 18, Vite, Tailwind CSS.
* **Hosting:** Vercel (Setup by M1).
* **Database:** Supabase/PostgreSQL (Seeded by M3, hosted by M1).

---

# SPRINT 1: RETROSPECTIVE
**Date:** April 11, 2026  
**Sprint Cycle:** Sprint 1 (Foundation Phase)

### What Went Well?
* **Swift Setup:** The team successfully transitioned from a blank repository to a scaffolded project with Tailwind and Vite in the first few days.
* **Early UI Wins:** M2 delivered both light and dark mode for Auth UI ahead of schedule, allowing the backend logic to be integrated immediately.
* **Security First:** RLS (Row-Level Security) was enabled from the start, ensuring data privacy was baked into the architecture.

### What Could Be Improved?
* **Environment Configuration:** The "mismatched package.json" issue on `hopecms` caused a slight delay in development. We need to ensure all dependencies are installed at the root level.
* **Requirement Clarity:** The missing "Role Table" in the initial SQL script caused a temporary blocker for M4 and M3. 

### Blockers Encountered
* **Dependency Management:** Mismatched `package.json` required manual intervention to centralize packages.
* **Data Schema Gaps:** The lack of a predefined Role table delayed the assignment of Superadmin privileges.
* **Verification Limits:** Hit a ceiling on email verification accounts during testing.

### Action Items for Sprint 2
* **Root-Level Enforcement:** Ensure all team members run `npm install` only at the project root to avoid local dependency conflicts.
* **Role-Based Access Control (RBAC):** Prioritize the integration of the Role table to move Prof. Jerry’s account to Superadmin status.
* **Collaborative Verification:** For future email testing, use the "scan code" workaround involving the whole team to bypass provider limits.

