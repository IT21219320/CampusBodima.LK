import React from "react";
import Sidebar from './sideBar';
import { Breadcrumbs, Typography, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Container, Row, Col, } from 'react-bootstrap';
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useSelector, } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import MailIcon from '@mui/icons-material/Mail';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import {
  useGetMyReservationMutation,
  useUpdateDurationMutation,
  useDeleteReservationMutation,
  useGetToDoByOccIdMutation,
} from "../slices/reservationsApiSlice";




const MyReservationComponent = () => {

  const feedback = () => {
    navigate(`/occupant/feedback/create`)
  }

  //inline styles
  const myStyle = {
    boxShadow: '1px 9px 20px 5px #d8d6d6',
    backgroundColor: 'rgb(240 242 255)',
    padding: '40px',
    marginTop: '20px',
    
  };

  const hederStyle = {
    backgroundColor: 'rgb(36 39 69)',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '10px',
    textAlign: 'center',
  }

  const fonts = {
    fontSize: '21px',
  }

  const { userInfo } = useSelector((state) => state.auth);

  const [getMyReservation] = useGetMyReservationMutation();
  const [updateDuration] = useUpdateDurationMutation();
  const [deleteReservation] = useDeleteReservationMutation();
  const [getToDo] = useGetToDoByOccIdMutation();

  const [myReservation, setMyReservation] = useState();
  const [updateS, setUpdateS] = useState()
  const [deleteS, setDeleteS] = useState();
  const [todo, setTodo ] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const paymentHandle = () => {
    navigate(`/occupant/payment/`)
  }

  const loadData = async () => {
    try {
      setLoading(true)

      const res = await getMyReservation({ _id: userInfo._id }).unwrap();
      setMyReservation(res.myDetails);
      
      console.log(res.myDetails);
      setLoading(false)

    } catch (error) {
      setLoading(false)
      console.error('Error getting reservation', error);
    }

    try {
      const resTodo = await getToDo({occId: userInfo._id}).unwrap();
      setTodo(resTodo);

      console.log(resTodo);

    } catch (error) {
      
      console.log('Error getting Todo', error);
    }

  }

  useEffect(() => {
    loadData();
  }, [updateS, deleteS]);


  //update handler
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(['']);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    updateHandler()
    setOpen(false);
  };

  const updateHandler = async () => {

    const userID = userInfo._id

    const res = await updateDuration({ userInfo_id: userID, Duration: duration }).unwrap();
    setUpdateS(res);

    toast.success("Duration Updated Successfully");

  }

  //delete handler
  const [dltOpen, setDltOpen] = useState(false);
  const [email, setEmail] = useState(['']);

  const handleDltClickOpen = () => {
    setDltOpen(true);
  };

  const handleDltClose = () => {
    deleteHandler();
    setDltOpen(false);
  };

  const handleDltcancel = () => {
    setDltOpen(false);
  };

  const deleteHandler = async () => {

    const userID = userInfo._id
    console.log(userInfo.email)

    if (todo.length == 0){
      if (userInfo.email === email) {
        const res = await deleteReservation({ ReservationId: myReservation.Id }).unwrap();
  
        console.log(res);
        setDeleteS(res);
  
        if (res.message === "Reservation Successfully Deleted") {
          toast.success("Reservation Successfully Deleted");
          navigate(`/`);
        }
      }
  
      else {
        toast.error("Incorrect email. Please try again!");
      }
    }else{
      toast.warning("Please do your payments before cancelling the reservation");
      navigate(`/occupant/payment/`);
    }

  }



  return (
    <>
      <Container>

        <div style={hederStyle}>
          <Row >
            <h4 style={{ color: 'white' }}>My Boarding</h4>
          </Row>
        </div>

        {loading ? (
          <>

            <div style={{ width: '100%', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </div>

          </>) : (
          <>

            {myReservation ? (
              <>
                {myReservation.paymentStatus === "Pending" && myReservation.status === "Pending" ? (
                  <>
                    <center>
                      <h1 style={{ marginTop: '190px', fontFamily: 'cursive', color: '#afb5be' }}>
                        <p>Thank you for choosing us !!!</p>
                        </h1>

                        <h3 style={{ marginTop: '20px', fontFamily: 'cursive', color: 'rgb(125 131 139)' }}>
                        <p>You will be notified by a mail when the owner approves your reservation</p>
                        </h3>
                    </center>
                  </>
                ) : myReservation.paymentStatus === "Pending" && myReservation.status === "Approved" ? (
                  <>
                    <center>
                      <h1 style={{ marginTop: '130px', fontFamily: 'cursive', color: '#afb5be' }}>
                        <p>Your reservation has been approved. </p>
                      </h1>
                      <p>Please make your initial payment as soon as possible</p>
                      <Button variant="contained" size="small" onClick={paymentHandle}> Go to Payments</Button>
                    </center>
                  </>
                ) : myReservation.paymentStatus === "Paid" && myReservation.status === "Approved" && (
                  <>
                    <Row>

                      <Col style={{ marginLeft: '10px', marginRight: '10px' }}>

                        <Row>
                          <div style={myStyle}> </div>
                        </Row>

                        <Row>
                          <div style={{ boxShadow: '1px 9px 20px 5px #d8d6d6', backgroundColor: 'rgb(240 242 255)', padding: '35pxpx', marginTop: '20px' }}>

                            <h5 style={{ marginBottom: '25px', marginTop: "10px", fontWeight: "bold" }}>Boarding Owner Details</h5>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}><AccountCircleIcon fontSize="small" />Owner Name</p> <p >{myReservation.ownerFName + "  " + myReservation.ownerLName}</p>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}><MailIcon fontSize="small" />Email</p> <p >{myReservation.ownerEmail}</p>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}><LocalPhoneIcon fontSize="small" />Phone Number</p> <p >{myReservation.ownerPhone}</p>

                          </div>

                        </Row>

                        <Row>
                          <div style={{ boxShadow: '1px 9px 20px 5px #d8d6d6', backgroundColor: 'rgb(240 242 255)', padding: '35pxpx', marginTop: '20px' }}>

                            <h5 style={{ marginBottom: '25px', marginTop: "10px", fontWeight: "bold" }}>Owner Bank Details</h5>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Account Number</p> <p >{myReservation.ownerAccNo}</p>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Holder Name</p> <p >{myReservation.ownerHoldName}</p>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Bank Name</p> <p >{myReservation.ownerBankName}</p>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Branch Name</p> <p >{myReservation.ownerBranch}</p>

                          </div>

                        </Row>

                      </Col>

                      <Col>

                        <Row>

                          <div style={{ boxShadow: '1px 9px 20px 5px #d8d6d6', backgroundColor: 'rgb(240 242 255)', padding: '25px', marginTop: '20px', height: '96%' }}>
                            <h3 style={{ marginBottom: '30px', textAlign: "center" }}>My Reservation Details</h3>

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Fisrt Name</p> <p >{myReservation.firstName}</p>
                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Last Name</p> <p >{myReservation.lastName}</p>
                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Boarding Type</p> <p >{myReservation.bType}</p>
                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Boarding Name</p> <p >{myReservation.bName}</p>
                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Boarding Address</p> <p >{myReservation.bAddress}</p>

                            {myReservation.bType === 'Hostel' && (
                              <>
                                <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Room Number</p> <p >{myReservation.rNo}</p>

                              </>)}

                            <p style={{ float: "left", width: "40%", fontWeight: "bold" }}>Monthly Rent</p> <p >{myReservation.rent}</p>

                          </div>

                        </Row>

                        <Row>

                          <div style={myStyle}>

                            <p style={{ float: "left", width: "55%", fontWeight: "bold" }}>Reserved Date</p> <p >{new Date(myReservation.reservedDt).toDateString()}</p>
                            <p style={{ float: "left", width: "55%", fontWeight: "bold" }}>Reserved Duration</p> <p >{myReservation.Duration}</p>

                            <Row style={{ marginTop: '20px' }}>

                              
                              <Col>
                                <Button variant="contained" size="small" style={{ backgroundColor: '#0a9954', borderRadius: '20px', width: '195px' , float: "left"}} onClick={handleClickOpen}>Update</Button>

                                <Dialog open={open} onClose={handleClose}>

                                  <DialogTitle>Update Reservation Period</DialogTitle>

                                  <DialogContent>

                                    <DialogContentText>
                                      Choose the number of months to be extend, from the date you reserved the boarding.
                                    </DialogContentText>

                                    <FormControl sx={{ m: 1, minWidth: 80 }}>

                                      <InputLabel id="demo-simple-select-autowidth-label">Duration</InputLabel>

                                      <Select
                                        labelId="demo-simple-select-autowidth-label"
                                        id="demo-simple-select-autowidth"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        autoWidth
                                        label="Duration"
                                      >
                                        <MenuItem value="">
                                          <em>None</em>
                                        </MenuItem>
                                        <MenuItem value={3}>03 Months</MenuItem>
                                        <MenuItem value={6}>06 Months</MenuItem>
                                        <MenuItem value={12}>01 Year</MenuItem>
                                        <MenuItem value={24}>02 Years</MenuItem>

                                      </Select>

                                    </FormControl>

                                  </DialogContent>

                                  <DialogActions>
                                    <Button onClick={handleClose}>Cancel</Button>
                                    <Button onClick={handleClose}>Save</Button>
                                  </DialogActions>

                                </Dialog>
                                </Col>
                                <Col>

                                <Button variant="contained" size="small" style={{ backgroundColor: '#d86872', borderRadius: '20px', width: '195px' }} onClick={handleDltClickOpen}>Delete</Button>

                                <Dialog open={dltOpen} onClose={handleDltClose}>

                                  <DialogTitle>Delete Reservation</DialogTitle>

                                  <DialogContent>

                                    <DialogContentText>

                                      <p style={{ color: '#ff0000' }}>Are you sure you want to delete this reservation?</p>
                                      <p>To delete your reservation, Enter the email that used to do the reservation above.</p>

                                    </DialogContentText>

                                    <TextField
                                      autoFocus
                                      margin="dense"
                                      id="name"
                                      label="Email Address"
                                      type="email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      fullWidth
                                      variant="standard"
                                    />

                                  </DialogContent>

                                  <DialogActions>
                                    <Button onClick={handleDltcancel}>Cancel</Button>
                                    <Button onClick={handleDltClose}>Delete</Button>
                                  </DialogActions>

                                </Dialog>

                                </Col>

                            </Row>

                          </div>

                        </Row>

                      </Col>

                    </Row>

                  </>
                )}

              </>) : (
              <>
                <center><h1 style={{ marginTop: '200px', fontFamily: 'cursive', color: '#afb5be' }}>You haven't done any reservations</h1></center>
              </>
            )}

          </>
        )}

      </Container>
    </>
  );
};

export default MyReservationComponent;