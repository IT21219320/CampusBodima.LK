import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { Row, Col, Form } from "react-bootstrap";
import reserveFormStyle from "../styles/reserveFormStyle.module.css";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useCreateOrderMutation } from '../slices/orderApiSlice'; // Import the generated mutation function
import Sidebar from '../components/sideBar';

const OrderForm = () => {
  const [product, setProduct]=useState('')
  const [foodType, setFoodType]=useState('')
  const [quantity, setQuantity]=useState('')
  const [price, setPrice]=useState('')
  const [orderNo, setOrderNo]=useState('')
  const [total, setTotal] = useState(0); // State to store the total
  const { userInfo } = useSelector((state) => state.auth);
  const userID = userInfo._id;

  const [formData, setFormData] = useState({
    product: '',
    foodType: '',
    quantity: '',
  });

  const priceData = {
    '3': {
      '3': 400, // Fried Rice - Chicken
      '6': 350, // Fried Rice - Fish
      '12': 300, // Fried Rice - Egg
    },
    '6': {
      '3': 350, // Rice & Curry - Chicken
      '6': 300, // Rice & Curry - Fish
      '12': 300, // Rice & Curry - Egg
    },
    '12': {
      '3': 350, // Noodles - Chicken
      '12': 300, // Noodles - Egg
    },
    '24': {
      '3': 25, // Hoppers - Normal
      '12': 80, // Hoppers - Egg
    },
  };

  // Function to calculate price based on product and foodType
  const calculatePrice = () => {
    const selectedProduct = formData.product;
    const selectedFoodType = formData.foodType;

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

    // Calculate and set the total
    setTotal(price * newQuantity);

    // Update the form data
    setFormData({ ...formData, quantity: newQuantity });
  };

  const [createOrder, { isLoading, isError, error }] = useCreateOrderMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resPay= await createOrder({userInfo_id:userID,product:product,foodType:foodType,quantity:quantity,price:price,orderNo:orderNo,total:total})

    try {
      // Calculate the price
      const calculatedPrice = calculatePrice();

      // Create the order with calculated price
      const response = await createOrder({ ...formData, price: calculatedPrice }).unwrap();
      console.log('Order created:', response);
      // You can update your UI or perform other actions here
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const renderFoodTypeDropdown = () => {
    if (formData.product === '3' || formData.product === '6') {
      return (
        <Row className={reserveFormStyle.durationRaw}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="3">Chicken</MenuItem>
              <MenuItem value="6">Fish</MenuItem>
              <MenuItem value="12">Egg</MenuItem>
            </Select>
          </FormControl>
        </Row>
      );
    } else if (formData.product === '12') {
      return (
        <Row className={reserveFormStyle.durationRaw}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="3">Chicken</MenuItem>
              <MenuItem value="12">Egg</MenuItem>
            </Select>
          </FormControl>
        </Row>
      );
    } else {
      return (
        <Row className={reserveFormStyle.durationRaw}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Food Type</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              required
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="3">Normal</MenuItem>
              <MenuItem value="12">Egg</MenuItem>
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
    <form onSubmit={handleSubmit} style={formStyle}>
      <Row className={reserveFormStyle.durationRaw}>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">Product</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
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
        value={formData.quantity}
        onChange={handleQuantityChange}
        required
      />
      {/* Display the calculated price */}
      <div>Price: {calculatePrice()}</div>
      
      {/* Display the total by multiplying quantity by price */}
      <div>Total: {total}</div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Order...' : 'Create Order'}
      </button>
      {isError && <div>Error: {error.message}</div>}
    </form>
    </>
  );
};

export default OrderForm; 