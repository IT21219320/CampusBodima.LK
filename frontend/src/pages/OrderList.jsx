import React, { useEffect, useState } from 'react';

   const OrderList = () => {
     const [orders, setOrders] = useState([]);

     useEffect(() => {
       // Fetch all orders from your backend API
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

     return (
       <div>
         <h2>Orders</h2>
         <ul>
           {orders.map((order) => (
             <li key={order._id}>
               Product: {order.product}, Quantity: {order.quantity}, Customer: {order.customer}
             </li>
           ))}
         </ul>
       </div>
     );
   };

   export default OrderList;