import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Tabs, Tab, Link, Pagination, CircularProgress, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext,} from '@mui/icons-material';
import KitchenIcon from '@mui/icons-material/Kitchen';
import DeleteIcon from '@mui/icons-material/Delete';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerIngredientsMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import { Table, TableHead, TableRow } from '@mui/material'; 
import { autoPlay } from 'react-swipeable-views-utils';
 
//import SwipeableViews from 'react-swipeable-views';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ingredientStyles from '../styles/ingredientStyles.module.css';  

import defaultImage from '/images/defaultImage.png'

//const AutoPlaySwipeableViews = SwipeableViews;

const OwnerIngredientPage = () => {
    const theme = useTheme();

    //const [activeImage, setActiveImage] = useState(0);
     
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [ingredients, setIngredients] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getOwnerIngredient, { isLoading }] = useGetOwnerIngredientsMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async (pageNo) => {
        try {
            const data = userInfo._id+'/'+pageNo;
            const res = await getOwnerIngredient( data ).unwrap();
            setIngredients(res.ingredient);  
            setTotalPages(res.totalPages);  
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }

    useEffect(() => {
        loadData(page);     
    },[]);

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);    
        console.log(ingredients);   
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
                                <Typography key="3" color="text.primary">Ingredients</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                     
                        <Row className='mt-3'>
                            <Col className="mb-3" xs={12} md={12}>
                                <Row>
                                    <Col>
                                    <h1 style={{ fontSize: '50px', color: 'blue', }}>Ingredients</h1>
                                        <Row style={{textAlign:'right', marginBottom:'20px'}}>
                                            <Col><Link href='/owner/ingredient/add'><Button className="mt-4" style={{background: '#685DD8'}}><KitchenIcon/> Add New Ingredient</Button></Link></Col>
                                        </Row>
                                        <Row style={{minHeight:'calc(100vh - 240px)'}}>
                                            <Col>
                                                {isLoading ? (
                                                    <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                                                        <CircularProgress />
                                                    </div> 
                                                   ): ingredients.length > 0 ? (
                                                      <Table className={ingredientStyles.customtable} striped bordered hover>
                                                        <thead>
                                                          <tr>
                                                            <th>Ingredient Name</th>
                                                            <th>Available Quantity</th>
                                                            <th>Alert At</th>
                                                            <th>Purchase Date</th>
                                                            <th>Option</th>  
                                                          </tr>
                                                        </thead>
                                                      <tbody>
                                                        {ingredients.map((ingredient, index) => (
                                                          <tr key={index}>
                                                            <td>{ingredient.ingredientName}</td>
                                                            <td>{ingredient.quantity}</td>
                                                            <td>{ingredient.measurement}</td>
                                                            <td>{ingredient.purchaseDate}</td>
                                                            <td className={ingredientStyles.nohover}> 
                                                                <Link href=''>
                                                                    <Button  style={{ background: 'yellow', color: 'black', marginRight: '10px' }}>
                                                                    <BrowserUpdatedIcon /> Update
                                                                    </Button>
                                                                </Link>
                                                                <Link href=''>
                                                                    <Button  style={{ background: 'red',color: 'black' }}>
                                                                    <DeleteIcon /> Delete
                                                                    </Button>
                                                                </Link>
                                                            </td> 
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </Table>
                                                        
                                                    ):(
                                                        <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>
                                                            <h2>You don't have any Ingredients!</h2>
                                                        </div>
                                                )}
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
                     
                </Container>
            </div>
        </> 
    )
};

export default OwnerIngredientPage;