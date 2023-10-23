import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import {Link as ReactLink} from "react-router-dom";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Form, FloatingLabel} from 'react-bootstrap';
import { Breadcrumbs, Typography, Link, Card, CardContent, Avatar, CircularProgress, Button, Dialog, DialogContent, DialogTitle, DialogActions, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Close, NavigateNext, Warning } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import { useDeleteTicketMutation, useGetTicketByUniqueIdMutation, useReplyTicketMutation, useUpdateTicketMutation, useUpdateTicketStatusMutation } from "../slices/ticketsApiSlices";
import { toast } from "react-toastify";
import { StringToAvatar } from "../utils/StringToAvatar";
import ticketThreadPageStyles from "../styles/ticketThreadPageStyles.module.css";
import { formatDistanceToNow } from "date-fns";
import {BiTimeFive} from "react-icons/bi";
import {RiDeleteBinLine} from "react-icons/ri";
import {FiEdit} from "react-icons/fi"; 

import storage from '../utils/firebaseConfig';
import {ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'

const OccupantTicketThreadPage = () => {

    const {ticketId} = useParams();
    const[ticket, setTicket] = useState("");
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState("");
    const [tempDeleteId, setTempDeleteId] = useState('');
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);
    const [isLoading4, setIsLoading4] = useState(false);
    const [update, setUpdate] = useState(false);
    const [updateDescription, setUpdateDescription] = useState('');
    const [updateAttachment, setUpdateAttachment] = useState('');
    const [updateAttachmentLink, setUpdateAttachmentLink] = useState('');

    const currentTime = new Date();
    const fifteenMinutesAgo = new Date(currentTime - 15 * 60 * 1000); //1second=1000ms

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();
    
    
    const { userInfo } = useSelector((state) => state.auth);
    //useffects run when the page loads
    useEffect(() => {
        loadData();
    },[]);

    const [getTicketByUniqueID, { isLoading }] = useGetTicketByUniqueIdMutation();
    const [updateTicketStatus] = useUpdateTicketStatusMutation();
    const [replyTicket] = useReplyTicketMutation();
    const [useDeleteTicket] = useDeleteTicketMutation();
    const [updateTicket] = useUpdateTicketMutation();
    

    const loadData = async () => {
        setIsLoading3(true)
        try{
            const res = await getTicketByUniqueID( ticketId ).unwrap();

            let ticket = { ...res.ticket };

            if (ticket.attachment) {
                try {
                    const Url = await getDownloadURL(ref(storage, ticket.attachment));
                    ticket = { ...ticket, attachmentLink: Url }; // Create a new object with the updated attachment
                } catch (error) {
                    console.log(error);
                }
            }

            if (ticket.reply.length > 0) {
                const updatedReplies = [];

                for (let i = 0; i < ticket.reply.length; i++) {
                    let reply = ticket.reply[i];
                    if (reply.attachment) {
                        try {
                            const Url2 = await getDownloadURL(ref(storage, reply.attachment));
                            const updatedReply = { ...reply, attachmentLink: Url2 }; // Create a new object with the updated attachment
                            updatedReplies.push(updatedReply);
                        } catch (error) {
                            console.log(error);
                        }
                    } else {
                        updatedReplies.push(reply);
                    }
                }

                ticket = { ...ticket, reply: updatedReplies }; // Update the ticket object with the updated replies
            }

            setTicket(ticket);
            setIsLoading3(false)

            
        } catch(err){
            toast.error(err.data?.message || err.error);
            setIsLoading3(false)
            navigate('/occupant/ticket');
        }
    }

    const TimeAgo = ( date ) => {
        const formattedDate = formatDistanceToNow(date, { addSuffix: true });
        
        return formattedDate;
    }

    const handleResolvedBtn = async(_id) =>{
        setIsLoading3(true);

        try{
            const res = await updateTicketStatus( {_id} ).unwrap();
            loadData();
            toast.success('Successfully marked as resolved');
        } catch(err){
            toast.error(err.data?.message || err.error);
        }        
        setIsLoading3(false);
   }

   const handleReplyBtn = async()=>{
        setIsLoading3(true);

        if (description != "") {
            try {
                var uniqueName;
                if(attachment != ''){
                    const timestamp = new Date().getTime();
                    const random = Math.floor(Math.random() * 1000) + 1;
                    uniqueName = `${timestamp}_${random}.${attachment.name.split('.').pop()}`;
                
                    const storageRef = ref(storage, `${uniqueName}`);
                    const uploadTask = uploadBytesResumable(storageRef, attachment);
    
                    await uploadTask;
                }
    
                try{
                    const res = await replyTicket( {_id:ticketId, description, attachment:uniqueName, senderId:ticket.senderId,  recieverId:ticket.recieverId} ).unwrap();
                    //setTicket(res.updatedTicket);  updated ticket came from ticket controller response
                    loadData();
                    toast.success('Successfully sent the reply');
                    setDescription('');
                    setIsLoading3(false);
                    
                } catch(err){
                    toast.error(err.data?.message || err.error);
                    setIsLoading3(false);
                }
    
            } catch (error) {
                console.log('Error uploading and retrieving image:', error);
                setIsLoading3(false);
            }
        }
        else{
            toast.error("Enter a description");
            setIsLoading3(false);
        }

        
       
   }
    //delete last ticket
    const handleDialogOpen = (e, id) => {
        e.preventDefault();
        if(new Date(ticket.updatedAt) > new Date(new Date() - 15 * 60  * 1000)){
            setTempDeleteId(id);
            setConfirmDialog(true);
        }
        else{
            toast.error('Cannot Delete ticket after 15 minutes!');
            loadData()
        }
    }

    const handleDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    } 

    const deleteTicket = async() => {
        handleDialogClose();
        try {
            setIsLoading3(true);

            const data = ticket._id+'/'+tempDeleteId;
            const res = await useDeleteTicket(data).unwrap();
            loadData()
            toast.success('Ticket Deleted successfully!');

            
            setIsLoading3(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setIsLoading3(false);
        }
    }

    //update last ticket
    const handleEditBtn = (ticket) => {
        setUpdateDescription(ticket.description);
        setUpdateAttachment(ticket.attachment);
        setUpdateAttachmentLink(ticket.attachmentLink);
        setUpdate(true);
    }

    //updateButton
    const handleUpdateBtn = async(replyTktId) => {
        console.log(isLoading4);
        if(new Date(ticket.updatedAt) > new Date(new Date() - 15 * 60 * 1000)){

            try{
                var uniqueName;
                if(updateAttachment){
                    const timestamp = new Date().getTime();
                    const random = Math.floor(Math.random() * 1000) + 1;
                    uniqueName = `${timestamp}_${random}.${updateAttachment.name.split('.').pop()}`;
                
                    const storageRef = ref(storage, `${uniqueName}`);
                    const uploadTask = uploadBytesResumable(storageRef, updateAttachment);
    
                    await uploadTask;
                }

                const res = await updateTicket({ticketId:ticket._id, replyTktId, description:updateDescription, attachment:uniqueName});
                setUpdateAttachment('');
                setUpdateAttachmentLink('');
                setUpdateDescription('')
                setUpdate(false);
                toast.success('Ticket updated successfully');
                setIsLoading4(false)
                loadData();
            }
            catch(err){
                toast.error(err.data?.message || err.error);
                setIsLoading4(false)
            }
        }
        else{
            toast.error('Cannot Update ticket after 15 minutes!');
            loadData();
            setIsLoading4(false)
        }
    }

    return(
        <>
            <Sidebar /> 

            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/occupant/ticket">My Tickets</Link>,

                                <Typography key="4" color="text.primary">{ticket.subject}</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>


                    <Row>
                        <Col>
                            <Card variant="outlined" className={ticketThreadPageStyles.card}>
                                <CardContent>
                                    <h5>{ticket.subject}</h5>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>

                    {!ticket || isLoading3 ? <div style={{width:'100%',height:'70vh',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> :
                        <>
                            <Row style={{marginTop:"10px"}}>
                                <Col>
                                    <Card variant="outlined" style={userInfo._id==ticket.senderId._id ? {borderLeft:'4px solid #5fa7f8'} : {borderLeft:'initial'}} >
                                        <CardContent >
                                            <Row>
                                                <Col style={{display:"flex", alignItems:"center"}}>
                                                    {ticket.senderId.image ? 
                                                        <Avatar alt={ticket.senderId.firstName+" "+ticket.senderId.lastName} src={ticket.senderId.image} style={{ width: 40, height: 40 }} referrerPolicy="no-referrer" /> 
                                                    : 
                                                        <Typography component="div">
                                                            <Avatar alt={ticket.senderId.firstName+" "+ticket.senderId.lastName} {...StringToAvatar(ticket.senderId.firstName+" "+ticket.senderId.lastName)} style={{ width: 40, height: 40, fontSize: 20 }} />
                                                        </Typography>
                                                    }
                                                    <h5 style={{color:"dimgrey", marginBottom:"0px"}}>
                                                        &nbsp;You ({ticket.senderId.firstName})
                                                    </h5>
                                                </Col>
                                                <Col style={{textAlign:"right"}}>
                                                    <BiTimeFive style={{marginBottom:"2px"}} /> {TimeAgo(new Date(ticket.createdAt))}
                                                </Col>
                                                {ticket.reply.length == 0 && (new Date(ticket.createdAt) > fifteenMinutesAgo) && userInfo._id==ticket.senderId._id ?
                                                <>
                                                    <Col lg={1}>
                                                        <div style={{display:'flex'}}>
                                                            <Button style={{minWidth:'0', padding:'5px'}} onClick={(e) => handleDialogOpen(e,ticket._id)}><RiDeleteBinLine style={{color:"#f73b54", fontSize:"20px"}}/></Button>
                                                        
                                                            <Button style={{minWidth:'0', padding:'5px'}} onClick={() => navigate(`/occupant/ticket/update/${ticket._id}`)}><FiEdit style={{color:"#3366ff", fontSize:"20px" }} /></Button>
                                                        </div>
                                                    </Col>
                                                </>              

                                                :""}
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <pre className={ticketThreadPageStyles.description}>{ticket.description}</pre>
                                                    {ticket.attachmentLink ? <ReactLink to={ticket.attachmentLink}  className={ticketThreadPageStyles.attachment} target="_blank" download>Download Attatchment</ReactLink> : ''}
                                                </Col>
                                            </Row>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col> {/*we check update? (update part also here)*/ }
                                    {ticket.reply.length>0 ?
                                        ticket.reply.map((tkt, index) => (
                                            (ticket.reply.length-1) == index && (new Date(tkt.createdAt) > fifteenMinutesAgo) && tkt.senderId._id == userInfo._id && update && ticket.status == "Pending"? 
                                                <Card variant="outlined" key={index} style={userInfo._id==ticket.senderId._id ? {borderLeft:'4px solid #5fa7f8',marginTop:'20px'} : {marginTop:'20px'}}>
                                                    <CardContent >
                                                            <>
                                                                <Row>
                                                                    <Col style={{display:"flex", alignItems:"center"}}>
                                                                        {tkt.senderId.image ? 
                                                                            <Avatar alt={tkt.senderId.firstName+" "+tkt.senderId.lastName} src={tkt.senderId.image} style={{ width: 40, height: 40 }} referrerPolicy="no-referrer" /> 
                                                                        : 
                                                                            <Typography component="div">
                                                                                <Avatar alt={tkt.senderId.firstName+" "+tkt.senderId.lastName} {...StringToAvatar(tkt.senderId.firstName+" "+tkt.senderId.lastName)} style={{ width: 40, height: 40, fontSize: 20 }} />
                                                                            </Typography>
                                                                        }
                                                                        <h5 style={{color:"dimgrey", marginBottom:"0px"}}>
                                                                            &nbsp;You ({tkt.senderId.firstName})
                                                                        </h5>
                                                                    </Col>
                                                                    <Col lg={6}style={{textAlign:"right"}}>
                                                                        <BiTimeFive style={{marginBottom:"2px"}} /> {TimeAgo(new Date(tkt.createdAt))}
                                                                    </Col>
                                                                    <Col lg={1}>
                                                                        <Button style={{float:"right"}} onClick={(e) => {setUpdate(false); setUpdateAttachment(''); setUpdateAttachmentLink(''); setUpdateDescription('')}}><Close style={{color:"#f73b54"}}/></Button>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col lg={9} xs={6} className='mt-3'>
                                                                        <FloatingLabel controlId="floatingTextarea2" label="Add Description">
                                                                            <Form.Control
                                                                                as="textarea"
                                                                                placeholder="Add Description"
                                                                                className={ticketThreadPageStyles.rplyTktDesc}
                                                                                value={updateDescription}  
                                                                                onChange={ (e) => setUpdateDescription(e.target.value)} 
                                                                                required
                                                                            />
                                                                        </FloatingLabel>
                                                                    </Col>
                                                                </Row>
                                                                <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                                    <Col lg={9} xs={6} className='mt-3'>
                                                                        {updateAttachment ? 
                                                                                <>
                                                                                    <ReactLink to={updateAttachmentLink} target="_blank" download>Attachment</ReactLink>
                                                                                    <Close onClick={() => {setUpdateAttachmentLink('');setUpdateAttachment('');}} style={{cursor:'pointer'}} /> 
                                                                                </>
                                                                            : 
                                                                            <Form.Group controlId="formFileMultiple" className="mb-3" style={{maxWidth:'40%'}}>
                                                                                <Form.Control type="file" onChange={(e) => {setUpdateAttachment(e.target.files[0]);setUpdateAttachmentLink(e.target.files[0])}} />
                                                                            </Form.Group>
                                                                        }
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col className="mt-3">
                                                                        <LoadingButton loading={isLoading4} variant="contained" color="warning" onClick={() => handleUpdateBtn(tkt._id)}>Update</LoadingButton>
                                                                    </Col>
                                                                </Row>
                                                            </>
                                                    </CardContent>
                                                </Card>
                                            :
                                                <Card variant="outlined" key={index} style={userInfo._id==tkt.senderId._id ? {borderLeft:'4px solid #5fa7f8',marginTop:'20px'} : {marginTop:'20px'}}>
                                                    <CardContent >
                                                            <>
                                                                <Row>
                                                                    <Col style={{display:"flex", alignItems:"center"}}>
                                                                        {tkt.senderId.image ? 
                                                                            <Avatar alt={tkt.senderId.firstName+" "+tkt.senderId.lastName} src={tkt.senderId.image} style={{ width: 40, height: 40 }} referrerPolicy="no-referrer" /> 
                                                                        : 
                                                                            <Typography component="div">
                                                                                <Avatar alt={tkt.senderId.firstName+" "+tkt.senderId.lastName} {...StringToAvatar(tkt.senderId.firstName+" "+tkt.senderId.lastName)} style={{ width: 40, height: 40, fontSize: 20 }} />
                                                                            </Typography>
                                                                        }
                                                                        <h5 style={{color:"dimgrey", marginBottom:"0px"}}>
                                                                            &nbsp; {userInfo._id == tkt.senderId._id ?<>You ({tkt.senderId.firstName})</> : tkt.senderId.firstName}
                                                                        </h5>
                                                                    </Col>
                                                                    <Col lg={6}style={{textAlign:"right"}}>
                                                                        <BiTimeFive style={{marginBottom:"2px"}} /> {TimeAgo(new Date(tkt.createdAt))}
                                                                    </Col>
                                                                    {(ticket.reply.length-1) == index && (new Date(tkt.createdAt) > fifteenMinutesAgo) && tkt.senderId._id == userInfo._id && ticket.status == "Pending" ? 
                                                                    <>
                                                                        <Col lg={1}>
                                                                            <div style={{display:'flex'}}>
                                                                                <Button style={{minWidth:'0', padding:'3px'}} onClick={(e) => handleDialogOpen(e,tkt._id)}><RiDeleteBinLine style={{color:"#f73b54",fontSize:"20px"}}/></Button>
                                                                                <Button style={{minWidth:'0', padding:'3px'}} onClick={() => handleEditBtn(tkt)}><FiEdit style={{color:"#3366ff", fontSize:"20px" }} /></Button>
                                                                            </div>  
                                                                        </Col>
                                                                    </>              
                                                                    :""}
                                                                </Row>
                                                                <Row>
                                                                    <Col>
                                                                        <pre className={ticketThreadPageStyles.description}>{tkt.description}</pre>
                                                                        {tkt.attachmentLink ? <ReactLink to={tkt.attachmentLink} className={ticketThreadPageStyles.attachment} target="_blank" download>Download Attatchment</ReactLink> : ''}
                                                                    </Col>
                                                                    
                                                                </Row>
                                                            </>
                                                    </CardContent>
                                                </Card>
                                        ))
                                    : ''}
                                </Col>
                            </Row>
                            {ticket.status == "Pending" ?
                            <Row style={{marginTop:"50px"}}>
                                <Col>
                                    <h5 style={{color:"dimgray"}}>Reply Or <span style={{color:"#5fa7f8", cursor:"pointer"}} onClick={() => handleResolvedBtn(ticket._id)}> Close this ticket</span></h5>
                                   
                                        <Card variant="outlined" style={{marginBottom:"10px"}}>
                                            <CardContent>
                                                <Row>
                                                    <Col style={{display:"flex", alignItems:"center"}}>
                                                        {ticket.senderId.image ? 
                                                            <Avatar alt={ticket.senderId.firstName+" "+ticket.senderId.lastName} src={ticket.senderId.image} style={{ width: 40, height: 40 }} referrerPolicy="no-referrer" /> 
                                                        : 
                                                            <Typography component="div">
                                                                <Avatar alt={ticket.senderId.firstName+" "+ticket.senderId.lastName} {...StringToAvatar(ticket.senderId.firstName+" "+ticket.senderId.lastName)} style={{ width: 40, height: 40, fontSize: 20 }} />
                                                            </Typography>
                                                        }
                                                        <h5 style={{color:"dimgrey", marginBottom:"0px"}}>
                                                            &nbsp;You ({ticket.senderId.firstName})
                                                        </h5>
                                                    </Col>
                                                </Row>
                                                <Row style={{marginLeft:"25px"}}>
                                                    <Col>
                                                        <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                            <Col lg={9} xs={6} className='mt-3'>
                                                            <FloatingLabel controlId="floatingTextarea2" label="Add Description">
                                                                <Form.Control
                                                                as="textarea"
                                                                placeholder="Add Description"
                                                                className={ticketThreadPageStyles.rplyTktDesc}
                                                                value={description}  
                                                                onChange={ (e) => setDescription(e.target.value)} 
                                                                required
                                                                />
                                                            </FloatingLabel>
                                                            </Col>
                                                        </Row>
                                                        <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                            <Col lg={9} xs={6} className='mt-3'>
                                                                <Form.Group controlId="formFileMultiple" className="mb-3" style={{maxWidth:'40%'}}>
                                                                    <Form.Control type="file" onChange={(e) => setAttachment(e.target.files[0])} />
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Button variant="contained" style={{marginLeft:"40px"}} onClick={handleReplyBtn}>Reply</Button>
                                                    </Col>
                                                </Row>

                                            </CardContent>

                                        </Card>
                                </Col>
                            </Row>
                            :""}
                        </>
                    }


                </Container>
            </div>
        
            <Dialog
                fullScreen={fullScreen}
                open={confirmDialog}
                onClose={handleDialogClose}
            >
                <DialogContent className={ticketThreadPageStyles.confirmIcon}>
                    <Warning style={{fontSize:'100px'}} />
                </DialogContent>
                <DialogTitle id="responsive-dialog-title">
                    {"Are you sure you want to delete this ticket?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={deleteTicket} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )

}

export default OccupantTicketThreadPage;