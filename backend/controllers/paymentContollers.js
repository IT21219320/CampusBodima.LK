import expressAsyncHandler from "express-async-handler";
import dotenv from 'dotenv';
import Stripe from "stripe";
import cron from "node-cron";
import payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import Boarding from "../models/boardingModel.js";
import reservations from "../models/reservationModel.js";
import Room from "../models/roomModel.js";
import Utility from "../models/utilityModel.js"
import toDoPayment from "../models/toDoPayments.js"
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});


const getPath = expressAsyncHandler(async (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

const getPublichkey = expressAsyncHandler(async (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
})

const makePayment = expressAsyncHandler(async (req, res) => {

  const { userInfo_id, bId, des, amount, month } = req.body;

  const user = await User.findById(userInfo_id);

  const boarding = await Boarding.findById(bId);
  const oUser = await User.findById(boarding.owner);
  const reserve = await reservations.findOne({ occupantID: userInfo_id });



  if (boarding.boardingType === "Annex") {

    const response = await payment.create({
      occupant: user,
      owner: oUser,
      paymentType: "Card",
      amount: amount,
      description: des,
      payableMonth: month,
      boarding: boarding,
      credited: amount,
    })
    if (response) {
      res.status(200).json({
        message: "payment inserted",
      });
    }
  }
  else if (boarding.boardingType === "Hostel") {
    let roomT;
    if (reserve) {

      roomT = await Room.findById(reserve.roomID);

    }

    const response = await payment.create({
      occupant: user,
      owner: oUser,
      paymentType: "Card",
      amount: amount,
      description: des,
      payableMonth: month,
      boarding: boarding,
      room: roomT,
      credited: amount,
    })
    if (response) {
      res.status(200).json({
        message: "payment inserted",
      });
    }
  } else {
    res.status(200).json({
      message: "No reservation",
    });
  }


})

const getPaymentsByUserID = expressAsyncHandler(async (req, res) => {
  const { userInfo_id, oId, month } = req.body;
  const user = await User.findById(userInfo_id);


  let payments
  if (oId) {
    if (month) {
      payments = await payment.find({ "occupant._id": userInfo_id, amount: { $regex: oId }, payableMonth: month });
    } else {
      payments = await payment.find({ "occupant._id": userInfo_id, amount: { $regex: oId } });
    }
  } else {
    if (month) {
      payments = await payment.find({ "occupant._id": userInfo_id, payableMonth: month });
    } else {
      payments = await payment.find({ "occupant._id": userInfo_id });
    }


  }

  if (payments) {
    res.status(200).json({
      payments
    })
  }

})

const getPaymentsByOwnerID = expressAsyncHandler(async (req, res) => {
  const { userInfo_id, boId } = req.body;
  const user = await User.findById(userInfo_id);
  let payments
  if (boId) {
    payments = await payment.find({ "owner._id": userInfo_id, "boarding._id": boId });
  }
  else {
    payments = await payment.find({ "owner._id": userInfo_id });
  }
  if (payments) {
    res.status(200).json({
      payments
    })
  }

})

const withdrawByBoarding = expressAsyncHandler(async (req, res) => {
  const { userInfo_id, bId, des, amount } = req.body;
  console.log(userInfo_id);
  console.log(bId);
  console.log(amount);
  const user = await User.findById(userInfo_id);
  console.log(user);
  const boarding = await Boarding.findById(bId);

  const response = await payment.create({

    owner: user,
    amount: amount,
    description: des,
    boarding: boarding,
    debited: amount,

  })
  if (response) {
    res.status(200).json({
      message: "Withraw successfull",
    });
  }


})

cron.schedule('0 0 10 * *', async () => {
  try {
    // Calculate the monthly fee for each subscribed user
    const reservedUsers = await reservations.find();

    const currentDate = new Date(Date.now());
    const currentMonth = currentDate.getMonth() + 1

    for (const userReservation of reservedUsers) {
      if (userReservation) {
        const boardingT = await Boarding.findById(userReservation.boardingId);

        let oneUserUtitlity = 0;
        if (boardingT) {
          const [utility, usersB] = await Promise.all([
            Utility.find({ boarding: boardingT._id }),
            reservations.find({ boardingId: boardingT._id }),
          ]);

          if (utility.length > 0) {
            const userCount = usersB.length;

            let totalUtility = 0;
            for (const oneU of utility) {
              totalUtility += parseInt(oneU.amount);
            }

            console.log("Total utility: ", totalUtility, " User count: ", userCount);
            oneUserUtitlity = totalUtility / parseInt(userCount);
          }

          console.log("One user utility: ", oneUserUtitlity);
        }

        await toDoPayment.create({
          amount: oneUserUtitlity,
          occupant: userReservation.occupantID,
          month: currentMonth,
        });
      }
    }

    console.log('Monthly fees calculated and updated.');
  } catch (error) {
    console.error('Error calculating monthly fees:', error);
  }
});

const calcMonthlyPayment = expressAsyncHandler(async (req, res) => {
  try {
    // Calculate the monthly fee for each subscribed user
    const reservedUsers = await reservations.find();

    const currentDate = new Date(Date.now())
    const currentMonth = currentDate.getMonth() + 1

    for (const userReservation of reservedUsers) {
      if (userReservation) {
        const boardingT = await Boarding.findById(userReservation.boardingId);

        let monthlyFee = 0;
        if (boardingT.boardingType === "Annex") {

          monthlyFee = parseInt(boardingT.rent)

        }
        else if (boardingT.boardingType === "Hostel") {
          const roomT = await Room.findById(userReservation.roomID);

          if (roomT) {
            monthlyFee = parseInt(roomT.rent);
          }
          else {
            console.log(userReservation.roomID, "No room available")
          }

        }

        let oneUserUtitlity = 0;
        if (boardingT) {
          const [utility, usersB] = await Promise.all([
            Utility.find({ boarding: boardingT._id }),
            reservations.find({ boardingId: boardingT._id }),
          ]);

          if (utility.length > 0) {
            const userCount = usersB.length;
            let totalUtility = 0;
            for (const oneU of utility) {
              totalUtility += parseInt(oneU.amount);
            }

            console.log("Total utility: ", totalUtility, " User count: ", userCount);
            oneUserUtitlity = totalUtility / parseInt(userCount);
          }

          console.log("One user utility: ", oneUserUtitlity);
        }
        console.log(oneUserUtitlity + monthlyFee)
        await toDoPayment.create({
          amount: oneUserUtitlity + monthlyFee,
          occupant: userReservation.occupantID,
          month: currentMonth,
        });
      }
    }

    res.status(200).json({
      message: "Calculation done",
    });

    console.log('Monthly fees calculated and updated.');
  } catch (error) {
    console.error('Error calculating monthly fees:', error);
  }
});

const getToDoPaymentsByUserCMonth = expressAsyncHandler(async (req, res) => {
  const { userInfo_id } = req.body;
  const currentDate = new Date(Date.now());
  const currentMonth = currentDate.getMonth() + 1;
  try {

    const response = await toDoPayment.find({ occupant: userInfo_id, month: currentMonth, status: 'pending' });

    if (response) {
      res.status(200).json(
        response
      )
    }

  } catch (error) {

    console.log(error)

  }

})

const getToDoPaymentsByUser = expressAsyncHandler(async (req, res) => {
  const { userInfo_id } = req.body;
  const currentDate = new Date(Date.now());
  const lastMonth = currentDate.getMonth();
  try {
    const response = await toDoPayment.find({ occupant: userInfo_id, month: lastMonth, status: 'pending' });
    if (response) {
      res.status(200).json(
        response
      )
    }

  } catch (error) {
    console.log(error)
  }

})

const getAllToDoPaymentsByUser = expressAsyncHandler(async (req, res) => {
  const { userInfo_id } = req.body;
  try {
    const response = await toDoPayment.find({ occupant: userInfo_id });
    if (response) {
      res.status(200).json(
        response
      )
    }

  } catch (error) {
    console.log(error)
  }

})

const getToDoPaymentById = expressAsyncHandler(async (req, res) => {
  const { id } = req.body;

  try {
    const response = await toDoPayment.findById(id);
    if (response) {
      res.status(200).json(
        response
      )
    }

  } catch (error) {
    console.log(error)
  }

})

const changeStatus = expressAsyncHandler(async (req, res) => {
  const payId = req.body.payId;
  console.log(payId);
  const payRes = await toDoPayment.findById(payId);
  console.log(payRes);
  payRes.status = 'paid';
  await payRes.save();
  if (payRes) {
    res.status(200).json({
      message: "Payment status updated",
      payRes
    })
  }
})

const getMyReservation = expressAsyncHandler(async (req, res) => {
  const userInfo_id = req.body;

  try {
    const resMyB = await reservations.findOne({ occupantID: userInfo_id })
    res.status(200).json(resMyB);
  } catch (error) {
    console.log(error)
  }


})

const changeReservationPaidStatus = expressAsyncHandler(async (req, res) => {
  const userInfo_id = req.body.userInfo_id;

  try {
    const resPayPen = await reservations.findOne({ occupantID: userInfo_id, paymentStatus: 'Pending' })
    if (resPayPen) {
      resPayPen.paymentStatus = 'Paid'
      resPayPen.save();
      res.status(200).json(resPayPen)
    }
  } catch (error) {
    console.log(error)
  }

  res.status(404).json({
    message: "Not updated"
  })
})

const getIntent = expressAsyncHandler(async (req, res) => {

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

const getWebHook = expressAsyncHandler(async (req, res) => {
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


export { getIntent, getPath, getPublichkey, getWebHook, makePayment, getPaymentsByUserID, getPaymentsByOwnerID, calcMonthlyPayment, getToDoPaymentsByUserCMonth, getToDoPaymentsByUser, getMyReservation, changeStatus, changeReservationPaidStatus, getToDoPaymentById, getAllToDoPaymentsByUser, withdrawByBoarding };
