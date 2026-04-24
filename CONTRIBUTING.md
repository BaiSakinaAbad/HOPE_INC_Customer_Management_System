## HEADS UP TEAM

# BRANCH AND PR NAMING CONVENTION:

## feat/ (Feature)
- When to use: Use this for any new functionality or UI component being added to the CMS.
- Examples: Creating the customer soft-delete logic, building the sales history panel, or setting up the AuthContext.

## fix/ (Bug Fix)
- When to use: Use this when you are correcting an error in existing code where the behavior isn't working as intended.
- Examples: Fixing an RLS policy that hides the wrong rows or correcting a broken SQL join in the sales detail view.

## db/ (Database)
- When to use: Specific to this project, use this for any schema changes, RLS policy definitions, SQL views, or triggers.
- Best Practice: You should include the table name in the branch name (e.g., db/rls-customer-select) to make the migration history easy to trace.

## test/ (Testing)
- When to use: Use this when you are adding or updating test cases, such as Vitest files or the 27-case rights test matrix.
- Examples: Documenting the pass/fail results for the soft-delete visibility tests.

## docs/ (Documentation)
- When to use: Use this for any work involving the README, user manuals, sprint logs, or the ERD diagram.
- Examples: Finalizing the 12-slide presentation deck or updating the installation instructions.

## refactor/ (Code Cleanup - no behavior change)
- When to use: Use this when you are rewriting or cleaning up code to make it "cleaner" without actually changing how the feature behaves for the user.
- Example: Cleaning up the customerService.js file to improve readability.

## chore/ (Tooling & Maintenance)
- When to use: Use this for "housekeeping" tasks that don't involve the feature logic or database—like configuration, dependencies, or deployment settings.
- Examples: Setting up branch protection rules, configuring Vercel environment variables, or installing new npm packages.

# EVERY PR description states: What changed / Why / How to test

Sample Template: 
Description
What changed: - [Briefly describe the code changes]

Why: - [Reference the Sprint deliverable or specific requirement]

How to test:
1. [Step 1]
2. [Step 2]

Checklist
- [ ] [cite_start]Branch forked from `dev` 
- [ ] [cite_start]No `console.log` or `.env` keys 
- [ ] [cite_start]All Vitest tests pass locally 


