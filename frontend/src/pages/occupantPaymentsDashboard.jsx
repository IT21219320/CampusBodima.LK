import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import { Breadcrumbs, Typography, Button, Link, CircularProgress, Box, Collapse, IconButton, Alert, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table } from 'react-bootstrap';
import 'react-credit-cards-2/dist/es/styles-compiled.css';


const OccupantPaymentDash = () => {
    const { userInfo } = useSelector((state) => state.auth);

    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>

                <Container>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/owner/ingredient">Payments</Link>,
                                <Typography key="4" color="text.primary">View</Typography>
                            </Breadcrumbs>
                        </Col>

                    </Row>
                    <Row>
                    <div  className="card">
                        <h3>Card Holder: dewmina</h3>
                        <p>Card Number: 973498632094623</p>
                        <p>Expiration Date: 12/23</p>
                    </div>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default OccupantPaymentDash