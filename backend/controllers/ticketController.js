import asyncHandler from 'express-async-handler'
import Ticket from '../models/ticketModel';
import User from '../models/userModel';



// @desc Create a ticket
//route POST /api/tickets/create
// @access Private
const createTicket = asyncHandler(async (req,res) =>{
    const{ senderId, subject, category, subCategory ,description } = req.body;

    const largestTicketNo = await Ticket.findOne({}, { ticketId: 1}).sort({ticketId: -1});
    
    var ticketId;

    if(largestTicketNo){
        ticketId = parseInt(largestTicketNo.ticketId) + 1;
    }else{
        ticketId = 1;
    }

    ticketId = ticketId.toString();

    const sender = await User.findById(senderId);

    const ticket = await Ticket.create({
        ticketId,
        senderId: sender,
        subject,
        category,
        subCategory,
        description

    });

    if(ticket){
        res.status(201).json({ticket});
    }
    else{
        res.status(400)
        throw new Error('error');
    }

});

//getTicket by userId

const getUserTickets = asyncHandler(async (req,res) => {
    const {id} = req.body;

    const tickets = await Ticket.find({
        $or: [{senderId: id},{recieverId: id}],
    });

    if(tickets){
        res.status(201).json({tickets});
    }
    else{
        res.status(400);
        throw new Error('No tickets');
    }
});

//getTicket by ticketId

const getTicketsbyId = asyncHandler(async (req,res) => {
    const{ticketId} = req.body;

    const ticket = await Ticket.find({ticketId});

    if(ticket){
        res.status(201).json({ticket});
    }
    else{
        res.status(400);
        throw new Error('No ticket can be found');
    }
});

//updatetickets

const updateTicket = asyncHandler(async (req,res) => {
    const {_id,ticketId,senderId,recieverId,subject,category,subCategory,description} = req.body;

    const tickets = await Ticket.findById(_id);

    if(tickets){
        tickets.subject = subject || tickets.subject;
        tickets.category = category || tickets.category;
        tickets.subCategory = subCategory || tickets.subCategory;
        tickets.description = description || tickets.description;

        const updatedTicket = await tickets.save();

        res.status(200).json({
            updatedTicket
        })

    }

    else{
        res.status(404);
        throw new Error('ticket not found');

    }

});

//deleteTicket

const deleteTicket = asyncHandler(async (req,res) => {

    const {_id} = req.query;

    const tickets = await Ticket.findById(_id); 

    if(tickets){
        await Ticket.findOneAndDelete({_id})
        res.status(200).json("Successfully Deleted")
    }
    else{
        res.status(404);
        throw new Error('Ticket not found')

    }
});


export { createTicket,
        getUserTickets,
        getTicketsbyId,
        updateTicket,
        deleteTicket }






