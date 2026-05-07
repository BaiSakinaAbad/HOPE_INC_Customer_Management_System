

# HOPE, INC. Customer Management System

## Product Requirements Document (PRD)
```
Version: 2.0  (Revised from PROJECT DEVELOPMENT GUIDE prepared by JEREMIAS C. ESPERANZA)
Date: March 26, 2026
Prepared for: BS Computer Science Capstone Project 
Institution: New Era University – College of Informatics and Computer Studies
```
PRD ARE LIVING DOCUMENTS, THIS WILL BE UPDATED AS NEEDED

## Product Objective

1.1 Vision

To deliver a modern, secure, and user-friendly Customer Management System that enables HOPE, INC. to efficiently manage customer relationships while maintaining complete visibility into historical sales data—all within a 6-week development cycle.

1.2 Goal

Build a web-based application that centralizes customer data management with full CRUD capabilities on customer records, while providing read-only access to sales transactions, product catalogs, and pricing history. The system must enforce strict role-based access control and maintain data integrity through soft-delete mechanisms.

1.3 System Objective

The HOPE, INC. Customer Management System aims to:

Manage customers: view, add, edit, and soft-delete customer records (custno, custname, address, payterm).
View sales: display each customer&#39;s transaction history from the sales table (transNo, salesDate, empNo).
View sales details: drill into each transaction to see items purchased from salesDetail joined with product and priceHist.
View product catalogue: read-only listing of all products with their current prices from priceHist. Enforce rights: CRUD rights on customer module; VIEW-only rights on sales, salesDetail, product and priceHist.
Soft-delete with recovery: deleted customers hidden from USER; recoverable by
ADMIN/SUPERADMIN.

---

## Target Audience

2.1 User Personas

Standard User (USER)

| Attribute | Description |
|-----------|-------------|
| Role | Staff Member |
| Description | Day-to-day employees who need to view and manage active customer records |
| Technical Proficiency | Basic to intermediate computer literacy |
| Access Frequency | Daily use during business hours |

Capabilities:

| Capability | Description |
|------------|-------------|
| View active customers | Browse and search all customers with ACTIVE status |
| View sales history | Access transaction records linked to customers |
| View sales details | Drill into individual transactions to see line items |
| View product catalogue | Browse all products and current pricing |

Administrator (ADMIN)

| Attribute | Description |
|-----------|-------------|
| Role | Department Manager |
| Description | Supervisors who need elevated access for data recovery and user oversight |
| Technical Proficiency | Intermediate computer literacy |
| Access Frequency | Daily use during business hours |

Capabilities:

| Capability | Description |
|------------|-------------|
| All USER capabilities | Full access to standard user functions |
| View inactive customers | Access archived customer records |
| Add new customers | Create new customer records with required details |
| Recover inactive customers | Restore INACTIVE customers to ACTIVE status |
| Edit customers | Edit customer records |
| View audit stamps | See creation and modification metadata on records |

Super Administrator (SUPERADMIN)

| Attribute | Description |
|-----------|-------------|
| Role | System Owner |
| Description | IT administrators or executives with full system control |
| Technical Proficiency | Intermediate to advanced computer literacy |
| Access Frequency | As needed for administrative tasks |

Capabilities:

| Capability | Description |
|------------|-------------|
| All ADMIN capabilities | Full access to administrator functions |
| Manage user roles | Promote or demote users between USER and ADMIN roles |
| Soft-delete users | Soft-delete users |
| Full user administration | Complete control over non-SUPERADMIN accounts |

Restriction: Cannot modify other SUPERADMIN accounts (enforced at UI and database levels)

2.2 Default Rights Matrix

| Access Right | USER | ADMIN | SUPERADMIN |
|--------------|:----:|:-----:|:----------:|
| **Customer Management** ||||
| View active customers | ☑ | ☑ | ☑ |
| Add new customers | ☐ | ☑ | ☑ |
| Edit customer details | ☐ | ☑ | ☑ |
| Soft-delete customers | ☐ | ☐ | ☑ |
| View inactive customers | ☐ | ☑ | ☑ |
| Recover soft-deleted customers | ☐ | ☑ | ☑ |
| View audit stamps | ☐ | ☑ | ☑ |
| **Sales & Products** ||||
| View sales history | ☑ | ☑ | ☑ |
| View sales details | ☑ | ☑ | ☑ |
| View product catalogue | ☑ | ☑ | ☑ |
| View price history | ☑ | ☑ | ☑ |
| **User Administration** ||||
| View user list | ☐ | ☑ | ☑ |
| Activate new users | ☐ | ☑ | ☑ |
| Change user roles | ☐ | ☐ | ☑ |
| Deactivate users | ☐ | ☐ | ☑ |
| Modify SUPERADMIN accounts | ☐ | ☐ | ☐ |

## Features & Functionality

### 3.1 Authentication Module
```
User Stories:

- As a new user, I want to register using my email and password so that I can create an account.
- As a new user, I want to register using my Google account so that I can sign up quickly without creating new credentials.
- As a registered user, I want to log in securely so that I can access the system.
- As a newly registered user, I understand my account will be INACTIVE until an administrator activates it.
```
```
Functional Requirements:

| Requirement | Description |
|-------------|-------------|
| Email/Password Authentication | Registration and login via Supabase Auth |
| Google OAuth 2.0 | Single sign-on integration for quick registration |
| Auto-provisioning | New accounts created as USER role with INACTIVE status |
| Session Management | Handled using React Context API |
```

