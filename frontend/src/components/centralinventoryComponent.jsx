import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Button, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel,MenuItem, Select,TextField,Autocomplete } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useAddIngredientMutation,useGetBoardingIngredientNamesMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";
 

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

 

const centralinventoryPage = ({ boardingId }) => {

  const { userInfo } = useSelector((state) => state.auth);
 
  const [noticeStatus, setNoticeStatus] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
   
  const [addIngredient, {isLoading}] = useAddIngredientMutation();
  const [getIngredientNames,{isLoading2}] = useGetBoardingIngredientNamesMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  const loadData = async () => {
    try {
        if (boardingId) {

            const res = await getIngredientNames({boardingId,searchQuery}).unwrap();
            console.log(res);
            setIngredients(res.ingredient);
        }
    } catch (err) {
        toast.error(err.data?.message || err.error);
    }
    }

    useEffect(() => {
        loadData();     
    },[boardingId,searchQuery]);

  const submitHandler = async(e) => {
    e.preventDefault();

      try {
        const data = {
          boardingId: boardingId,  
          ingredientId,
          quantity:quantity+' '+measurement,  
          purchaseDate,
        };

        const res = await addIngredient(data).unwrap();

        if (res && res.ingredient) {

          toast.success('Data added successfully');
          navigate('/owner/ingredient');  

        } else {
          toast.error('Failed to add Data');
        }

      } catch (err) {
        toast.error(err.data?.message || err.error || err);
      }
       
    }



  return (
      <>
       
      <div className={dashboardStyles.mainDiv}>
        <Container>
          	<Row>
                <Col>
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                        <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                        <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                        <Link underline="hover" key="3" color="inherit" href="/owner/ingredient">Ingredients</Link>,
                        <Typography key="4" color="text.primary">Central</Typography>
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
                                <h2>Increase Ingredients</h2> 
                            </Row> 

                             
                            <Typography variant="subtitle1" sx={{ marginBottom: 1}}>
                                Ingredient Name
                            </Typography>
                             
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={ingredients}
                                sx={{ width: 300}}
                                getOptionLabel={(option) => option.ingredientName} // Use a label from your ingredient object
                                renderInput={(params) => <TextField {...params} label="Search..." />}
                                onChange={(e, selectedIngredient) => setIngredientId(selectedIngredient ? selectedIngredient._id : '')} // Set the selected ingredient's ID
                                value={ingredients.find((ingredient) => ingredient._id === ingredientId) || null} // Find the ingredient object by ID and set it as the value
                            />
                                
                            
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

                             
                            <Box sx={{ minWidth: 120 }}>
                              <FormControl fullWidth>
                                  <InputLabel id="demo-simple-select-label">Measurement</InputLabel>
                                  <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={measurement}
                                    label="Measurement"
                                    onChange={(e) => setMeasurement(e.target.value)}
                                  >
                                    <MenuItem value={'ml'}>ml</MenuItem>
                                    <MenuItem value={'g'}>g</MenuItem>
                                    <MenuItem value={'pcs'}>pcs</MenuItem>
                                  </Select>
                              </FormControl>
                            </Box>

                            
                            <Form.Group className='my-2' controlId='confirmPassword'>
                              <Form.Label>Increase Date</Form.Label>
                              <Form.Control
                                type='date'
                                placeholder='Enter Date'
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                              ></Form.Control>
                            </Form.Group>

                            <Row style={{marginTop:'40px'}}>
                                  <Col>
                                      <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Increase</Button>      
                                  </Col>
                            </Row>
                            
                        </Form>
                    </FormContainer>
        </Container>
      </div>
      </>
  );

 }
export default centralinventoryPage

