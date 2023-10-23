import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ViewMenu from "../components/menuView";
import { Breadcrumbs, Typography, Link} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

const MenuForm = () => {
  

  const { userInfo } = useSelector((state) => state.auth);
  
  
  
  return (
    <>
    <Sidebar />
    <div className={dashboardStyles.mainDiv}>
    <Container className={dashboardStyles.container}>
    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType === 'owner' ? 'Owner' : (userInfo.userType === 'occupant' ? 'Occupant' : userInfo.userType === 'admin' ? 'Admin' : userInfo.userType === 'kitchen' ? 'Kitchen' : '')}</Link>,
                                <Typography key="3" color="text.primary">Menu</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Row><ViewMenu /></Row>
            </Container>
        </div>           

    </>
  );
};

export default MenuForm;
