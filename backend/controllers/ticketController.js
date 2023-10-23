import asyncHandler from 'express-async-handler'
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import Reservation from '../models/reservationModel.js';
import Boarding from '../models/boardingModel.js';
import { sendMail } from '../utils/mailer.js';



// @desc Create a ticket
//route POST /api/tickets/create
// @access Private
const createTicket = asyncHandler(async (req,res) =>{
    const{ senderId, subject, category, subCategory ,description, attachment } = req.body;

    const reservation = await Reservation.findOne({occupantID: senderId, status:"Approved"});
    if(!reservation){
        res.status(400);
        throw new Error('Please join a boarding to raise ticket')
    }
    
    const boarding = await Boarding.findOne({_id: reservation.boardingId});
    
    
    const owner = await User.findById(boarding.owner);

    const largestTicketNo = await Ticket.findOne({}, { ticketId: 1}).sort({ticketId: -1});
    
    var ticketId;

    if(largestTicketNo){
        ticketId = parseInt(largestTicketNo.ticketId) + 1;
    }else{
        ticketId = 1;
    }

    const sender = await User.findById(senderId);

    const ticket = await Ticket.create({
        ticketId,
        senderId: sender,
        recieverId: owner,
        boardingId: boarding,
        subject,
        category,
        subCategory,
        description,
        attachment

    });

    

    if(ticket){
        const message = `<p><b>Dear ${owner.firstName},</b> <br><br> ${sender.firstName} has raised a ticket regarding <b>${category}</b>. Please reply to this ticket as soon as possible.
                          <br><br> Best wishes,<br>
                          The CampusBodima Team. </p>`
        sendMail(owner.email,message,"You have a new ticket to respond");
        res.status(201).json({ticket});
    }
    else{
        res.status(400)
        throw new Error('error');
    }

});

//getTicket by userId   occupant ta adala tiket tika

