import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Image, Button } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Tabs, Tab, Link, Pagination, CircularProgress, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext, AddHomeWork } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingsMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { autoPlay } from 'react-swipeable-views-utils';
import SwipeableViews from 'react-swipeable-views';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

import defaultImage from '/images/defaultImage.png'

const AutoPlaySwipeableViews = SwipeableViews;

const OwnerBoardingPage = () => {
    const theme = useTheme();

    const [activeImage, setActiveImage] = useState(0);
    const [viewUserInfo, setViewUserInfo] = useState();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [boardings, setBoardings] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getOwnerBoardings, { isLoading }] = useGetOwnerBoardingsMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async (pageNo) => {
        try {
            const data = userInfo._id+'/'+pageNo;
            const res = await getOwnerBoardings( data ).unwrap();
            setBoardings(res.boardings);  
            setTotalPages(res.totalPages);  
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }

    useEffect(() => {
        setViewUserInfo(true);
        loadData(page);     
    },[]);

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);    
        console.log(boardings);   
    };

    const handleImageChange = (step) => {
      setActiveImage(step);
    };

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
                    
                    <Fade in={viewUserInfo} >
                        <Row className='mt-3'>
                            <Col className="mb-3" xs={12} md={12}>
                                <Row>
                                    <Col>
                                        <Row style={{textAlign:'right'}}>
                                            <Col><Link to=''><Button className="mt-4" style={{background: '#685DD8'}}><AddHomeWork /> Add New Boarding</Button></Link></Col>
                                        </Row>
                                        <Row style={{minHeight:'calc(100vh - 240px)'}}>
                                            <Col>
                                                {isLoading ? <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                                                    boardings.length > 0 ? 
                                                        boardings.map((boarding, index) => (
                                                            <Card key={index} className={`${ownerStyles.card} mt-4`}>
                                                                <CardContent className={ownerStyles.cardContent}>
                                                                    <Row style={{height:'100%', width:'100%'}}>
                                                                        <Col style={{height:'100%'}} xs={4}>
                                                                        {/*<AutoPlaySwipeableViews
                                                                            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                                                            index={activeImage}
                                                                            onChangeIndex={handleImageChange}
                                                                            enableMouseEvents
                                                                        >
                                                                            {boarding.boardingImages.map((image, index) => (
                                                                                <div key={index}>
                                                                                {Math.abs(activeImage - index) <= 2 ? (
                                                                                    <Box
                                                                                    component="img"
                                                                                    sx={{
                                                                                        height: 255,
                                                                                        display: 'block',
                                                                                        maxWidth: 400,
                                                                                        overflow: 'hidden',
                                                                                        width: '100%',
                                                                                    }}
                                                                                    src={image}
                                                                                    />
                                                                                ) : null}
                                                                                </div>
                                                                            ))}
                                                                        </AutoPlaySwipeableViews>*/}
                                                                            <Image src={boarding.boardingImages[0] ? boarding.boardingImages[0] : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images}height='100%' width='100%'/>
                                                                        </Col>
                                                                        <Col xs={6}>
                                                                        {console.log(boarding)}
                                                                            <h2>{boarding.boardingName}</h2>
                                                                            <br />
                                                                            <p>Rooms: {boarding.noOfRooms} &nbsp; &nbsp; Baths: {parseInt(boarding.noOfCommonBaths)+parseInt(boarding.noOfAttachBaths)}</p>
                                                                            <p>{boarding.city}, {boarding.boardingType}</p>
                                                                            {boarding.boardingType == 'Annex' ? <>
                                                                                <p>Rs {boarding.rent} /Month</p>
                                                                            </> : <>
                                                                                
                                                                            </>}
                                                                        </Col>
                                                                        <Col xs={2}>
                                                                        </Col>
                                                                    </Row>
                                                                </CardContent>
                                                            </Card>
                                                        ))
                                                    :
                                                        <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>
                                                            <h2>You don't have any registered boardings!</h2>
                                                        </div>
                                                }
                                            </Col>
                                        </Row>
                                        {totalPages <= 1 ? <></> : 
                                        <Row>
                                            <Col className="mt-3"><Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" disabled={isLoading} style={{float:'right'}}/></Col>
                                        </Row>
                                        }
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