import { useState, useEffect } from "react";
import {  useNavigate } from 'react-router-dom';
import { Container, Row, Col,Button} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, FormControl,  InputLabel, MenuItem, Select  } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useGetUtilityBoardingMutation } from '../slices/utilitiesApiSlice'; 
import { useDispatch, useSelector } from 'react-redux';
import AllUtility from '../components/allUtilityComponent';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';
import { RiWaterFlashFill } from 'react-icons/ri';
import sideBarStyles from '../styles/sideBarStyles.module.css'

  
const AllUtilitiesPage = () =>{

  const { userInfo } = useSelector((state) => state.auth); 
  const [boardingId, setBoardingId] = useState('');
  const [boardingNames, setBoardingNames] = useState([]);
  const [utilityType,setUtilityType] = useState('Electricity');


  const [getUtilityBoarding, { isLoadings }] = useGetUtilityBoardingMutation();
     
  const loadData = async () => {
        try {
             
            const ownerId = userInfo._id;

            const res = await getUtilityBoarding(ownerId).unwrap();  
            setBoardingNames(res.boardings);  
            
            if (res.boardings.length > 0) {
                // Set the default selected boarding ID to the first one in the list
                setBoardingId(res.boardings[0]._id);
            }

        } catch (error) {
            console.error('Error fetching boarding names:', error);
             
        }
    };

    useEffect(() => {
        loadData(); // Fetch boarding names when the component mounts
    }, []);
  

const handleBoardingNameChange = (event) => {
  setSelectedBoardingId(event.target.value);
}; 
    
    const handleChange = (event, newUtilityType) => {
      setUtilityType( newUtilityType);
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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
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
                            <Row className='mt-3'>
                                    <Col className="ml-5">
                                    <Box sx={{ minWidth: 120 }}>
                                        <FormControl style={{width:390} }>
                                            <InputLabel id="demo-simple-select-label">Boarding Name</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={boardingId}
                                                label="Boarding Name"
                                                onChange={handleBoardingNameChange}
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
                                   <Col>
                                   <Row style={{textAlign:'right', marginBottom:'20px'}}>
                                    <Col><Link href='/owner/utility/add'><Button className="mt-4" style={{background: '#685DD8'}}><RiWaterFlashFill style={{fontSize:'1.5em'}}/> Add New Utility Bill</Button></Link></Col>
                                    </Row>
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
                    {utilityType === 'Electricity' && <AllUtility boardingId ={boardingId} utilityType={utilityType}/>  }
                    {utilityType === 'Water'&& <AllUtility boardingId ={boardingId} utilityType={utilityType}/> }
                    {utilityType === 'Other'  }

                    <Link href=''>
                    <button type="button" >
                    <RiWaterFlashFill style={{fontSize:'1.5em'}}/> Add New Utilities
                    </button >
              </Link>
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