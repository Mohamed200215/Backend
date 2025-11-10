const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string 
const url = "mongodb+srv://maxamedmosseabdi:Maxamed12%3F%3F@lessons.1ojmdjj.mongodb.net/?appName=Lessons";
const client = new MongoClient(url, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

async function main() {
  try {
    console.log(" Connecting to MongoDB...");
    await client.connect();
    console.log(" Connected to MongoDB Atlas");

    const db = client.db("AfterSchool");
    const lessonsCollection = db.collection("lessons");
    const ordersCollection = db.collection("orders");

    // ---------- BASIC ROUTES ----------
    app.get("/", (req, res) => res.send("Backend is running 🚀"));

    //GET all lesson
    app.get("/lessons", async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

        // POST new order
    app.post("/order", async (req, res) => {
      try {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        res.status(201).json({ message: "Order placed successfully!", result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to place order" });
      }
    });

     // PUT - update lesson
    app.put("/lessons/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body; // e.g. { spaces: 3 }
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



    // ---------- SERVER ----------
    app.listen(3000, () => console.log("✅ Server running on port 3000"));
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
