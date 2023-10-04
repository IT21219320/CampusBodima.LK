import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetTodayOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table, Tabs, Tab} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent,Link, Button, TextField ,CircularProgress} from '@mui/material';
import { NavigateNext, Search, GridViewRounded } from '@mui/icons-material';
import { DateRange } from 'react-date-range';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { fontFamily } from "@mui/system";
import { formatDistanceToNow } from 'date-fns';
import { FiEdit } from 'react-icons/fi';
import {RiDeleteBinLine} from 'react-icons/ri'
import { BrowserUpdated as BrowserUpdatedIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import DeleteOrder from "./DeleteOrder";
import OrderForm from "../components/orderForm";
import formStyle from '../styles/formStyle.module.css';

const OrderList = () =>{

    const theme = useTheme();

    const [product, setOrder] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('Place Order');
    const [searchQuery, setSearchQuery] = useState(''); 
    

    
    const openDeleteModal = (order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
      };
    const closeDeleteModal = () => {
        setSelectedOrder(null);
        setShowDeleteModal(false);
      };
    const handleDeleteSuccess = () => {
        // Reload the order data or update the UI as needed
       loadOrderData();
       closeDeleteModal();
      };
    const { userInfo } = useSelector((state) => state.auth);

    

    const navigate = useNavigate();

    const [getTodayOrder, { isLoading }] = useGetTodayOrderMutation();
    const userID = userInfo._id
    const loadOrderData = async () => {
      try {
        const res = await getTodayOrder({ occupantId: userID }).unwrap();
         
        setOrder(res.order);
      } catch (error) {
       
        toast.error('Failed to fetch orders. Please try again later.');
      }
    };
    
    

    useEffect(() => {
        // Dispatch the action to fetch feedback data
        loadOrderData();
      }, []); // Empty dependency array to trigger the effect on component mount

      const filteredOrders = product.filter((order) => {
        return (
          order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.foodType.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });


    return(
        <>
        <Sidebar />
        
        <div className={dashboardStyles.mainDiv}>
            <Container className={dashboardStyles.container}>
                <Row>
                    <Col>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                            <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                            <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                            
                            <Typography key="3" color="text.primary">Today Orders</Typography>
                        </Breadcrumbs>
                    </Col>
                </Row>
                <p></p>
                <Tabs defaultActiveKey="Place Order" onSelect={(k) => setActiveTab(k)}>
                    <Tab eventKey="Pending Orders" title="Pending Orders">
                        {activeTab=="Pending Orders" ?
                            <>
                                <Row>
                                    <Col>
                                        <Card variant="outlined" className={occupantFeedbackStyles.card}>
                                            <CardContent>
                                                <h3>Pending Orders</h3>
                                            </CardContent>
                                        </Card>
                                    </Col>
                                </Row>
                                <TextField
                                    id="search"
                                    label="Search Product"
                                    variant="outlined"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={formStyle.searchField}
                                />
                                <Row>
                                    <Col>
                                        <Table striped bordered hover className={occupantFeedbackStyles.table}>
                                            <thead>
                                                    <tr style={{textAlign:'center'}}>
                                                        {/*<th>Order id</th>*/}
                                                        <th>Date & Time</th>
                                                        <th>Order Number</th>
                                                        <th>Product</th>
                                                        <th>Food Type</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Total</th>
                                                        <th>Status</th>
                                                        <th>Update Or Delete</th>
                                                        
                                                    </tr>
                                            </thead>
                                            <tbody>
                                            {isLoading ? (
                                                    <tr style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                                                        <td colSpan={3}><CircularProgress /></td>
                                                    </tr>
                                                ) : filteredOrders.length > 0 ? ( // Step 4: Display filtered orders
                                                filteredOrders.map((order, index) => (
                                                        <tr key={index}>
                                                            {/*<td>{order._id}</td>*/}
                                                            <td>{order.date}</td>
                                                            <td>{order.orderNo}</td>
                                                            <td>{order.product}</td>
                                                            <td>{order.foodType}</td>
                                                            <td>{order.quantity}</td>
                                                            <td>{order.price}</td>
                                                            <td>{order.total}</td>
                                                            <td>{order.status}</td>
                                                            {/* Render additional feedback data as needed */}
                                                            <td > 
                                                            
                                                                <Button  style={{ background: ' blue', color: 'black', marginRight: '10px' }}
                                                                onClick={() => navigate(`/occupant/order/orderList/updateOrder/${order._id}`)}>
                                                                    <BrowserUpdatedIcon /> Update
                                                                </Button>
                                                                <Button
                                                                style={{ background: 'red', color: 'black' }}
                                                                onClick={() => openDeleteModal(order)}
                                                                >
                                                                <DeleteIcon /> Delete
                                                                </Button>
                                                            </td> 
                                            
                                                        </tr>
                                                        
                                                    ))
                                                ) : (
                                                    <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                                                    <td colSpan={6}>
                                                      <h4>No matching orders found!</h4>
                                                    </td>
                                                  </tr>
                                                )}
                                            </tbody>
                                            {selectedOrder && (
                                                <DeleteOrder
                                                order={selectedOrder}
                                                onClose={closeDeleteModal}
                                                onDeleteSuccess={handleDeleteSuccess}
                                                />
                                            )}
                                        </Table>
                                    </Col>
                                </Row>
                            </>
                        : ''}
                    </Tab>
                </Tabs>
                    

                    
               
            </Container>
        </div>
    </>
        
    )
}
export default OrderList;