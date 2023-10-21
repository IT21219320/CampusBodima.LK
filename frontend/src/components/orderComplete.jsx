import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetTodayOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import { Row, Col } from 'react-bootstrap';
import { MenuItem, Breadcrumbs, FormControl, InputLabel, Select, Typography, Link, Button, TextField, CircularProgress } from '@mui/material';
import { GetAppRounded } from '@mui/icons-material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import orderStyles from '../styles/orderStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import DeleteOrder from "../pages/DeleteOrder";
import formStyle from '../styles/formStyle.module.css';
import jsPDF from 'jspdf';
const OrderComplete = () => {



    const [product, setOrder] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
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





    const [getTodayOrder, { isLoading }] = useGetTodayOrderMutation();
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

        loadOrderData();
    }, [boardingId]);

    const filteredOrders = product.filter((order) => {
        console.log(order);
        return (
            order.status === "Completed" &&
            order?.items.some((item) =>
                item.product.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    });

    const exportToPDF = () => {
        ;//Report Generating

        const completedOrders = product.filter((order) => order.status === 'Completed');

        const doc = new jsPDF();
        const companyDetails = {
            name: "CampusBodima",
            address: "138/K, Ihala Yagoda, Gampaha",
            phone: "071-588-6675",
            email: "info.campusbodima@gmail.com",
            website: "www.campusbodima.com"
        };
        doc.addImage("/logo2.png", "PNG", 10, 10, 50, 30);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(`${companyDetails.name}`, 200, 20, { align: "right", style: "bold" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`${companyDetails.address}`, 200, 25, { align: "right" });
        doc.text(`${companyDetails.phone}`, 200, 29, { align: "right" });
        doc.text(`${companyDetails.email}`, 200, 33, { align: "right" });
        doc.text(`${companyDetails.website}`, 200, 37, { align: "right" });
        doc.setLineWidth(0.5);
        doc.line(10, 45, 200, 45);




        doc.setFontSize(12);
        doc.text("Completed Orders", 85, 65);
        const headers = [["Date", "Time", "Order Number", "Product", "Qty", "Price", "Total"]];



        const data = completedOrders.map((order) => [
            new Date(order.date).toLocaleDateString(),
            `${new Date(order.date).getHours()}:${new Date(order.date).getMinutes()}`,
            order.orderNo,
            order.items.map((item) => item.product),
            order.items.map((item) => item.quantity),
            order.items.map((item) => item.price),
            order.total,
            order.status,
        ]);

        const styles = {
            halign: "center",
            valign: "middle",
            fontSize: 10,
        };

        doc.autoTable({
            head: headers,
            body: data,
            styles,
            margin: { top: 70 },
            startY: 70
        });

        doc.setFontSize(8);
        doc.text(`Report of Order List`, 20, 50)
        doc.text(`Date: ${new Date().toDateString()}`, 20, 54)
        doc.text(`Author: ${userInfo.firstName} ${userInfo.lastName}`, 20, 58)
        doc.save("OrderHistory.pdf");

    };

    return (
        <>
            <Row>
                <Col>

                    <div className={orderStyles.card}>
                        <h3>Completed Orders</h3>
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
                    />
                </Col><Col></Col>
                <Col style={{ textAlign: 'right' }}>
                    <Button variant="contained" style={{ marginRight: '10px', background: '#4c4c4cb5' }} onClick={exportToPDF}>Download Report<GetAppRounded /></Button>
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
                                    <TableCell align="center"><b>Total</b></TableCell>
                                    <TableCell align="center"><b>Status</b></TableCell>
                                    <TableCell align="center"><b>Delete</b></TableCell>

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
                                                    style={{ background: 'red', color: 'white' }}
                                                    onClick={() => openDeleteModal(order)}
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            </TableCell>

                                        </TableRow>

                                    ))
                                ) : (
                                    <TableRow style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                                        <TableCell colSpan={10}>
                                            <h4>No matching orders found!</h4>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </tbody>
                        </Table>
                    </TableContainer>
                    {selectedOrder && (
                        <DeleteOrder
                            order={selectedOrder}
                            onClose={closeDeleteModal}
                            onDeleteSuccess={handleDeleteSuccess}
                        />
                    )}

                </Col>
            </Row>
        </>

    )
}
export default OrderComplete;