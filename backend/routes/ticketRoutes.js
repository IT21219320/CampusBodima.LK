import express from 'express';
const router = express.Router();
import{ createTicket, getUserTickets, updateStatus, search, getTicketByUniqueId, replyTicket, deleteTicket, updateTicket } from '../controllers/ticketController.js';

//root path // localhost:3000/api/tickets/

/*router.route('/create') // localhost:3000/api/tickets/create */
router.post('/create', createTicket);
router.post('/getUserTickets', getUserTickets);
router.get('/:_id', getTicketByUniqueId);  //ticketUniqueId
router.put('/update', updateTicket); //ticketUpdate (update last ticket)
router.delete('/delete/:ticketId/:replyTktId',deleteTicket); 
router.put('/reply', replyTicket); //reply for the ticket
router.put('/updateStatus', updateStatus);
router.post('/search', search);  //search handler



export default router;