### 3.2 Customer Management Module (Full CRUD)
```
User Stories:

- As a USER, I want to view a list of all active customers so that I can find customer information quickly.
- As a USER, I want to search and filter customers by name or address so that I can locate specific records.
- As a USER, I want to add a new customer with their details (name, address, payment terms) so that they are recorded in the system.
- As a USER, I want to edit existing customer information so that records stay current.
- As a USER, I want to soft-delete a customer so that they are archived but not permanently removed.
- As an ADMIN, I want to view inactive (soft-deleted) customers so that I can review archived records.
- As an ADMIN, I want to recover a soft-deleted customer so that they become active again.
- As an ADMIN/SUPERADMIN, I want to view audit stamps on customer records so that I can track changes.
```
```
Data Fields:

| Field | Description |
|-------|-------------|
| custno | Unique customer number |
| custname | Customer name |
| address | Customer address |
| payterm | Payment terms |
| record_status | ACTIVE or INACTIVE |
| stamp | Audit trail (hidden from USER) |
```
```
Business Rules:

- No hard deletes permitted (DELETE keyword prohibited in codebase)
- INACTIVE customers invisible to USER accounts
- Only ADMIN/SUPERADMIN can view and recover INACTIVE records
``` 
### 3.3 Sales History Module (View Only)
```
User Stories:

- As a USER, I want to view a customer's sales transactions so that I can understand their purchase history.
- As a USER, I want to see transaction details including date and employee number so that I have complete transaction context.

Data Fields:

| Field | Description |
|-------|-------------|
| transNo | Transaction number |
| salesDate | Date of sale |
| empNo | Employee number who processed the sale |
```

### 3.4 Sales Details Module (View Only)
```
User Stories for USERS(standard):

- As a USER, I want to drill into a specific transaction to see individual line items so that I can review what was purchased.
- As a USER, I want to see product information and quantities for each line item so that I have complete purchase details.
ongoing

```
### 3.5 Product Catalogue Module (View Only)
```
User Stories:

- As a USER, I want to view the complete product catalogue so that I can see all available products.
- As a USER, I want to see current prices for each product so that I have accurate pricing information.

Data Sources: product table (52 products) joined with priceHist table (~70 price entries)
```
### 3.6 User Administration Module
```
User Stories:

- As an ADMIN, I want to activate newly registered users so that they can access the system.
- As a SUPERADMIN, I want to change user roles so that I can grant appropriate permissions.
- As a SUPERADMIN, I cannot modify other SUPERADMIN accounts (enforced at UI and RLS levels).
```


## Success Metrics

### 4.1 Key Performance Indicators (KPIs)

| Category | Metric | Target | Measurement Method |
|----------|--------|--------|-------------------|
| Functionality | Feature completion rate | 100% of defined features | Sprint review checklist |
| Quality | Unit test coverage | ≥ 80% code coverage | Vitest coverage reports |
| Quality | Critical bugs at launch | 0 critical, ≤ 3 minor | Bug tracking during UAT |
| Performance | Page load time | < 2 seconds | Lighthouse audit |
| Security | RLS policy compliance | 100% of access rules enforced | Security test cases |


### 4.2 Acceptance Criteria Summary

| Criteria | Description |
|----------|-------------|
| Customer CRUD | All create, read, update, and soft-delete operations function correctly |
| No Hard Deletes | No DELETE statements exist anywhere in the codebase |
| USER Visibility | INACTIVE customers are completely invisible to USER accounts |
| ADMIN Recovery | ADMIN/SUPERADMIN can view and recover INACTIVE customers |
| Read-Only Tables | Sales, salesDetail, product, and priceHist tables are strictly read-only |
| Authentication | Both Email/Password and Google OAuth function correctly |
| Auto-Provisioning | New registrations are auto-provisioned as USER/INACTIVE |
| SUPERADMIN Protection | ADMIN cannot modify SUPERADMIN accounts |
| Audit Visibility | Audit stamps visible only to ADMIN/SUPERADMIN |
| Deployment | Application deploys successfully to Vercel or Netlify |

---

## Timeline & Milestones (Recommended)

### 5.1 Development Phases

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Foundation | Weeks 1–2 | Database setup, authentication system, basic UI framework, customer list view |
| Core Features | Weeks 3–4 | Full customer CRUD, sales history views, product catalogue, role-based access implementation |
| Polish & Deploy | Weeks 5–6 | User administration, testing, bug fixes, deployment, documentation |

### 5.2 Key Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| Authentication Complete | End of Week 2 | Working login/registration with Google OAuth |
| Core Modules Functional | End of Week 4 | All modules operational with RBAC implemented |
| Production Deployment | Week 6, Day 4 | Live application on Vercel/Netlify |
| Final Presentation | Week 6, Day 7 | Capstone project demonstration |


---

## Technical Constraints & Dependencies

### 6.1 Constraints

| Constraint | Description |
|------------|-------------|
| Team Size | 5-member development team |
| Timeline | 6-week development period |
| Hosting | Free-tier deployment (Vercel or Netlify) |
| Database | Supabase free-tier limitations |

### 6.2 Dependencies

| Dependency | Description |
|------------|-------------|
| Supabase | Database and authentication service availability |
| Google OAuth | API access for single sign-on functionality |
| Team Availability | Member participation and skill distribution |

---

## Appendix

### 7.1 Data Volume Summary

| Table | Record Count |
|-------|--------------|
| customer | 82 records |
| sales | 124 transactions |
| salesDetail | ~250 line items |
| product | 52 products |
| priceHist | ~70 price entries |

### 7.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ with Vite |
| Styling | Tailwind CSS |
| Backend/Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth with Google OAuth |
| State Management | React Context API |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel or Netlify |

