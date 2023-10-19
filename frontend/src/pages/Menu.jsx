import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ViewMenu from "../components/menuView";

const MenuForm = () => {
  

  
  
  
  
  return (
    <>
    <Sidebar />
    <div className={dashboardStyles.mainDiv}>
    <Container className={dashboardStyles.container}>
        
    <ViewMenu />
            </Container>
        </div>           

    </>
  );
};

export default MenuForm;
