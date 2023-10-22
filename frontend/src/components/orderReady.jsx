import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetTodayOrderMutation, useUpdateStatusMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import {  Row, Col,} from 'react-bootstrap';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { MenuItem, Breadcrumbs, FormControl, InputLabel, Select, Typography, Link, Button, TextField, CircularProgress } from '@mui/material';
import orderStyles from '../styles/orderStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import DeleteOrder from "../pages/DeleteOrder";
import formStyle from '../styles/formStyle.module.css';

const OrderReady = () => {

    const theme = useTheme();

    const [product, setOrder] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('Place Order');
    const [searchQuery, setSearchQuery] = useState('');
    const [boardingId, setBoardingId] = useState('All');
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
        // Reload the order data or update the UI as needed
        loadOrderData();
        closeDeleteModal();
    };
    const { userInfo } = useSelector((state) => state.auth);

    const status = async (id) => {
        try {
            const newStatus = "Completed"
            const ress = await updateStatus({
                status: newStatus,
                _id: id,
            }).unwrap();
            if (ress) {
                console.log("value", ress);
                toast.success('Order Moved to Ready Status');
                loadOrderData()
            }
        } catch (err) {
            toast.error(err.data?.message || err.error)
        }
    }


    const navigate = useNavigate();

    const [getTodayOrder, { isLoading }] = useGetTodayOrderMutation();
    const [updateStatus] = useUpdateStatusMutation();
    const userID = userInfo._id
    const loadOrderData = async () => {
        try {
            const res = await getTodayOrder({ ownerId: userID, boardingId }).unwrap();
            setOrder(res.order);
            setBoardingNames(res.boarding)
            if (boardingId == '') {
                setBoardingId(res.boarding[0]._id)
            }
        } catch (error) {
            toast.error('Failed to fetch orders. Please try again later.');
        }
    };

    useEffect(() => {
        // Dispatch the action to fetch feedback data
        loadOrderData();
    }, [boardingId]); // Empty dependency array to trigger the effect on component mount

    const filteredOrders = product.filter((order) => {
        console.log(order);
        return (
          order.status === "Ready" &&
          order?.items.some((item) =>
            item.product.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      });


    return (
        <>
            <Row>
                <Col>
                    <div className={orderStyles.card}>
                        <h3>Prepared Orders</h3>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <TextField
                        id="search"
                        label="Search Product"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={formStyle.searchField}
                    /><p></p>
                </Col>
                <Col>
                    <div style={{ float: 'right', minWidth: '220px' }}>
                        <FormControl fullWidth>
                            <InputLabel id="boarding-label">Select Boarding</InputLabel>
                            <Select
                                labelId="boarding-label"
                                id="boarding-select"
                                value={boardingId}
                                label="Select Boarding"
                                onChange={(e) => setBoardingId(e.target.value)}
                            >
                                 <MenuItem value={'All'}>
                                                All
                                            </MenuItem>
                                {Array.isArray(boardingNames) && boardingNames.map((boarding) => (
                                    <MenuItem key={boarding._id} value={boarding._id}>
                                        {boarding.boardingName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                <TableContainer compenent={Paper}>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow style={{ textAlign: 'center' }}>

                                    {/*<th>Order id</th>*/}
                                    <TableCell align="center"><b>Date</b></TableCell>
                                    <TableCell align="center"><b>Time</b></TableCell>
                                    <TableCell align="center"><b>Order Number</b></TableCell>
                                    <TableCell align="center"><b>Product</b></TableCell>
                                    <TableCell align="center"><b>Quantity</b></TableCell>
                                    <TableCell align="center"><b>Price</b></TableCell>
                                    <TableCell align="center"><b>Sub Total</b></TableCell>
                                    <TableCell align="center"><b>Total</b></TableCell>
                                    <TableCell align="center"><b>Status</b></TableCell>
                                    <TableCell align="center"><b>Update Status</b></TableCell>

                                </TableRow>
                            </TableHead>

                            <tbody>
                                {isLoading ? (
                                    <TableRow style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                                        <TableCell colSpan={9}><CircularProgress /></TableCell>
                                    </TableRow>
                                ) : filteredOrders.length > 0 ? ( // Step 4: Display filtered orders
                                    filteredOrders.map((order, index) => (
                                        <TableRow key={index}>
                                            {/*<td>{order._id}</td>*/}
                                            <TableCell align="center">{new Date(order.date).toDateString()}</TableCell>
                                            <TableCell align="center">{new Date(order.date).getHours()}:{new Date(order.date).getMinutes()}</TableCell>
                                            <TableCell align="center">{order.orderNo}</TableCell>
                                            <TableCell><td align="center">
                                            {order.items.map((item,index) => (
                                                <TableRow>
                                                    <TableCell align="center">{item.product}</TableCell>
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
                                            <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                onClick={() => status(order._id)}
                                                style={{ background: '#0FFF50', color: 'white', marginRight: '10px' }}>
                                                Complete</Button></TableCell>

                                    </TableRow>

                                ))
                            ) : (
                                <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                                    <td colSpan={10}>
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
                    
                    </TableContainer>
                </Col>
            </Row>
        </>

    )
}
export default OrderReady;