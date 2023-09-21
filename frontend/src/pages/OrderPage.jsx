import React from "react";
import OrderDetail from "../components/OrderDetail.jsx";

const OrderPage = () => {
  const orderId = "1"; 
  return (
    <div>
      <OrderDetail orderId={orderId} />
    </div>
  );
};

export default OrderPage;
