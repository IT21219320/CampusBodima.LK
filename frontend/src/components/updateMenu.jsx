import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Row, Col, TextField, Button } from '@mui/material';

import { useUpdateMenuMutation } from '../slices/menuesApiSlice';
import formStyle from '../styles/formStyle.module.css';

const UpdateMenu = ({ menu, onClose, onUpdateSuccess }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [updateMenuData, setUpdateMenuData] = useState({
    cost: menu.cost,
    price: menu.price,
  });

  const [updateMenu, { isLoading, isError }] = useUpdateMenuMutation();
  
  const userID = userInfo._id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateMenuData({
      ...updateMenuData,
      [name]: value,
    });
  };

  const handleUpdateMenu = async () => {
    try {
      const updatedMenu = await updateMenu({
        menuId: menu._id,
        ownerId: userID,
        updates: updateMenuData,
      }).unwrap();
      toast.success('Menu updated successfully');
      onUpdateSuccess(updatedMenu);
      onClose();
    } catch (error) {
      toast.error('Failed to update menu. Please try again later.');
    }
  };

  return (
    <div>
      <Row>
        <Col>
          <h3>Update Menu</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <TextField
            id="cost"
            name="cost"
            label="Cost"
            variant="outlined"
            value={updateMenuData.cost}
            onChange={handleInputChange}
            className={formStyle.formField}
          />
        </Col>
        <Col>
          <TextField
            id="price"
            name="price"
            label="Price"
            variant="outlined"
            value={updateMenuData.price}
            onChange={handleInputChange}
            className={formStyle.formField}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateMenu}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Menu'}
          </Button>
        </Col>
        <Col>
          <Button variant="contained" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default UpdateMenu;
