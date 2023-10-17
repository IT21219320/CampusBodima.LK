import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Tabs, Tab} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent,Link, Button, TextField ,CircularProgress} from '@mui/material';
import { NavigateNext, Search, GridViewRounded } from '@mui/icons-material';
import { DateRange } from 'react-date-range';
import occupantFeedbackStyles from '../styles/occupantFeedbackStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { sort } from 'lodash';
import { BrowserUpdated as BrowserUpdatedIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import DeleteOrder from "./DeleteOrder";
import OrderForm from "../components/orderForm";
import OrderHistory from "../components/orderHistory";
import orderStyles from '../styles/orderStyles.module.css';


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

    const getStatusValue = (status) => {
        switch (status) {
          case 'Pending':
            return 1;
          case 'Ready':
            return 2;
          case 'Completed':
            return 3;
          default:
            return 4;
        }
      };
      
      // Sort the filteredOrders array by status
    


    const navigate = useNavigate();

    const [getOrder, { isLoading }] = useGetOrderMutation();
    const userID = userInfo._id
    const loadOrderData = async () => {
      try {
        const res = await getOrder({ occupantId: userID }).unwrap();
         
        setOrder(res.order);
      } catch (error) {
       
        toast.error('Failed to fetch orders. Please try again later.');
      }
    };
    
    

    useEffect(() => {
        // Dispatch the action to fetch feedback data
        loadOrderData();
      }, []); // Empty dependency array to trigger the effect on component mount

      const filteredOrders = product
      .filter((order) => order.status === "Ready"||order.status ==="Pending") 
      .filter((order) => {
        return (
          order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.foodType.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      // Sort the filteredOrders array by status
    filteredOrders.sort((a, b) => getStatusValue(a.status) - getStatusValue(b.status));

    return(
        <>
        <Sidebar />
        
        <div className={dashboardStyles.mainDiv}>
            <Container className={dashboardStyles.container}>
                <Row>
                    <Col>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                            <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                            <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                            
                            <Typography key="3" color="text.primary">My Orders</Typography>
                        </Breadcrumbs>
                    </Col>
                </Row>
                <p></p>
                <Tabs defaultActiveKey="Place Order" onSelect={(k) => setActiveTab(k)}>
                    <Tab eventKey="Place Order" title="Place Order">
                        {activeTab=="Place Order" ?
                            <OrderForm />
                        : ''}
                    </Tab>
                    <Tab eventKey="My Orders" title="My Orders">
                        {activeTab=="My Orders" ?
                            <>
                                <Row>
                                    <Col>
                                        <div className={orderStyles.card}>
                                            <h3>My Orders</h3>
                                        </div>
                                    </Col>
                                </Row>
                                <Row><div className={orderStyles.search}><TextField
                                    id="search"
                                    label="Search"
                                    //variant="outlined"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={orderStyles.searchField}
                                />
                                </div>
                                </Row>
                                <Row>
                                    <Col>
                                        <table striped bordered hover className="table table-striped table-bordered">
                                        <thead >
                                                    <tr style={{textAlign:'center'}}>
                                                        {/*<th>Order id</th>*/}
                                                        <th>Date</th>
                                                        <th>Time</th>
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
                                                            <td>{new Date(order.date).toDateString()}</td>
                                                            <td align="center">{new Date(order.date).getHours()}:{new Date(order.date).getMinutes()}</td>
                                                            <td>{order.orderNo}</td>
                                                            <td>{order.product}</td>
                                                            <td>{order.foodType}</td>
                                                            <td>{order.quantity}</td>
                                                            <td>{order.price}</td>
                                                            <td>{order.total}</td>
                                                            <td>{order.status}</td>
                                                            {/* Render additional feedback data as needed */}
                                                            {order.status === "Pending" ? (
                                                                    <>
                                                                        <td align="center">
                                                                        <Button  style={{ background: ' lightgreen', color: 'white', marginRight: '10px' }}
                                                                        onClick={() => navigate(`/occupant/order/orderList/updateOrder/${order._id}`)}>
                                                                            <BrowserUpdatedIcon />
                                                                        </Button>
                                                                        <Button
                                                                            style={{ background: '#FF0000', color: 'black' }}
                                                                            onClick={() => openDeleteModal(order)}
                                                                        >
                                                                            <DeleteIcon /> 
                                                                        </Button>
                                                                        </td>
                                                                    </>
                                                                    ) : order.status === "Ready" ? (
                                                                    <>
                                                                        <td style={{color:'red',textAlign:"center"}}>Your Order Is Ready for Pickup!</td>
                                                                    </>
                                                                    ) : (
                                                                        <>
                                                                            <td style={{color:'darkgreen',textAlign:"center"}}>Order Completed</td>
                                                                        </>
                                                                        )  }
                                                            
                                            
                                                        </tr>
                                                        
                                                    ))
                                                ) : (
                                                    <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                                                    <td colSpan={5}>
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
                                        </table>
                                    </Col>
                                </Row>
                            </>
                        : ''}
                    </Tab>
                    <Tab eventKey="Order History" title="Order History">
                        {activeTab=="Order History" ?
                            <OrderHistory />
                        : ''}
                    </Tab>
                </Tabs>
                    

                    
               
            </Container>
        </div>
    </>
        
    )
}
export default OrderList;