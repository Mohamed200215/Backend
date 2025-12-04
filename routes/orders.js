// ORDERS ROUTER
// Handles creating, reading, updating and deleting orders

const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

module.exports = (db) => {
  // Connect to the "orders" collection in MongoDB
  const ordersCollection = db.collection("orders");

  // POST /orders → Create new order
  router.post("/", async (req, res) => {
    try {
      const order = req.body;        // Get order details from frontend

      // --- VALIDATION ---

      // Check missing fields
      if (!order.name || !order.phone || !order.items) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate name (letters + spaces only)
      if (!/^[a-zA-Z\s]+$/.test(order.name)) {
        return res.status(400).json({ error: "Invalid name format" });
      }

      // Validate phone (must be exactly 10 digits)
      if (!/^[0-9]{10}$/.test(order.phone)) {
        return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
      }

      // Validate items array
      if (!Array.isArray(order.items) || order.items.length === 0) {
        return res.status(400).json({ error: "Order must include at least one item" });
      }

      // Validate each item
      for (const item of order.items) {
        if (!item.lessonId || !item.subject || !item.price) {
          return res.status(400).json({ error: "Invalid item structure" });
        }

        // Verify lesson exists in DB
        const lessonExists = await db
          .collection("Lessons")
          .findOne({ _id: new ObjectId(item.lessonId) });

        if (!lessonExists) {
          return res.status(400).json({ error: `Lesson does not exist: ${item.subject}` });
        }
      }

      // Insert order into MongoDB
      const result = await ordersCollection.insertOne(order);

      // Attach generated MongoDB ID to the order we return
      order._id = result.insertedId;

      // Send back the full order object (for confirmation page)
      res.status(201).json(order);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  // GET /orders → Get all orders
  router.get("/", async (req, res) => {
    try {
      const orders = await ordersCollection.find({}).toArray();
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // PUT /orders/:id → Update an order
  // (Used to edit order details if needed)
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;      // Order ID
      const updates = req.body;      // Fields to update

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

  // DELETE /orders/:id → Delete an order
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
