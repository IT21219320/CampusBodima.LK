import asyncHandler from 'express-async-handler'
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import Reservation from '../models/reservationModel.js';
import Boarding from '../models/boardingModel.js';



// @desc Create a ticket
//route POST /api/tickets/create
// @access Private
const createTicket = asyncHandler(async (req,res) =>{
    const{ senderId, subject, category, subCategory ,description, attachment } = req.body;

    const reservation = await Reservation.findOne({occupantID: senderId});
    if(!reservation){
        res.status(400);
        throw new Error('Please join a boarding to raise ticket')
    }
    
    const boarding = await Boarding.findOne({_id: reservation.boardingId});
    
    console.log(reservation.boardingId);
    const owner = await User.findById(boarding.owner);

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
        recieverId: owner,
        subject,
        category,
        subCategory,
        description,
        attachment

    });

    if(ticket){
        res.status(201).json({ticket});
    }
    else{
        res.status(400)
        throw new Error('error');
    }

});

//getTicket by userId   userta adala tiket tika

const getUserTickets = asyncHandler(async (req,res) => {
    const id = req.body.id;
    const page = req.body.page || 0;
    const pageSize = req.body.rowsPerPage;
    const category = req.body.category;
    const subCategory = req.body.subCategory;
    const status = req.body.status;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const date = req.body.date;
    const search = req.body.search;

    const skip = (page) * pageSize;

    var totalRows = await Ticket.countDocuments({
        'senderId._id': id,
        ...(category !== 'all' ? { category } : {}),
        ...(subCategory !== 'all' ? { subCategory } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(date !== 'all' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
        subject: { $regex: search, $options: "i" } 
    });

    try{
        const tickets = await Ticket.find({
            'senderId._id': id,
            ...(category !== 'all' ? { category } : {}),
            ...(subCategory !== 'all' ? { subCategory } : {}),
            ...(status !== 'all' ? { status } : {}),
            ...(date !== 'all' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            subject: { $regex: search, $options: "i" } 
        })
        .skip(skip)
        .limit(pageSize);

        if(tickets){
            res.status(201).json({tickets,totalRows});
        }
         else{
            res.status(400);
            throw new Error('No tickets');
        } 
    }catch(err){
        res.status(500).json({err});
    }
});

// search
const search = asyncHandler(async (req,res) => {
    const id = req.body.id;
    const page = req.body.page || 0;
    const pageSize = req.body.rowsPerPage;
    const search = req.body.search;

    const skip = (page) * pageSize;

    var totalRows = await Ticket.countDocuments({
        'senderId._id': id,
        $or: [
            { subject: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { subCategory: { $regex: search, $options: "i" } },
            {status: {$regex: search, $options: "i"}},
            
          ],  
    });

    try{
        const tickets = await Ticket.find({
            'senderId._id': id,
            $or: [
                { subject: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { subCategory: { $regex: search, $options: "i" } },
                {status: {$regex: search, $options: "i"}},
                {description: {$regex: search, $options: "i"}}
              ],  
        })
        .skip(skip)
        .limit(pageSize);

        if(tickets){
            res.status(201).json({tickets,totalRows});
        }
         else{
            res.status(400);
            throw new Error('No tickets');
        } 
    }catch(err){
        res.status(500).json({err});
    }
});

//getTicket by Id      uniquetika(thread)

const getTicketByUniqueId = asyncHandler(async (req,res) => {
    const ticketId = req.params._id;

    console.log(ticketId);

    const ticket = await Ticket.findOne({_id:ticketId});

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
    const {_id,ticketId,senderId,recieverId,subject,category,subCategory,description,status,attachment} = req.body;

    const tickets = await Ticket.findById(_id);

    if(tickets){
        tickets.subject = subject || tickets.subject;
        tickets.category = category || tickets.category;
        tickets.subCategory = subCategory || tickets.subCategory;
        tickets.description = description || tickets.description;
        tickets.status = status || tickets.status;
        tickets.attachment = attachment || tickets.attachment;

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

//updateTicket status: Mark as resolved

const updateStatus = asyncHandler(async (req, res) => {
    const{_id} = req.body;

    const ticketStatus = await Ticket.findById(_id);

    if(ticketStatus){
        ticketStatus.status = "Resolved";
    
     const updatedTicketStatus = await ticketStatus.save();

        res.status(200).json({
            updatedTicketStatus
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
        getTicketByUniqueId,
        updateTicket,
        deleteTicket,
        updateStatus,
        search
        }






