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
      await deleteOrder({ _id: order._id }).unwrap();
      toast.success("Order Deleted Successfully..");
      onDeleteSuccess();
    } catch (err) {
      
      toast.error(err.data?.message || err.error || err);
      onDeleteSuccess();
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
