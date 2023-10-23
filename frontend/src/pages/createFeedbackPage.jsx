import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Row, Col } from 'react-bootstrap';
import { Breadcrumbs, Typography, Card, CardContent, Link, FormControl, TextField,Select,MenuItem } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import { useCreateFeedbackMutation } from '../slices/feedbackApiSlice';
import StarRating from '../pages/StarRating.jsx';
import CreateFeedbackStyles from '../styles/createFeedbackStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';

const CreateFeedback = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const {boardingId, boardingName} = useParams();

  const [viewUserInfo, setViewUserInfo] = useState();
  const [occupantId] = useState(userInfo._id);
  const [occupantName] = useState(userInfo.firstName + ' ' + userInfo.lastName);
  const [occupantEmail] = useState(userInfo.email);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [descriptionError, setDescriptionError] = useState('');

  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const navigate = useNavigate();

  useEffect(() => {
    
     setViewUserInfo(true);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (description.length > 140) {
      toast.error('Description must be under 140 characters.');
      return;
    }

    try {
      const res = await createFeedback({ senderId: occupantId, description, rating, boardingId}).unwrap();
      //console.log("value", res);
      if (res) {
        toast.success('Feedback submitted successfully');
        navigate('/occupant/feedback');
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Sidebar />

      <div className={dashboardStyles.mainDiv}>
        <Container>
          <Row>
            <Col>
              <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                <Typography color="text.primary">Home</Typography>,
                <Typography color="text.primary">{userInfo.userType === 'owner' ? 'Owner' : (userInfo.userType === 'occupant' ? 'Occupant' : userInfo.userType === 'admin' ? 'Admin' : '')}</Typography>,
                <Typography color="text.primary">Feedbacks</Typography>
                <Typography color="text.primary">Create</Typography>
              </Breadcrumbs>
            </Col>
          </Row>

          <Form onSubmit={submitHandler} className={CreateFeedbackStyles.form} >
            <Row>
              <Col>
                <Card variant="outlined" className={CreateFeedbackStyles.card}>
                  <CardContent style={{ padding: '18px' }}>
                    <h4 style={{ margin: 0 }}>Create Feedback</h4>
                  </CardContent>
                </Card>
              </Col>
            </Row>
            <Col >
              <Card variant="outlined" className={CreateFeedbackStyles.card}>
                <CardContent>
                  <Row id={CreateFeedbackStyles.newFeedback}>
                    <p>
                      <b>New Feedback</b>
                    </p>
                  </Row>

                  <Row>
                    <Row className={`mt-4 ${CreateFeedbackStyles.formGroup}`}>
                      <Col lg={3} xs={6}>
                        <label htmlFor="name" className={CreateFeedbackStyles.lbl}>
                          Name
                        </label>
                      </Col>
                      <Col lg={9} xs={6} className="mt-3">
                        <TextField id="outlined-read-only-input" size="small" value={occupantName} InputProps={{ readOnly: true }} />
                      </Col>
                    </Row>

                    <Row className={`mt-4 ${CreateFeedbackStyles.formGroup}`}>
                      <Col lg={3} xs={6}>
                        <label htmlFor="name" className={CreateFeedbackStyles.lbl}>
                          Email
                        </label>
                      </Col>
                      <Col lg={9} xs={6} className="mt-3">
                        <TextField id="outlined-read-only-input" sx={{  height: '78px' }} value={occupantEmail} InputProps={{ readOnly: true }} />
                      </Col>
                    </Row>

                    <Row className={`mt-4 ${CreateFeedbackStyles.formGroup}`}>
                      <Col lg={3} xs={6}>
                        <label htmlFor="boardingname" className={CreateFeedbackStyles.lbl}>
                          Boarding Name
                        </label>
                      </Col>
                        <Col lg={9} xs={6} className={`mt-3 ${CreateFeedbackStyles.formControl}`}>
                        <TextField id="outlined-read-only-input" sx={{ height: '78px' }} value={boardingName} InputProps={{ readOnly: true }} />
                      </Col>
                    </Row>

                    <Row className={`mt-4 ${CreateFeedbackStyles.formGroup}`}>
                      <Col lg={3} xs={6}>
                        <label htmlFor="rating" className={CreateFeedbackStyles.lbl}>
                          Rating<span className={CreateFeedbackStyles.require}><b>*</b></span>
                        </label>
                      </Col>
                      <Col className={`mt-3 ${CreateFeedbackStyles.starRating}`}>
                        <StarRating rating={rating} onChange={setRating} />
                      </Col>
                    </Row>

                    <Row className={`mt-4 ${CreateFeedbackStyles.formGroup}`}>
                      <Col lg={3} xs={6}>
                        <label htmlFor="description" className={CreateFeedbackStyles.lbl}>
                          Description<span className={CreateFeedbackStyles.require}><b>*</b></span>
                        </label>
                      </Col>
                      <Col className={`mt-3 ${CreateFeedbackStyles.formControl}`}>
                        <TextField
                          id="outlined-multiline-static"
                          label="Enter Feedback"
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
                        {descriptionError && (
                          <Typography className={CreateFeedbackStyles.errorMessage} variant="caption">
                            {descriptionError}
                          </Typography>
                        )}
                      </Col>
                    </Row>
                  </Row>

                  <LoadingButton type="submit" loading={isLoading} className={`mt-4 mb-4 me-4 ${CreateFeedbackStyles.submitButton}`} style={{ float: 'right' }} variant="contained">
                    Submit Feedback
                  </LoadingButton>
                  <LoadingButton type="button" loading={isLoading} onClick={() => navigate('/occupant/feedback')} className={`mt-4 mb-4 me-3 ${CreateFeedbackStyles.cancelButton}`} style={{ float: 'right' }} variant="contained">
                    Cancel Feedback
                  </LoadingButton>
                </CardContent>
              </Card>
            </Col>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default CreateFeedback;
