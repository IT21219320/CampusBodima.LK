import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Button, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel,MenuItem, Select,TextField,Autocomplete } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useReduceIngredientQuantityMutation,useGetBoardingIngredientNamesMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";
 

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

 

const ReduceinventoryPage = ({ boardingId }) => {

  const { userInfo } = useSelector((state) => state.auth);
 
  const [noticeStatus, setNoticeStatus] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [measurement, setMeasurement] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
   
  const [reduceIngredientQuantity, {isLoading}] = useReduceIngredientQuantityMutation();
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

        const res = await reduceIngredientQuantity(data).unwrap();

        if(res.alertQty){
          toast.info(`running low on ${res.alertQtyName}`)
        }

        if (res && res.ingredient) {
          console.log(res);
          toast.success('Data reduce successfully');
            setIngredientId('');
            setQuantity('');
            setMeasurement('');
            setPurchaseDate('');
            

        } else {
          toast.error('Failed to add Data');
        }

      } catch (err) {
        console.log(err);
        toast.error(err.data?.error || err.data?.message || err.error || err);
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
       
      <div className={dashboardStyles.mainDiv}>
        <Container>
          	 
                    <Collapse in={noticeStatus}>
                        <Alert
                            action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                            sx={{ mt: 2, bgcolor:'rgb(177 232 255)' }}
                            severity="info"
                        >
                            <strong>Info</strong> -  You need to add Necessary Measurements for Quantity Field.
                        </Alert>
                    </Collapse>

                    <FormContainer>
                       <Form onSubmit={submitHandler}>
                            <Row>
                                <h2>Reduce Ingredients</h2> 
                            </Row> 

                             
                            <Typography variant="subtitle1" sx={{ marginBottom: 1}}>
                                Ingredient Names
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
                                    required
                                  >
                                    <MenuItem value={'ml'}>ml</MenuItem>
                                    <MenuItem value={'g'}>g</MenuItem>
                                    <MenuItem value={'pcs'}>pcs</MenuItem>
                                  </Select>
                              </FormControl>
                            </Box>

                            
                            <Form.Group className='my-2' controlId='purchaseDate'>
                              <Form.Label>Reduce Date</Form.Label>
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
                                      <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Reduce</Button>      
                                  </Col>
                            </Row>
                            
                        </Form>
                    </FormContainer>
        </Container>
      </div>
      </>
  );

 }
export default ReduceinventoryPage
