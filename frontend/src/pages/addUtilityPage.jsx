import { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import { toast } from 'react-toastify';
import { useAddUtilitiesMutation } from '../slices/utilitiesApiSlice';
import orderStyles from '../styles/orderStyles.module.css';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';


import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';
import UtilityForm from '../components/utilityForm';
import OtherUtilityForm from '../components/otherUtilityForm';
import Water from '../components/waterForm';
import  BillStyles from '../styles/billStyles.module.css';

const AddUtilitiesPage = () =>{

  
  const { userInfo } = useSelector((state) => state.auth); 
    const [utilityType,setUtilityType] = useState('Electricity');
   
    const navigate = useNavigate();
     
    const [addUtilities, {isLoading}] = useAddUtilitiesMutation(); 
    
    const handleChange = (event, newUtilityType) => {
      setUtilityType( newUtilityType);
    };
const handleUtilityFormSubmit = async (event) => {

  try {
    const response = await addUtilities({ utilityType, ...utilityData }).unwrap();
    console.log('Utility added:', response);
    toast.success('Utility added successfully');
  } catch (err) {
    toast.error(err.data?.message || err.error);
  }
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
                                <Link underline="hover" key="1" color="inherit" href="/owner/utility/">AllUtility</Link>
                                <Typography key="3" color="text.primary">AddUtility</Typography>
                            </Breadcrumbs>
                      
                        <Row className='mt-4'>
                                <Col className="mb-1">
                                <Card className={orderStyles.card} style={{borderRadius:'6px'}}>
                                        <CardContent style={{padding:'1px', textAlign:'center',color:'white'}}>
                                            <h4 style={{margin:0,fontSize:'25px'}}><b>Add Utilities</b></h4>
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
                    </Tabs>
                    {utilityType === 'Electricity' && <UtilityForm onSubmit={handleUtilityFormSubmit}/>}
                    {utilityType === 'Water' && <Water onSubmit={handleUtilityFormSubmit} />}
                    {utilityType === 'Other' && <OtherUtilityForm onSubmit={handleUtilityFormSubmit} /> }
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

export default AddUtilitiesPage;