import expressAsyncHandler from "express-async-handler";
import dotenv from 'dotenv';
import Stripe from "stripe";
import cron from "node-cron";
import payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import Boarding from "../models/boardingModel.js";
import reservations from "../models/reservationModel.js";
import Room from "../models/roomModel.js";
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
  });


const getPath = expressAsyncHandler(async(req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

const getPublichkey = expressAsyncHandler(async(req,res)=>{
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
})

const makePayment = expressAsyncHandler(async(req,res) =>{

  const {userInfo_id, bId} = req.body;
  const user = await User.findById(userInfo_id);
  
  const boarding = await Boarding.findById(bId);
  const oUser = await User.findById(boarding.owner);
  const reserve = await reservations.findOne({occupantID: userInfo_id });
  
  let room;
  if(reserve){
    console.log(reserve.roomID._id)
    room = await Room.findById(reserve.roomID);
    console.log(room)
  }
  
  if(boarding.boardingType === "Annex"){
    const response = await payment.create({
      occupant: user,
      owner : oUser,
      paymentType: "Card",
      amount: boarding.keyMoney,
      description: "Initial Payment to reserve",
      boarding : boarding,
      credited : boarding.keyMoney,
    })
    if(response){
      res.status(200).json({
          message: "payment inserted",
        });
    }
  }
  else if(boarding.boardingType === "Hostel"){
    console.log(room)
    const response = await payment.create({
      occupant: user,
      owner : oUser,
      paymentType: "Card",
      amount: room.keyMoney,
      description: "Initial Payment to reserve",
  
      boarding : boarding,
      credited : room.keyMoney,
    })
    if(response){
      res.status(200).json({
          message: "payment inserted",
        });
    }
  }else{
    res.status(200).json({
    message: "No reservation",
  });}
  

})

const getPaymentsByUserID = expressAsyncHandler(async(req, res) =>{
    const userInfo_id = req.body;
    const user = await User.findById(userInfo_id);
    const payments = await payment.find({"occupant._id":userInfo_id});
    if(payments){
        res.status(200).json({
            payments
        })
    }

})

cron.schedule('0 0 10 * *', async () => {
    try {
      // Calculate the monthly fee for each subscribed user
      const reservedUsers = await reservations.find();
  
      for (const user of reservedUsers) {
        
        
        
  
        
      }
  
      console.log('Monthly fees calculated and updated.');
    } catch (error) {
      console.error('Error calculating monthly fees:', error);
    }
  });

const getIntent = expressAsyncHandler(async(req,res)=>{
  
  const userInfo_id = req.body;
  const user = await User.findById(userInfo_id.userID);
  try {

    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'EUR',
      amount: 1999,
      automatic_payment_methods: { enabled: true }
    });

    // Send publishable key and PaymentIntent details to client
    res.status(202).json({
      clientSecret: paymentIntent.client_secret,
    });
    
  } catch (e) {
    res.status(400).send({
      error: {
        message: e,
      },
    });
  }
});

const getWebHook = expressAsyncHandler(async(req,res)=>{
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
  );
  } catch (err) {
    console.log(`Webhook signature verification failed.`);
    return res.sendStatus(400);
  }
  data = event.data;
  eventType = event.type;
  } else {
  // Webhook signing is recommended, but if the secret is not configured in `config.js`,
  // we can retrieve the event data directly from the request body.
  data = req.body.data;
  eventType = req.body.type;
}

if (eventType === 'payment_intent.succeeded') {
// Funds have been captured
// Fulfill any orders, e-mail receipts, etc
// To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
console.log('Payment captured!');
} else if (eventType === 'payment_intent.payment_failed') {
console.log('Payment failed.');
}
res.sendStatus(200);
})


export {getIntent, getPath, getPublichkey, getWebHook, makePayment,getPaymentsByUserID};
