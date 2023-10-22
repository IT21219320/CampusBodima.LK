import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDeleteFeedbackMutation, useGetFeedbackByUserIdMutation } from "../slices/feedbackApiSlice";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table,Card } from 'react-bootstrap';
import { Breadcrumbs, Typography, Paper, InputBase, IconButton, Box, FormControl, InputLabel, Select, MenuItem, TablePagination, CircularProgress, Button, Rating,Link,CardContent } from '@mui/material';
import { NavigateNext, Search, Delete as DeleteIcon } from '@mui/icons-material';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';
import jsPDF from 'jspdf';
import { GetAppRounded, GridViewRounded } from '@mui/icons-material';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';


import Modal from 'react-bootstrap/Modal';
import Boarding from "../../../backend/models/boardingModel";

const OccupantFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  //const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  //const [search, setSearch] = useState('');
  const [rating, setRating] = useState('all');
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [deleteFeedbacks, setDeleteFeedbacks] = useState('');
  const [getFeedbackByUserId, { isLoading }] = useGetFeedbackByUserIdMutation();
  const [deleteFeedback, { isLoading2 }] = useDeleteFeedbackMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const ratings = ['all', '0', '1', '2', '3', '4','5'];
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [date, setDate] = useState('all');
 
  
 
  const TimeAgo = ( date ) => {
    const formattedDate = formatDistanceToNow(date, { addSuffix: true });
    
    return formattedDate;
  }  



  const [show, setShow] = useState(false);

  const loadFeedbackData = async () => {
    try {
      const res = await getFeedbackByUserId({ userId: userInfo._id ,searchQuery, startDate, endDate, date}).unwrap();
      setFeedbacks(res.feedback);
      //filteredFeedbacks(res.feedback);


    } catch (error) {
      console.error('Error getting feedbacks', error);
      }
  };
  const handleClose = () => setShow(false);
 
  useEffect(() => {
    loadFeedbackData();
  }, [ userInfo._id,searchQuery,deleteFeedbacks, startDate, endDate, date]);



  const handleDateRangeSelect = (ranges) =>{
    console.log(ranges);
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
    setDate('range');
}

const handleDateChange = (e) => {
    setDate(e.target.value);
    setStartDate(new Date());
    setEndDate(new Date());

}

