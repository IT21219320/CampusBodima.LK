import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Tabs, Tab, Link, Pagination, CircularProgress } from "@mui/material";
import { Form, Container, Row, Col, Image, Button } from 'react-bootstrap';
import { NavigateNext } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingsMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerBoardingStyles from '../styles/ownerBoardingStyles.module.css';

const OwnerBoardingPage = () => {
    const [viewUserInfo, setViewUserInfo] = useState();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [boardings, setBoardings] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getOwnerBoardings, { isLoading }] = useGetOwnerBoardingsMutation();

var isLoading2 = true;

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

    return (
        <>
            <Sidebar />
            <div className={ownerBoardingStyles.mainDiv}>
                <Container className={ownerBoardingStyles.boardingContainer}>
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
                                        <Card>
                                            <CardContent className={ownerBoardingStyles.cardContent}>
                                                <Row>
                                                    <Col><Link to=''><Button></Button></Link></Col>
                                                </Row>
                                                <Row>
                                                    {isLoading2 ? <CircularProgress /> : boardings.map((boarding, index) => (
                                                        <div key={index}>
                                                        {/* Render content for each boarding */}
                                                        <p>{boarding.boardingName}</p>
                                                        {/* Add other content related to each boarding */}
                                                        </div>
                                                    ))}
                                                </Row>
                                                <Row>
                                                    <Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" disabled={isLoading}/>
                                                </Row>
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