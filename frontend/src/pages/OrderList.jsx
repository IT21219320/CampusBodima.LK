import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, InputLabel, Select, MenuItem, FormControl, TextField,} from '@mui/material';
import Sidebar from '../components/sideBar';

   const OrderList = () => {
     const [orders, setOrders] = useState([]);

     useEffect(() => {
       const fetchOrders = async () => {
         try {
           const response = await fetch('/api/orders/all');
           const data = await response.json();
           setOrders(data);
         } catch (error) {
           console.error('Error fetching orders:', error);
         }
       };

       fetchOrders();
     }, []);
     const foods = [
      {
        _id: 1,
        date: '2023.08.25',
        orderno:1,
        product: 'Rice & curry',
        foodType: 'Chicken',
        quantity: 2,
        price: 350,
        total:700,
        status:'ready',
      },
      {
        _id: 2,
        date: '2023.08.13',
        orderno:2,
        product: 'Fried Rice',
        foodType: 'Chicken',
        quantity: 1,
        price: 450,
        total:450,
        status:'pending...',
      },
    ];
  

     return (
       <div>
         <h2 style={{ fontSize: '24px', color: 'blue'}}>My Orders</h2>
         
         <ul>
          <p></p>
          
         </ul>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
         <tr>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Order Number</th>
            <th style={tableHeaderStyle}>Order Details</th>
            <th style={tableHeaderStyle}>Order Total</th>
            <th style={tableHeaderStyle}>Status</th>
          </tr>
        {foods.map((food) => (
          <tr>
            <td style={tableCellStyle}key={food._id}>
             {food.date}
          </td>
          <td style={tableCellStyle}key={food._id}>
          {food.orderno}
          </td>
          <td style={tableDetailsStyle}key={food._id}>
          {food.product}{'\t'}{food.foodType}{'\t'}{food.quantity}
          </td>
          <td style={tableCellStyle}key={food._id}>
             {food.total}
          </td>
          <td style={tableCellStyle}key={food._id}>
             {food.status}
          </td>
          </tr>
          
        ))}
        
        </table>
       </div>
     );
   };
   const tableHeaderStyle = {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  };
  const tableCellStyle = {
  
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'center',
  };
  const tableDetailsStyle = {
  
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'justify',
  };

   export default OrderList;