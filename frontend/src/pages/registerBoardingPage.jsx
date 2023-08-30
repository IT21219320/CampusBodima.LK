import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Image, Button } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Tabs, Tab, Link, Pagination, CircularProgress, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext, AddHomeWork } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingsMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';

const RegisterBoardingPage = () => {
    
    const [viewUserInfo, setViewUserInfo] = useState();

    const { userInfo } = useSelector((state) => state.auth);
    

    useEffect(() => {
        setViewUserInfo(true);
    },[]);

    return(
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/owner/boarding">Boarding</Link>,
                                <Typography key="4" color="text.primary">Add</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Fade in={viewUserInfo} >
                        <Row className='mt-3'id='viewUser'>
                            <Col className="mb-3" xs={12} md={4}></Col>
                        </Row>
                    </Fade>
                </Container>
            </div>
        </>
    );
}

export default RegisterBoardingPage;