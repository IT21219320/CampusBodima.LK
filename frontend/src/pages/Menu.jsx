import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ViewMenu from "../components/menuView";
import orderStyles from '../styles/orderStyles.module.css';
import { TextField, InputLabel, Button } from '@mui/material';
import { useAddMenuMutation } from '../slices/menuesApiSlice';

const MenuForm = () => {
  const [menuName, setMenuName] = useState('');
  const [product, setProduct] = useState('');
  const [boarding, setBoarding] = useState('');
  const [cost, setCost] = useState('');
  const [foodType, setFoodType] = useState('');
  const [price, setPrice] = useState('');
  const [activeTab, setActiveTab] = useState('Create Menu');
  const { userInfo } = useSelector((state) => state.auth);
  const ownerId=userInfo._id;

  const [createMenu, { isLoading, isError, error }] = useAddMenuMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
        toast.error('Please fill out all fields with valid data.');
        return;
      }
    try {
      
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
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const isFormValid = () => {
    // Validate menuName (under 15 characters)
    if (menuName.trim() === '' || menuName.length > 15) {
      toast.error('Menu Name must be under 15 characters.');
      return false;
    }
  
    // Validate productName (under 15 characters)
    if (product.trim() === '' || product.length > 15) {
      toast.error('Product Name must be under 15 characters.');
      return false;
    }
  
    // Validate cost (positive number)
    if (cost.trim() === '' || isNaN(cost) || parseFloat(cost) <= 0) {
      toast.error('Cost must be a positive number.');
      return false;
    }
  
    // Validate foodType (under 15 characters)
    if (foodType.trim() === '' || foodType.length > 15) {
      toast.error('Food Type must be under 15 characters.');
      return false;
    }
  
    // Validate price (positive number)
    if (price.trim() === '' || isNaN(price) || parseFloat(price) <= 0) {
      toast.error('Price must be a positive number.');
      return false;
    }
  
    return true;
  };
  const formContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  const formBorder = {
    border: '1px solid #ccc', // Border around the form
    borderRadius: '4px',
    padding: '15px',
  };
  
  const gridContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gridGap: '10px',
    marginBottom: '15px',
  };
  
  const labelStyle = {
    fontSize: '16px',
    color: 'rgb(25, 25, 112)',
    alignSelf: 'center',
  };
  
  const inputStyle = {
    width: '100%',
   
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif',
  };
  
  const buttonStyle = {
    backgroundColor: 'rgb(25, 25, 112)',
    color: 'white',
    fontSize: '14px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginLeft:'110px'
  };
  
  const errorStyle = {
    color: 'red',
    marginTop: '10px',
    fontSize: '12px',
  };
  
  return (
    <>
    <Sidebar />
    <div className={dashboardStyles.mainDiv}>
    <Container className={dashboardStyles.container}>
        <Tabs defaultActiveKey="Create Menu" onSelect={(k) => setActiveTab(k)}>
                    <Tab eventKey="Create Menu" title="Create Menu">
                        {activeTab=="Create Menu" ?
                        <><Row>
                                  <Col>
                                      <div className={orderStyles.card}>
                                          <h3>Add Menu Items</h3>
                                      </div>
                                  </Col>
                              </Row>
                              <Container style={containerStyle} maxWidth="md">
                              <Row>
                                      <Col>
                                      <form onSubmit={submitHandler} style={formContainer}>
                                      <div style={formBorder}>
                                          <div style={gridContainer}>
                                            <div style={labelStyle}>Menu Name</div>
                                            <TextField
                                              type="text"
                                              value={menuName}
                                              onChange={(e) => setMenuName(e.target.value)}
                                              required
                                              style={inputStyle}
                                            />
                                            
                                            <div style={labelStyle}>Product Name</div>
                                            <TextField
                                              type="text"
                                              value={product}
                                              onChange={(e) => setProduct(e.target.value)}
                                              required
                                              style={inputStyle}
                                            />
                                            
                                            <div style={labelStyle}>Boarding Name</div>
                                            <TextField
                                              type="text"
                                              value={boarding}
                                              onChange={(e) => setBoarding(e.target.value)}
                                              required
                                              style={inputStyle}
                                            />
                                            
                                            <div style={labelStyle}>Cost</div>
                                            <TextField
                                              type="number"
                                              value={cost}
                                              onChange={(e) => setCost(e.target.value)}
                                              required
                                              style={inputStyle}
                                            />
                                            
                                            <div style={labelStyle}>Food Type</div>
                                            <TextField
                                              type="text"
                                              value={foodType}
                                              onChange={(e) => setFoodType(e.target.value)}
                                              required
                                              style={inputStyle}
                                            />
                                            
                                            <div style={labelStyle}>Price</div>
                                            <TextField
                                              type="number"
                                              value={price}
                                              onChange={(e) => setPrice(e.target.value)}
                                              required
                                              style={inputStyle}
                                            />
                                          </div>
                                          
                                          <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={isLoading}
                                            style={buttonStyle}
                                          >
                                            {isLoading ? 'Creating Menu...' : 'Create Menu'}
                                          </Button>
                                          
                                          {isError && <div style={errorStyle}>Error: {error.message}</div>}
                                          </div>
                                        </form>

                                      </Col>
                                  </Row>
                                  </Container>
                                  </>
                        : ''}
                    </Tab>
                    <Tab eventKey="My Menu" title="My Menu">
                        {activeTab=="My Menu" ?
                            <>
                            <ViewMenu />
                            </>
                        : ''}
                    </Tab>
                </Tabs>
            </Container>
        </div>           

    </>
  );
};

export default MenuForm;
