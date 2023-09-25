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

//getTicket by userId   occupant ta adala tiket tika

const getUserTickets = asyncHandler(async (req,res) => {
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
    const sortColumn = req.body.sortColumn;
    const order = req.body.order;

    const skip = (page) * pageSize;
    
    endDate.setHours(23, 59, 59, 999); // Set to just before midnight of the following day

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
            latestReplyId = 1.1;
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

        const updatedTicket = await Ticket.findOneAndUpdate(
            { _id: _id }, // Find the parent ticket by _id
            { $push: { reply: reply } },
            { $set : {status: "Pending"}}
        );


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
    if (ticket) {
        if(ticketId == replyTktId){
            ticket = await Ticket.findOne({_id:ticketId});
            
            ticket.subject = subject || ticket.subject;
            ticket.category = category || ticket.category;
            ticket.subCategory = subCategory || ticket.subCategory;
            ticket.description = description || ticket.description;
            ticket.status = status || ticket.status;
            ticket.attachment = attachment || ticket.attachment;
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
                    ticket.reply[i].attachment = attachment || ticket.reply[i].attachment;
                    
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

    const skip = (page) * pageSize;
    
    endDate.setHours(23, 59, 59, 999); // Set to just before midnight of the following day

    var totalRows = await Ticket.countDocuments({
        'recieverId._id': id,
        ...(category !== 'all' ? { category } : {}),
        ...(subCategory !== 'all' ? { subCategory } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(date !== 'all' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
        subject: { $regex: search, $options: "i" } 
    });

    try{
        const tickets = await Ticket.find({
            'recieverId._id': id,
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






