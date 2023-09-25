import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useGetOrderMutation, useUpdateOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";
import { Container, Button, TextField, CircularProgress } from '@mui/material';
import {  Row, Col} from 'react-bootstrap';

const UpdateOrder = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [updateFormData, setUpdateFormData] = useState({});

  const [getOrder, { isLoading: isGetOrderLoading }] = useGetOrderMutation();
  const [updateOrder, { isLoading: isUpdateLoading }] = useUpdateOrderMutation();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const res = await getOrder({ orderId });
        setOrderData(res.data); // Assuming the API response contains the order data
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch order. Please try again later.');
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleUpdate = async () => {
    try {
      await updateOrder({ orderId, ...updateFormData });
      toast.success('Order updated successfully.');
    } catch (error) {
      toast.error('Failed to update order. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      [name]: value,
    });
  };

  if (isLoading || isGetOrderLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2>Update Order</h2>
          <form>
            <TextField
              name="product"
              label="Product"
              variant="outlined"
              fullWidth
              margin="normal"
              value={updateFormData.product || orderData.product}
              onChange={handleInputChange}
            />
            {/* Add similar fields for other order properties */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={isUpdateLoading}
            >
              {isUpdateLoading ? <CircularProgress size={24} /> : "Update Order"}
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateOrder;
