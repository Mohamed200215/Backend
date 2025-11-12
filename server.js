const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

// ✅ Import the orders route
const createOrdersRouter = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

const url = "mongodb+srv://maxamedmosseabdi:Maxamed12%3F%3F@lessons.1ojmdjj.mongodb.net/?appName=Lessons";
const client = new MongoClient(url, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

async function main() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("AfterSchool");
    const lessonsCollection = db.collection("lessons");

    // ✅ Use the orders router
    app.use("/orders", createOrdersRouter(db));

    // ---------- LESSON ROUTES ----------
    app.get("/", (req, res) => res.send("Backend is running 🚀"));

    app.get("/lessons", async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

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

    app.delete("/lessons/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await lessonsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: "Lesson deleted successfully", result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete lesson" });
      }
    });

    app.listen(3000, () => console.log("✅ Server running on port 3000"));
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();

