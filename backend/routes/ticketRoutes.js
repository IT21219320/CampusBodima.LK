import express from 'express';
const router = express.Router();
import{ createTicket, getUserTickets, updateStatus, search, getTicketByUniqueId } from '../controllers/ticketController.js';

//root path // localhost:3000/api/tickets/

/*router.route('/create') // localhost:3000/api/tickets/create */
router.post('/create', createTicket);
router.post('/getUserTickets', getUserTickets);
router.get('/:_id', getTicketByUniqueId);  //ticketUniqueId
/*router.put('/update', updateTicket);
router.delete('/delete',deleteTicket); */
router.put('/updateStatus', updateStatus);
router.post('/search', search);  //search handler



export default router;

