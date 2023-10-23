import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Boarding from '../models/boardingModel.js';

const createOrder = async (req, res) => {
  try {
    const {
      cart,
      occupantId
    } = req.body;

    const latestOrder = await Order.findOne({boarding: cart[0].boarding}).sort({ createdAt: -1 });

    let newOrderNo = 1
    if(latestOrder){
      newOrderNo = parseInt(latestOrder.orderNo) + 1
    }

    let items = [];
    let item;
    let total = 0;
    for(let i = 0; i < cart.length; i++){

      item = {
        product:cart[i].product,
        quantity:cart[i].quantity,
        price:cart[i].price,
        total:(cart[i].price*cart[i].quantity),
      }

      total += (cart[i].price*cart[i].quantity);

      items.push(item)
      
    }
    
    const order = new Order({
      items:items,
      orderNo:newOrderNo,
      boarding:cart[0].boarding,
      occupant: occupantId,
      total: total
    })
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    throw new Error(error)
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
  
  const ownerId = req.body.ownerId;
  let boardingId = req.body.boardingId;

  
  if(!boardingId){
    boardingId = await Boarding.findOne({ inventoryManager: ownerId });
    boardingId = boardingId._id.toString();
  }
  //1.const boarding = get boardings that has inventoryManager as ownerId
  const boarding = await Boarding.find({ inventoryManager: ownerId }).select('boardingName');

  if(boardingId.length == 0){
    throw new Error("You are not assigned to a boarding")
  }

  let query = {};

  if (boardingId === 'All') {
    query = { boarding: { $in: boarding.map(b => b._id) } };
  } else {
    query = { boarding: boardingId };
  }

  if(boarding.length>0){
    try {
      
      const order = await Order.find(query);
      if (order) {
          res.status(200).json({
            order,
            boarding,
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
}else{
  throw new Error("Sorry, No boardings assigned to you!!");
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
  const currentDate = new Date();

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const targetDate = new Date(order.date); // Parse the date from the database

    const timeDifference = currentDate - targetDate;

    const eightHoursInMillis = 24 * 60 * 60 * 1000;

    if (timeDifference < eightHoursInMillis) {
      await Order.deleteOne({ _id: orderId });
      res.status(200).json({
        message: "Order deleted successfully",
      });
    } else {
      res.status(200);
      throw new Error("You can't delete orders after one day.");
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