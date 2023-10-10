import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetTodayOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table, Tabs, Tab} from 'react-bootstrap';
import { Button, TextField ,CircularProgress} from '@mui/material';
import { GetAppRounded} from '@mui/icons-material';

import orderStyles from '../styles/orderStyles.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import DeleteOrder from "../pages/DeleteOrder";
import formStyle from '../styles/formStyle.module.css';
import jsPDF from 'jspdf';
const OrderComplete = () =>{

    const theme = useTheme();

    const [product, setOrder] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('Place Order');
    const [searchQuery, setSearchQuery] = useState(''); 
    
    const generateReportData = () => {
        return product.map((order) => ({
            Date: new Date(order.date).toLocaleDateString(),
            Time: `${new Date(order.date).getHours()}:${new Date(order.date).getMinutes()}`,
            OrderNumber: order.orderNo,
            Product: order.product,
            FoodType: order.foodType,
            Quantity: order.quantity,
            Price: order.price,
            Total: order.total,
            Status: order.status,
        }));
    };
    
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
        
        loadOrderData();
      }, []); 

      const filteredOrders = product
        .filter((order) => order.status === "Completed") 
        .filter((order) => {
            return (
            order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.foodType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        const exportToPDF = () => {;//Report Generating
            
            const completedOrders = product.filter((order) => order.status === 'Completed');

            const doc = new jsPDF();
        
            const headers = [[ "Date","Time","Order Number","Product","Food Type","Qty","Price","Total"]];
        
            // Map the admin data to table rows
        
            const data = completedOrders.map((order) => [
                new Date(order.date).toLocaleDateString(),
                `${new Date(order.date).getHours()}:${new Date(order.date).getMinutes()}`,
                order.orderNo,
                order.product,
                order.foodType,
                order.quantity,
                order.price,
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
              startY: 50
            });
        
            
            
            
            doc.text("Order History List", 85, 40);
            doc.setFontSize(8);
            doc.text(`Report of Order List`, 20, 20)
            doc.text(`Date: ${new Date().toDateString()}`, 20, 24)
            doc.text(`Author: ${userInfo.firstName} ${userInfo.lastName}`, 20, 28)
            doc.save("OrderHistory.pdf");
        
        };
        
    return(
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
            </Col>
                <Col style={{textAlign:'right'}}>
                    <Button variant="contained" style={{marginRight:'10px', background:'#4c4c4cb5'}} onClick={exportToPDF}>Download Report<GetAppRounded /></Button>
                </Col>
                <p></p>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover className={orderStyles.table}>
                        <thead>
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
                                    <th>Delete</th>
                                    
                                </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                                <tr style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                                    <td colSpan={10}><CircularProgress /></td>
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
                                        <td align="center"> 
                                        
                                            
                                            <Button
                                            style={{ background: 'red', color: 'white' }}
                                            onClick={() => openDeleteModal(order)}
                                            >
                                            <DeleteIcon />
                                            </Button>
                                        </td> 
                        
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
        
    )
}
export default OrderComplete;