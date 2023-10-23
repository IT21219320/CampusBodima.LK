import { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useParams } from 'react-router-dom';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';
import orderStyles from '../styles/orderStyles.module.css';

import UpdateForm from '../components/updateForm';
import Water from '../components/waterForm';

const UpdateUtilitiesPage = () =>{

      
  const { userInfo } = useSelector((state) => state.auth); 
const {utilityType} =useParams();
   
    const navigate = useNavigate();

  
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
                                <Typography key="3" color="text.primary">Update Utility</Typography>
                            </Breadcrumbs>
                      
                        <Row className='mt-4'>
                                <Col className="mb-1">
                                    <Card style={{borderRadius:'6px'}}className={orderStyles.card}>
                                        <CardContent style={{padding:'1px', textAlign:'center',color:'white'}}>
                                            <h4 style={{margin:0}}><b>Update Utilities</b></h4>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className='mt-4'>
                <Col className="mb-1">
                  <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Tabs
                      value={utilityType}
                      centered
                    >
                      <Tab label="Electricity" value="Electricity" />
                      <Tab label="Water" value="Water" />
                      <Tab label="Other"value="Other" />
                    </Tabs>
                    {/* Display the selected utility type */}
                    <div className="selected-utility">
                     
                    </div>

                    {utilityType === 'Electricity' && <UpdateForm/> }
                    {utilityType === 'Water' && <UpdateForm/> }
                    {utilityType === 'Other'&& <UpdateForm/> }
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

export default UpdateUtilitiesPage;