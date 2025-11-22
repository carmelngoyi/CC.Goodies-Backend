require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const base64 = require("base-64");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB = process.env.MONGODB_URI;

app.use(bodyParser.json());
app.use(cors());

let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(MONGODB);
    await client.connect();
    db = client.db("CC_Goodies");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
connectToMongo();

// Basic Auth for protected routes
async function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const [email, password] = base64.decode(authHeader.split(" ")[1]).split(":");
  const user = await db.collection("users").findOne({ email });

  if (!user) return res.status(401).json({ message: "User not found" });

  const decodedStoredPassword = base64.decode(user.password);
  if (decodedStoredPassword !== password) return res.status(401).json({ message: "Invalid password" });

  req.user = user;
  next();
}

// SIGNUP 
app.post("/signup", async (req, res) => {
  try {
    const { name, email, address, password, confirmPassword } = req.body;

    if (!email.includes("@")) throw new Error("Invalid email");
    if (password.length < 8) throw new Error("Password must be at least 8 characters long");
    if (password !== confirmPassword) throw new Error("Passwords do not match");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    const encodedPassword = base64.encode(password);
    const result = await db.collection("users").insertOne({ name, email, address, password: encodedPassword, createdAt: new Date() });

    res.status(201).json({ message: "User created", user_id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return res.status(401).json({ error: "Authorization header missing or invalid" });
    }

    const [email, password] = base64.decode(authHeader.split(" ")[1]).split(":");
    const user = await db.collection("users").findOne({ email });
    console.log(user);

    if (!user || base64.decode(user.password) !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }



    res.status(200).json({ message: "Login successful", user: { email: user.email, _id: user._id } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const products = await db.collection("products").find({}).toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const result = await db.collection("products").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("products").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

//Bakery
app.get("/bakery", async (req, res) => {
  try {
    const bakery = await db.collection("bakery").find({}).toArray();
    res.json(bakery);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch baked products" });
  }
});

app.post("/bakery", async (req, res) => {
  try {
    const result = await db.collection("bakery").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/bakery/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("bakery").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/bakery/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("bakery").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

//Bevarages
app.get("/bevarages", async (req, res) => {
  try {
    const bevarages = await db.collection("bevarages").find({}).toArray();
    res.json(bevarages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/bevarages", async (req, res) => {
  try {
    const result = await db.collection("bevarages").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/bevarages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("bevarages").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/bevarages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("bevarages").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});


//Cereals
app.get("/cereals", async (req, res) => {
  try {
    const cereals = await db.collection("cereals").find({}).toArray();
    res.json(cereals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/cereals", async (req, res) => {
  try {
    const result = await db.collection("cereals").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/cereals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("cereal").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/cereals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("cereals").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});


//Dairy
app.get("/dairy", async (req, res) => {
  try {
    const dairy = await db.collection("dairy").find({}).toArray();
    res.json(dairy);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/dairy", async (req, res) => {
  try {
    const result = await db.collection("dairy").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/dairy/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("dairy").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/dairy/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("dairy").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});


//FruitsVeg
app.get("/fruitsVeg", async (req, res) => {
  try {
    const fruitsVeg = await db.collection("fruitsVeg").find({}).toArray();
    res.json(fruitsVeg);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/fruitsVeg", async (req, res) => {
  try {
    const result = await db.collection("fruitsVeg").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/fruitsVeg/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("fruitsVeg").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/fruitsVeg/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("fruitsVeg").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});


//Poultry
app.get("/poultry", async (req, res) => {
  try {
    const poultry = await db.collection("poultry").find({}).toArray();
    res.json(poultry);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/poultry", async (req, res) => {
  try {
    const result = await db.collection("poultry").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/poultry/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("poultry").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/poultry/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("poultry").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

//Snacks
app.get("/snacks", async (req, res) => {
  try {
    const snacks = await db.collection("snacks").find({}).toArray();
    res.json(snacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/snacks", async (req, res) => {
  try {
    const result = await db.collection("snacks").insertOne(req.body);
    res.status(201).json({ message: "Product created", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/snacks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("snacks").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/snacks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("snacks").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

//Appliances
// app.get("/appliances", async (req, res) => {
//   try {
//     const products = await db.collection("appliances").find({}).toArray();
//     res.json(appliances);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// app.post("/appliances", async (req, res) => {
//   try {
//     const result = await db.collection("appliances").insertOne(req.body);
//     res.status(201).json({ message: "Product created", id: result.insertedId });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add product" });
//   }
// });

// app.put("/appliances/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await db.collection("appliances").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
//     res.json({ message: "Product updated" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update product" });
//   }
// });

// app.delete("/appliances/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await db.collection("products").deleteOne({ _id: new ObjectId(id) });
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete product" });
//   }
// });


//BANKING DETAILS
app.post("/api/userBankingDetails", async (req, res) => {
  try {
    const {
      email,
      method,
      cardNumber,
      expiry,
      cvv,
      accountNumber,
      bankName,
    } = req.body;

    await db.collection("userBankingDetails").insertOne({
      email,
      method,
      cardNumber,
      expiry,
      cvv,
      accountNumber,
      bankName,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Banking details saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save banking details" });
  }
});

//ORDERS
app.post("/api/orders", async (req, res) => {
  try {
    await db.collection("orders").insertOne(req.body);
    res.status(201).json({ message: "Order saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save order" });
  }
});

app.get("/api/orders/:email", async (req, res) => {
  try {
    const orders = await db.collection("orders").find({ email: req.params.email }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

//PROTECTED ROUTES
app.use("/users", basicAuth);

app.get("/users", async (req, res) => {
  const users = await db.collection("users").find({}).toArray();
  res.json(users);
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
  res.json({ message: "User updated" });
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "User deleted" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});