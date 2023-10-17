import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Button, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel,MenuItem, Select } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useUpdateIngredientsMutation,useGetUpdateIngredientsMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";
import { useParams } from "react-router-dom";
 

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

 

const updateIngredientPage = () => {

  const { userInfo } = useSelector((state) => state.auth);
  
  const { boardingId, ingredientId } = useParams();
  const [boardingNames, setBoardingNames] = useState([]);
  const [noticeStatus, setNoticeStatus] = useState(true);
  const [newIngredientName, setIngredientName] = useState('');
  const [newQuantity, setQuantity] = useState('');
  const [newMeasurement, setAlertQuantity] = useState('');
  const [newPurchaseDate, setPurchaseDate] = useState('');
   
  const [updateIngredient, {isLoading}] = useUpdateIngredientsMutation();
  const [getUpdateIngredient,{isLoading2}] = useGetUpdateIngredientsMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loadData = async () => {
    try {
      
      if(boardingId && ingredientId){
        const data = boardingId+'/'+ingredientId;
        const res = await getUpdateIngredient(data).unwrap();
         
        setIngredientName(res.ingredient.ingredientName);
        setQuantity(res.ingredient.quantity);
        setAlertQuantity(res.ingredient.measurement);
        setPurchaseDate(res.ingredient.purchaseDate);
        setBoardingNames(res.boarding.boardingName);
      }
        
    } catch (error) {
      console.error('Error fetching boarding names:', error);
    }
  };

  useEffect(() => {
    loadData();     
  },[boardingId, ingredientId]);

  const submitHandler = async(e) => {
    e.preventDefault();

      try {
        const data = {
          boardingId: boardingId, 
          ingredientId: ingredientId,
          newIngredientName,
          newQuantity,  
          newMeasurement,
          newPurchaseDate,
        };

        const res = await updateIngredient(data).unwrap();
        
        if (res) {
           
          toast.success('Ingredient Updated successfully');
          navigate(`/${userInfo.userType}/ingredient`);  

        } else {
          toast.error('Failed to update ingredient');
        }

      } catch (err) {
        toast.error(err.data?.message || err.error || err);
      }
       
    }



  return (
      <>
      <Sidebar />
      <div className={dashboardStyles.mainDiv}>
        <Container>
          	<Row>
                <Col>
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                        <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                        <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                        <Link underline="hover" key="3" color="inherit" href="/owner/ingredient">Ingredients</Link>,
                        <Typography key="4" color="text.primary">Update</Typography>
                    </Breadcrumbs>
                </Col>
            </Row>
                    <Collapse in={noticeStatus}>
                        <Alert
                            action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                            sx={{ mt: 2, bgcolor:'rgb(177 232 255)' }}
                            severity="info"
                        >
                            <strong>Info</strong> -  If You Want to Change Quantity please Use Central or Reduce Inventory.
                        </Alert>
                    </Collapse>

                    <FormContainer>
                       <Form onSubmit={submitHandler}>
                            <Row>
                              <Col>
                                <h3>Update Ingredients</h3>
                              </Col>
                              <Col>
                              <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Boarding Name</InputLabel>
                                  <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={boardingId}  
                                    label="Boarding Name"
                                    disabled  
                                  >
                                    <MenuItem value={boardingId}>  
                                      {boardingNames}
                                    </MenuItem>
                                  </Select>
                              </FormControl>
                              </Col>
                            </Row>

                            <Form.Group className='my-2' controlId='ingredientName'>
                              <Form.Label>Ingredient Name</Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Enter Ingredient Name'
                                value={newIngredientName}
                                onChange={(e) => setIngredientName(e.target.value)}
                                required
                              ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='quantity'>
                              <Form.Label>Quantity</Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Enter Quantity'
                                value={newQuantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                readOnly={true}
                              ></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='alertquantity'>
                              <Form.Label>Alert Quantity</Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Enter Alert Quantity'
                                value={newMeasurement}
                                onChange={(e) => setAlertQuantity(e.target.value)}
                                required
                              ></Form.Control>
                            </Form.Group>
                            
                            <Form.Group className='my-2' controlId='confirmPassword'>
                              <Form.Label>Purchase Date</Form.Label>
                              <Form.Control
                                type='date'
                                placeholder='Enter Date'
                                value={newPurchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                readOnly={true}
                              ></Form.Control>
                            </Form.Group>

                            <Row style={{marginTop:'40px'}}>
                                  <Col>
                                      <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Update</Button>      
                                  </Col>
                            </Row>
                            
                        </Form>
                    </FormContainer>
        </Container>
      </div>
      </>
  );

 }
export default updateIngredientPage

