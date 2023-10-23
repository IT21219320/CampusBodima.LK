import asyncHandler from 'express-async-handler';
import Feedback from '../models/feedbackModel.js';
import User from '../models/userModel.js';
import Boarding from '../models/boardingModel.js';
import bodyParser from 'body-parser';
import ReservationHistory from '../models/reservationHistory.js';
import { sendMail } from '../utils/mailer.js';





// @desc Create a feedback
// @route POST /api/feedback/create
// @access Private



const createFeedback = asyncHandler(async (req, res) => {
    const {senderId, description, rating,boardingId } = req.body;

    const reservationHistory = await ReservationHistory.findOne({'boarding._id':boardingId,'occupant._id':senderId});

    if(reservationHistory){

      const largestFeedbackNo = await Feedback.findOne({}, { feedbackId: 1}).sort({feedbackId: -1});
    
    var feedbackId;

    if(largestFeedbackNo){
        feedbackId = parseInt(largestFeedbackNo.feedbackId) + 1;
    }else{
        feedbackId = 1;
    }



    feedbackId = feedbackId.toString();

   
    const sender = await User.findById(senderId);
    const boarding = await Boarding.findById(boardingId).populate('owner');
    if(!boarding){
      res.status(400);
      throw new Error('Boarding Not Found!');
    }

    
    
    const ownerEmail = boarding.owner.email;
    
      const feedback = await Feedback.create({
        feedbackId,
        senderId: sender,
        boardingId: boarding,
        description,
        rating,
        
      });
  
      if(feedback){
        if(feedback.rating>3){
        // Send email to each occupant with per occupant cost
        const message = `<p>
        <b>Dear ${boarding.owner.firstName}</b>,<br/><br/>

          I'm delighted to share that we've received glowing feedback about your<b style="color: blue;"> ${feedback.boardingId.boardingName}</b> boarding facility.<br/> Clients praised the <b>(${feedback.rating}/5) ratings with description as "${feedback.description}"</b>.<br/>Thank you for your exemplary service.
          <br/>
          Warm regards,
          <br/>
          Campusbodima Team<br/>
          Admin<br/>
          campusbodima.lk
        </p>`
        
        sendMail(ownerEmail,message,"Concerning Feedback Received for Your Boarding Facility");
        res.status(201).json({ message: "feedback and rating Sent!"});}
        else{
          const message = `<p><b>Dear ${boarding.owner.firstName}</b>,<br/><br/>

        I regret to inform you that we have received concerning feedback about your <b style="color: blue;"> ${feedback.boardingId.boardingName}</b> boarding facility. Clients expressed dissatisfaction with <b style="color: red;">(${feedback.rating}/5)ratings with description as "${feedback.description}"</b>.<br/> We urge you to address these issues promptly to ensure the well-being of the people entrusted to your facility.<br/>Thank you.
        
        Sincerely,
          <br/>
          Campusbodima Team<br/>
          Admin<br/>
          campusbodima.lk
        </p>`
        
        sendMail(ownerEmail,message,"Concerning Feedback Received for Your Boarding Facility");
        res.status(201).json({ message: "feedback and rating Sent!"});
        
        }
      
    }
    else{
        res.status(400)
        throw new Error('error');
    }

    }else{

      res.status(400);
        throw new Error(' Not Found!');

    }
    
    
  });


  
  // @desc Get feedback by userId
 // @route GET /api/feedback/user/:userId
 // @access Private
/*const getFeedbackByUserId = asyncHandler(async (req, res) => {
  try{
    const userId = req.query; // Assuming userId is passed as a URL parameter
    
    const search = req.query.search;
    const page = req.body.pageNo || 1;
    const pageSize = 10;
    


    const skip = (page) * pageSize;
    
    var totalFeedback = await Feedback.countDocuments({
      'senderId._id': userId,
      description: { $regex: search, $options: 'i' },
    });

    const totalPages = Math.ceil(totalFeedback / pageSize);

    const feedback = await Feedback.find({
      'senderId._id': userId,
      description: { $regex: search, $options: 'i' },
    })
      .skip(skipCount)
      .limit(pageSize);

    if (feedback) {
      res.status(200).json({
        feedback,
        totalPages,
      });
    } else {
      res.status(404).json({ message: 'No feedback found for the user.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});*/




const getFeedbackByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const searchQuery = req.body.searchQuery;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const date = req.body.date;


  endDate.setHours(23, 59, 59, 999);

  try {
    const feedback = await Feedback.find({ 'senderId._id': userId,
    description: { $regex: searchQuery, $options: 'i' },
    ...(date !== 'all' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), 
  }).populate('boardingId');
    
   

    if (feedback) {
      res.status(200).json({ feedback });
    } else {
      res.status(404).json({ error: 'No feedback found for the user.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});


const getFeedbackByBoardingId = asyncHandler(async (req, res) => {
  const {boardingId } = req.body;
  

  try {
    const feedback = await Feedback.find({ boardingId })
    
   

    if (feedback) {
      res.status(200).json({ feedback });
    } else {
      res.status(404).json({ error: 'No feedback found for the user.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});







 

  // Getfeedback by feedbackId
  // @access Private


  const getAllFeedbacks = asyncHandler(async (req, res) => {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const date = req.body.date;
    const searchQuery = req.body.searchQuery;

    endDate.setHours(23, 59, 59, 999);

    try {
        const feedback = await Feedback.find({ 
          ...(date !== 'all' ? { updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {}), 
          description: { $regex: searchQuery, $options: 'i' },
        }).populate('boardingId');

        

            res.status(200).json({ feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch feedback.' });
    }
});








 
  
  // Update feedback by feedbackId
  // @access Private

  const updateFeedback = asyncHandler(async (req, res) => {
    //const { _id } = req.qu;
    const { feedbackId, newdescription, newrating,newcreatedAt} = req.body;
  
    try {
      const feedback = await Feedback.findById(feedbackId);

      if (!feedback) {
        res.status(404);
        throw new Error("Feedback not found");
       }
  
      
        
        feedback.description = newdescription || feedback.description;
        feedback.rating = newrating || feedback.rating;
        feedback.createdAt=newcreatedAt||feedback.createdAt;
  
        const updatedFeedback = await feedback.save();



        res.status(200).json({
          updatedFeedback
         }) 
  
        
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  });


  // @desc    Get Ingredients for Update
// route    GET /api/ingredient/owner/update/:boardingId/:ingredientId
// @access  Private - Owner
const getUpdateFeedback = asyncHandler(async (req, res) => {
  const {feedbackId,} = req.params;
  
  
  
  try {
    const feedback = await Feedback.findById(feedbackId);
    
    
    

    if (feedback) {
      res.status(200).json({ feedback });
    } else {
      res.status(404).json({ error: 'No feedback found for the user.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});
  
  // Delete feedback by feedbackId
// @access Private

const deleteFeedback = asyncHandler(async (req, res) => {
  const{feedbackId} = req.body;
   
  try {
    const feedback = await Feedback.findByIdAndDelete(feedbackId );

    

    if (!feedback) {
      res.status(404);
      throw new Error("Feedback not found");
    } else {
      res.status(200).json({
        message: 'Successfully deleted feedback'
      });
    }
  } catch (error) {
    res.status(400).json({
      error:'Failed to Delete Feedbacks'});
  }
});






  
  export {
    createFeedback,
    getAllFeedbacks,
    updateFeedback,
    getUpdateFeedback,
    deleteFeedback,
    getFeedbackByUserId,
    getFeedbackByBoardingId,
};