This file is the compilation of our daily standup meetings.

# PROJECT KICKOFF
### March 28, 2026
### Members Present: All members
*Prepared by: @BaiSakinaAbad*
1. Yesterday and Today's Progress
```

   Sakina [M1]: Briefing of the team. Created the initial structure of the project, sets rules for branches and pr. Configured the project to use Tailwind CSS and react vite 18. Revised PRD for readability. Created project repository.

   Vinz [M4]: Setup Authentication and enabled Google as a sign in provider.

   Saira [M2]: Created Login and register page.

   Peja [M3]: All 5 HopeDB tables seeded and enabled RLS

   Klyne [M5]: Reviewed PR, tests updates and approve PR to merge to dev branch. Wrote test cases for Sprint 1.
```

2. Blockers & Dependencies
```

    Issues: Mismatched package.json running on hopecms.

    Needs: to fix the mismatched package.json running on hopecms and make sure the package we are using is on the root level of the project.
```
   
--- 

   # SPRINT 1 WEEK 2 
   April 2, 2026 <br>
   Present Members: All members present<br>
   *Prepared by: @BaiSakinaAbad*
    
   ## Role-by-Role Reports

   **Sakina [M1]**
   ```
      Completed: Facilitate Merge request approval, Initial Documentation Templates, task dessimination, 
      Working on: Vercel setup, Sprint board, Monitoring of progress
      Blockers: None
   ```
   
   **Saira [M2]**
   ```
      Completed: Login/signin ui (Both light and dark mode)
      Working on: Dashboard/s, Log out
      Blockers: None
   ```
   **Peja [M3]**
   ```
      Completed: All 5 HopeDB tables seeded and enabled RLS policies
      Working on: Service core functionalities and sql
      Blockers: Role table was not given on the sql script. 
   ```
   **Vinz [M4]**
   ```
      Completed: Enabald User authentication and Google sign in. Added Prof. Jerry's account as user (Will change to superadmin when the role tables are ready)
      Working on: User input (email/password), test accounts
      Blockers: none
   ```
   **Klyne [M5]**<br>
   ```
      Completed: Facilitate merge request approval
      Working on: Creation of test cases for Sprint 1 and 2
      Blockers: none
   ```
---
   # SPRINT 1 WEEK 2.1
   APRIL 5 2026 <br>
   TIME DURATION: 10:30 - 10:45 PM <br>
   All members are present <br>
   **Prepared by:** @BaiSakinaAbad <br>
      
   ## Role-by-Role Reports
   **Sakina [M1]**<br>
   ```
      Completed: Polished folder scaffold and documentation templates.
      Working on: Project board and tasks dessimination
      Blockers: None
   ```
   
   **Saira [M2]**<br>
   ```
      Completed: Superadmin Dashboard and Wireframes for next features
      Working on: Prototyping the Wireframes
      Blockers: Waiting for M4 to finish the roles
   ```
   **Peja [M3]**<br>
   ```
      Completed: Added user table, refined policies and rls refining.
      Working on: Additional table for user(incoming) and audit logs column/table
      Blockers: none
   ```
   **Vinz [M4]**<br>
   ```
      Completed: Test Accounts
      Working on: Registration input fields
      Blockers: limited accounts for (email verifications) solution: have other members scan the code for verification
   ```
   **Klyne [M5]**<br>
   ```
      Completed: test cases for sprint 1
      Working on: test cases for sprint 2 and 3
      Blockers: none
   ```
--- 

   # SPRINT 2 WEEK 1 
   APRIL 12 2026
   <br>
   Time duration: 3:07pm - 3:20pm <br>
   Present Members: All members present
   <br> *Prepared by:* @BaiSakinaAbad

   ## Role-by-Role Reports

   **Sakina [M1]**<br>
   ```
      Completed: Task dissimenation for sprint 2 and 3, project board management and reviewing pr.
      Working on: Tasks assigned on this [docs](docs/sprint 2 and 3 tasks.pdf)
      Blockers: Waiting M4 to finish the user and admin routing pages.
   ```
   
  **Saira [M2]**<br>
   ```
      Completed: 
      Working on: Logo, Admin and user dashboard
      Blockers: Placeholder for admin and user dashboard -> M4 
   ```
   **Peja [M3]**<br>
   ```
      Completed: Refine policies, trigger functions for database.
      Working on: Additional account state "blocked"
      Blockers: none
   ```
   **Vinz [M4]**<br>
   ```
      Completed: Completion of registry, changed placeholders
      Working on: Placeolder dashboards as assigned by m2.
      Blockers: Supabase admin access -> resolved
   ```
   **Klyne [M5]**<br>
   ```
      Completed: Revised test cases for sprint 1, 2, and 3.
      Working on: Test cases for sprint 3 and sprint 2 log.
      Blockers: none
   ```
   ---
   # SPRINT 2 WEEK 2
   April 25, 2026
   <br>
   Time duration: 3:00 PM - 3:08 PM <br>
   Present Members: All members are present<br>
   <br> *Prepared by:* @BaiSakinaAbad

   ## Role-by-Role Reports

   **Sakina [M1]**<br>
   ```
      Completed: Customer CRUD, Product catalogue, Pagination, Dashboard header (access level indicator), Sales history (linked to customer and employee)
      Working on: Customer analytics
      Blockers: Mismatched database policy (using current.emp_no instead of uid)
   ```
   
  **Saira [M2]**<br>
   ```
      Completed: Refining design on Stitch
      Working on: Delivering components
      Blockers: None
   ```
   **Peja [M3]**<br>
   ```
      Completed: Views needed
      Working on: Refining RLS policy
      Blockers: None
   ```
   **Vinz [M4]**<br>
   ```
      Completed: User activation, bug fixes
      Working on: Role matrix
      Blockers: Database
   ```
   **Klyne [M5]**<br>
   ```
      Completed: Monitoring PR and refining test cases
      Working on: Monitoring PR and user manual draft
      Blockers: None
   ```
   ---
  # SPRINT 3 WEEK 1
   May 1, 2026
   <br>
   Time duration: 3:00 PM - 3:05 PM <br>
   Present Members: All members are present<br>
   <br> *Prepared by:* @BaiSakinaAbad

   ## Role-by-Role Reports

   **Sakina [M1]**<br>
   ```
      Completed: Fixed routing bugs; restricted dashboards to superadmins only.
      Working on: Building the customer analytics module.
      Blockers: Access denied due to a mismatched user authentication table.
   ```
   
  **Saira [M2]**<br>
   ```
      Completed: Designed brand logo, text, and initial UI views.
      Working on: Exporting high-quality SVG and PNG assets.
      Blockers: Account login issues for new users.
   ```
   **Peja [M3]**<br>
   ```
      Completed: Organized database structure and table views.
      Working on: Collaborating with M4 to fix login and signup flows.
      Blockers: None
   ```
   **Vinz [M4]**<br>
   ```
      Completed: Fixed data fetching and implemented audit logs.
      Working on: Repairing signup and login errors with M3.
      Blockers: Database synchronization issues.
   ```
   **Klyne [M5]**<br>
   ```
      Completed: Monitored and approved pull requests.
      Working on: Writing the first draft of the user manual.
      Blockers: None
   ```