import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDeleteMenuesMutation } from "../slices/menuesApiSlice";
import { toast } from "react-toastify";

const DeleteMenu = ({ menu, onClose, onDeleteSuccess }) => {
  const [show, setShow] = useState(true);

  const [deleteMenu, { isLoading }] = useDeleteMenuesMutation();

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  const handleDelete = async () => {
    try {
        await deleteMenu({ _id: menu._id }).unwrap();
        console.log(_id)
        toast.error("Failed to delete menu. Please try again later.");
       
    } catch (error) {
        toast.success("Menu deleted successfully.");
        onDeleteSuccess();
      
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Menu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this menu?</p>
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

export default DeleteMenu;
