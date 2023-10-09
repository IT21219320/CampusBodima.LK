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
import { useGetMyReservationMutation, useUpdateDurationMutation, useDeleteReservationMutation } from "../slices/reservationsApiSlice";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';


const MyReservationComponent = () => {

  const feedback = () => {
    navigate(`/occupant/feedback/create`)
  }

  //inline styles
  const myStyle = {
    backgroundColor: '#a3aab591',
    padding: '40px',
    marginTop: '20px',
    borderRadius: '20px',
  };

  const hederStyle = {
    backgroundColor: '#84888f',
    padding: '10px',
    marginTop: '20px',
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

  const [myReservation, setMyReservation] = useState();
  const [updateS, setUpdateS] = useState()
  const [deleteS, setDeleteS] = useState();

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await getMyReservation({ _id: userInfo._id }).unwrap();
      setMyReservation(res.myDetails);


    } catch (error) {
      console.error('Error getting reservation', error);
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

  const deleteHandler = async () => {

    const userID = userInfo._id
    console.log(userInfo.email)

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
      window.alert("incorrect email");
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
        {myReservation ? (
          <><Row>
            <Col>
              <div style={{ backgroundColor: '#a3aab591', padding: '40px', marginTop: '20px', borderRadius: '20px', height: '96%' }}>
                <h3 style={{ marginBottom: '30px' }}>My Reservation Details</h3>
                <Row>
                  <Col><p style={fonts}>Reservation ID</p></Col>
                  <Col>
                    <TextField id="standard-basic" value={myReservation && myReservation.Id ? myReservation.Id : ''} variant="standard" style={{ width: '100%' }} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p style={fonts}>Name</p>
                  </Col>
                  <Col>
                    <TextField id="standard-basic" value={myReservation && myReservation.name ? myReservation.name : ''} variant="standard" style={{ width: '100%' }} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p style={fonts}>Boarding Type</p>
                  </Col>
                  <Col>
                    <TextField id="standard-basic" value={myReservation && myReservation.bType ? myReservation.bType : ''} variant="standard" style={{ width: '100%' }} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p style={fonts}>Boarding Name</p>
                  </Col>
                  <Col>
                    <TextField id="standard-basic" value={myReservation && myReservation.bName ? myReservation.bName : ''} variant="standard" style={{ width: '100%' }} />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p style={fonts}>Room No</p>
                  </Col>
                  <Col>
                    <TextField id="standard-basic" value={myReservation && myReservation.rNo ? myReservation.rNo : ''} variant="standard" style={{ width: '100%' }} />
                  </Col>
                </Row>

              </div>

            </Col>

            <Col style={{ marginLeft: '10px', marginRight: '10px' }}>
              <div>

                <Row>
                  <div style={myStyle}>
                    <h3 style={{ marginBottom: '30px' }}>Update Reservation Period</h3>
                    <p></p>
                    <Row>
                      <Col>
                        <p style={fonts}>Reserved Date</p>
                      </Col>
                      <Col>
                        <TextField id="standard-basic" value={myReservation && myReservation.reservedDt ? myReservation.reservedDt : ''} variant="standard" style={{ width: '100%' }} />
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <p style={fonts}>Reserved Duration</p>
                      </Col>
                      <Col>
                        <TextField id="standard-basic" value={myReservation && myReservation.Duration ? myReservation.Duration : ''} variant="standard" style={{ width: '100%' }} />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: '20px' }}>
                      <Button variant="contained" size="small" style={{ backgroundColor: '#0a9954', borderRadius: '20px' }} onClick={handleClickOpen}>Update</Button>
                      <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Upadte Reservation Period</DialogTitle>
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
                    </Row>

                  </div>
                </Row>

                <Row>
                  <div style={myStyle}>
                    <h3 style={{ marginBottom: '30px' }}>Cancel Reservation</h3>
                    <Row>
                      <p>we need your feedback!!! please feel free to give a feedback before cancelling the reservation</p>
                    </Row>
                    <Row>
                      <Button variant="contained" size="small" style={{ backgroundColor: '#0d6efd', borderRadius: '20px', marginBottom: '20px' }} onClick={feedback}>Give Feedback</Button>
                    </Row>
                    <Row>
                      <Button variant="contained" size="small" style={{ backgroundColor: '#d86872', borderRadius: '20px' }} onClick={handleDltClickOpen}>Delete</Button>
                      <Dialog open={dltOpen} onClose={handleDltClose}>
                        <DialogTitle>Delete Reservation</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            To delete reservation, you have to enter the email that used do the reservation.
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
                          <Button onClick={handleDltClose}>Cancel</Button>
                          <Button onClick={handleDltClose}>Delete</Button>
                        </DialogActions>
                      </Dialog>
                    </Row>
                  </div>
                </Row>


              </div>

            </Col>

          </Row>
          </>) : (
          <>
            <center><h1 style={{ marginTop: '270px', fontFamily: 'cursive', color: '#afb5be' }}>You haven't done any reservations</h1></center>
          </>
        )}






      </Container>
    </>
  );
};

export default MyReservationComponent;