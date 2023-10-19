import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDeleteFeedbackMutation,useGetAllFeedbacksMutation  } from "../slices/feedbackApiSlice";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table,Card } from 'react-bootstrap';
import { Breadcrumbs, Typography, Paper, InputBase, IconButton, Box, FormControl, InputLabel, Select, MenuItem, TablePagination, CircularProgress, Button, Rating } from '@mui/material';
import { NavigateNext, Search, BrowserUpdated as BrowserUpdatedIcon, Delete as DeleteIcon } from '@mui/icons-material';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';
import jsPDF from 'jspdf';
import { GetAppRounded, GridViewRounded } from '@mui/icons-material';

import Modal from 'react-bootstrap/Modal';



const AllFeedbacks = () => {


  const [feedbacks, setFeedbacks] = useState([]);
  //const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  //const [category, setCategory] = useState('all');
  const [rating, setRating] = useState('all');
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [deleteFeedbacks, setDeleteFeedbacks] = useState('');
  const [getAllFeedbacks, { isLoading }] = useGetAllFeedbacksMutation();
  const [deleteFeedback, { isLoading2 }] = useDeleteFeedbackMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const ratings = ['all', '0', '1', '2', '3', '4','5'];



  const loadFeedbackData = async () => {
    try {
      const res = await getAllFeedbacks().unwrap();
      setFeedbacks(res.feedback);
      filteredFeedbacks(res.feedback);
    } catch (error) {
      console.error(error);
    }
  };

  
  const [show, setShow] = useState(false)

  useEffect(() => {
    loadFeedbackData();
  }, [ userInfo._id,searchQuery,deleteFeedbacks]);

  const handleClose = () => setShow(false);

 

  

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
    let headers = ["Boarding Name","Discription","Number of Rating"];

    // Map the admin data to table rows

    const data = feedbacks.map((feedback) => [
      feedback.boardingId.boardingName,
      feedback.description,
      feedback.rating,
     
      new Date(feedback.createdAt).toLocaleString('en-GB')
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
                <Typography color="text.primary">Home</Typography>,
                <Typography color="text.primary">{userInfo.userType === 'owner' ? 'Owner' : (userInfo.userType === 'occupant' ? 'Occupant' : userInfo.userType === 'admin' ? 'Admin' : '')}</Typography>,
                <Typography color="text.primary">Feedbacks</Typography>
              </Breadcrumbs>
            </Col>
          </Row>
          <Col>
              <Card variant="outlined" className={occupantFeedbackStyles.card}>
                <h4>Feedbacks</h4>
              </Card>
          </Col>
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
                placeholder="Search Feedbacks"
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
  <Col><div style={{border: '1px solid #00000066', padding:'15px'}}>Short By: </div></Col>
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
          
          </Row>
        </FormControl>
            </form>
            </Col>
          </Row>


          <Row style={{marginTop: '30px'}}>
            <Col>
            <Table striped bordered hover>
                <thead>
                  <tr style={{ textAlign: 'center', backgroundColor: 'black' }}>
                    <th style={{ backgroundColor: 'blue', color: 'white' }}>Boarding Name</th>
                    <th style={{ backgroundColor: 'blue', color: 'white' }}>Feedback Details</th>
                    <th style={{ backgroundColor: 'blue', color: 'white' }}>Number of Star Rating</th>
                    <th style={{ backgroundColor: 'blue', color: 'white' }}>Options</th>
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
                        <td>{feedback.boardingId.boardingName}</td>
                        <td>{feedback.description}</td>
                        <td><Rating name="read-only" value={parseInt(feedback.rating)} readOnly /></td>
                        <td style={{ textAlign: 'center' }}> 
                        
                        
                        <Button
                            className="mt-4 mb-4 me-3" style={{ float: 'center' ,
                             background: 'red', color: 'black', variant:"contained" }}
                            onClick={handleShow }
                          >
                            <DeleteIcon /> Delete
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

export default AllFeedbacks;