const getUserTickets = asyncHandler(async (req,res) => {
    const id = req.body.id;   //userid
    const page = req.body.page || 0;
    const pageSize = req.body.rowsPerPage;
    const category = req.body.category;
    const subCategory = req.body.subCategory;
    const status = req.body.status;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const date = req.body.date;
    const search = req.body.search;
    const sortColumn = req.body.sortColumn;
    const order = req.body.order;
    

    const skip = (page) * pageSize;

    endDate.setHours(23, 59, 59, 999); // Set to just before midnight of the following day


    const reservation = await Reservation.findOne({occupantID: id, status: "Approved"});
    if(!reservation){
        res.status(400);
        throw new Error('Please join a boarding to raise ticket')
    }

    var totalRows = await Ticket.countDocuments({
        'senderId._id': id,
        'boardingId._id': reservation.boardingId,
        ...(category !== 'all' ? { category } : {}),
        ...(subCategory !== 'all' ? { subCategory } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(date !== 'all' ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}),
        $or: [
            {subject: { $regex: search, $options: "i" } },
            //{description: { $regex: search, $options: "i" } },
        ]
        
    });

    try{
        const tickets = await Ticket.find({
            'senderId._id': id,
            'boardingId._id': reservation.boardingId,
            ...(category !== 'all' ? { category } : {}),
            ...(subCategory !== 'all' ? { subCategory } : {}),
            ...(status !== 'all' ? { status } : {}),
            ...(date !== 'all' ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            $or: [
                {subject: { $regex: search, $options: "i" } },
                //{description: { $regex: search, $options: "i" } },
            ]
        })
        .collation({locale: "en"}).sort({ [sortColumn]: order})
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

// search handler
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

//getTicket by uniqueId     uniquetika(thread)

const getTicketByUniqueId = asyncHandler(async (req,res) => {
    const ticketId = req.params._id;

    

    const ticket = await Ticket.findOne({_id:ticketId});

    if(ticket){
        res.status(201).json({ticket});
    }
    else{
        res.status(400);
        throw new Error('No ticket can be found');
    }
});


//replyTicket

const replyTicket = asyncHandler(async (req, res) => {
    const{_id, senderId, recieverId, description, attachment } = req.body;

    const ticket = await Ticket.findById(_id);
    

    if(ticket){

        var latestReplyId;
        if(ticket.reply.length == 0){
            latestReplyId = parseInt(ticket.ticketId)+0.1;
        }
        else{
             latestReplyId = parseFloat(ticket.reply[ticket.reply.length - 1].ticketId)+0.1;
        }
                
        
        const reply = {
            ticketId: latestReplyId.toFixed(1),
            senderId: senderId,
            recieverId: recieverId,
            subject: ticket.subject,
            category: ticket.category,
            subCategory: ticket.subCategory,
            description: description,
            attachment: attachment
        }
        console.log(senderId);
        console.log(recieverId);

        const updatedTicket = await Ticket.findOneAndUpdate(
            { _id: _id }, // Find the parent ticket by _id
            { $push: { reply: reply } },
            { $set : {status: "Pending"}}
        );
            //sending email 
        const message = `<p><b>Dear ${recieverId.firstName},</b> <br><br> ${senderId.firstName} has replied to your ticket <b>${ticket.subject}</b>. 
                          <br><br> Best wishes,<br>
                          The CampusBodima Team. </p>`
        sendMail(recieverId.email,message,"You have got a response to your ticket");

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

//updateticket (update last ticket)

const updateTicket = asyncHandler(async (req,res) => {
    const {ticketId,subject,category,subCategory,description,status,attachment,replyTktId } = req.body;

    let ticket = await Ticket.findById(ticketId); 
    console.log(attachment);
    if (ticket) {
        if(ticketId == replyTktId){
            ticket = await Ticket.findOne({_id:ticketId});
            
            ticket.subject = subject || ticket.subject;
            ticket.category = category || ticket.category;
            ticket.subCategory = subCategory || ticket.subCategory;
            ticket.description = description || ticket.description;
            ticket.status = status || ticket.status;
            ticket.attachment = attachment;
            ticket = await ticket.save();
        }
        else{
            for(let i = 0; i < ticket.reply.length; i++){
                if(ticket.reply[i]._id == replyTktId){
                    ticket.reply[i].subject = subject || ticket.reply[i].subject;
                    ticket.reply[i].category = category || ticket.reply[i].category;
                    ticket.reply[i].subCategory = subCategory || ticket.reply[i].subCategory;
                    ticket.reply[i].description = description || ticket.reply[i].description;
                    ticket.reply[i].status = status || ticket.reply[i].status;
                    ticket.reply[i].attachment = attachment;
                    
                    ticket = await ticket.save();
                }
            }
            
            
        }
        res.status(200).json({ticket});
    } else {
        res.status(404)
        throw new Error("Ticket not found.");
    }

});


//deleteTicket

const deleteTicket = asyncHandler(async (req,res) => {

    const {ticketId, replyTktId } = req.params;

    let ticket = await Ticket.findById(ticketId);

    if (ticket) {
        if(ticketId == replyTktId){
            ticket = await Ticket.findOneAndDelete({_id:ticketId});
        }
        else{
            for(let i = 0; i < ticket.reply.length; i++){
                if(ticket.reply[i]._id == replyTktId){
                    ticket.reply.splice(i, 1);
                }
            }

            ticket = await ticket.save();
        }
        res.status(200).json({ticket});
    } else {
        res.status(404)
        throw new Error("Ticket not found.");
    }
}); 


//owner

//getTicket by ownerId   ownert ta adala tiket tika

const getOwnerTickets = asyncHandler(async (req,res) => {
    const id = req.body.id;
    const page = req.body.page || 0;
    const pageSize = req.body.rowsPerPage;
    const category = req.body.category;
    const subCategory = req.body.subCategory;
    const status = req.body.status;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const date = req.body.date;
    const search = req.body.search;
    let boardingId = req.body.boardingId || 'all';
    const sortColumn = req.body.sortColumn;
    const order = req.body.order;

    const skip = (page) * pageSize;
    
    endDate.setHours(23, 59, 59, 999); // Set to just before midnight of the following day

    const boarding = await Boarding.findOne({owner: id, status:"Approved"});
    if(!boarding){
        res.status(400);
        throw new Error('Please create a boarding to view tickets')
    }

    
    var ownerBoardings = await Boarding.find({owner: id, status:"Approved"}).select('boardingName');

    var totalRows = await Ticket.countDocuments({
        'recieverId._id': id,
        ...(boardingId !== 'all' ? { 'boardingId._id': boardingId } : {}),
        ...(category !== 'all' ? { category } : {}),
        ...(subCategory !== 'all' ? { subCategory } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(date !== 'all' ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}),
        subject: { $regex: search, $options: "i" } 
    });

    try{
        const tickets = await Ticket.find({
            'recieverId._id': id,
            ...(boardingId !== 'all' ? { 'boardingId._id': boardingId } : {}),
            ...(category !== 'all' ? { category } : {}),
            ...(subCategory !== 'all' ? { subCategory } : {}),
            ...(status !== 'all' ? { status } : {}),
            ...(date !== 'all' ? { updatedAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            subject: { $regex: search, $options: "i" } 
        })
        .collation({locale: "en"}).sort({ [sortColumn]: order})
        .skip(skip)
        .limit(pageSize);

        if(tickets){
            res.status(201).json({tickets,totalRows,ownerBoardings});
        }
         else{
            res.status(400);
            throw new Error('No tickets');
        } 
    }catch(err){
        res.status(500).json({err});
    }
});



export { createTicket,
        getUserTickets,
        getTicketByUniqueId,
        updateTicket,
        deleteTicket,
        updateStatus,
        replyTicket, //occupant controllers 
        getOwnerTickets,
        search
        }






