import express from "express";
import mysql from "mysql2/promise";
const app = express();
app.use(express.json());
let connection;

try {
  const serverConnection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Mysql.acc.001",
  });
  await serverConnection.execute("CREATE DATABASE IF NOT EXISTS retail_store");
  console.log("Database is ready.");

  await serverConnection.end();

  connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Mysql.acc.001",
    database: "retail_store",
  });
  console.log("Connected to the MySQL database.");

  //suppliers table
  await connection.execute(`
      CREATE TABLE IF NOT EXISTS Suppliers (
        SupplierID int primary key auto_increment , 
SupplierName varchar(100) not null , 
ContactNumber varchar(100) not null 
      )
    `);
  //products table
  await connection.execute(`
      CREATE TABLE IF NOT EXISTS Products (
       ProductID int primary key auto_increment , 
ProductName varchar(100) not null ,
Price decimal(10,2) not null , 
StockQuantity int not null , 
SupplierID int ,
constraint fk_Suppliers_Products foreign key (SupplierID) references Suppliers(SupplierID) on update cascade on delete cascade
      )
    `);

  await connection.execute(`
      CREATE TABLE IF NOT EXISTS Sales (
   SaleID int primary key auto_increment , 
ProductID int,
SaleDate date not null ,  
QuantitySold int not null ,
constraint fk_Products_Sales foreign key (ProductID) references Products(ProductID) on update cascade on delete cascade 
      )
    `);
} catch (error) {
  console.error("Database initialization error:", error);
  process.exit(1);
}

