# Changelog
All notable changes to the HOPE, INC. Customer Management System will be documented here.
Checked by: M1 and M5

---

## [v0.1] — March 27, 2026 · Sprint 1 Kickoff
### Added
- Project repository created with branch protection rules (`main`, `dev`, `scaffold`) → @BaiSakinaAbad
- Project scaffolded with Vite + React 18 and Tailwind CSS → @BaiSakinaAbad
- PR template and Git protection rules configured → @BaiSakinaAbad (#18)

---

## [v0.2] — March 28–30, 2026 · Sprint 1
### Added
- Login and Register UI with light and dark mode toggling → @sairarat (#20)
- `all/docs` branch created solely for documentation → @BaiSakinaAbad
### Fixed
- Web design responsiveness across different devices → @sairarat (#21)
- Cleaned `dev` and `main` folders by removing unnecessary files → @BaiSakinaAbad (#22)
- Moved scaffold to root and removed the `hopecms` subfolder to resolve mismatched `package.json` → @BaiSakinaAbad (#24)

---

## [v0.3] — March 31, 2026 · Sprint 1
### Fixed
- File layout restructured to apply proper Atomic Design Pattern → @sairarat (#25)
- Password logic checker added to validate input on registration → @sairarat (#25)

---

## [v0.4] — April 1, 2026 · Sprint 1
### Added
- User authentication: email/password login and sign-up flows → @solanov (#26)

---

## [v0.5] — April 2, 2026 · Sprint 1
### Added
- Full database creation: all 5 HopeDB tables seeded with RLS policies enabled → @PejaLattrell (#27)

---

## [v0.6] — April 4–5, 2026 · Sprint 1
### Added
- Super Admin Dashboard UI and loading spinner → @sairarat (#29)
- Sprint 1 auth flow test cases and Vitest configuration → @KlyneZyro (#56)
- Setup instructions, `.env` requirements, and environment check documentation → @KlyneZyro (#57)
### Fixed
- Adjusted `AuthComposites` to align with updated auth structure → @solanov (#28)
- Removed unnecessary files from `dev` branch → @BaiSakinaAbad (#30)

---

## [v0.7] — April 12–18, 2026 · Sprint 2 Week 1
### Added
- Account state `blocked`: blocked accounts are fully banned from accessing the application (distinct from `inactive`) → All members
- Account state `for approval`: applied to newly registered accounts pending admin activation → All members
- Login/Register input field functionalities; Display Name and Avatar implemented → @solanov (#58)
- Customer Management module: listing, viewing, adding, editing, and soft-deleting customers with role-based gating → @BaiSakinaAbad (#66, #68, #69, #71)
- Superadmin employee account activation and deactivation → @solanov (#67)
- User and customer activation/deactivation flow → @solanov (#72)
- Login Guard: blocked or inactive users are redirected and cannot access the app → @solanov (#73)
- Full Sprint 2 Rights Matrix, View-Only Enforcement, and Visibility test suites → @KlyneZyro (#60, #62)
### Fixed
- `beforeEach` test leak resolved; Google OAuth test cases updated → @KlyneZyro (#59)
- PR-02 tests moved out of `dev` to follow sprint plan → @KlyneZyro (#61)
- Folder structure corrected and Issue #64 resolved → @solanov (#65)
- Backend database configuration refactored and corrected → @PejaLattrell (#74)
- User role fetching bug resolved → @PejaLattrell (#75)

---

## [v0.8] — April 19–25, 2026 · Sprint 2 Week 2
### Added
- Rights Matrix UI with full permission visibility per role → @solanov (#76)
- Audit logs feature and `LogsPage.tsx` → @solanov (#77, #78, #87)
- Navigation provider and soft-delete customer service implemented → @BaiSakinaAbad (#80)
- Project logo added to the application → @sairarat (#81)
- Sales and Product pages → @BaiSakinaAbad (#85)
- Reports module → @BaiSakinaAbad (#86)
- User rights toggle: allows dynamic permission changes per user → @solanov (#90)
- Sprint 2 security enforcement, visibility gating tests, and official log → @KlyneZyro (#93)
- Project Requirements Document added to repository → @BaiSakinaAbad (#89)
### Fixed
- `logs` folder renamed to `audit` to avoid `.gitignore` conflicts → @solanov (#79)
- Admin and User dashboard pages removed; both roles now route directly to Customer Management → @BaiSakinaAbad (#82)
- Logo, pagination color, and brand text corrected → @sairarat (#83)
- Abort guard added to prevent race conditions on unmounted components → @PejaLattrell (#84)
- Reverted premature Dashboard Header Graphs (re-scoped to Sprint 3) → @KlyneZyro (#91)
- Login and Register page UI redesigned for consistency → @sairarat (#94)

---

## [v0.9] — May 1–7, 2026 · Sprint 3 Week 1
### Added
- `CustomerRow` component with expandable sales history panel → @BaiSakinaAbad (#103)
- Test hooks defined, documented, and refactored for modularity → @PejaLattrell (#105, #106, #107, #108, #109, #115, #116, #117)
- Dashboard UI structure redesigned → @solanov (#111)
### Fixed
- Compilation error from duplicated variable declarations resolved → @solanov (#99)
- Dashboard charts UI corrected → @sairarat (#100)
- Merge conflicts resolved → @sairarat (#102)
- Unnecessary bar charts removed from dashboard → @sairarat (#104)
- Bug in user permission changes fixed → @solanov (#110)
- Unused variable lint errors bypassed for successful Vercel deployment → @BaiSakinaAbad (#113)
### Release
- `RELEASE 1` — first production-ready build merged → @BaiSakinaAbad (#112)

---

## [v1.0.0] — May 8–10, 2026 · Sprint 3 Final Release
### Added
- Final CMS User Manual and Changelogs → @KlyneZyro (#118)
- Sprint 3 End-to-End Production Test Report → @KlyneZyro (#119)
- Final Defense Presentation Slides (12-slide deck) → @KlyneZyro (#120)
### Release
- Final merge to `main` — HOPE, INC. Customer Management System v1.0.0 released → @BaiSakinaAbad (#121)