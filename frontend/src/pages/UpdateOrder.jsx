/*import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useGetOrderMutation, useUpdateOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import { Container,Breadcrumbs, Button, TextField, Typography, Link, CircularProgress } from '@mui/material';
import {  Row, Col} from 'react-bootstrap';
import { NavigateNext } from '@mui/icons-material';
import Sidebar from '../components/sideBar';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import formStyle from '../styles/formStyle.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import InputLabel from '@mui/material/InputLabel';*/


/*const UpdateOrder = () => {
  const [product, setProduct]=useState('')
  const [foodType, setFoodType]=useState('')
  const [quantity, setQuantity]=useState('')
  const [price, setPrice]=useState('')
  const [orderNo, setOrderNo] = useState(1);
  const [total, setTotal] = useState(0); // State to store the total
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [updateFormData, setUpdateFormData] = useState({});
  const { userInfo } = useSelector((state) => state.auth);

  const [getOrder, { isLoading: isGetOrderLoading }] = useGetOrderMutation();
  const [updateOrder, { isLoading: isUpdateLoading }] = useUpdateOrderMutation();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const res = await getOrder({ orderId });
        setOrderData(res.data); // Assuming the API response contains the order data
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch order. Please try again later.');
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleUpdate = async () => {
    try {
      await updateOrder({ orderId, ...updateFormData });
      toast.success('Order updated successfully.');
    } catch (error) {
      toast.error('Failed to update order. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      [name]: value,
    });
  };

  if (isLoading || isGetOrderLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (<><Sidebar />
    <Container>
    <Row>
                    <Col>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                            <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                            <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                            
                            <Typography key="3" color="text.primary">Create Order</Typography>
                        </Breadcrumbs>
                    </Col>
      </Row>
      <Row>
        <Col>
          <h2>Update Order</h2>
          <form>
          <Select
            labelId="demo-simple-select-standard-label"
            value={product}
            fullWidth
            onChange={(e) => setFoodType(e.target.value )}
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
           {/* <TextField
              name="product"
              label="Product"
              variant="outlined"
              fullWidth
              margin="normal"
              value={updateFormData.product || orderData.product}
              onChange={handleInputChange}
/>}*//*
            <TextField
            name="foodType"
            label="Food Type"
            variant="outlined"
            fullWidth
            margin="normal"
            value={updateFormData.foodType || orderData.product}
            onChange={handleInputChange}
          />
            {/* Add similar fields for other order properties *//*}
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={isUpdateLoading}
            >
              {isUpdateLoading ? <CircularProgress size={24} /> : "Update Order"}
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
    </>
  );
};
const UpdateOrder = () => {
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

  const [updateOrder, { isLoading, isError, error }] = useUpdateOrderMutation();

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
      const response = await updateOrder({
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
              fullWidth
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
          
        </Row>
      );
    } else if (product === '12') {
      return (
        <Row className={dashboardStyles.mainDiv}>
         
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              fullWidth
              onChange={(e) => setFoodType(e.target.value )}
              required
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
              fullWidth
              onChange={(e) => setFoodType(e.target.value )}
              required
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

  /*const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    
    margin: '0 auto',
  };*//*

  return (<>
    <Sidebar />
    <Container className={formStyle.containerStyles}>
    <Row>
                    <Col>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                            <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                            <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                            
                            <Typography key="3" color="text.primary">Update Order</Typography>
                        </Breadcrumbs>
                    </Col>
                </Row>
    <div className={dashboardStyles.mainDiv}>
    <form onSubmit={submitHandler} >
      <Row className={dashboardStyles.durationRaw}>
        
          <InputLabel id="demo-simple-select-standard-label">Product</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            value={product}
            fullWidth
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
        
      </Row>

      {renderFoodTypeDropdown()}
      <p></p>
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        fullWidth
        margin="normal"
        onChange={handleQuantityChange}
        required
      />
      {/* Display the calculated price *//*}
      <div fullWidth>Price: {calculatePrice()}</div>
      
      {/* Display the total by multiplying quantity by price *//*}
      <div>Total: {total}</div>
      <div>Order No: {orderNo}</div>
      <Button 
      type="submit" 
      loading={isLoading} 
      variant="contained"
      color="primary"
      >
        {isLoading ? 'Creating Order...' : 'Create Order'}
      </Button>
      {isError && <div>Error: {error.message}</div>}
    </form>
    </div>
    </Container>
    </>
  );
  
};*/

