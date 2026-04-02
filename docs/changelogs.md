
April 2, 2026

## Database Structure

### 1. Customers Table
Stores customer information.

| Column        | Type        | Description |
|--------------|------------|------------|
| custNo       | VARCHAR(5) | Primary Key |
| custName     | VARCHAR(50) | Customer name |
| address      | VARCHAR(50) | Customer address |
| payterm      | VARCHAR(255) | Payment terms (COD, 30D, 45D) |
| recordStatus | VARCHAR(10) | Status (ACTIVE by default) |
| stamp        | VARCHAR(60) | Audit field |

---

### 2. Products Table
Stores product details.

| Column    | Type        | Description |
|----------|------------|------------|
| prodCode | VARCHAR(6) | Primary Key |
| description | VARCHAR(30) | Product description |
| unit     | VARCHAR(3) | Unit (pc, ea, mtr, pkg, ltr) |

---

### 3. Employees Table
Stores employee and role information.

| Column    | Type        | Description |
|----------|------------|------------|
| empNo    | VARCHAR(5) | Primary Key |
| lastName | VARCHAR(15) | Last name |
| firstName| VARCHAR(15) | First name |
| gender   | CHAR(1) | M or F |
| birthDate| DATE | Birth date |
| hireDate | DATE | Hire date |
| sepDate  | DATE | Separation date |
| role     | VARCHAR(20) | employee / admin / superadmin |

---

### 4. Sales Table
Stores transaction headers.

| Column    | Type        | Description |
|----------|------------|------------|
| transNo  | VARCHAR(8) | Primary Key |
| salesDate| DATE | Transaction date |
| custNo   | VARCHAR(5) | FK → customers |
| empNo    | VARCHAR(5) | FK → employees |

---

### 5. SalesDetail Table
Stores transaction line items.

| Column    | Type        | Description |
|----------|------------|------------|
| transNo  | VARCHAR(8) | FK → sales |
| prodCode | VARCHAR(6) | FK → products |
| quantity | DECIMAL(10,2) | Quantity sold |
| unitPrice| DECIMAL(10,2) | Price at time of sale |

**Primary Key:** (transNo, prodCode)

---

### 6. Price History Table
Stores historical pricing of products.

| Column    | Type        | Description |
|----------|------------|------------|
| effDate  | DATE | Effective date |
| prodCode | VARCHAR(6) | FK → products |
| unitPrice| DECIMAL(10,2) | Product price |

**Primary Key:** (effDate, prodCode)

---

## 🔗 Relationships

- Customers → Sales (1:M)
- Employees → Sales (1:M)
- Sales → SalesDetail (1:M)
- Products → SalesDetail (1:M)
- Products → PriceHist (1:M)

---

## 🔐 Security (Row-Level Security - RLS)

RLS is implemented to enforce role-based access:

### Roles:
- **employee** – Can view and manage their own transactions
- **admin** – Can manage products and view broader data
- **superadmin** – Full access (including employee management)

### Behavior:
- Employees can only access their own sales records
- Admins can modify product-related data
- Only superadmin can delete employees


### ERD Diagram
![ERD Diagram](CMS-ERD%20(1).png)

---

[intender for M5 - Klyne Reyes]

This file contains all the systems changes and updates that have been made to the project whenever you check and test it.

Us this template:

[Date]

[What was changed]

[What was tested]

[What was fixed]

[What was removed]

[What was updated]

Note: you can also use your own template if you have one.
