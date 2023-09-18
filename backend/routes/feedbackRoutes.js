import express from 'express';
 

const router = express.Router();
import{ createFeedback,getFeedbackById,updateFeedback,deleteFeedback } from '../controllers/feedbackController.js';


/*route('/create') // localhost:5000/api/feedbacks/create */


router.post('/create', createFeedback);
router.post('/getfeedback', getFeedbackById);
router.put('/update', updateFeedback);
router.delete('/delete',deleteFeedback); 

export default router;