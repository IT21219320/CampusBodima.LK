import asyncHandler from 'express-async-handler';
import Feedback from '../models/feedbackModel.js';
import User from '../models/userModel.js';
import Reservation from '../models/reservationModel.js'
import Boarding from '../models/boardingModel.js';




// @desc Create a feedback
// @route POST /api/feedbacks/create
// @access Private



const createFeedback = asyncHandler(async (req, res) => {
    const { feedbackId, category, description, ratingStar } = req.body;

    const reservation = await Reservation.findOne({occupantID: senderId});
   

    if(!reservation){
        res.status(400);
        throw new Error('Please join a boarding to raise ticket')
    }

    const boarding = await Boarding.findOne({_id: reservation.boardingId});

      const feedback = await Feedback.create({
        feedbackId,
        senderId: sender,
        category,
        description,
        ratingStar,
      });
  
      if(feedback){
        res.status(201).json({feedback});
    }
    else{
        res.status(400)
        throw new Error('error');
    }
    
  });
  //getTicket by userId
  // Getfeedback by feedbackId
  const getFeedbackById = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
  
    try {
      const feedback = await Feedback.findById(feedbackId);
  
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
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
  };