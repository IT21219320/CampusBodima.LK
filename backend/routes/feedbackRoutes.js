import express from 'express';
 

const router = express.Router();
import{ createFeedback,getAllFeedbacks,updateFeedback,getUpdateFeedback,deleteFeedback,getFeedbackByUserId,getFeedbackByBoardingId } from '../controllers/feedbackController.js';


/*route('/create') // localhost:5000/api/feedback/create */


router.post('/create', createFeedback);
router.get('/getfeedback', getAllFeedbacks);
router.post('/getfeedbackByid',getFeedbackByUserId);
router.post('/getfeedbackbyBoardingid',getFeedbackByBoardingId);

router.put('/occupant/feedback/update', updateFeedback);
router.get('/occupant/feedback/update/:feedbackId', getUpdateFeedback);


router.delete('/delete', deleteFeedback); 
//router.post('/search', search);   //search bar

export default router;