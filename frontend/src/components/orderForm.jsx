import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Row, Col, Form } from "react-bootstrap";
import { Breadcrumbs,Container, Button,Link,Typography,Card, CardContent, TextField, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useCreateOrderMutation } from '../slices/orderApiSlice'; 
import orderStyles from '../styles/orderStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import formStyle from '../styles/formStyle.module.css';
import ViewMenu from "../components/menuView";
import MenuView from './menuoccupant';
import { Close } from '@mui/icons-material';
import { setCartItems } from '../slices/cartSlice.js';
import { clearCartDetails } from '../slices/cartSlice.js';


const OrderForm = () => {
  const [product, setProduct]=useState('')
  const [foodType, setFoodType]=useState('')
  const [quantity, setQuantity]=useState('')
  const [price, setPrice]=useState('')
  const [orderNo, setOrderNo] = useState(1);
  const [total, setTotal] = useState(0); // State to store the total
  const { userInfo } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const userID = userInfo._id;

  const dispatch = useDispatch();

  const [createOrder, { isLoading, isError, error }] = useCreateOrderMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      // Create the order with calculated price
      const response = await createOrder({
        cart,
        occupantId:userID,
      }).unwrap();
      if (response) {
        // Increment the orderNo for the next order
        console.log("value", response);
        toast.success('Order Successfull');
        dispatch(clearCartDetails())
      }
    } catch (err) {
      toast.error(err.data?.message || err.error || err);
    }

      
      
  };

  const removeFromCart = (menu) => {
    // Use the filter method to create a new cart array without the item to be removed
    const updatedCart = cart.filter((item) => item._id !== menu._id);
    
    // Dispatch the updated cart to the state
    dispatch(setCartItems(updatedCart));
  }

  const handleQuantityChange = (menu, quantity) => {

    if(quantity == 0){
      removeFromCart(menu)
    }
    else{
      // Find the index of the menu item in the cart   
      const existingCartItemIndex = cart.findIndex((item) => item._id === menu._id);
  
      if (existingCartItemIndex !== -1) {
        // If the item exists in the cart, create a new cart array with the updated quantity
        const updatedCart = cart.map((item, index) => {
          if (index === existingCartItemIndex) {
            return {
              ...item,
              quantity: quantity,
            };
          }
          return item;
        });
  
        // Dispatch the updated cart
        dispatch(setCartItems(updatedCart));
      }
    }

  }

  return (
    <>
      <Row>
        <Col>
          <div>
            <div className={orderStyles.card}>
              <h3>Food Menu</h3>
            </div>
            <MenuView />
          </div>
        </Col>
        <Col>
          <div className={orderStyles.card}>
            <h3>Cart</h3>
          </div>
          <div className="order-box">
            <div className="order-form-container">
              <form className={formStyle.form}>
                <Row className={dashboardStyles.durationRaw}>
                  <Col>
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell align="center" style={{ height: '50px' }}><b>Product</b></TableCell>
                            <TableCell align="center"><b>Unit Price</b></TableCell>
                            <TableCell align="center"><b>Quantity</b></TableCell>
                            <TableCell align="center"><b>Total</b></TableCell>
                            <TableCell align="center"><b>Remove</b></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {cart.length > 0 ? (
                            cart.map((menu, index) => (
                              <TableRow key={index}>
                                <TableCell align="center" style={{ height: '50px' }}>{menu.product}</TableCell>
                                <TableCell align="center">Rs. {menu.price}</TableCell>
                                <TableCell align="center">
                                  <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={menu.quantity}
                                    style={{
                                      padding: '5px',
                                      width: '100px',
                                      border: '1px solid #ccc',
                                      borderRadius: '5px',
                                    }}
                                    onChange={(e) => handleQuantityChange(menu, e.target.value)}
                                    required
                                  />
                                </TableCell>
                                <TableCell align="center">Rs. {menu.price * menu.quantity}</TableCell>
                                <TableCell align="center"><IconButton onClick={() => removeFromCart(menu)}><Close /></IconButton></TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} style={{textAlign:'center', height:'5px'}}>
                                No menu items found!
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3} style={{textAlign:'center', height:'5px'}}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell>
                              Rs. {cart.reduce((total, menu) => total + menu.quantity * menu.price, 0)}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </TableContainer> 
                  </Col>
                </Row>
                <Button style={{backgroundcolor: 'blue',
  color: 'white',
  borderradius: '4px',
  padding: '10px 20px',
  fontsize: '16px',
  cursor: 'pointer',
}}

  
onClick={handleSubmit}>Confirm Order</Button>
              </form>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default OrderForm; 