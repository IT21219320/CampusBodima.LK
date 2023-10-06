import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Row, Col, Form } from "react-bootstrap";
import { Breadcrumbs,Container, Button,Link,Typography,Card, CardContent, TextField, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { NavigateNext } from '@mui/icons-material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useCreateOrderMutation } from '../slices/orderApiSlice'; // Import the generated mutation function
import Sidebar from './sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import formStyle from '../styles/formStyle.module.css';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';

const OrderForm = () => {
  const [product, setProduct]=useState('')
  const [foodType, setFoodType]=useState('')
  const [quantity, setQuantity]=useState('')
  const [price, setPrice]=useState('')
  const [orderNo, setOrderNo] = useState(1);
  const [total, setTotal] = useState(0); // State to store the total
  const { userInfo } = useSelector((state) => state.auth);
  const userID = userInfo._id;

  

  const priceData = {
    '3': {
      '2': 400, // Fried Rice - Chicken
      '1': 350, // Fried Rice - Fish
      '7': 300, // Fried Rice - Egg
    },
    '6': {
      '2': 350, // Rice & Curry - Chicken
      '1': 300, // Rice & Curry - Fish
      '7': 300, // Rice & Curry - Egg
    },
    '12': {
      '2': 350, // Noodles - Chicken
      '7': 300, // Noodles - Egg
    },
    '24': {
      '5': 25, // Hoppers - Normal
      '7': 80, // Hoppers - Egg
    },
  };
  
  // Function to calculate price based on product and foodType
  const calculatePrice = () => {
    const selectedProduct = product;
    const selectedFoodType = foodType;

    if (priceData[selectedProduct] && priceData[selectedProduct][selectedFoodType]) {
      return priceData[selectedProduct][selectedFoodType];
    }
    
    // Default price if no match is found
    return 0;
  };

  // Function to handle quantity change
  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    const price = calculatePrice();
    setPrice(price);
    // Calculate and set the total
    setTotal(price * newQuantity);

    // Update the form data
    setQuantity(newQuantity);
  };

  const [createOrder, { isLoading, isError, error }] = useCreateOrderMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // Validate if quantity is a positive value
      if (quantity <= 0) {
        toast.error('Quantity must be a positive value.');
        return;
      }
      const calculatedPrice = calculatePrice();
  
      // Create the order with calculated price
      const response = await createOrder({
        userInfo_id: userID,
        product: product,
        foodType: foodType,
        quantity: quantity,
        price: calculatedPrice, // Use calculatedPrice here
        total: total,
        occupantId:userID,
        orderNo:orderNo,
      });
      if (response) {
        // Increment the orderNo for the next order
        setOrderNo((prevOrderNo) => prevOrderNo + 1);
        console.log("value", response);
        toast.success('Order Submitted Successfully');
      }
    } catch (err) {
      toast.error(err.data?.message || err.error);
    }

      
      
  };
  

  const renderFoodTypeDropdown = () => {
    if (product === '3' || product === '6') {
      return (
        <Row className={dashboardStyles.mainDiv}>
          
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              
              onChange={(e) => setFoodType(e.target.value )}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginTop: '10px',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="2">Chicken</MenuItem>
              <MenuItem value="1">Fish</MenuItem>
              <MenuItem value="7">Egg</MenuItem>
            </Select>
          
        </Row>
      );
    } else if (product === '12') {
      return (
        <Row className={dashboardStyles.mainDiv}>
         
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
            
              onChange={(e) => setFoodType(e.target.value )}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginTop: '10px',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="2">Chicken</MenuItem>
              <MenuItem value="7">Egg</MenuItem>
            </Select>
          
        </Row>
      );
    } else {
      return (
        <Row className={dashboardStyles.mainDiv}>
          
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              
              onChange={(e) => setFoodType(e.target.value )}
              required
              style={{
                width: '97%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginTop: '10px',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="5">Normal</MenuItem>
              <MenuItem value="7">Egg</MenuItem>
            </Select>
          
        </Row>
      );
    }
  };

  

  return (<>
    
                <Row>
                        <Col>
                            <Card variant="outlined" className={occupantFeedbackStyles.card}>
                                <CardContent>
                                    <h3>Create New Order</h3>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>
    <div className="order-box">
      <div className="order-form-container">
      
    <form onSubmit={submitHandler} className={formStyle.form} >
      <Row className={dashboardStyles.durationRaw}>
        
      <InputLabel
  id="demo-simple-select-standard-label"
  style={{
    fontSize: '16px',
    fontWeight: 'bold',
  }}
>
  Product
</InputLabel>
<Select
  labelId="demo-simple-select-standard-label"
  value={product}
  onChange={(e) => setProduct(e.target.value)}
  required
  style={{
    width: '94%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginTop: '10px',
  }}
>
  <MenuItem value="">
    <em>None</em>
  </MenuItem>
  <MenuItem value="3">Fried Rice</MenuItem>
  <MenuItem value="6">Rice & Curry</MenuItem>
  <MenuItem value="12">Noodles</MenuItem>
  <MenuItem value="24">Hoppers</MenuItem>
</Select>

        
      </Row>
      <Row>

      {renderFoodTypeDropdown()}
      </Row>
      <p></p>
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        style={{
          padding: '5px',
          width: '15%',
          border: '1px solid #ccc',
          borderRadius: '5px',
          margin: '10px auto',
        }}
        onChange={handleQuantityChange}
        required
      />
      {/* Display the calculated price */}
      <div style={{
          padding: '5px',
          width: '15%',
          border: '1px solid #ccc',
          borderRadius: '5px',
          margin: '10px auto',
        }}>Unit Price: {calculatePrice()}</div>
      
      {/* Display the total by multiplying quantity by price */}
      <div style={{
          padding: '5px',
          width: '15%',
          border: '1px solid #ccc',
          borderRadius: '5px',
          margin: '10px auto',
        }}>Total: {total}</div>
      <div style={{
          padding: '5px',
          width: '15%',
          border: '1px solid #ccc',
          borderRadius: '5px',
          margin: '10px auto',
        }}>Order No: {orderNo}</div>
      <LoadingButton 
      type="submit" 
      loading={isLoading} 
      variant="contained"
      color="primary"
      >
        {isLoading ? 'Creating Order...' : 'Create Order'}
      </LoadingButton>
      {isError && <div>Error: {error.message}</div>}
    </form>
    </div>
    </div>
    </>
  );
  
};

export default OrderForm; 