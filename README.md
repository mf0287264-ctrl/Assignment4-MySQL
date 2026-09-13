# Assignment 4 - MySQL & Node.js (Express)

This repository contains the solutions for **Assignment 4 - MySQL**. 

> [!NOTE]
> All detailed assignment questions and requirements can be found in the [`Assignment4-MySQL.pdf`](./Assignment4-MySQL.pdf) file included in this repository.

---

## 📌 Repository Contents

### 🎨 Part 1: Entity Relationship Diagram (ERD)
- Contains the **Musicana Recording System (ERD)** diagram.
- File: [`part1/Musicana Recording System (ERD).png`](./part1/Musicana%20Recording%20System%20(ERD).png)

### 🗺️ Part 2: Relational Schema Mapping
- Contains the relational mapping derived from the ERD design.
- File: [`part2/maping.png`](./part2/maping.png)

### 💻 Part 3: Retail Store Express.js REST API with MySQL
An Express.js application interacting with a MySQL database (`retail_store`).

#### Database Structure:
- **Suppliers**: `SupplierID` (PK), `SupplierName`, `ContactNumber`
- **Products**: `ProductID` (PK), `ProductName`, `Price`, `StockQuantity`, `SupplierID` (FK)
- **Sales**: `SaleID` (PK), `ProductID` (FK), `QuantitySold`, `SaleDate`

#### Key Features & Endpoints:
- **CRUD Operations**: Complete RESTful routes for `Products`, `Suppliers`, and `Sales`.
- **Database Schema Modifications (DDL)**:
  - Add / drop `Category` column in `Products`.
  - Modify `ContactNumber` column type in `Suppliers`.
- **Seed Script**: `/script` endpoint to populate initial data.
- **Reports & Analytical Queries**:
  - Total quantity sold per product.
  - Product with the highest stock quantity.
  - Suppliers whose names start with 'F'.
  - Products that have never been sold.
  - Sales report joining sales and products.
- **Database Control Language (DCL)**:
  - User creation (`store_manager`).
  - Granting & revoking permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).

---

## 🔗 Postman Collection

You can access and test the full API endpoints using the shared Postman Collection:
👉 **[Postman Collection Documentation](https://documenter.getpostman.com/view/52196999/2sBYAytUVz)**

---

## 🚀 How to Run Part 3

1. Navigate to `part3` directory:
   ```bash
   cd part3
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MySQL server is running locally and update configuration parameters in `index.js` if needed.
4. Start the server:
   ```bash
   npm start
   # or for development
   npm run start:dev
   ```
