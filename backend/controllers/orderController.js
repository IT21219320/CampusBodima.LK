import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

const createOrder = async (req, res) => {
  try {
    const {
      product,
      foodType,
      quantity,
      price,
      orderNo,
      foodImages,
      owner,
      occupantId,
      status,

      total,
    } = req.body;
    const productNames = {
      '3': 'Fried Rice',
      '6': 'Rice & Curry',
      '12': 'Noodles',
      '24': 'Hoppers',
    };
    
    const foodTypeNames = {
      '1': 'Fish',
      '2': 'Chicken',
      '7': 'Egg',
      '5': 'Normal',
    };
    const order = new Order({
      product:productNames[product],
      foodType:foodTypeNames[foodType],
      quantity:quantity,
      price:price,
      orderNo:orderNo+1,
      
      owner:owner,
      occupant: occupantId,
      status:status,
  
      total:total,
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Could not create the order" });
  }
};
const getOrder = asyncHandler(async (req, res) => {
  const userId = req.body.occupantId;
   
  
  try {
      const order = await Order.find({occupant:userId});

      if (order) {
          res.status(200).json({
            order,
          });
      } else {
          res.status(404).json({
              message: "Order not found",
          });
      }
  } catch (error) {
      res.status(500).json({
          message: "Server error",
      });
  }
});


const getTodayOrder = asyncHandler(async (req, res) => {
   
  
  try {
      const order = await Order.find();

      if (order) {
          res.status(200).json({
            order,
          });
      } else {
          res.status(404).json({
              message: "Order not found",
          });
      }
  } catch (error) {
      res.status(500).json({
          message: "Server error",
      });
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  
  const _id = req.params;

  const order = await Order.findById(_id);

  if(order){
    res.status(200).json({order});
  }
  else{
    throw new Error('Order Not Found');
  }

});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({_id:req.body._id});    
    if (order) {
      
      
      
      order.product = req.body.product||order.product;
      order.foodType = req.body.foodType||order.foodType;
      order.quantity = req.body.quantity||order.quantity;
      order.price = req.body.price||order.price;
      order.orderNo = req.body.orderNo||order.orderNo;
      order.status = req.body.status||order.status;
      order.date = req.body.date||order.date;
      order.total = req.body.total||order.total;
    
      const updateOrder = await order.save();

    res.status(200).json({
      _id:updateOrder._id,
      product:updateOrder.product,
      foodType:updateOrder.foodType,
      quantity:updateOrder.quantity,
      price:updateOrder.price,
      orderNo:updateOrder.orderNo,
      status:updateOrder.status,
      date:updateOrder.date,
      total:updateOrder.total
    });
    }else{
      res.status(404);
      throw new Error('Order not found');
     }
});


const updateStatus = asyncHandler(async (req, res) => {
  console.log(req.body._id);
  const order = await Order.findOne({_id:req.body._id});    
    if (order) {
      
      order.status = req.body.status||order.status;
      
    
      const updateOrder = await order.save();

    res.status(200).json({
      _id:updateOrder._id,
      product:updateOrder.product,
      foodType:updateOrder.foodType,
      quantity:updateOrder.quantity,
      price:updateOrder.price,
      orderNo:updateOrder.orderNo,
      status:updateOrder.status,
      
    });
    }else{
      res.status(404);
      throw new Error('Order not found');
     }
});


const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.body._id;
  console.log(orderId);
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    await Order.deleteOne({ _id:orderId });
    res.status(200).json({
      message: "Order deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete Order",
      error: error.message
    });
  }
});
export{
  createOrder,
  getTodayOrder,
  getOrder,
  getOrderById,
  updateStatus,
  updateOrder,
  deleteOrder,
};