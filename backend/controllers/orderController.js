import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

const createOrder = async (req, res)=>{ 
  try {
    const { 
      product, 
      foodType, 
      quantity, 
      price 
    } = req.body;
    
    const order = new Order({ product, foodType, quantity, price });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export{
  createOrder,
  getAllOrders,
};
