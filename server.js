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
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://www.cc-goodies.com.s3-website-us-east-1.amazonaws.com/",
    "https://cc-goodies-frontend.vercel.app",
    "https://cc-goodies-frontend-rh475v9rb-carmel-ngoyis-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});