// Define routes for CRUD operations on products
app.post("/products", async (req, res) => {
  const { name, price, quantity, supplierId } = req.body;
  const query =
    "INSERT INTO products (ProductName, Price, StockQuantity , SupplierID) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await connection.execute(query, [
      name,
      price,
      quantity,
      supplierId,
    ]);
    res.status(201).json({
      message: "Product inserted successfully",
      result,
    });
  } catch (error) {
    console.error("Error inserting product:", error);
    res
      .status(500)
      .json({ message: "Error inserting product", error: error.message });
  }
});
app.get("/products", async (req, res) => {
  const query = "SELECT * FROM products";
  try {
    const [rows] = await connection.execute(query);
    res.status(200).json({
      message: "Products retrieved successfully",
      products: rows,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res
      .status(500)
      .json({ message: "Error retrieving products", error: error.message });
  }
});
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM products WHERE ProductID = ?";
  try {
    const [rows] = await connection.execute(query, [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({
      message: "Product retrieved successfully",
      product: rows[0],
    });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
});
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is required" });
    return;
  }
  const { name, price, quantity } = req.body;
  if (!name || !price || !quantity) {
    res.status(400).json({
      message: "Product name, price, and quantity are required",
    });
    return;
  }
  const query =
    "UPDATE products SET ProductName = ?, Price = ?, StockQuantity = ? WHERE ProductID = ?";
  try {
    const [result] = await connection.execute(query, [
      name,
      price,
      quantity,
      id,
    ]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({
      message: "Product updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
});
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE ProductID = ?";
  try {
    const [result] = await connection.execute(query, [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({
      message: "Product deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
});

// Define routes for CRUD operations on suppliers
app.post("/suppliers", async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is required" });
    return;
  }
  const { SupplierName, ContactNumber } = req.body;
  if (!SupplierName || !ContactNumber) {
    res.status(400).json({
      message: "SupplierName and ContactNumber are required",
    });
    return;
  }
  const query =
    "INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)";
  try {
    const [result] = await connection.execute(query, [
      SupplierName,
      ContactNumber,
    ]);
    res.status(201).json({
      message: "Supplier added successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    res
      .status(500)
      .json({ message: "Error adding supplier", error: error.message });
  }
});
app.get("/suppliers", async (req, res) => {
  const query = "SELECT * FROM Suppliers";
  try {
    const [rows] = await connection.execute(query);
    res.status(200).json({
      message: "Suppliers retrieved successfully",
      suppliers: rows,
    });
  } catch (error) {
    console.error("Error retrieving suppliers:", error);
    res
      .status(500)
      .json({ message: "Error retrieving suppliers", error: error.message });
  }
});
app.get("/supplier/:id", async (req, res) => {
  const reqId = req.params.id;

  try {
    const query = "SELECT * FROM Suppliers WHERE SupplierID = ?";
    const [rows] = await connection.execute(query, [reqId]);
    if (rows.length === 0) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }
    res.status(200).json({
      message: "Supplier retrieved successfully",
      product: rows,
    });
  } catch (error) {
    console.error("Error retrieving supplier:", error);
    res
      .status(500)
      .json({ message: "Error retrieving supplier", error: error.message });
  }
});
app.put("/supplier/:id", async (req, res) => {
  const reqId = req.params.id;
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is required" });
    return;
  }
  const { SupplierName, ContactNumber } = req.body;
  if (!SupplierName || !ContactNumber) {
    res.status(400).json({
      message: "SupplierName and ContactNumber are required",
    });
    return;
  }
  try {
    const query =
      "UPDATE Suppliers SET SupplierName = ?, ContactNumber = ? WHERE SupplierID = ?";
    const [result] = await connection.execute(query, [
      SupplierName,
      ContactNumber,
      reqId,
    ]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }
    res.status(200).json({
      message: "Supplier updated successfully",
      result: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating supplier", error: error.message });
  }
});
app.delete("/supplier/:id", async (req, res) => {
  const reqId = req.params.id;
  try {
    const query = "DELETE FROM Suppliers WHERE SupplierID = ?";
    const [result] = await connection.execute(query, [reqId]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }
    res.status(200).json({
      message: "Supplier deleted successfully",
      result: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting supplier", error: error.message });
  }
});

// Define routes for CRUD operations on Sales
app.post("/sales", async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is required" });
    return;
  }

  const { ProductID, QuantitySold } = req.body;

  if (!ProductID || !QuantitySold) {
    res
      .status(400)
      .json({ message: "ProductID and QuantitySold are required" });
    return;
  }

  const query =
    "INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)";
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const [result] = await connection.execute(query, [
      ProductID,
      QuantitySold,
      currentDate,
    ]);

    res.status(201).json({
      message: "Sale recorded successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error recording sale:", error);
    res
      .status(500)
      .json({ message: "Error recording sale", error: error.message });
  }
});
app.get("/sales", async (req, res) => {
  const query = "SELECT * FROM Sales";
  try {
    const [rows] = await connection.execute(query);
    res.status(200).json({
      message: "Sales retrieved successfully",
      sales: rows,
    });
  } catch (error) {
    console.error("Error retrieving sales:", error);
    res
      .status(500)
      .json({ message: "Error retrieving sales", error: error.message });
  }
});
app.get("/sales/product/:id", async (req, res) => {
  const reqId = req.params.id;

  try {
    const query = "SELECT * FROM Sales WHERE ProductID = ?";
    const [rows] = await connection.execute(query, [reqId]);

    if (rows.length === 0) {
      res.status(404).json({ message: "No sales found for this product" });
      return;
    }

    res.status(200).json({
      message: "Product sales retrieved successfully",
      sales: rows,
    });
  } catch (error) {
    console.error("Error retrieving product sales:", error);
    res.status(500).json({
      message: "Error retrieving product sales",
      error: error.message,
    });
  }
});

app.get("/add/category", async (req, res) => {
  const query = `alter table Products add Category varchar(100) not null default 'General'`;
  try {
    const result = await connection.execute(query);
    res
      .status(200)
      .json({ message: "Category column added successfully", result: result });
  } catch (error) {
    console.error("Error adding category column:", error);
    res
      .status(500)
      .json({ message: "Error adding category column", error: error.message });
  }
});
app.delete("/delete/category", async (req, res) => {
  const query = `alter table Products drop column Category`;
  try {
    const result = await connection.execute(query);
    res.status(200).json({
      message: "Category column deleted successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error deleting category column:", error);
    res.status(500).json({
      message: "Error deleting category column",
      error: error.message,
    });
  }
});
app.get("/ChangeContactNumber", async (req, res) => {
  const query = `ALTER TABLE Suppliers MODIFY ContactNumber varchar(15)`;
  try {
    const result = await connection.execute(query);
    res.status(200).json({
      message: "Contact number column modified successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error modifying contact number column:", error);
    res.status(500).json({
      message: "Error modifying contact number column",
      error: error.message,
    });
  }
});

// seed script to insert initial data into the database
app.post("/script", async (req, res) => {
  try {
    // Insert supplier
    const query1 = `
      INSERT INTO Suppliers (SupplierName, ContactNumber)
      VALUES (?, ?)
    `;

    const [result1] = await connection.execute(query1, [
      "FreshFoods",
      "01001234567",
    ]);

    const supplierId = result1.insertId;

    // Insert Milk
    const query2 = `
      INSERT INTO Products
      (ProductName, Price, StockQuantity, SupplierID)
      VALUES (?, ?, ?, ?)
    `;

    const [result2] = await connection.execute(query2, [
      "Milk",
      15.0,
      50,
      supplierId,
    ]);

    const milkId = result2.insertId;

    // Insert Bread
    const [result3] = await connection.execute(query2, [
      "Bread",
      10.0,
      30,
      supplierId,
    ]);

    // Insert Eggs
    const [result4] = await connection.execute(query2, [
      "Eggs",
      20.0,
      40,
      supplierId,
    ]);

    // Insert Sale for Milk
    const query5 = `
      INSERT INTO Sales (ProductID, QuantitySold, SaleDate)
      VALUES (?, ?, ?)
    `;

    const [result5] = await connection.execute(query5, [
      milkId,
      2,
      "2025-05-20",
    ]);

    // ONE response at the end
    res.status(201).json({
      message: "Seed data inserted successfully",
      supplierId,
      milkId,
      breadId: result3.insertId,
      eggsId: result4.insertId,
      saleId: result5.insertId,
    });
  } catch (error) {
    console.error("Error executing seed script:", error);

    res.status(500).json({
      message: "Error executing seed script",
      error: error.message,
    });
  }
});

// Update the price of Bread
app.put("/update/products/bread", async (req, res) => {
  const query = `
    UPDATE Products
    SET Price = ?
    WHERE ProductName = 'Bread'
  `;

  try {
    const [result] = await connection.execute(query, [25.0]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Bread not found" });
      return;
    }

    res.status(200).json({
      message: "Bread price updated successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Bread price",
      error: error.message,
    });
  }
});

// Delete the product Eggs from the Products table
app.delete("/delete/products/eggs", async (req, res) => {
  const query = `
    DELETE FROM Products
    WHERE ProductName = 'Eggs'
  `;

  try {
    const [result] = await connection.execute(query);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Eggs not found" });
      return;
    }

    res.status(200).json({
      message: "Eggs deleted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Eggs",
      error: error.message,
    });
  }
});

app.get("/reports/total-sold", async (req, res) => {
  const query = `
    SELECT 
      Products.ProductName,
      COALESCE(SUM(Sales.QuantitySold), 0) AS TotalQuantitySold
    FROM Products
    LEFT JOIN Sales
      ON Products.ProductID = Sales.ProductID
    GROUP BY Products.ProductID, Products.ProductName
  `;

  try {
    const [rows] = await connection.execute(query);

    res.status(200).json({
      message: "Total quantity sold retrieved successfully",
      report: rows,
    });
  } catch (error) {
    console.error("Error generating report:", error);

    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
});

app.get("/reports/highest-stock", async (req, res) => {
  const query = `
    SELECT ProductName, StockQuantity
    FROM Products
    WHERE StockQuantity = (SELECT MAX(StockQuantity) FROM Products)
  `;

  try {
    const [rows] = await connection.execute(query);

    res.status(200).json({
      message: "Product with highest stock retrieved successfully",
      product: rows,
    });
  } catch (error) {
    console.error("Error generating report:", error);

    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
});

app.get("/reports/suppliers-starting-f", async (req, res) => {
  const query = `
    SELECT *
    FROM Suppliers
    WHERE SupplierName LIKE 'F%'
  `;

  try {
    const [rows] = await connection.execute(query);

    res.status(200).json({
      message: "Suppliers starting with F retrieved successfully",
      suppliers: rows,
    });
  } catch (error) {
    console.error("Error generating report:", error);

    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
});

app.get("/reports/never-sold", async (req, res) => {
  const query = `
   SELECT *
    FROM Products
    LEFT JOIN Sales
      ON Products.ProductID = Sales.ProductID
    WHERE Sales.ProductID IS NULL
  `;

  try {
    const [rows] = await connection.execute(query);

    res.status(200).json({
      message: "Products that have never been sold retrieved successfully",
      products: rows,
    });
  } catch (error) {
    console.error("Error generating report:", error);

    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
});

app.get("/sales/report", async (req, res) => {
  const query = `
    SELECT 
      Products.ProductName, 
      Sales.QuantitySold, 
      Sales.SaleDate 
    FROM Sales
    JOIN Products ON Sales.ProductID = Products.ProductID
  `;

  try {
    const [rows] = await connection.execute(query);

    if (rows.length === 0) {
      res.status(404).json({ message: "No sales records found" });
      return;
    }

    res.status(200).json({
      message: "Sales report retrieved successfully",
      report: rows,
    });
  } catch (error) {
    console.error("Error retrieving sales report:", error);
    res.status(500).json({
      message: "Error retrieving sales report",
      error: error.message,
    });
  }
});

app.post("/admin/create-user", async (req, res) => {
  try {
    await connection.query(
      "CREATE USER IF NOT EXISTS 'store_manager'@'localhost' IDENTIFIED BY 'Manager.Pass123'",
    );
    await connection.query(
      "GRANT SELECT, INSERT, UPDATE ON retail_store.* TO 'store_manager'@'localhost'",
    );
    await connection.query("FLUSH PRIVILEGES");

    res.status(200).json({
      message:
        "User 'store_manager' created and granted SELECT, INSERT, UPDATE permissions.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

app.post("/admin/revoke-update", async (req, res) => {
  try {
    await connection.query(
      "REVOKE UPDATE ON retail_store.* FROM 'store_manager'@'localhost'",
    );
    await connection.query("FLUSH PRIVILEGES");

    res.status(200).json({
      message: "UPDATE permission revoked successfully from 'store_manager'.",
    });
  } catch (error) {
    console.error("Error revoking permission:", error);
    res
      .status(500)
      .json({ message: "Error revoking permission", error: error.message });
  }
});

app.post("/admin/grant-delete-sales", async (req, res) => {
  try {
    await connection.query(
      "GRANT DELETE ON retail_store.Sales TO 'store_manager'@'localhost'",
    );
    await connection.query("FLUSH PRIVILEGES");

    res.status(200).json({
      message:
        "DELETE permission granted to 'store_manager' ONLY on the Sales table.",
    });
  } catch (error) {
    console.error("Error granting permission:", error);
    res
      .status(500)
      .json({ message: "Error granting permission", error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "invalid route ", success: false });
  return;
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
