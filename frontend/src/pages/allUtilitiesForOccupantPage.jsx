import { useState, useEffect } from "react";
import {  useNavigate } from 'react-router-dom';
import { Container, Row, Col,Button} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, FormControl,  InputLabel, MenuItem, Select  } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useGetUtilityBoardingMutation,useGetOccupantMutation,useGetBoardingMutation } from '../slices/utilitiesApiSlice'; 
import { useDispatch, useSelector } from 'react-redux';
import AllUtility from '../components/utilitiesForOccupant';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';
import { RiWaterFlashFill } from 'react-icons/ri';
import sideBarStyles from '../styles/sideBarStyles.module.css';
import billStyles from '../styles/billStyles.module.css';
import  BillStyles from '../styles/billStyles.module.css';
import { toast } from 'react-toastify';
import UtilityReport from '../components/utilityReportComponent';
  
const AllUtilitiesPage = () =>{

    const { userInfo } = useSelector((state) => state.auth);
    const [boardingData, setBoardingData] = useState([]);
    const [occupantData, setOccupantData] = useState([]);
    const [selectedBoardingId, setSelectedBoardingId] = useState('');
    const [selectedOccupant, setSelectedOccupant] = useState('');
    const [utilityType, setUtilityType] = useState('Electricity');
    
    
  
    const handleChange = (event, newUtilityType) => {
      setUtilityType(newUtilityType);
    };
  
 return(
    <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row> 
                    
                    
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">AllUtility</Typography>
                            </Breadcrumbs>
                      
                        <Row className='mt-4'>
                                <Col className="mb-1">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px', textAlign:'center'}}>
                                            <h4 style={{margin:0}}><b>All Utilities</b></h4>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                               
                                
                                
                            <Row className='mt-4'>
                <Col className="mb-1">
                  <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Tabs
                      value={utilityType}
                      onChange={handleChange}
                      centered
                    >
                      <Tab label="Electricity" value="Electricity" />
                      <Tab label="Water" value="Water" />
                      <Tab label="Other"value="Other" />
                      
                      <Tab >
                      </Tab>
                    </Tabs>
                    {utilityType === 'Electricity' && <AllUtility  utilityType={utilityType} />  }
                    {utilityType === 'Water'&& <AllUtility  utilityType={utilityType} /> }
                    {utilityType === 'Other' &&<AllUtility utilityType={utilityType} />}
                    
                  </Box> 
                
                </Col>
                
              </Row>
              
                            
                                                            
                         </Col>
                      </Row>
                    </Container>    
                  </div>
    </>        
 ) ; 

};

export default AllUtilitiesPage;