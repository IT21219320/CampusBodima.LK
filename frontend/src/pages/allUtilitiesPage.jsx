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
import sideBarStyles from '../styles/sideBarStyles.module.css';
import billStyles from '../styles/billStyles.module.css';
import  BillStyles from '../styles/billStyles.module.css';

  
const AllUtilitiesPage = () =>{

  const { userInfo } = useSelector((state) => state.auth); 
  const [boardingId, setBoardingId] = useState('');
  const [boardingData, setBoardingData] = useState([]);
  const [utilityType,setUtilityType] = useState('Electricity');
  const [selectedBoardingId, setSelectedBoardingId] = useState('');


  const [getUtilityBoarding, { isLoadings }] = useGetUtilityBoardingMutation();
     
 

  useEffect(() => {
    const loadData = async () => {
        try {
            const data = userInfo._id;
            const res = await getUtilityBoarding( data ).unwrap();
            console.log('res.boardings:', res.boardings);
            if (Array.isArray(res.boardings)) {
              const boardingData = res.boardings.map((boarding)=> ({
                id: boarding._id,
                name: boarding.boardingName,
              }));
              setBoardingData(boardingData);
              } else {
                console.error("boardings data is not an array:", res.boardings);
              } 
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    };
    loadData();
},[getUtilityBoarding, userInfo._id]);

useEffect(() => {
  if (boardingData.length > 0) {
    setSelectedBoardingId(boardingData[0].id);
  }
}, [boardingData]);
  

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
                                    <FormControl sx={{ m: 1, width: 300 }}>
                             <InputLabel id="boarding-name-label"> Boarding Name </InputLabel>
                                 <Select className={BillStyles.select}
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={selectedBoardingId}
                                      label="Boarding Name"
                                      onChange={handleBoardingNameChange} >
                                                  {boardingData.map((boarding) => ( 
                                                         <MenuItem key={boarding.id} value={boarding.id}>
                                                              {boarding.name}
                                                         </MenuItem>
                                                          ))}
                                 </Select>
                             </FormControl>
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
                    {utilityType === 'Electricity' && <AllUtility boardingId ={selectedBoardingId} utilityType={utilityType}/>  }
                    {utilityType === 'Water'&& <AllUtility boardingId ={selectedBoardingId} utilityType={utilityType}/> }
                    {utilityType === 'Other'  }

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