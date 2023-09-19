import { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, FloatingLabel} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, InputLabel, Select, MenuItem, FormControl, TextField,} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import { usecreateFeedbackMutation } from '../slices/feedbackApiSlice';


import dashboardStyles from '../styles/dashboardStyles.module.css';
import { feedbacksApiSlice } from '../slices/feedbackApiSlice';
import Sidebar from '../components/sideBar';

const CreateFeedback = () => {
    const { userInfo } = useSelector((state) => state.auth);
  
    const [viewUserInfo, setViewUserInfo] = useState(true);
    const [occupantId, setOccupantId] = useState(userInfo._id);
    const [occupantName, setOccupantName] = useState(userInfo.firstName + ' ' + userInfo.lastName);
    const [occupantEmail, setOccupantEmail] = useState(userInfo.email);
    const [feedback, setFeedback] = useState('');
  
    const [createFeedback, { isLoading }] = usecreateFeedbackMutation(); // Use the appropriate feedback mutation hook
  
    const navigate = useNavigate();
  
    useEffect(() => {
      setViewUserInfo(true);
    }, []);
  
    const submitHandler = async (e) => {
      e.preventDefault();
  
      try {
        const res = await createFeedback({ senderId: occupantId, feedback }).unwrap();
        toast.success('Feedback submitted successfully');
        navigate('/occupant/feedback'); // Redirect to the feedback page after submission
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    };
  
    return (
      <>
        <Sidebar />
  
        <div className={dashboardStyles.mainDiv}>
          <Container className={dashboardStyles.container}>
            <Row>
              <Col>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                  <Link underline="hover" key="1" color="inherit" href="/">
                    Home
                  </Link>
                  ,
                  <Link underline="hover" key="2" color="inherit" href="/profile">
                    {userInfo.userType === 'owner' ? 'Owner' : userInfo.userType === 'occupant' ? 'Occupant' : userInfo.userType === 'admin' ? 'Admin' : <></>}
                  </Link>
                  ,
                  <Link underline="hover" key="3" color="inherit" href="#">
                    Feedback
                  </Link>
                  ,
                  <Typography key="4" color="text.primary">
                    Create
                  </Typography>
                </Breadcrumbs>
              </Col>
            </Row>
  
            <Fade in={viewUserInfo}>
              <Form onSubmit={submitHandler}>
                <Row>
                  <Col>
                    <Card variant="outlined" className={CreateFeedbackStyles.card}>
                      <CardContent style={{ padding: '18px' }}>
                        <h4 style={{ margin: 0 }}>Create Feedback</h4>
                      </CardContent>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Card variant="outlined" className={CreateFeedbackStyles.card}>
                      <CardContent>
                        <Row id={CreateFeedbackStyles.newFeedback}>
                          <p>
                            <b>New Feedback</b>
                          </p>
                        </Row>
  
                        <Row>
                          <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                            <Col lg={3} xs={6}>
                              <label htmlFor="name" className={CreateFeedbackStyles.lbl}>
                                Name
                              </label>
                            </Col>
                            <Col lg={9} xs={6} className="mt-3">
                              <TextField id="outlined-read-only-input" size="small" value={occupantName} InputProps={{ readOnly: true }} />
                            </Col>
                          </Row>
  
                          <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                            <Col lg={3} xs={6}>
                              <label htmlFor="name" className={CreateFeedbackStyles.lbl}>
                                Email
                              </label>
                            </Col>
                            <Col lg={9} xs={6} className="mt-3">
                              <TextField id="outlined-read-only-input" size="small" value={occupantEmail} InputProps={{ readOnly: true }} />
                            </Col>
                          </Row>
  
                          <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                            <Col lg={3} xs={6}>
                              <label htmlFor="feedback" className={CreateFeedbackStyles.lbl}>
                                Feedback<span className={CreateFeedbackStyles.require}><b>*</b></span>
                              </label>
                            </Col>
                            <Col>
                              <TextField
                                id="outlined-multiline-static"
                                label="Enter Feedback"
                                multiline
                                rows={4}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                required
                                variant="outlined"
                              />
                            </Col>
                          </Row>
                        </Row>
                        <LoadingButton type="submit" loading={isLoading} className="mt-4 mb-4 me-4" style={{ float: 'right' }} variant="contained">
                          Submit Feedback
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
  };
  
  export default CreateFeedback;