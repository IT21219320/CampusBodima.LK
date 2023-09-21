import React from "react";
import OrderDetail from "./OrderDetail";

const OrderPage = () => {
  const orderId = "1"; 
  return (
    <div>
      <OrderDetail orderId={orderId} />
    </div>
  );
};

export default OrderPage;
