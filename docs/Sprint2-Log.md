# Sprint 2 Official Log: Rights Matrix & Data Integrity
**Dates:** April 12, 2026 – April 25, 2026  
**Status:** Completed

---

## 1. Sprint Overview

The focus of Sprint 2 was enforcing the System Rights Matrix across all UI components, implementing Customer CRUD operations with role-based access gating, and ensuring data visibility rules for soft-deleted records are strictly followed by both the frontend and backend layers.

---

## 2. Team Contributions

| Member | Role | Primary Deliverables (Based on Standups) |
| :--- | :--- | :--- |
| **Sakina** | M1 (Lead) | Task dissemination, Customer CRUD, Product Catalogue, Pagination, Dashboard Header, and Sales History linked to customer and employee. |
| **Saira** | M2 (Frontend) | UI design refinement on Stitch and delivery of UI components. |
| **Peja** | M3 (Backend) | Database views, RLS policy refinement, and trigger functions. |
| **Vinz** | M4 (Auth) | User activation flow, bug fixes, and role matrix implementation. |
| **Klyne** | M5 (QA) | 27-case Rights Matrix test suite, view-only enforcement tests, soft-delete and recovery tests, PR monitoring, and user manual draft. |

---

## 3. Tasks Completed (Summary)

- **Customer Module:** Full Customer CRUD implemented with role-based gating — Add and Edit restricted to ADMIN/SUPERADMIN; soft-delete restricted to SUPERADMIN only.
- **Product Catalogue:** Read-only Product Catalogue page implemented with pagination and a dashboard header showing the current user's access level.
- **Sales History:** Sales history panel linked to both customer and employee records.
- **Account States:** New account states `blocked` and `for approval` introduced — blocked accounts are fully banned; `for approval` applies to newly registered accounts pending admin activation.
- **Database:** Required SQL views created; RLS policies refined and trigger functions finalized.
- **QA — Rights Matrix:** 27-case automated test suite written covering USER, ADMIN, and SUPERADMIN permissions across all 9 rights.
- **QA — View-Only Enforcement:** Automated scans confirm zero add/edit/delete buttons render on Product pages for all three user roles. (Sales and Price History tests stubbed pending M2 final component names.)
- **QA — Soft-Delete Visibility:** Tests verify INACTIVE records are hidden from USER role and visible to ADMIN/SUPERADMIN.
- **QA — Recovery Logic:** Tests verify the Recover action is only available to ADMIN and SUPERADMIN on soft-deleted rows.

---

## 4. Blockers & Resolutions

| Blocker | Resolution |
| :--- | :--- |
| Mismatched database policy using `current.emp_no` instead of `uid`. | Policy corrected by M1 in coordination with M3. |
| Database synchronization issues affecting M4's auth flows. | M3 and M4 collaborated to realign the authentication table structure. |
| M2 component names for Sales and Price History pages not yet finalized, blocking full test suite activation. | QA used broad regex button scanning (`/add\|edit\|delete\|update\|create/i`) as a role-agnostic safety net. Affected test cases are commented with clear uncomment instructions for Sprint 3. |
| Supabase admin access issue encountered by M4. | Resolved via Supabase dashboard role reassignment. |

---

## 5. Next Sprint Goals (Sprint 3)

- Complete and finalize the User Manual.
- Implement Admin Module with user activation/deactivation and SUPERADMIN row protection.
- Build CMS Reports: Customer Sales Summary, Top Customers, and Product Revenue.
- Deploy to Vercel/Netlify with production environment variables configured.
- Conduct full end-to-end production test across all three user types.
- Finalize 12-slide presentation deck.

---

*Checked by: M1 and M5*