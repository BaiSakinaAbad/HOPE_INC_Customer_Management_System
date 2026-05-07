# Sprint 1 Official Log: Foundation & Authentication

**Dates:** March 28, 2026 – April 10, 2026
**Status:** Completed

## 1. Sprint Overview
The goal of Sprint 1 was to initialize the repository, set up the project structure, and implement core authentication (Email/Password and Google Sign-in).

## 2. Team Contributions
| Member | Role | Primary Deliverables (Based on Standups) |
| :--- | :--- | :--- |
| **Sakina** | M1 (Lead) | Initial project structure, Tailwind/Vite config, and PR management. |
| **Saira** | M2 (Frontend) | Login/Register UI (Light & Dark mode) and Superadmin Dashboard. |
| **Peja** | M3 (Backend) | Seeded 5 HopeDB tables and enabled RLS policies. |
| **Vinz** | M4 (Auth) | Enabled Google Sign-in, setup Test accounts, and Auth input fields. |
| **Klyne** | M5 (QA) | Facilitated MR approvals and created test cases for Sprints 1 & 2. |

## 3. Tasks Completed (Summary)
- **Infrastructure:** Configured Vite 18 and Tailwind CSS; established branch and PR rules.
- **UI/UX:** Completed Login and Registration pages with wireframes for upcoming features.
- **Database:** All 5 seeded tables now have active Row Level Security (RLS) policies.
- **Authentication:** Google OAuth enabled; Prof. Jerry's account added as a test user.
- **Quality Assurance:** Created automated test suites for Sprint 1 authentication flows.

## 4. Blockers & Resolutions
- **Blocker:** Mismatched `package.json` at the project root.
- **Resolution:** Fixed root-level package configuration to ensure consistency.
- **Blocker:** Role table was missing from the initial SQL script.
- **Resolution:** M4 used temporary user accounts while waiting for the finalized role schema.
- **Blocker:** Limited accounts available for email verification testing.
- **Resolution:** Team members assisted by scanning verification codes manually.

## 5. Next Sprint Goals (Sprint 2)
- Finalize User Roles and custom rights mapping.
- Implement test cases for the 27-case Rights Matrix.
- Begin work on Soft-Delete visibility and recovery.