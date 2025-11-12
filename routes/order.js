const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const ordersCollection = db.collection("orders");

  //  POST - create a new order
  router.post("/", async (req, res) => {
    try {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.status(201).json({ message: "Order placed successfully!", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  //  GET - get all orders
  router.get("/", async (req, res) => {
    try {
      const orders = await ordersCollection.find({}).toArray();
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  return router;
};
