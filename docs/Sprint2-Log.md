# Sprint 2 Log: Rights Matrix & Data Integrity (DRAFT)

**Dates:** April 12, 2026 – [In Progress]
**Status:** In Progress

## 1. Sprint Overview
The focus for Sprint 2 is enforcing the System Rights Matrix across all UI components and ensuring data visibility rules (Soft-Deletes) are strictly followed by the frontend and backend.

## 2. Tasks Completed (To Date)
- **QA Enforcement:** Developed the 27-case Rights Matrix test suite to validate USER, ADMIN, and SUPERADMIN permissions.
- **View-Only Protection:** Created automated scans for Sales, Product, and Price History pages to ensure zero unauthorized mutation buttons (Add/Edit/Delete) are rendered.
- **Visibility Logic:** Wrote tests to verify that INACTIVE records are filtered for standard users but accessible to ADMINs.
- **Recovery Logic:** Implemented tests to verify that "Recover" actions are only available to authorized roles on soft-deleted rows.

## 3. Blockers & Resolutions
- **In Progress:** Waiting for M2 to finalize component names for Sales and Price History to fully uncomment all test suites.
- **Resolution:** Using "nuclear" regex scanning for buttons to ensure security even before final UI text is finalized.

## 4. Next Sprint Goals
- Finalize the Recovery button implementation and testing.
- Verify full integration with M4’s `useRights()` hook.