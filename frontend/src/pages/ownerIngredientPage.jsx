import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Table, Button, Tabs, Tab } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, Pagination, CircularProgress, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext,} from '@mui/icons-material';
import KitchenIcon from '@mui/icons-material/Kitchen';
import DeleteIcon from '@mui/icons-material/Delete';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerIngredientsMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import { TableHead, TableRow } from '@mui/material'; 
import { autoPlay } from 'react-swipeable-views-utils';
 
//import SwipeableViews from 'react-swipeable-views';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ingredientStyles from '../styles/ingredientStyles.module.css';  

import AllIngredients from "../components/allIngredientsComponent";

import defaultImage from '/images/defaultImage.png'

//const AutoPlaySwipeableViews = SwipeableViews;

const OwnerIngredientPage = () => {

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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Ingredients</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                     
                        <Row className='mt-3'>
                            <Col className="mb-3" xs={12} md={12}>
                                <Row>
                                    <Col>
                                    <h1 style={{ fontSize: '50px', color: 'blue', }}>Inventory</h1>
                                        <Tabs defaultActiveKey="Ingredients"  id="uncontrolled-tab-example" className="mb-3">
                                            <Tab eventKey="Ingredients" title="Ingredients">
                                                <AllIngredients />
                                            </Tab>
                                            <Tab eventKey="Central Inventory" title="Central Inventory">
                                                <h1>Central Inventory</h1>
                                            </Tab>
                                            <Tab eventKey="Reduce Inventory" title="Reduce Inventory">
                                                <h1>Reduce Inventory</h1>
                                            </Tab>
                                        </Tabs>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                     
                </Container>
            </div>
        </> 
    )
};

export default OwnerIngredientPage;