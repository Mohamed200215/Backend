const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const createOrdersRouter = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const url =
  "mongodb+srv://maxamedmosseabdi:Maxamed12%3F%3F@lessons.1ojmdjj.mongodb.net/?appName=Lessons";

const client = new MongoClient(url, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});

async function main() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("Afterschool");
    const lessonsCollection = db.collection("Lessons");

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "Backend running", time: new Date() });
    });

    // Public images
    app.use("/images", express.static("public/images"));


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

    // Orders router
    app.use("/orders", createOrdersRouter(db));

    // Root
    app.get("/", (req, res) => res.send("Backend is running 🚀"));

    // Get all lessons
    app.get("/lessons", async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

    // Update lesson
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

    // Delete lesson
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server started on port " + port);
});

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