import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Row, Col, Form } from "react-bootstrap";
import { Breadcrumbs, Container, Button, Link, Typography,Card, CardContent, TextField, CircularProgress } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useUpdateOrderMutation, useGetOrderMutation } from '../slices/orderApiSlice'; // Import the generated mutation and query functions
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import formStyle from '../styles/formStyle.module.css';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';

const UpdateOrder = ({ orderId }) => {
  const [product, setProduct] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
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

  
  const { data: orderData, isLoading: isOrderLoading } = useGetOrderMutation(orderId);

  useEffect(() => {
    // Update form fields with order data when it's available
    if (orderData) {
      const { product, foodType, quantity, price, total } = orderData;
      setProduct(product);
      setFoodType(foodType);
      setQuantity(quantity);
      setPrice(price);
      setTotal(total);
    }
  }, [orderData]);

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

  const [updateOrder, { isLoading, isError, error }] = useUpdateOrderMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    const currentTime = new Date();

    const cutoffTime = new Date();
    cutoffTime.setHours(12, 0, 0, 0);
    
    // Compare the current time with the cutoff time
    if (currentTime > cutoffTime) {
      toast.error('Orders can no longer be updated after 12 PM.');
      return;
    }
    try {
      // Validate if quantity is a positive value
      if (quantity <= 0) {
        toast.error('Quantity must be a positive value.');
        return;
      }
      const calculatedPrice = calculatePrice();

      // Update the order with calculated price using useUpdateOrderMutation
      const response = await updateOrder({
        id: orderId,
        userInfo_id: userID,
        product: product,
        foodType: foodType,
        quantity: quantity,
        price: calculatedPrice,
        total: total,
        occupantId: userID,
        orderNo: orderNo,
      });
      if (response) {
        console.log("value", response);
        toast.success('Order Updated Successfully');
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
              fullWidth
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
          
        </Row>
      );
    } else if (product === '12') {
      return (
        <Row className={dashboardStyles.mainDiv}>
         
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={foodType}
              fullWidth
              onChange={(e) => setFoodType(e.target.value )}
              required
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
              fullWidth
              onChange={(e) => setFoodType(e.target.value )}
              required
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
  return (
    <>
      <Sidebar />
      <Container className={formStyle.containerStyles}>
        <Row>
          <Col>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
              <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
              <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType === 'owner' ? 'Owner' : (userInfo.userType === 'occupant' ? 'Occupant' : userInfo.userType === 'admin' ? 'Admin' : <></>)}</Link>,

              <Typography key="3" color="text.primary">Update Order</Typography>
            </Breadcrumbs>
          </Col>
        </Row>
        <Row>
              <Col>
                  <Card variant="outlined" className={occupantFeedbackStyles.card}>
                      <CardContent>
                          <h3>Update My Order</h3>
                      </CardContent>
                  </Card>
              </Col>
        </Row>
        <div className={dashboardStyles.mainDiv}>
          <form onSubmit={submitHandler} className={formStyle.form}>
            <Row className={dashboardStyles.durationRaw}>
              <InputLabel id="demo-simple-select-standard-label">Product</InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                value={product}
                fullWidth
                onChange={(e) => setProduct(e.target.value)}
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
            </Row>

            {renderFoodTypeDropdown()}
            <p></p>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              fullWidth
              margin="normal"
              onChange={handleQuantityChange}
              required
            />
            {/* Display the calculated price */}
            <div fullWidth>Price: {calculatePrice()}</div>

            {/* Display the total by multiplying quantity by price */}
            <div>Total: {total}</div>
            <div>Order No: {orderNo}</div>
            <Button
              type="submit"
              loading={isLoading}
              variant="contained"
              color="primary"
            >
              {isLoading ? 'Updating Order...' : 'Update Order'}
            </Button>
            {isError && <div>Error: {error.message}</div>}
          </form>
        </div>
      </Container>
    </>
  );
};

export default UpdateOrder;
