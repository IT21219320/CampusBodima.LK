import { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, FloatingLabel} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, InputLabel, Select, MenuItem, FormControl, TextField,} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import { useCreateTicketMutation } from '../slices/ticketsApiSlices';

import CreateTicketStyles from '../styles/createTicketStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { ticketsApiSlice } from '../slices/ticketsApiSlices';
import Sidebar from '../components/sideBar';


const CreateTicket = () => {
    const  { userInfo } = useSelector((state) => state.auth);

    const [viewUserInfo, setViewUserInfo] = useState();
    const [occupantId, setOccupantId] = useState(userInfo._id);
    const [occupantName, setOccupantName] = useState(userInfo.firstName +" "+ userInfo.lastName);
    const [occupantEmail, setOccupantEmail] = useState(userInfo.email);
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [description, setDescription] = useState('');

    const[createTicket, { isLoading }] =  useCreateTicketMutation();

    const navigate = useNavigate();
    
    useEffect(() => {
        setViewUserInfo(true);
    },[]);

    const changeCategory = (e) => {
        setCategory(e.target.value);

        if(e.target.value == 'boarding'){
            document.getElementById('boardingSub').style.display = "inline-flex";
            document.getElementById('foodSub').style.display = "none";
            setSubCategory('');
        }
        else{
            document.getElementById('foodSub').style.display = "inline-flex";
            document.getElementById('boardingSub').style.display = "none";
            setSubCategory('');
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
       
            try {
                const res = await createTicket({ senderId:occupantId, subject, category, subCategory ,description }).unwrap();
                
                toast.success("successful");
                navigate('/');  //should navigate to mytickets 
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        
    };


    return(
        <>
            <Sidebar />
            
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Boardings</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                    <Fade in={viewUserInfo} >
                        <Form onSubmit={submitHandler}>
                            <Row>
                                <Col>
                                    <Card variant="outlined" className={CreateTicketStyles.card}>
                                        <CardContent>
                                            <h4>Create Tickets</h4>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className={CreateTicketStyles.newTicket}>
                                <Col>
                                    <Card variant="outlined" className={CreateTicketStyles.card}>
                                        <CardContent>
                                            <Row id={CreateTicketStyles.newTicket}>
                                            <p><b>New Ticket</b></p> 
                                            </Row>
                                        
                                            <Row>
                                                <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                    <Col lg={3} xs={6}><label htmlFor="name" className={CreateTicketStyles.lbl}>Name</label></Col>
                                                    <Col lg={9} xs={6} className='mt-3'><TextField id="outlined-read-only-input" size='small' value={occupantName}  InputProps={{ readOnly: true,}} /></Col>    
                                                </Row>

                                                <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                    <Col lg={3} xs={6}><label htmlFor="name" className={CreateTicketStyles.lbl}>Email</label></Col>
                                                    <Col lg={9} xs={6} className='mt-3'><TextField id="outlined-read-only-input" size='small' value={occupantEmail}  InputProps={{ readOnly: true,}} /></Col>    
                                                </Row>

                                                <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                    <Col lg={3} xs={6}><label htmlFor="subject" className={CreateTicketStyles.lbl}>Subject<span className={CreateTicketStyles.require}><b>*</b></span></label></Col>
                                                    <Col lg={9} xs={6} className='mt-3'><input type="text" placeholder="Enter Subject" value={subject} id={CreateTicketStyles.subject} onChange={ (e) => setSubject(e.target.value)} required/></Col>
                                                </Row>
                                                <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                    <Col lg={3} xs={6}><label htmlFor="category" className={CreateTicketStyles.lbl}>Category<span className={CreateTicketStyles.require}><b>*</b></span></label></Col>
                                                    <Col lg={9} xs={6} className='mt-3'>
                                                        <FormControl sx={{ m:0, minWidth: 120 }} size="small"> 
                                                            <Select value={category} onChange={changeCategory} required  >
                                                                <MenuItem value="boarding">Boarding Issue</MenuItem>
                                                                <MenuItem value="food">Food Issues</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                        <br/>
                                                        <FormControl sx={{ mt:1, ml:3, minWidth: 120 }} size="small" id="boardingSub" style={{display:'none'}}>
                                                            <Select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required  >
                                                                <MenuItem value="utilities">Utilities</MenuItem>
                                                                <MenuItem value="payments">Payment Issues</MenuItem>
                                                                <MenuItem value="other">Other</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl sx={{ mt:1, ml:3, minWidth: 120 }} size="small" id="foodSub" style={{display:'none'}}>
                                                            <Select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required  >
                                                                <MenuItem value="payments">Payment Issues</MenuItem>
                                                                <MenuItem value="refunds">Quality Control</MenuItem>
                                                                <MenuItem value="other">Other</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Col>
                                                </Row>
                                                <Row style={{alignItems:'flex-start', marginTop:'10px'}}>
                                                    <Col lg={3} xs={6}><label htmlFor="description" className={CreateTicketStyles.lbl}>Description<span className={CreateTicketStyles.require}><b>*</b></span></label></Col>
                                                    <Col><FloatingLabel controlId="floatingTextarea2" label="Description">
                                                        <Form.Control as="textarea" placeholder="Add Description" style={{ height: '100px' }} value={description}  onChange={ (e) => setDescription(e.target.value)} required/>
                                                        </FloatingLabel></Col>
                                                </Row>
                                            </Row>
                                                <LoadingButton type="submit" loading={isLoading} className='mt-4 mb-4 me-4'  style={{float:'right'}} variant="contained">
                                                    Create Ticket
                                                </LoadingButton>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>


                            

                        </Form>
                    </Fade>
                </Container>
            </div>
        </>
    );
}




export default CreateTicket;


