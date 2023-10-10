import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { Row, Col } from 'react-bootstrap';
import { TextField, InputLabel, MenuItem, Select, Button } from '@mui/material';
import { useAddMenuMutation } from '../slices/menuesApiSlice'; // Assuming you have a menu API slice

const MenuForm = () => {
  const [menuName, setMenuName] = useState('');
  const [product, setProduct] = useState('');
  const [boarding, setBoarding] = useState('');
  const [cost, setCost] = useState('');
  const [foodType, setFoodType] = useState('');
  const [price, setPrice] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const ownerId=userInfo._id;

  const [createMenu, { isLoading, isError, error }] = useAddMenuMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // Validate form fields as needed

      // Create the menu
      const response = await createMenu({
        userInfo_id: ownerId,
        menuName: menuName,
        product: product,
        boarding: boarding,
        cost: cost,
        foodType: foodType,
        price: price,
        ownerId: ownerId,
      });

      if (response) {
        toast.success('Menu Created Successfully');
      }
    } catch (err) {
      toast.error(err.data?.message || err.error);
    }
  };

  return (
    <Row>
      <Col>
        <form onSubmit={submitHandler}>
          <InputLabel>Menu Name</InputLabel>
          <TextField
            type="text"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            required
          />
          <InputLabel>Product Name</InputLabel>
            <TextField
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          />
          <InputLabel>Boarding Name</InputLabel>
          <TextField
            type="text"
            value={boarding}
            onChange={(e) => setBoarding(e.target.value)}
            required
          />
          <InputLabel>Cost</InputLabel>
          <TextField
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
          <InputLabel>Food Type</InputLabel>
          <TextField
            type="text"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            required
          />
          <InputLabel>Price</InputLabel>
          <TextField
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Menu...' : 'Create Menu'}
          </Button>
          {isError && <div>Error: {error.message}</div>}
        </form>
      </Col>
    </Row>
  );
};

export default MenuForm;
