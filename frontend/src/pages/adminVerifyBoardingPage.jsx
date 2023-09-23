import { useState, useEffect } from "react";
import { Form, Container, Row, Col, Button, Tabs, Tab, } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Link, Card, CardContent } from "@mui/material";
import { NavigateNext, AddHomeWork } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import Sidebar from '../components/sideBar';
import AdminAllBoardings from '../components/adminAllBoardingsComponent';

import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

const AdminVerifyBoardingPage = () => {

    const [viewUserInfo, setViewUserInfo] = useState();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        setViewUserInfo(true);
    },[]);

    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Boardings</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col>
                            <Card variant="outlined" className={dashboardStyles.card}>
                                <CardContent style={{display: 'flex', alignContent:'center', flexDirection:'column', padding:'20px'}}>
                                    <h4 style={{marginBottom:0}}>Boardings</h4>
                                </CardContent>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Fade in={viewUserInfo} >
                        <Row className='mt-3'>
                            <Col className="mb-3 mt-4" xs={12} md={12}>
                                <Row>
                                    <Col>
                                        <Tabs defaultActiveKey="all boardings"  id="uncontrolled-tab-example" className="mb-3">
                                            <Tab eventKey="all boardings" title="All Boardings">
                                                <AdminAllBoardings />
                                            </Tab>
                                            <Tab eventKey="Pending Approval" title="Pending Approval">
                                                
                                            </Tab>
                                        </Tabs>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Fade>
                </Container>
            </div>
        </> 
    )
};

export default AdminVerifyBoardingPage;