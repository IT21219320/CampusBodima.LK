import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import formStyle from '../styles/formStyle.module.css';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, Button, TextField, CircularProgress } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { sort } from 'lodash';
import { BrowserUpdated as BrowserUpdatedIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import DeleteOrder from "../pages/DeleteOrder";
import orderStyles from '../styles/orderStyles.module.css';


const MyOrders = () => {

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

    const filteredOrders = product.filter((order) => {
        console.log(order);
        return (
            (order.status === "Pending" || order.status === "Ready" || order.status === "Preparing") &&
            order?.items.some((item) =>
                item.product.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    });
    
    const sortedOrders = filteredOrders.slice().sort((a, b) => {
        const statusOrder = ["Pending", "Ready", "Preparing"];
    
        // Compare the statuses based on the defined order
        const statusA = statusOrder.indexOf(a.status);
        const statusB = statusOrder.indexOf(b.status);
    
        return statusB - statusA; // Sorting in descending order
    });
    
    
    return (
        
        <>
            <Row>
                <Col>
                    <div className={orderStyles.card}>
                        <h3>My Orders</h3>
                    </div>
                </Col>
            </Row>
            <Row><Col>
                <TextField
                id="search"
                label="Search"
                //variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={formStyle.searchField}
            /></Col>
            
            </Row>
            <br/>
            <Row>
                <Col>
                <TableContainer compenent={Paper}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                                <TableCell align="center"><b>Date</b></TableCell>
                                <TableCell align="center"><b>Time</b></TableCell>
                                <TableCell align="center"><b>Order Number</b></TableCell>
                                <TableCell align="center"><b>Product</b></TableCell>
                                <TableCell align="center"><b>Quantity</b></TableCell>
                                <TableCell align="center"><b>Unit Price</b></TableCell>
                                <TableCell align="center"><b>Sub Total</b></TableCell>
                                <TableCell align="center"><b>Total</b></TableCell>
                                <TableCell align="center"><b>Status</b></TableCell>
                                <TableCell align="center"><b>Action</b></TableCell>

                                </TableRow>
                </TableHead>
                        <tbody>
                            {isLoading ? (
                                <TableRow style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                                    <TableCell align="center" colSpan={10}><CircularProgress /></TableCell>
                                </TableRow>
                            ) : sortedOrders.length > 0 ? ( // Step 4: Display filtered orders
                            sortedOrders.map((order, index) => (
                                    <TableRow key={index}>
                                        {/*<TableCell align="center">{order._id}</TableCell>*/}
                                        <TableCell align="center">{new Date(order.date).toDateString()}</TableCell>
                                        <TableCell align="center">{new Date(order.date).getHours()}:{new Date(order.date).getMinutes()}</TableCell>
                                        <TableCell align="center">{order.orderNo}</TableCell>
                                        <TableCell><td>
                                            {order.items.map((item,index) => (
                                                <TableRow>
                                                    <TableCell>{item.product}</TableCell>
                                                </TableRow>
                                            ))}
                                        </td></TableCell><TableCell>
                                        <td align="center">
                                            {order.items.map((item,index) => (
                                                <TableRow>
                                                    <TableCell align="center">{item.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </td></TableCell><TableCell>
                                        <td align="center">
                                            {order.items.map((item,index) => (
                                                <TableRow>
                                                    <TableCell align="center">{item.price}</TableCell>
                                                </TableRow>
                                            ))}
                                        </td></TableCell>
                                        <TableCell>
                                        <td align="center">
                                            {order.items.map((item,index) => (
                                                <TableRow>
                                                    <TableCell align="center">{item.total}</TableCell>
                                                </TableRow>
                                            ))}
                                        </td></TableCell>
                                        <TableCell align="center">{order.total}</TableCell>
                                        <TableCell align="center">{order.status}</TableCell>
                                        {/* Render additional feedback data as needed */}
                                        {order.status === "Pending" ? (
                                            <TableCell align="center">
                                                <Button
                                                variant="text"
                                                    style={{ backgroundColor:"#FF4444", color: 'white' }}
                                                    onClick={() => openDeleteModal(order)}
                                                >
                                                    Delete Order
                                                </Button>
                                            </TableCell>
                                            ) : order.status === "Preparing" ? (
                                            <TableCell style={{ color: '#FFA500', textAlign: "center" }}>
                                                <b>Your Order Is Being prepared.<br />Please Wait...</b>
                                            </TableCell>
                                            ) : (
                                            <TableCell style={{ color: '#00CED1', textAlign: "center" }}>
                                                <b>Your Order Is Ready for Pickup!</b>
                                            </TableCell>
                                            )}

                                    </TableRow>

                                ))
                            ) : (
                                <TableRow style={{ height: '100%', width: '100%', textAlign: 'center', color: '#DE5615' }}>
                                    <TableCell colSpan={10} align="center">
                                        <h4><b>No matching orders found!</b></h4>
                                    </TableCell>
                                </TableRow>
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
                    </TableContainer>
                </Col>
            </Row>
        </>

    )
}
export default MyOrders;