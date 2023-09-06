import express from 'express';
const router = express.Router();
import{ createTicket, getUserTickets } from '../controllers/ticketController.js';


/*router.route('/create') // localhost:3000/api/tickets/create */
router.post('/create', createTicket);
router.post('/getUserTickets', getUserTickets);
/*router.post('/', getTicketsbyTicketId);  //ticketId
router.put('/update', updateTicket);
router.delete('/delete',deleteTicket); */



export default router;