const selectionRange = {
    startDate,
    endDate,
    key: 'selection',
}

 
  const handleShow = () => setShow(true);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (rating === 'all') {
      return true; // Show all feedbacks
    } else {
      return parseInt(feedback.rating) === parseInt(rating);
    }
  });

 

  const handleDeleteFeedback = async (feedbackId) => {setShow(false)
    try {
        const resDelete = await deleteFeedback({ feedbackId}).unwrap();
        console.log(resDelete.message);
        setDeleteFeedbacks(resDelete.message );
        toast.success('Feedback deleted successfully');
       
    } catch (err) {
      toast.error(err.data?.message || err.error);
    }
};


  const handleSearch=(event) =>{
    setSearchQuery(event.target.value);
   

  };

  const exportToPDF = () => {;
    //const feedbackDate = feedback.updatedAt.split('T')[0];
               
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // company details
    const companyDetails = {
      name: "CampusBodima",
      address: "138/K, Ihala Yagoda, Gampaha",
      phone: "071-588-6675",
      email: "info.campusbodima@gmail.com",
      website: "www.campusbodima.com"
    };

    // logo
    doc.addImage("/logo2.png", "PNG", 10, 10, 50, 30);

    // Show company details
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(`${companyDetails.name}`, 200, 20, { align: "right", style: "bold" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${companyDetails.address}`, 200, 25, { align: "right" });
    doc.text(`${companyDetails.phone}`, 200, 29, { align: "right" });
    doc.text(`${companyDetails.email}`, 200, 33, { align: "right" });
    doc.text(`${companyDetails.website}`, 200, 37, { align: "right" });

    // horizontal line
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);

    // Report details
    doc.setFontSize(8);
    doc.text(`Report of Feedbacks List`, 20, 55);
    doc.text(`Date: ${new Date().toDateString()}`, 20, 59);
    doc.text(`Author: ${userInfo.firstName} ${userInfo.lastName}`, 20, 63);


    // Add report title
    doc.setFontSize(12);
    doc.text("Feedbacks List", 85, 65);


    // table headers
    let headers = ["Date","Boarding Name","Discription","Number of Rating"];

    // Map the admin data to table rows

    const data = filteredFeedbacks.map((feedback) => [

      new Date(feedback.updatedAt).toISOString().split('T')[0],
      feedback.boardingId.boardingName,
      feedback.description,
      feedback.rating,
     
      //new Date(feedback.updateAt).toLocaleString('en-GB')
    ]);


    // table styles
    const styles = {
      halign: "center",
      valign: "middle",
      fontSize: 9,
    };

    // Add the table to the PDF document
        doc.autoTable({
            head: [headers],
            body: data,
            styles,
            margin: { top: 90 },
            startY: 75
        });
    

    

    

    
    // Save the PDF
    doc.save("Feedbacks.pdf");

};

  return (
    <>
      <Sidebar />
      <div className={dashboardStyles.mainDiv}>
        <Container className={dashboardStyles.container}>
          <Row>
            <Col>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                
                                <Typography key="3" color="text.primary">My Feedbacks</Typography>
                            </Breadcrumbs>
            </Col>
          </Row>
          <Row>
                        <Col>
                            <Card variant="outlined" className={occupantFeedbackStyles.card}>
                                <CardContent style={{color:'#fff',backgroundColor:'#232a67'}}>
                                    <h4>FEEDBACKS  &  RATING</h4> 
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>
          <Row>
            <Col>
            <Paper
  component="form"
  sx={{
    p: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
    background: '#e3e7ea8f', // Background color for the Paper component
  }}
>
  <InputBase
    sx={{ ml: 1, flex: 1 }}
    placeholder="Search Feedbacks by Discription"
    onChange={handleSearch}
  />
  <IconButton
    type="button"
    sx={{
      p: '10px',
      backgroundColor: '#007bff', // Background color for the button
      color: 'white', // Text color for the button
      '&:hover': {
        backgroundColor: '#0056b3', // Hover background color
      },
    }}
    aria-label="search"
  >
    <Search />
  </IconButton>
</Paper>
            </Col>
            
          </Row>
          <Row>
                <Col style={{textAlign:'right'}}>
                    <Button variant="contained" style={{marginRight:'10px', background:'#4c4c4cb5'}} onClick={exportToPDF}>Report<GetAppRounded /></Button>
                </Col>
            </Row>
          <Row style={{ marginTop: '30px' }}>
            
            <Col>
            <form  className={occupantFeedbackStyles.form}>
              <FormControl  style={{Width:'20px'}}>

              <Row style={{marginTop:'20px'}}>
                <Col><div style={{border: '1px solid #00000066', padding:'15px'}}>Sort By: </div></Col>
                <Col>
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel >Rating</InputLabel>
                            <Select
                            value={rating}
                            label="Rating"
                            onChange={(event) => setRating(event.target.value)}
                            >
                            {ratings.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option === 'all' ? 'All' : option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                    </Box>
                </Col>
                <Col>
                    <Box sx={{ minWidth: 120, minHeight:50 }}>
                        <FormControl fullWidth>
                            <InputLabel>Date</InputLabel>
                            <Select
                                label="Date"
                                value={date}
                                onChange={handleDateChange}
                            >
                                <MenuItem value={'all'} style={{marginBottom:'10px'}}>All Time</MenuItem>
                                <MenuItem value={'range'} hidden>{startDate.toLocaleDateString('en-US')} - {endDate.toLocaleDateString('en-US')}</MenuItem>
                                <DateRange
                                    ranges={[selectionRange]}
                                    onChange={handleDateRangeSelect}
                                    maxDate={new Date()}
                                />
                            </Select>
                        </FormControl>
                    </Box>                               
                </Col>
                </Row>
              </FormControl>
              
              </form>
            </Col>
          </Row>
          <Row style={{marginTop: '30px'}}>
            <Col>
            <Table striped bordered hover>
                <thead>
                  <tr style={{ textAlign: 'center', backgroundColor: 'black', color: 'white ' }}>
                  <th style={{ backgroundColor: '#232a67', color: 'white' }}>Date</th>
                    <th style={{ backgroundColor: '#232a67', color: 'white' }}>Boarding Name</th>
                    <th style={{ backgroundColor: '#232a67', color: 'white' }}>Feedback Details</th>
                    <th style={{ backgroundColor: '#232a67', color: 'white' }}>Number of Star Rating</th>
                    <th style={{ backgroundColor: '#232a67', color: 'white' }}>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                      <td colSpan={4}><CircularProgress /></td>
                    </tr>
                  ) : filteredFeedbacks && filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map((feedback, index) => (
                      <tr key={index}>
                        <td>{new Date(feedback.updatedAt).toISOString().split('T')[0]}</td>
                        <td>{feedback.boardingId.boardingName}</td>
                        <td>{feedback.description}</td>
                        <td><Rating name="read-only" value={parseInt(feedback.rating)} readOnly /></td>
                        <td style={{ textAlign: 'center' }}>
                        <Button type="button" onClick={() => navigate(`/occupant/feedback/update/${feedback._id}/${feedback.boardingId.boardingName}`)} className="mt-4 mb-4 me-3" style={{ float: 'Center',background: '#2ac609', color: 'white' }} variant="contained">
                          <SystemUpdateAltIcon/>
                        </Button>



                        
                          <Button
                            className="mt-4 mb-4 me-3" style={{ float: 'center' ,
                             background: 'red', color: 'white', marginLeft: '10px',variant:"contained" }}
                            onClick={handleShow }
                          >
                            <DeleteIcon />
                          </Button>
                              <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                  <Modal.Title>Delete</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Do you won't to conform</Modal.Body>
                                <Modal.Footer>
                                  <Button variant="secondary" onClick={handleClose}>
                                    Cancel
                                  </Button>
                                  <Button variant="primary" onClick={() => handleDeleteFeedback(feedback._id)}>
                                    Delete
                                  </Button>
                                </Modal.Footer>
                              </Modal> 

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                      <td colSpan={4}><h4>You don't have any Feedbacks!</h4></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default OccupantFeedback;
