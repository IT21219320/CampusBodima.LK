import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDeleteOrderMutation } from "../slices/orderApiSlice";
import { toast } from "react-toastify";

const DeleteOrder = ({ order, onClose, onDeleteSuccess }) => {
  const [show, setShow] = useState(true);

  const [deleteOrder, { isLoading }] = useDeleteOrderMutation();

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  const handleDelete = async () => {
    try {
      await deleteOrder({ orderId: order._id }).unwrap();
      console.log(_id)
      toast.success("Order deleted successfully.");
      onDeleteSuccess();
    } catch (error) {
      toast.error("Failed to delete order. Please try again later.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Order</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this order?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteOrder;
