import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Tabs, Tab, Link } from "@mui/material";
import { Form, Container, Row, Col, Image } from 'react-bootstrap';
import { NavigateNext, AddHomeWorkRounded } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useGoogleLoginMutation } from '../slices/usersApiSlice';
import { setUserInfo, destroyResetSession } from "../slices/authSlice";
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerBoardingStyles from '../styles/ownerBoardingStyles.module.css';

const OwnerBoardingPage = () => {
    const [viewUserInfo, setViewUserInfo] = useState();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const navigate = useNavigate();
    const dispatch = useDispatch();

    //const [login, { isLoading }] = useLoginMutation();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        setViewUserInfo(true);
    });

    /*const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ userType, email, password }).unwrap();
            dispatch(setUserInfo({...res}));    
            console.log(res)        
            toast.success('Login Successful');
            navigate('/');
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }*/

    return (
        <>
            <Sidebar />
            <div className={ownerBoardingStyles.mainDiv}>
                <Container className={ownerBoardingStyles.boardingContainer}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="#">User</Link>,
                                <Typography key="3" color="text.primary">Boardings</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                    <Fade in={viewUserInfo} >
                        <Row className='mt-3'>
                            <Col className="mb-3" xs={12} md={12}>
                                {/*<Row>
                                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="Boarding Navigations">
                                        <Tab icon={<AddHomeWorkRounded />} iconPosition="start" label="Add Boarding" />
                                        <Tab icon={<AddHomeWorkRounded />} iconPosition="start" label="Add Boarding" />
                                        <Tab icon={<AddHomeWorkRounded />} iconPosition="start" label="Add Boarding" />
                                    </Tabs>
                                </Row>*/}
                                <Row>
                                    <Col>
                                        <Card>
                                            <CardContent className={ownerBoardingStyles.cardContent}>
                                                
                                            </CardContent>
                                        </Card>
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