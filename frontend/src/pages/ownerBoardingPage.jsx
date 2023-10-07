import { useState, useEffect } from "react";
import { Form, Container, Row, Col, Button, Tabs, Tab, } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Link } from "@mui/material";
import { NavigateNext, AddHomeWork } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import Sidebar from '../components/sideBar';
import ApprovedOwnerBoardings from '../components/OwnerBoardingsForStatusComponent'

import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

const OwnerBoardingPage = () => {

    const [viewUserInfo, setViewUserInfo] = useState();
    const [activeTab, setActiveTab] = useState('My Boardings');

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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Boardings</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                    <Fade in={viewUserInfo} >
                        <Row className='mt-3'>
                            <Col className="mb-3" xs={12} md={12}>
                                <Row>
                                    <Col>
                                        <Row style={{textAlign:'right'}}>
                                            <Col><Link href='/owner/boardings/add'><Button className={`${ownerStyles.addBtn} mt-4`}><AddHomeWork /> Add New Boarding</Button></Link></Col>
                                        </Row>
                                        <Tabs defaultActiveKey="My Boardings"  id="uncontrolled-tab-example" className="mb-3" onSelect={(k) => setActiveTab(k)}>
                                            <Tab eventKey="My Boardings" title="My Boardings">
                                                {activeTab=="My Boardings" ? <ApprovedOwnerBoardings>Approved</ApprovedOwnerBoardings> : ''}
                                            </Tab>
                                            <Tab eventKey="Incomplete" title="Incomplete">
                                                {activeTab=="Incomplete" ? <ApprovedOwnerBoardings>PendingRoom</ApprovedOwnerBoardings> : ''}
                                            </Tab>
                                            <Tab eventKey="Pending Approval" title="Pending Approval">
                                                {activeTab=="Pending Approval" ? <ApprovedOwnerBoardings>PendingApproval</ApprovedOwnerBoardings> : ''}
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

export default OwnerBoardingPage;