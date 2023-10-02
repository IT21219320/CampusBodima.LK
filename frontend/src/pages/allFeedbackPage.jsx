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


const AllFeedbacks = () => {


  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [category, setCategory] = useState('all');
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [deleteFeedbacks, setDeleteFeedbacks] = useState('');
  const [getAllFeedbacks, { isLoading }] = useGetAllFeedbacksMutation();
  const [deleteFeedback, { isLoading2 }] = useDeleteFeedbackMutation();
  const [searchQuery, setSearchQuery] = useState('');


  const loadFeedbackData = async () => {
    try {
      const res = await getAllFeedbacks().unwrap();
      setFeedbacks(res.feedback);
      setFilteredFeedbacks(res.feedback);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, [searchQuery,deleteFeedbacks]);

  useEffect(() => {
    filterFeedbacksByCategory();
  }, [category]);

  const filterFeedbacksByCategory = () => {
    if (category === 'all') {
      setFilteredFeedbacks(feedbacks);
    } else {
      const filtered = feedbacks.filter((feedback) => feedback.category === category);
      setFilteredFeedbacks(filtered);
    }
  };


  const handleDeleteFeedback = async (feedbackId) => {
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

    // Define the table headers
    const headers = [[ "Ticket Id","Category","Description","Ratings"]];

    // Map the admin data to table rows

    const data = feedbacks.map((feedback) => [
      feedback.ticketId,
      feedback.category,
      feedback.description,
      feedback.rating,
     
      new Date(feedback.createdAt).toLocaleString('en-GB')
    ]);

    // Set the table styles
    const styles = {
      halign: "center",
      valign: "middle",
      fontSize: 10,
    };

    // Add the table to the PDF document
    doc.autoTable({
      head: headers,
      body: data,
      styles,
      margin: { top: 70 },
      startY: 20
    });

    

    doc.text("Feedback List", 90, 10);
    doc.setFontSize(9);

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
                    <Button variant="contained" style={{marginRight:'10px', background:'#4c4c4cb5'}} onClick={exportToPDF}>Export<GetAppRounded /></Button>
                </Col>
          </Row>

          <Row style={{ marginTop: '30px' }}>
            <Col>
            <form  className={occupantFeedbackStyles.form}>
              <FormControl  style={{Width:'20px'}}>
                <InputLabel>Short by</InputLabel>
                <Select
                  value={category}
                  label="category"
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <MenuItem value={'all'}>All</MenuItem>
                  <MenuItem value={'hostal'}>Hostal</MenuItem>
                  <MenuItem value={'anex'}>Anex</MenuItem>
                </Select>
              </FormControl>
            </form>
            </Col>
          </Row>


          <Row style={{marginTop: '30px'}}>
            <Col>
            <Table striped bordered hover>
                <thead>
                  <tr style={{ textAlign: 'center', backgroundColor: 'black' }}>
                    <th>Category</th>
                    <th>Feedback Details</th>
                    <th>Number of Star Rating</th>
                    <th>Options</th>
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
                        <td>{feedback.category}</td>
                        <td>{feedback.description}</td>
                        <td><Rating name="read-only" value={parseInt(feedback.rating)} readOnly /></td>
                        <td>
                        
                        
                          <Button
                            className="mt-4 mb-4 me-3" style={{ float: 'right' ,
                             background: 'red', color: 'black', marginLeft: '10px',variant:"contained" }}
                            onClick={() => handleDeleteFeedback(feedback._id)}
                          >
                            <DeleteIcon /> Delete
                          </Button>
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
