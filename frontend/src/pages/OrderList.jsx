import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    
    axios.get("/api/orders")
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);

  return (
    <>
      <h1>Order List</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Order No</th>
            <th>Status</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.product}</td>
              <td>{order.orderNo}</td>
              <td>{order.status}</td>
              <td>{new Date(order.date).toLocaleDateString()}</td>
              <td>{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default OrderList;
