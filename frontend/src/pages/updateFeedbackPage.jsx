
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
//import { Container, Form, Button, Row, Col, TextField } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, FormControl, Select, MenuItem } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import { useUpdateFeedbackMutation } from '../slices/feedbackApiSlice';
import StarRating from '../pages/StarRating.jsx';
import CreateFeedbackStyles from '../styles/createFeedbackStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';

const UpdateFeedback = () => {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [viewUserInfo, setViewUserInfo] = useState(true);
  const [occupantId, setOccupantId] = useState(userInfo._id);
  const [occupantName, setOccupantName] = useState(userInfo.firstName + ' ' + userInfo.lastName);
  const [occupantEmail, setOccupantEmail] = useState(userInfo.email);
  const [boardingId, setBoardingId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [updateFeedback, { isLoading }] = useUpdateFeedbackMutation();
  const { data: feedbackData, isLoading: isFeedbackLoading } = useGetFeedbackByIdQuery(feedbackId);

  useEffect(() => {
    if (feedbackData) {
      // Populate state variables with the fetched feedback data
      const { senderId, category, description, rating, boardingId } = feedbackData;
      setCategory(category);
      setDescription(description);
      setRating(rating);
      setBoardingId(boardingId);
    }
  }, [feedbackData]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateFeedback({
        feedbackId,
        senderId: occupantId,
        category,
        description,
        rating,
        boardingId,
      });
      toast.success('Feedback updated successfully');
      navigate('/occupant/feedback');
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
                <Link underline="hover" key="3" color="inherit" href="/occupant/feedback">
                  Feedback
                </Link>
                ,
                <Typography key="4" color="text.primary">
                  Update
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
                      <h4 style={{ margin: 0 }}>Update Feedback</h4>
                    </CardContent>
                  </Card>
                </Col>
              </Row>
              <Col>
                <Card variant="outlined" className={CreateFeedbackStyles.card}>
                  <CardContent>
                    <Row id={CreateFeedbackStyles.newFeedback}>
                      <p>
                        <b>Edit Feedback</b>
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
                          <TextField id="outlined-read-only-input" size="small" sx={{ width: '30%', height: '78px' }} value={occupantEmail} InputProps={{ readOnly: true }} />
                        </Col>
                      </Row>

                      <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                        <Col lg={3} xs={6}>
                          <label htmlFor="category" className={CreateFeedbackStyles.lbl}>
                            Category<span className={CreateFeedbackStyles.require}><b>*</b></span>
                          </label>
                        </Col>
                        <Col lg={9} xs={6} className="mt-3">
                          <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                            <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                              <MenuItem value={'boarding'}>Boarding</MenuItem>
                              <MenuItem value={'anex'}>Anex</MenuItem>
                            </Select>
                          </FormControl>
                        </Col>
                      </Row>

                      <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                        <Col lg={3} xs={6}>
                          <label htmlFor="boardingId" className={CreateFeedbackStyles.lbl}>
                            Boarding ID/Anex ID
                          </label>
                        </Col>
                        <Col lg={9} xs={6} className="mt-3">
                          <TextField id="outlined-read-only-input" size="small" value={boardingId} InputProps={{ readOnly: true }} />
                        </Col>
                      </Row>

                      <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                        <Col lg={3} xs={6}>
                          <label htmlFor="rating" className={CreateFeedbackStyles.lbl}>
                            Rating<span className={CreateFeedbackStyles.require}><b>*</b></span>
                          </label>
                        </Col>
                        <Col>
                          <StarRating rating={rating} onChange={setRating} />
                        </Col>
                      </Row>

                      <Row style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                        <Col lg={3} xs={6}>
                          <label htmlFor="description" className={CreateFeedbackStyles.lbl}>
                            Description<span className={CreateFeedbackStyles.require}><b>*</b></span>
                          </label>
                        </Col>
                        <Col>
                          <TextField
                            id="outlined-multiline-static"
                            label="Edit Feedback"
                            multiline
                            rows={8}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            variant="outlined"
                            sx={{
                              width: '100%',
                              height: '200px',
                            }}
                          />
                        </Col>
                      </Row>
                    </Row>

                    <LoadingButton type="submit" loading={isLoading} className="mt-4 mb-4 me-4" style={{ float: 'right' }} variant="contained">
                      Update Feedback
                    </LoadingButton>
                    <Button onClick={() => navigate('/occupant/feedback')} className="mt-4 mb-4 me-3" style={{ float: 'right' }} variant="contained">
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </Col>
            </Form>
          </Fade>
        </Container>
      </div>
    </>
  );
};

export default UpdateFeedback;






