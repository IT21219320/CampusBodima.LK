import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
/*
const createOrder = async (req, res)=>{ 
  try {
    const { 
      product, 
      foodType, 
      quantity, 
      price 
    } = req.body;
    
    //const order = new Order({ product, foodType, quantity, price });
    const order = new Order({
      product:product,
      foodType:foodType,
      quantity:quantity,
      price:price,
    });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Fetch all orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  if (orders) {
    res.status(200).json(orders);
  } else {
    res.status(400);
    throw new Error('No Orders Available');
  }
});


export{
  createOrder,
  getAllOrders,
};
*/

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      product,
      foodType,
      quantity,
      price,
      orderNo,
      status,
      date,
      total,
    } = req.body;

    const order = new Order({
      product,
      foodType,
      quantity,
      price,
      orderNo,
      status,
      date,
      total,
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Could not create the order" });
  }
};

// Get a specific order by its ID
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Could not get the order" });
  }
};

// Update a specific order by its ID
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated order
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Could not update the order" });
  }
};

// Delete a specific order by its ID
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(204).send(); // No content response
  } catch (error) {
    res.status(500).json({ error: "Could not delete the order" });
  }
};
export{
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
};