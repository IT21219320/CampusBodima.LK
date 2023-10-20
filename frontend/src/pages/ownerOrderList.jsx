import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetTodayOrderMutation, useUpdateStatusMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table, Tabs, Tab } from 'react-bootstrap';
import { MenuItem, Breadcrumbs,FormControl,InputLabel, Select, Typography, Link, Button, TextField, CircularProgress } from '@mui/material';
import { NavigateNext, Search, GridViewRounded } from '@mui/icons-material';
import orderStyles from '../styles/orderStyles.module.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import DeleteOrder from "./DeleteOrder";
import formStyle from '../styles/formStyle.module.css';
import OrderReady from "../components/orderReady";
import OrderComplete from "../components/orderComplete";

const OrderList = () => {
    const [product, setOrder] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [boardingId, setBoardingId] = useState('');
    const [activeTab, setActiveTab] = useState('Pending Orders');
    const [boardingNames, setBoardingNames] = useState('');

    const openDeleteModal = (order) => {
        setSelectedOrder(order);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedOrder(null);
        setShowDeleteModal(false);
    };

    const handleDeleteSuccess = () => {
        loadOrderData();
        closeDeleteModal();
    };

    const { userInfo } = useSelector((state) => state.auth);

    const status = async (id) => {
        try {
            const newStatus = "Ready";
            const ress = await updateStatus({
                status: newStatus,
                _id: id,
            }).unwrap();
            if (ress) {
                toast.success('Order Moved to Ready Status');
                loadOrderData();
            }
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    };

    const navigate = useNavigate();

    const [getTodayOrder, { isLoading }] = useGetTodayOrderMutation();
    const [updateStatus] = useUpdateStatusMutation();
    const userID = userInfo._id;

    const loadOrderData = async () => {
        try {
            const res = await getTodayOrder({ occupantId: userID,boardingId }).unwrap();
            setOrder(res.order);
            setBoardingNames(res.boarding)
            if(boardingId == ''){
                setBoardingId(res.boarding[0]._id)
              }
        } catch (error) {
            toast.error('Failed to fetch orders. Please try again later.');
        }
    };

    useEffect(() => {
        loadOrderData();
    }, [boardingId]); // Updated dependency array to trigger the effect when the selected boarding changes

    const filteredOrders = product
        .filter((order) => order.status === "Pending")
        .filter((order) => {
            return (
                order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.foodType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType === 'owner' ? 'Owner' : (userInfo.userType === 'occupant' ? 'Occupant' : userInfo.userType === 'admin' ? 'Admin' : userInfo.userType === 'kitchen' ? 'Kitchen' : '')}</Link>,
                                <Typography key="3" color="text.primary">Orders</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <p></p>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                    >
                        <Tab eventKey="Pending Orders" title="Pending Orders">
                            <Row>
                                <Col>
                                    <div className={orderStyles.card}>
                                        <h3>Pending Orders</h3>
                                    </div>
                                </Col>
                            </Row>
                            <TextField
                                id="search"
                                label="Search Product"
                                variant="outlined"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={formStyle.searchField}
                            /><p></p>
                            <Row>
                                <Col>
                                    {/* Add a select input for boarding selection */}
                                    <FormControl fullWidth>
                                        <InputLabel id="boarding-label">Select Boarding</InputLabel>
                                        <Select
                                            labelId="boarding-label"
                                            id="boarding-select"
                                            value={boardingId}
                                            onChange={(e) => setBoardingId(e.target.value)}
                                        >
                                            {Array.isArray(boardingNames) && boardingNames.map((boarding) => (
                  <MenuItem key={boarding._id} value={boarding._id}>
                    {boarding.boardingName}
                  </MenuItem>
                ))}
                                        </Select>
                                    </FormControl>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Table striped bordered hover className={orderStyles.table}>
                                        <thead>
                                            <tr style={{ textAlign: 'center' }}>
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
                                                <th>Change Status</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                                                    <td colSpan={10}><CircularProgress /></td>
                                                </tr>
                                            ) : filteredOrders.length > 0 ? (
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
                                                        <td align="center">
                                                            <Button
                                                                variant="contained"
                                                                onClick={() => status(order._id)}>Ready</Button></td>

                                                    </tr>
                                                ))
                                            ) : (
                                                <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                                                    <td colSpan={10}>
                                                        <h4>No matching orders found!</h4>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="Ready Orders" title="Ready Orders">
                            {activeTab === "Ready Orders" ? <OrderReady>Ready</OrderReady> : ''}
                        </Tab>
                        <Tab eventKey="Completed Orders" title="Completed Orders">
                            {activeTab === "Completed Orders" ? <OrderComplete>Ready</OrderComplete> : ''}
                        </Tab>
                    </Tabs>
                </Container>
            </div>
        </>
    );
};

export default OrderList;
