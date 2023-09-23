import asyncHandler from 'express-async-handler';
import Feedback from '../models/feedbackModel.js';
import User from '../models/userModel.js';
import Reservation from '../models/reservationModel.js'
import Boarding from '../models/boardingModel.js';




// @desc Create a feedback
// @route POST /api/feedback/create
// @access Private



const createFeedback = asyncHandler(async (req, res) => {
    const {senderId,category, description, rating, } = req.body;

    /*const reservation = await Reservation.findOne({occupantID: senderId});
   

    if(!reservation){
        res.status(400);
        throw new Error('Please join a boarding if you wont to create Feedback')
    }

    const boarding = await Boarding.findOne({_id: reservation.boardingId});

    console.log(reservation.boardingId);
    const owner = await User.findById(boarding.owner);*/


    

    const largestFeedbackNo = await Feedback.findOne({}, { feedbackId: 1}).sort({feedbackId: -1});
    
    var feedbackId;

    if(largestFeedbackNo){
        feedbackId = parseInt(largestFeedbackNo.feedbackId) + 1;
    }else{
        feedbackId = 1;
    }

    feedbackId = feedbackId.toString();

    const sender = await User.findById(senderId);

      const feedback = await Feedback.create({
        feedbackId,
        senderId: sender,
        category,
        description,
        rating,
        
      });
  
      if(feedback){
        res.status(201).json({feedback});
    }
    else{
        res.status(400)
        throw new Error('error');
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

  try {
    const feedback = await Feedback.find({ 'senderId._id': userId });

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

    const { } = req.query;
    
  
    try {
      const feedback = await Feedback.find({});
  
      if (feedback) {
        res.status(200).json({ feedback });
      } else {
        res.status(404).json({ error: 'Feedback not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch feedback.' });
    }
  });
  
  // Update feedback by feedbackId
  // @access Private

  const updateFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const { category, description, ratingStar } = req.body;
  
    try {
      const feedback = await Feedback.findById(feedbackId);
  
      if (feedback) {
        feedback.category = category || feedback.category;
        feedback.description = description || feedback.description;
        feedback.ratingStar = ratingStar || feedback.ratingStar;
  
        const updatedFeedback = await feedback.save();
  
        res.status(200).json({ updatedFeedback });
      } else {
        res.status(404).json({ error: 'Feedback not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update feedback.' });
    }
  });
  
  // Delete feedback by feedbackId
  // @access Private
  const deleteFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
  
    try {
      const feedback = await Feedback.findById(feedbackId);
  
      if (feedback) {
        await Feedback.findByIdAndDelete(feedbackId);
        res.status(200).json('Successfully deleted feedback');
      
       } else {
        res.status(404).json({ error: 'Feedback not found' });
      }
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete feedback.' });
    }
  });
  
  export {
    createFeedback,
    getAllFeedbacks,
    updateFeedback,
    deleteFeedback,
    getFeedbackByUserId,
};