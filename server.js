const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());


const url = "mongodb+srv://maxamedmosseabdi:Maxamed12%3F%3F@lessons.1ojmdjj.mongodb.net/?appName=Lessons";
const client = new MongoClient(url);

async function main() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("AfterSchool");
    const lessonsCollection = db.collection("lessons");

    app.get("/", (req, res) => res.send("Backend is running 🚀"));
    app.get("/lessons", async (req, res) => {
      const lessons = await lessonsCollection.find({}).toArray();
      res.json(lessons);
    });

    app.listen(3000, () => console.log("✅ Server running on port 3000"));
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
