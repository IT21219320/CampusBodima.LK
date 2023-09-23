import React, { useState } from 'react';
import { useCreateOrderMutation } from '../slices/orderApiSlice'; // Import the generated mutation function
import styles from '../styles/orderForm.css';
const OrderForm = () => {
  const [formData, setFormData] = useState({
    product: '',
    foodType: '',
    quantity: '',
    price: '',
  });

  // Use the generated mutation function
  const [createOrder, { isLoading, isError, error }] = useCreateOrderMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the createOrder mutation with the formData
      const response = await createOrder(formData).unwrap();
      console.log('Order created:', response);
      // You can update your UI or perform other actions here
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        type="text"
        placeholder="Product"
        value={formData.product}
        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
      />
      <input
        type="text"
        placeholder="Food Type"
        value={formData.foodType}
        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
      />
      <input
        type="number"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
      />
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
