import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Row, Col, Form } from "react-bootstrap";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useCreateOrderMutation } from '../slices/orderApiSlice'; // Import the generated mutation function
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';

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
      // Calculate the price
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
        <Row className={dashboardStyles.durationRaw}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value )}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="2">Chicken</MenuItem>
              <MenuItem value="1">Fish</MenuItem>
              <MenuItem value="7">Egg</MenuItem>
            </Select>
          </FormControl>
        </Row>
      );
    } else if (product === '12') {
      return (
        <Row className={dashboardStyles.durationRaw}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value )}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="2">Chicken</MenuItem>
              <MenuItem value="7">Egg</MenuItem>
            </Select>
          </FormControl>
        </Row>
      );
    } else {
      return (
        <Row className={dashboardStyles.durationRaw}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value )}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="5">Normal</MenuItem>
              <MenuItem value="7">Egg</MenuItem>
            </Select>
          </FormControl>
        </Row>
      );
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '300px',
    margin: '0 auto',
  };

  return (<>
    <Sidebar />
    <div className={dashboardStyles.mainDiv}>
    <form onSubmit={submitHandler} style={formStyle}>
      <Row className={dashboardStyles.durationRaw}>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">Product</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            value={product}
            onChange={(e) => setProduct( e.target.value )}
            required
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="3">Fried Rice</MenuItem>
            <MenuItem value="6">Rice & Curry</MenuItem>
            <MenuItem value="12">Noodles</MenuItem>
            <MenuItem value="24">Hoppers</MenuItem>
          </Select>
        </FormControl>
      </Row>

      {renderFoodTypeDropdown()}

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={handleQuantityChange}
        required
      />
      {/* Display the calculated price */}
      <div>Price: {calculatePrice()}</div>
      
      {/* Display the total by multiplying quantity by price */}
      <div>Total: {total}</div>
      <div>Order No: {orderNo}</div>
      <button type="submit" loading={isLoading}>
        {isLoading ? 'Creating Order...' : 'Create Order'}
      </button>
      {isError && <div>Error: {error.message}</div>}
    </form>
    </div>
    </>
  );
};

export default OrderForm; 