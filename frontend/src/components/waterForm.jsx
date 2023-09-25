import { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, InputGroup,Image} from 'react-bootstrap';
import {  Card, CardContent,  InputLabel, Select, MenuItem, FormControl,Backdrop,CircularProgress,List,ListItem,Divider,ListItemText,ListItemAvatar,Avatar,Typography,Badge,Link} from '@mui/material';
import { NavigateNext, HelpOutlineRounded , Close, AddPhotoAlternate} from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import  BillStyles from '../styles/billStyles.module.css';
import { toast } from 'react-toastify';
import { useAddUtilitiesMutation,useGetUtilityBoardingMutation,useGetOccupantMutation} from '../slices/utilitiesApiSlice';
import Tooltip from '@mui/material/Tooltip';
import { ImageToBase64 } from "../utils/ImageToBase64";

import dashboardStyles from '../styles/dashboardStyles.module.css';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import storage from "../utils/firebaseConfig";

const ITEM_HEIGHT = 38;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
  style: {
  maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
  width: 250,
},
},
}; 


const AddUtilitiesPage = () =>{

  const { userInfo } = useSelector((state) => state.auth); 


    const [boardingData, setBoardingData] = useState([]);
    const [utilityType,setUtilityType] = useState('');
    const [ amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [utilityImage,setUtilityImage] = useState([]);
    const [utilityPreviewImage, setUtilityPreviewImage] = useState([]);
    const [occupantID,setOccupantId]= useState([]);
    const [selectedBoardingId, setSelectedBoardingId] = useState('');
    const [backDropOpen, setBackDropOpen] = useState(false);
    const [selectedOccupant, setSelectedOccupant] = useState('');
     
    const [occupantData, setOccupantData] = useState([]);


    const navigate = useNavigate();
     
    const [addUtilities, {isLoading}] = useAddUtilitiesMutation(); 
    const [getUtilityBording, { isLoadings }] =useGetUtilityBoardingMutation();
    const[getOccupant,{isLoading2}]=useGetOccupantMutation();
    const navigateTo = () => {
      
      navigate('/owner/utility/');
    };

    
    useEffect(() => {
    const loadData = async () => {
        try {
            const data = userInfo._id;
            const res = await getUtilityBording( data ).unwrap();
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
},[getUtilityBording, userInfo._id]);
  
   

const handleBoardingNameChange = async (event) => {
console.log(event.target.value);
try {
  const response = await getOccupant( event.target.value ).unwrap();
  const occupantsData = response.occupants;
  console.log(occupantsData);
  setOccupantData(occupantsData);
  setSelectedBoardingId(event.target.value);
  } catch (err) {
    toast.error(err.data?.message || err.error);
  }
}


const handleUtilityFormSubmit = async (event) => {
  event.preventDefault();

  const utilityData = {
    boardingId:selectedBoardingId,
    utilityType:'Water',
    amount,
    date,
    description,
    utilityImage,
    
  };
  if (selectedOccupant) {
    utilityData.occupantID = selectedOccupant;
  }

  try {
    const uploadPromises = utilityImage.map(async (file) => {
     
      try {
          const timestamp = new Date().getTime();
          const random = Math.floor(Math.random() * 1000) + 1;
          const uniqueName = `${timestamp}_${random}.${file.name.split('.').pop()}`;
      
          const storageRef = ref(storage, uniqueName);
          const uploadTask = uploadBytesResumable(storageRef, file);

          await uploadTask;
          
          return uniqueName;
        }catch (error) {
            console.error('Error uploading and retrieving image:', error);
            return null; // Handle the error as needed
        }
    });
    // Wait for all uploads to complete
    const uploadedImageNames = await Promise.all(uploadPromises);
   
   // Filter out any null values from failed uploads
    const validImageNames = uploadedImageNames.filter((name) => name !== null);

    console.log(validImageNames)
    
    //res= await addUtilities({utilityImage:validImageNames});

    const response = await addUtilities({...utilityData, utilityImage: validImageNames}).unwrap();
    console.log('Utility added:', response);
    toast.success('Utility added successfully');
    navigate('/owner/utility'); 

  } catch (err) {
    toast.error(err.data?.message || err.error);
  }
} 

const previewImage = async(e) => {
  const data = await ImageToBase64(e.target.files[0]);

  setUtilityImage([...utilityImage,e.target.files[0]]);
  setUtilityPreviewImage([...utilityPreviewImage,data]);
}


const removeImage = (imageToRemove) => {
  // Find the index of the item to remove in boardingImages
   const indexToRemove = utilityPreviewImage.indexOf(imageToRemove);

  if (indexToRemove !== -1) {
      // Create a copy of the arrays with the item removed
      const updatedPreviewImages = [...utilityPreviewImage];
      const updatedImages = [...utilityImage];

      updatedPreviewImages.splice(indexToRemove, 1);
      updatedImages.splice(indexToRemove, 1);

      // Update the state with the updated arrays
      setUtilityPreviewImage(updatedPreviewImages);
      setUtilityImage(updatedImages);
  }
  
};
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const handleAmountChange = (e) => {
  const enteredAmount = e.target.value;

  // Use a regular expression to check if the entered value is a valid number
  if (/^\d*\.?\d*$/.test(enteredAmount)) {
    // If it's a valid number, update the state
    setAmount(enteredAmount);
  } else {
    // If it's not a valid number, show a toast message
    toast.error("Please enter a valid number");
  }
};

 return(
    <>
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row className="d-flex justify-content-center">
                        <Col md={8} >
                      <div>
                        <form onSubmit={handleUtilityFormSubmit}>
                               <Row className='mt-4'>
                                  <Col className="mb-3">
                                    <Card className={CreateBoardingStyles.card}>
                                      <CardContent style={{padding:'25px'}}>
                                          <Row> 
                                               <Col>                   
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
                                               <Row>
                                               <Typography variant="body2" color="textSecondary">
                                                            {/* Comment: If adding a bill for only one occupant */}
                                                            If adding a bill occupant:
                                                          </Typography>
                                               </Row>
                                               <Row>
                                               <FormControl
                                                          sx={{ m: 1, width: 300 }}
                                                          disabled={!selectedBoardingId}
                                                        >
                                                          <InputLabel id="occupant-label">Select Occupant</InputLabel>
                                                          <Select
                                                            className={BillStyles.select}
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            value={selectedOccupant}
                                                            label="Occupant Name"
                                                            onChange={(e) => setSelectedOccupant(e.target.value)}
                                                          >
                                                            {occupantData.map((occupant) => (
                                                              <MenuItem key={occupant._id} value={occupant._id}>
                                                                {occupant.firstName}
                                                              </MenuItem>
                                                            ))}
                                                          </Select>
                                                        </FormControl>
                                                        </Row>
                                              </Col>
                                           </Row>
                          <Row className="mt-3" >
                            <Col xs={6} md={2}>
                                     <Form.Label>
                                      Amount : <span style={{color:'red'}}>*</span> 
                                     <Tooltip title="Give your bill's amount" placement="top" arrow>
                                     <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                     </Tooltip>
                                     </Form.Label>
                            </Col>
                            <Col   xs={6} md={14}>
                                     <InputGroup style={{width:'60%'}}>
                                      <InputGroup.Text>Rs.</InputGroup.Text>
                                      <Form.Control type="Number" placeholder="Amount" value={amount} onChange={handleAmountChange} required style={{width:'40%'}}/>
                                      <InputGroup.Text>.00</InputGroup.Text>
                                      </InputGroup>
                            </Col> 
                            </Row>
                                        <Row className="mt-3" >
                                        <Col xs={6} md={2}>
                                              <Form.Label>Date : <span style={{color:'red'}}>*</span>
                                              </Form.Label>
                                              </Col>
                                        <Col   xs={6} md={10}>
                                               <Form.Control type="Date" placeholder="Date" value={date} onChange={ (e) => setDate(e.target.value)} required style={{width:'30%'}}  min={getCurrentDate()} max={getCurrentDate()}/>
                                        </Col> 
                                        </Row>
                           <Row className="mt-3" >
                              <Col xs={6} md={2}>
                                     <Form.Label>
                                      Description : 
                                     </Form.Label>
                              </Col>
                              <Col   xs={6} md={10}>
                                      <Form.Control as="textarea" type="text" rows={3} placeholder="Description" value={description} onChange={ (e) => setDescription(e.target.value)} required style={{width:'50%'}}/>
                              </Col>  
                           </Row>   
                                                   <Row style={{marginTop:'20px'}}>
                                                        <Col xs={6} md={2}>
                                                            <Form.Label style={{margin:0}}>Bill Image<span style={{color:'red'}}>*</span></Form.Label>
                                                            <p>({utilityImage.length}/2)</p>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={6} md={10}>
                                                            <Row>
                                                                <Col>
                                                                    {utilityImage.length < 2 ?
                                                                        <Form.Group controlId="formFile" className="mb-0">
                                                                        <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                        <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                        </Form.Group>
                                                                         :<></>}
                                                                    {utilityPreviewImage.length > 0 ?
                                                                             utilityPreviewImage.map((utilityPreviewImage, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(utilityPreviewImage)}>
                                                                            <Image src={utilityPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                            </Badge>
                                                                             ))
                                                                          :<></>}
                                                                 </Col>
                                                             </Row>
                                                         </Col>
                                                    </Row>   
                                            <Row style={{marginTop:'40px'}}>
                                               <Col>
                                               
                                                     
                                               <Col>
                                                      <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Submit</Button>
                                                          <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                                           open={backDropOpen}
                                                          >                       
                                                          <CircularProgress color="inherit" />
                                                          </Backdrop>
                                                </Col>
                                                
                                                </Col>
                                            </Row>

                                                 </CardContent>
                                               </Card>
                                            </Col>
                                        </Row>    
                                 </form>  
                              </div>                                                        
                           </Col>
                        </Row>
                     </Container>    
                   </div>
    </>        
 ) ; 

};

export default AddUtilitiesPage;