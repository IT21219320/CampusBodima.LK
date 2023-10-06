import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Row, Col, Form } from "react-bootstrap";
import { Breadcrumbs, Container, Button, Link, Typography,Card, CardContent, TextField, CircularProgress } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useUpdateOrderMutation, useGetOrderMutation, useGetUpdateOrdersMutation } from '../slices/orderApiSlice'; // Import the generated mutation and query functions
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import formStyle from '../styles/formStyle.module.css';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateOrder = ({ orderId }) => {
  const [product, setProduct] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderNo, setOrderNo] = useState(1);
  const [total, setTotal] = useState(0); // State to store the total
  const { userInfo } = useSelector((state) => state.auth);
  const userID = userInfo._id;

  const {oId} = useParams();

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
  const productNames = {
    '3': 'Fried Rice',
    '6': 'Rice & Curry',
    '12': 'Noodles',
    '24': 'Hoppers',
  };
  const foodTypeNames = {
    '1': 'Fish',
    '2': 'Chicken',
    '7': 'Egg',
    '5': 'Normal',
  };


  
    const [updateOrder, { isLoading, isError, error }] = useUpdateOrderMutation();
    const [getUpdateOrder] = useGetUpdateOrdersMutation();

    const navigate = useNavigate();

    const loadData = async() => {
      const res = await getUpdateOrder(oId).unwrap()
      console.log(res);
      setProduct(res.order.product)
      setFoodType(res.order.foodType)
      setQuantity(res.order.quantity)
      setPrice(res.order.price)
      setOrderNo(res.order.orderNo)
      setTotal(res.order.total)
    }
   
  useEffect(() => {
    // Update form fields with order data when it's available
    loadData()
  }, []);

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

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      
      if (quantity <= 0) {
        toast.error('Quantity must be a positive value.');
        return;
      }
      const calculatedPrice = calculatePrice();

      // Update the order with calculated price using useUpdateOrderMutation
      const response = await updateOrder({
        _id: oId,
        userInfo_id: userID,
        product: productNames[product],
        foodType: foodTypeNames[foodType],
        quantity: quantity,
        price: calculatedPrice,
        total: total,
        occupantId: userID,
        orderNo: orderNo,
      });
      if (response) {
        console.log("value", response);
        toast.success('Order Updated Successfully');
        navigate('/occupant/order/')
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
                width: '94%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginTop: '10px',
              }}
            >
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
                {Object.keys(productNames).map((productCode) => (
                  <MenuItem key={productCode} value={productCode}>
                    {productNames[productCode]}
                  </MenuItem>
                ))}
              </Select>
            </Row>

            {renderFoodTypeDropdown()}
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
        }}>Price: {calculatePrice()}</div>

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
            <Button
              type="submit"
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
