import React, { useEffect, useState } from 'react';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [errorFetching, setErrorFetching] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/all');
        if (!response.ok) {
          throw new Error('Error fetching orders');
        }
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setErrorFetching(true);
      }
    };

    fetchOrders();
  }, []);

  if (!errorFetching) {
    return <p>Error fetching orders.</p>;
  }

  if (orders.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', color: 'blue' }}>My Orders</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Order Number</th>
            <th style={tableHeaderStyle}>Order Details</th>
            <th style={tableHeaderStyle}>Order Total</th>
            <th style={tableHeaderStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders((order) => (
            <tr key={order._id}>
              <td style={tableCellStyle}>{order.date}</td>
              <td style={tableCellStyle}>{order.orderNo}</td>
              <td style={tableDetailsStyle}>
                {order.product} {order.quantity}
              </td>
              <td style={tableCellStyle}>{order.total}</td>
              <td style={tableCellStyle}>{order.status}</td>
            </tr>
          ))}
        </tbody>
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
