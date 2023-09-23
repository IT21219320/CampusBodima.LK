import express from 'express';
 

const router = express.Router();
import{ createFeedback,getAllFeedbacks,updateFeedback,deleteFeedback,getFeedbackByUserId } from '../controllers/feedbackController.js';


/*route('/create') // localhost:5000/api/feedback/create */


router.post('/create', createFeedback);
router.get('/getfeedback', getAllFeedbacks);
router.post('/getfeedbackByid',getFeedbackByUserId);
router.put('/occupant/feedback/update/:userId', updateFeedback);
router.delete('/delete',deleteFeedback); 
//router.post('/search', search);

export default router;