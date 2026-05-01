
# SPRINT 2: RETROSPECTIVE
**Date:** April 30, 2026  
**Project:** Customer Managment System (HOPECMS) <br>
**Sprint Cycle:** Sprint 2 (Week 2 Wrap-up) <br>
**Prepared by:** @BaiSakinaAbad 

### What Went Well?
* **Feature Velocity:** Core functionalities like Customer CRUD, Product Catalogue, and Sales History were completed on schedule.
* **Design-to-Dev Pipeline:** M2 successfully refined the Stitch designs, allowing for a smooth transition to component delivery.
* **Quality Assurance:** PR monitoring and test case refinement remained consistent thanks to M5.

### What Could Be Improved?
* **Database Synchronization:** We hit a significant snag with RLS (Row-Level Security) policies and UID mismatches.
* **Role Mapping:** The complexity of the Role Matrix was slightly underestimated, leading to late-sprint blockers.

### Action Items (Next Steps)
* **Standardize DB Policies:** M1 and M3 to sync on the `current.emp_no` vs. `uid` logic to prevent further mismatched policies.
* **Cross-Role Sync:** M4 and M1 to have a 15-minute touchpoint on the Role Matrix before the next sprint starts to align on database permissions.

---

# SPRINT 3: PLANNING
**Date:** May 1, 2026 – May 11, 2026  
**Sprint Goal:** Finalize Analytics, Role Security, and User Documentation.

## Sprint Backlog

| Member | Primary Task | Secondary Task |
| :--- | :--- | :--- |
| **Sakina [M1]** | Complete Customer Analytics | Optimize Sales History Queries |
| **Saira [M2]** | Final Component Delivery | UI Polish & Consistency Check |
| **Peja [M3]** | Finalize RLS Policy Refinement | View Optimization |
| **Vinz [M4]** | Role Matrix Implementation |  Role Matrix  |
| **Klyne [M5]** | User Manual (Final Draft) | Final PR Review & System Testing |

## Risk Assessment & Mitigation
* **Risk:** Continued Database/Policy mismatches delaying the Role Matrix.
* **Mitigation:** The first 2 days of the sprint are dedicated to a "Database Lockdown" where M1, M3, and M4 ensure all policies are uniform.

## Definition of Done (DoD)
1. Code passes all refined test cases (M5).
2. UI matches the Stitch design 1:1 (M2).
3. All RLS policies are functional and verified (M3/M4).
4. Documentation is ready for end-user review (M5).
5. Succesfully deployed to vercel.

---
