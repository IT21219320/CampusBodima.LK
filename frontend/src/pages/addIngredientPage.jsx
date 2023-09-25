import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Button, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel,MenuItem, Select } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useAddIngredientMutation,useGetOwnerBoardingMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";
 

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

 

const AddIngredientPage = () => {

  const { userInfo } = useSelector((state) => state.auth);

  const [boardingId, setBoardingId] = useState('');
  const [boardingNames, setBoardingNames] = useState([]);
  const [noticeStatus, setNoticeStatus] = useState(true);
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [alertquantity, setAlertQuantity] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
   
  const [addIngredient, {isLoading}] = useAddIngredientMutation();
  const [getOwnerBoarding,{isLoading2}] = useGetOwnerBoardingMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loadData = async () => {
    try {
      const ownerId = userInfo._id;
      const res = await getOwnerBoarding(ownerId).unwrap();
      setBoardingNames(res.boardings);
      if (res.boardings.length > 0) {
        // Set the default selected boarding ID to the first one in the list
        setBoardingId(res.boardings[0]._id);
      }
    } catch (error) {
      console.error('Error fetching boarding names:', error);
    }
  };

  useEffect(() => {
    loadData();     
  },[]);

  const submitHandler = async(e) => {
    e.preventDefault();

      try {
        const data = {
          boardingId: boardingId,  
          ingredientName,
          quantity:quantity+' '+measurement,  
          measurement:alertquantity+' '+measurement,
          purchaseDate,
        };

        const res = await addIngredient(data).unwrap();

        if (res && res.ingredient) {

          toast.success('Ingredient added successfully');
          navigate('/owner/ingredient');  

        } else {
          toast.error('Failed to add ingredient');
        }

      } catch (err) {
        toast.error(err.data?.message || err.error || err);
      }
       
    }

    // Get the current date in the format YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  return (
      <>
      <Sidebar />
      <div className={dashboardStyles.mainDiv}>
        <Container>
          	<Row>
                <Col>
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                        <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                        <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                        <Link underline="hover" key="3" color="inherit" href="/owner/ingredient">Ingredients</Link>,
                        <Typography key="4" color="text.primary">Add</Typography>
                    </Breadcrumbs>
                </Col>
            </Row>
                    <Collapse in={noticeStatus}>
                        <Alert
                            action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                            sx={{ mt: 2, bgcolor:'rgb(177 232 255)' }}
                            severity="info"
                        >
                            <strong>Info</strong> -  You need to add Necessary Measurements for Quantity and Alert Quantity Field.
                        </Alert>
                    </Collapse>

                    <FormContainer>
                       <Form onSubmit={submitHandler}>
                            <Row>
                              <Col>
                                <h2>Add Ingredients</h2>
                              </Col>
                              <Col>
                                  <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Boarding Name</InputLabel>
                                    <Select
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={boardingId}
                                      label="Boarding Name"
                                      onChange={(e) => setBoardingId(e.target.value)}
                                    >
                                      {boardingNames.map((boarding) => (
                                        <MenuItem key={boarding._id} value={boarding._id}>
                                          {boarding.boardingName}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                              </Col>
                            </Row>

                            <Form.Group className='my-2' controlId='ingredientName'>
                              <Form.Label>Ingredient Name</Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Enter Ingredient Name'
                                value={ingredientName}
                                onChange={(e) => setIngredientName(e.target.value)}
                                required
                              ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='quantity'>
                              <Form.Label>Quantity</Form.Label>
                              <Form.Control
                                type='number'
                                placeholder='Enter Quantity'
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                              ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='alertquantity'>
                              <Form.Label>Alert Quantity</Form.Label>
                              <Form.Control
                                type='number'
                                placeholder='Enter Alert Quantity'
                                value={alertquantity}
                                onChange={(e) => setAlertQuantity(e.target.value)}
                                required
                              ></Form.Control>
                            </Form.Group>
                            
                            <Box sx={{ minWidth: 120 }}>
                              <FormControl fullWidth>
                                  <InputLabel id="demo-simple-select-label">Measurement</InputLabel>
                                  <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={measurement}
                                    label="Measurement"
                                    onChange={(e) => setMeasurement(e.target.value)}
                                    required
                                  >
                                    <MenuItem value={'ml'}>ml</MenuItem>
                                    <MenuItem value={'g'}>g</MenuItem>
                                    <MenuItem value={'pcs'}>pcs</MenuItem>
                                  </Select>
                              </FormControl>
                            </Box>

                            
                            <Form.Group className='my-2' controlId='purchaseDate'>
                              <Form.Label>Purchase Date</Form.Label>
                              <Form.Control
                                type='date'
                                placeholder='Enter Date'
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                min={getCurrentDate()} // Set the minimum date to today
                                max={getCurrentDate()} // Set the maximum date to today
                                required
                              ></Form.Control>
                            </Form.Group>

                            <Row style={{marginTop:'40px'}}>
                                  <Col>
                                      <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Add</Button>      
                                  </Col>
                            </Row>
                            
                        </Form>
                    </FormContainer>
        </Container>
      </div>
      </>
  );

 }
export default AddIngredientPage
