import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Table, Button, Tabs, Tab,Modal } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, Pagination, CircularProgress, Box, FormControl,  InputLabel, MenuItem, Select,Autocomplete,TextField  } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext,} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingMutation,useGetKitchenUsersEmailsMutation,useAddKitchenUserMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
 
 
//import SwipeableViews from 'react-swipeable-views';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ingredientStyles from '../styles/ingredientStyles.module.css';  

import AllIngredients from "../components/allIngredientsComponent";
import ReduceinventoryPage from "../components/reduceinventoryComponent";
import CentralinventoryPage from "../components/centralinventoryComponent";
import IngredientReport from "../components/ingredientReportComponent";

import defaultImage from '/images/defaultImage.png'

//const AutoPlaySwipeableViews = SwipeableViews;

const OwnerIngredientPage = () => {

    const { userInfo } = useSelector((state) => state.auth); 
    const [boardingId, setBoardingId] = useState('');
    const [sBoardingId, selectedBoardingId] = useState('');
    const [boardingNames, setBoardingNames] = useState([]);
    const [activeTab, setActiveTab] = useState("Ingredients");
    const [showModal, setShowModal] = useState(false);
    const [managersEmails, setManagersEmails] = useState([]);
    const [ManagerId, setManagerId] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getOwnerBoarding, { isLoading }] = useGetOwnerBoardingMutation();
    const [getManagersEmails,{isLoading2}] = useGetKitchenUsersEmailsMutation();
    const [addKitchenUser,{isLoading3}] = useAddKitchenUserMutation();

    // Function to fetch boarding names from the API
    const loadData = async () => {
        try {
             
            const ownerId = userInfo._id;

            const res = await getOwnerBoarding(ownerId).unwrap();  
            setBoardingNames(res.boardings);  
            
            if (res.boardings.length > 0 && res.boardings[0].inventoryManager) {
                // Set the default selected boarding ID to the first one in the list
                setBoardingId(res.boardings[0]._id);
            }

        } catch (error) {
            console.error('Error fetching boarding names:', error);
             
        }
    };

    // Function to fetch managers' emails
    const loadManagersEmails = async () => {
        try {
            const res = await getManagersEmails().unwrap();
            console.log(res)
            setManagersEmails(res.user);
        } catch (error) {
            console.error('Error fetching managers\' emails:', error);
        }
    };


    useEffect(() => {
        loadData();  
    }, []);

    
    // Function to handle when a boarding is selected
    const handleBoardingSelect = (event) => {
        const boarding = boardingNames.find(item => item._id === event.target.value);

        if(!boarding.inventoryManager){
            selectedBoardingId(event.target.value);
            loadManagersEmails();
            setShowModal(true);
        }
        else{
            setBoardingId(event.target.value);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        console.log("bId",sBoardingId);
        try {
          const data = {
            boardingId: sBoardingId,
            ManagerId,
          };
          
          console.log("data",data);
          const res = await addKitchenUser(data).unwrap();
          console.log("Res",res);
          if (res && res.user) {
            console.log(res);
            toast.success('Manager added successfully');
          } else {
            toast.error('Failed to add Manager');
          }
        } catch (err) {
          console.error('Error adding Manager:', err);
          toast.error(err.data?.error || err.data?.message || err.error || err);
        } finally {
          handleCloseModal();
        }
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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Ingredients</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                     
                        <Row className='mt-3'>
                            <Col className="mb-3" xs={12} md={12}>
                                <Row>
                                    <Col>
                                    <h1 style={{ fontSize: '50px', color: '#685DD8', }}>Inventory</h1>
                                    </Col>
                                    <Col className="ml-5">
                                    <Box sx={{ minWidth: 120}}>
                                        <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">Boarding Name</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={boardingId}
                                                label="Boarding Name"
                                                onChange={handleBoardingSelect}
                                            >
                                                 {boardingNames.map((boarding) => (
                                                    <MenuItem key={boarding._id} value={boarding._id}>
                                                        {boarding.boardingName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                   </Box>
                                   </Col> 
                                </Row>
                                <Row>
                                   <Col> 
                                        <Tabs defaultActiveKey="Ingredients"  id="uncontrolled-tab-example" className="mb-3" onSelect={(k) => setActiveTab(k)}>
                                            <Tab eventKey="Ingredients" title="Ingredients">
                                                {activeTab=="Ingredients" ? <AllIngredients boardingId={boardingId} /> :''}
                                            </Tab>
                                            <Tab eventKey="Central Inventory" title="Central Inventory">
                                                {activeTab=="Central Inventory" ? <CentralinventoryPage boardingId={boardingId} /> :''}
                                            </Tab>
                                            <Tab eventKey="Reduce Inventory" title="Reduce Inventory">
                                                {activeTab=="Reduce Inventory" ? <ReduceinventoryPage boardingId={boardingId} /> :''}
                                            </Tab>
                                            <Tab eventKey="Report" title="Inventory Report">
                                                {activeTab=="Report" ? <IngredientReport boardingId={boardingId} /> :''}
                                            </Tab>
                                        </Tabs>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                     
                </Container>
            </div>

             {/* Bootstrap Modal */}
             <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Manager</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                      
                    <Typography variant="subtitle1" sx={{ marginBottom: 1}}>
                        Managers Emails
                    </Typography>
                             
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={managersEmails}
                        sx={{ width: 300}}
                        getOptionLabel={(option) => option.email} // Use a label from your ingredient object
                        renderInput={(params) => <TextField {...params} label="Search..." />}
                        onChange={(e, selectedManager) => setManagerId(selectedManager ? selectedManager._id : '')} // Set the selected ingredient's ID
                        value={managersEmails.find((user) => user._id === ManagerId) || null} // Find the ingredient object by ID and set it as the value
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button type="submit" variant="primary" onClick={submitHandler}>
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>
        </> 
    )
};

export default OwnerIngredientPage;