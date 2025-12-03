require("dotenv").config();

// IMPORTS & INITIAL SETUP
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const createOrdersRouter = require("./routes/orders");

const app = express();

// Enable CORS for frontend → backend communication
app.use(cors({
  origin: [
    "http://localhost:3000",                      // local dev
    "https://mohamed200215.github.io",           // GitHub Pages domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


// Parse incoming JSON request bodies
app.use(express.json());

// REQUEST LOGGING (for debugging)

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// MONGODB CONNECTION SETUP
const url = process.env.MONGO_URI;

// Allows connection through https
const client = new MongoClient(url, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});


// MAIN FUNCTION (Connect + Create Routes)

async function main() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    // Select database + collection
    const db = client.db("Afterschool");
    const lessonsCollection = db.collection("Lessons");


    // HEALTH CHECK ENDPOINT

    app.get("/health", (req, res) => {
      res.json({ status: "Backend running", time: new Date() });
    });


    // SERVE PUBLIC IMAGES

    app.use("/images", express.static("public/images"));


    // SEARCH ENDPOINT (subject, location, price, spaces)

    app.get("/search", async (req, res) => {
      const q = req.query.q?.toLowerCase() || "";

      let numberValue = Number(q);
      let isNumber = !isNaN(numberValue);

      const results = await lessonsCollection
        .find({
          $or: [
            { subject: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            isNumber ? { price: numberValue } : {},
            isNumber ? { spaces: numberValue } : {},
          ],
        })
        .toArray();

      res.json(results);
    });

    // ORDERS ROUTER (POST, GET, DELETE…)

    app.use("/orders", createOrdersRouter(db));


    // ROOT ENDPOINT

    app.get("/", (req, res) => res.send("Backend is running 🚀"));


    // GET ALL LESSONS

    app.get("/lessons", async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

    // UPDATE LESSON (spaces, etc.)
    app.put("/lessons/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        const result = await lessonsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        res.json({ message: "Lesson updated successfully", result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update lesson" });
      }
    });

    // DELETE LESSON

    app.delete("/lessons/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await lessonsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.json({ message: "Lesson deleted successfully", result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete lesson" });
      }
    });


    // START SERVER

    const port = process.env.PORT || 8080;

    app.listen(port, () => {
      console.log("Server started on port " + port);
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// Run backend
main();
