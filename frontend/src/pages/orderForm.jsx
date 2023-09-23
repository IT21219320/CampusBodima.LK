import React, { useState } from 'react';
import { Row, Col, Form } from "react-bootstrap";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useCreateOrderMutation } from '../slices/orderApiSlice'; // Import the generated mutation function

const OrderForm = () => {
  const [formData, setFormData] = useState({
    product: '',
    foodType: '',
    quantity: '',
  });

  // Function to calculate price based on product and foodType
  const calculatePrice = () => {
    // Add your logic to calculate the price here based on formData.product and formData.foodType
    // For example, you can use a switch statement or lookup table
    // Replace the following line with your calculation logic
    return 10; // Replace with your calculated price
  };

  const [createOrder, { isLoading, isError, error }] = useCreateOrderMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  return (
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
            <MenuItem value={3}>Fried Rice</MenuItem>
            <MenuItem value={6}>Rice & Curry</MenuItem>
            <MenuItem value={12}>Noodles</MenuItem>
            <MenuItem value={24}>Hoppers</MenuItem>
          </Select>
        </FormControl>
      </Row>
      {product==3||product==6||product==12(
                            cards.map((card) => (
                                <div key={card.id} className="card">
                                    <p>{card.cardNumber}</p>
                                    <p>{card.cvv}</p>
                                    <p>{card.exNumber}</p>
                                </div>
                            ))
                        ) /*: (
                            <p>No cards to display</p>
                        )*/}
      if(product==3||product==6||product==12){
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
            <MenuItem value={3}>Chicken</MenuItem>
            <MenuItem value={6}>Fish</MenuItem>
            <MenuItem value={12}>Egg</MenuItem>
          </Select>
        </FormControl>
      </Row>}
      else{
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
            <MenuItem value={3}>Chicken</MenuItem>
            
            <MenuItem value={12}>Egg</MenuItem>
          </Select>
        </FormControl>
      </Row>
      }
      <input
        type="number"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
      />
      {/* Display the calculated price */}
      <div>Price: {calculatePrice()}</div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Order...' : 'Create Order'}
      </button>
      {isError && <div>Error: {error.message}</div>}
    </form>
  );
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '300px',
  margin: '0 auto',
};

export default OrderForm;

