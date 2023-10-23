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
import { Button,Tooltip } from '@mui/material';
import { setCartItems } from '../slices/cartSlice.js';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


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
      const filteredMenuData = res.menu.filter((menu) => menu.availability === true);
      setMenuData(filteredMenuData);
    } catch (err) {
      console.log(err);
      toast.error(err.data?.message || err.error || err);
    }
  };
  
    const customStyle = {
      fontSize: '16px',
      color: 'white',         
      borderRadius: '4px',      
      padding: '8px',       
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
                <Row><h4 style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0047ab',
                  fontFamily:'Times New Roman',
                }}>
                  Select Item to Order
                </h4>
                  {filteredMenus.length > 0 ?
                    filteredMenus.map((menu, index) => (
                      <Col lg={4} style={{ padding: 'initial' }} key={index}>
                        <Container style={{ display: 'flex', alignItems: 'stretch' }}>
                          {menu.availability ? (
                            <Tooltip title={<span style={customStyle}>Rs. {menu.price}</span>} placement="top" arrow>
                              <Button style={{
                                flexDirection: 'column',
                                padding: '10px 0',
                                margin: '5px 0',
                                textAlign: 'center',
                                fontFamily: 'cursive',
                                width: '100%',
                                color: 'white',
                                fontWeight: 'bold',

                              }} variant='contained' color='info' onClick={() => addToCart(menu)}>
                                <Row>
                                  <Col>
                                    {menu.product}
                                  </Col>
                                </Row>
                                
                              </Button>
                            </Tooltip>
                          ) : (
                            // Display a message when menu is not available
                            <div style={{ backgroundColor: 'gray', color: 'white', padding: '10px' }}>
                              You can't place an order now
                            </div>
                          )}
                        </Container>
                      </Col>
                    ))
                    :
                    <Col>'No menu items found!'</Col>}
                </Row>
              }


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
