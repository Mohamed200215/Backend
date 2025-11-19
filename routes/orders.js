const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const ordersCollection = db.collection("orders");

  // ============================
  //  POST - Create new order
  // ============================
  router.post("/", async (req, res) => {
    try {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);

      res.status(201).json({
        message: "Order placed successfully!",
        result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  // ============================
  //  GET - Get all orders
  // ============================
  router.get("/", async (req, res) => {
    try {
      const orders = await ordersCollection.find({}).toArray();
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // ============================
  //  PUT - Update an order
  // ============================
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;

      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );

      res.json({
        message: "Order updated successfully",
        result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ============================
  //  DELETE - Delete order
  // ============================
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.json({
        message: "Order deleted successfully",
        result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  return router;
};
