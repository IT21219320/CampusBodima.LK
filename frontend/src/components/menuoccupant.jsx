// MenuView.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Row, Col } from 'react-bootstrap';
import formStyle from '../styles/formStyle.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { toast } from 'react-toastify';
import { useGetBoardingMenuesMutation } from '../slices/menuesApiSlice';
import orderStyles from '../styles/orderStyles.module.css';
import DeleteMenu from './deleteMenu';
import {  Button} from '@mui/material';
import { setCartItems } from '../slices/cartSlice.js';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Navigate } from 'react-router-dom';

const MenuView = () => {
  const [menuData, setMenuData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedmenu, setSelectedMenu] = useState(null);
  const [boardingNames, setBoardingNames] = useState('');
  const [boardingId, setBoardingId] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const userID = userInfo._id;
  const [getBoardingMenues, { isLoading, data: menus }] = useGetBoardingMenuesMutation();

  const dispatch = useDispatch();

  const loadMenuData = async () => {
    try {
      const res = await getBoardingMenues({ userID }).unwrap();
      setMenuData(res.menu);
    } catch (err) {
      console.log(err);
      toast.error(err.data?.message || err.error || err);
    }
  };

  const addToCart = (menu) => {
    const quantity = 1;
  
    // Check if the menu item is already in the cart
    const existingCartItemIndex = cart.findIndex((item) => item._id === menu._id);
  
    if (existingCartItemIndex !== -1) {
      // If the item already exists in the cart, create a new cart array with the updated quantity
      const updatedCart = cart.map((item, index) => {
        if (index === existingCartItemIndex) {
          return {
            ...item,
            quantity: item.quantity + quantity,
          };
        }
        return item;
      });
      dispatch(setCartItems(updatedCart));
    } else {
      // If the item doesn't exist, add it to the cart with quantity
      const menuWithQuantity = { ...menu, quantity };
      const tempCart = [...cart, menuWithQuantity];
      dispatch(setCartItems(tempCart));
    }
  }
  

  

  useEffect(() => {
    loadMenuData();
    console.log(cart);
  }, [boardingId]);

  const filteredMenus = menuData
    .filter((menu) => {
      return menu.product.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <>
      <Row>
        <Col>
          
          <input
            id="search"
            type="text"
            placeholder="Search In Menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={formStyle.searchField}
          />
        </Col>
        <Col>
          <div style={{ float: 'right', minWidth: '220px' }}>
            {/* Your boarding selection component goes here */}
          </div>
        </Col>
      </Row>
      <br />
      
      <Row>
        <Col>
        
          <Card>
            <Card.Body>
              {isLoading ? 
                'Loading...' 
              : 
                <Row>
                {filteredMenus.length > 0 ?
                  filteredMenus.map((menu, index) => (
                    <Col lg={4} key={index}>
                      <Button style={{
    background: 'linear-gradient(to right, #C02425, #F0CB35)', // Replace these colors with your desired gradient
    flexDirection: 'column',
    padding: '10px 10px',
    margin: '10px 0',
    textAlign: 'center',
    fontFamily: 'cursive', 
    width: '100%',
    color: 'white',
    fontWeight: 'bold',
  }} variant='contained' onClick={() => addToCart(menu)}>
                        <Row>
                          <Col>
                            {menu.product}
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            Rs. {menu.price}
                          </Col>
                        </Row>
                      </Button>
                    </Col>
                  ))
                :
                  <Col>'No menu items found!'</Col>} 
                </Row>        
              }
              {/*<TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" style={{ height: '50px' }}><b>Product</b></TableCell>
                      <TableCell align="center"><b>Price</b></TableCell>
                      <TableCell align="center"><b>Action</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} style={{textAlign:'center'}}>
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredMenus.length > 0 ? (
                      filteredMenus.map((menu, index) => (
                        <TableRow key={index}>
                          <TableCell align="center" style={{ height: '50px' }}>{menu.product}</TableCell>
                          <TableCell align="center">{menu.price}</TableCell>
                          <TableCell align="center">
                            <Button style={{ background: ' lightgreen', color: 'white', marginRight: '10px' }}
                            onClick={()=>Navigate()}><AddShoppingCartIcon/></Button>
                          </TableCell>
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
                </Table>
              </TableContainer>*/}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {selectedmenu && (
        <DeleteMenu
          menu={selectedmenu}
          onClose={closeDeleteModal}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};

export default MenuView;
