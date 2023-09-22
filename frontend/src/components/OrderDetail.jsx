import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderDetail = ({ orderId }) => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get(`/api/orders/${orderId}`)
      .then((response) => {
        setOrder(response.data);
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
      });
  }, [orderId]);

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Order Details</h1>
      <p>Product: {order.product}</p>
      <p>Food Type: {order.foodType}</p>
      <p>Quantity: {order.quantity}</p>
      <p>Price: {order.price}</p>
      <p>Order No: {order.orderNo}</p>
      <p>Status: {order.status ? "Completed" : "Pending"}</p>
      <p>Date: {new Date(order.date).toLocaleDateString()}</p>
      <p>Total: {order.total}</p>
    </div>
  );
};

export default OrderDetail;
