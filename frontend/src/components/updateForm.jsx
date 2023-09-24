import { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, InputGroup,Image} from 'react-bootstrap';
import {  Card, CardContent,  InputLabel, Select, MenuItem, FormControl,Backdrop,CircularProgress,List,ListItem,Divider,ListItemText,ListItemAvatar,Avatar,Typography,Badge,Link} from '@mui/material';
import { NavigateNext, HelpOutlineRounded , Close, AddPhotoAlternate} from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import  BillStyles from '../styles/billStyles.module.css';
import { toast } from 'react-toastify';
import { useUpdateUtilityMutation,useGetUpdateUtilityMutation} from '../slices/utilitiesApiSlice';
import Tooltip from '@mui/material/Tooltip';
import { ImageToBase64 } from "../utils/ImageToBase64";
import billStyles from '../styles/billStyles.module.css';
import { useParams } from 'react-router-dom';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";
import storage from "../utils/firebaseConfig";
import LinearProgress from '@mui/material/LinearProgress';
import defaultImage from '/images/defaultImage.png';
import { Link as CustomLink } from "react-router-dom";
import ownerStyles from '../styles/ownerStyles.module.css';
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


const UpdateUtilitiesPage = ({}) =>{

  const { userInfo } = useSelector((state) => state.auth); 

    const { boardingId,utilityType,utilityId} = useParams();
    const [boardingNames, setBoardingNames] = useState([]);
    const [ newAmount, setAmount] = useState('');
    const [newDate, setDate] = useState('');
    const [newDescription, setDescription] = useState('');
    const [newUtilityImage,setNewUtilityImage] = useState([]);
    const [utilityPreviewImage, setUtilityPreviewImage] = useState([]);
    const [utilityImages, setUtilityImages] = useState([]);
    const [utilityImagesToDelete, setUtilityImagesToDelete] = useState([]);
    const [newUtilityPreviewImages, setNewUtilityPreviewImages] = useState([]);
    const [backDropOpen, setBackDropOpen] = useState(false);   
    const [percent, setPercent] = useState('101');
    const [selectedBoardingId, setSelectedBoardingId] = useState('');
    const [imagePreview, setImagePreview] = useState(''); // Store image preview
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();
     
    const[updateUtility,{isLoading}] =useUpdateUtilityMutation();
    const[getUpdateUtility,{isLoading1}] = useGetUpdateUtilityMutation();
    
     
    
    const loadData = async () => {
        try {
             
          if(boardingId && utilityType && utilityId){
            setBackDropOpen(true);
            const data = boardingId+'/'+utilityType+'/'+utilityId;
            const res = await getUpdateUtility(data).unwrap();
            console.log(res);
             
            setAmount(res.utility.amount);
            setDate(res.utility.date);
            setDescription(res.utility.description);
            setUtilityImages(res.utility.utilityImage);
            setBoardingNames(res.boarding.boardingName);
            setUtilityImagesToDelete([]);
          
             // Create an array of promises for image retrieval
                const updatedImages = await Promise.all(res.utility.utilityImage.map(async (image, index) => {
                    try {
                        const imageUrl = await getDownloadURL(ref(storage, image));
                        // Update the URL for the image in the boardingImages array
                        return imageUrl
                    } catch (error) {
                        console.error('Error retrieving image URL:', error);
                        // Handle the error as needed
                        return null;
                    }
                }));

            Promise.all(updatedImages)
                .then((imageUrl) => {

                    setUtilityPreviewImage(imageUrl);
                })
                .catch((error) => {
                    console.error('Error updating image URLs:', error);
                    // Handle the error as needed
                });
                setBackDropOpen(false);
              }
        } catch (error) {
          setBackDropOpen(false);
          console.error('Error fetching boarding names:', error);
        }
      
      };
    
      useEffect(() => {
        loadData();     
      },[boardingId,utilityType,utilityId]);

      
    const previewImage = async(e) => {
      const data = await ImageToBase64(e.target.files[0]);

      setNewUtilityImage([...newUtilityImage,e.target.files[0]]);
     setNewUtilityPreviewImages([...newUtilityPreviewImages,data]);
  }
  const removeOldImage = async(imageToRemove) => {
    // Find the index of the item to remove in boardingImages
    const indexToRemove = utilityPreviewImage.indexOf(imageToRemove);
    
    if (indexToRemove !== -1) {
        // Create a copy of the arrays with the item removed
        const updatedPreviewImages = [...utilityPreviewImage];
        const updatedImages = [...utilityImages];
        const updatedImagesToDelete = [...utilityImagesToDelete];
        
        updatedImagesToDelete.push(updatedImages[indexToRemove]);
        updatedPreviewImages.splice(indexToRemove, 1);
        updatedImages.splice(indexToRemove, 1);

        // Update the state with the updated arrays
        setUtilityPreviewImage(updatedPreviewImages);
        setUtilityImages(updatedImages);
        setUtilityImagesToDelete(updatedImagesToDelete);

    }
    
};

const removeImage = (imageToRemove) => {
  // Find the index of the item to remove in boardingImages
  const indexToRemove = newUtilityPreviewImages.indexOf(imageToRemove);

  if (indexToRemove !== -1) {
      // Create a copy of the arrays with the item removed
      const updatedPreviewImages = [...newUtilityPreviewImages];
      const updatedImages = [...newUtilityImage];

      updatedPreviewImages.splice(indexToRemove, 1);
      updatedImages.splice(indexToRemove, 1);

      // Update the state with the updated arrays
      setNewUtilityPreviewImages(updatedPreviewImages);
      setUtilityImages(updatedImages);
  }
  
};

const handleUtilityFormSubmit = async (event) => {
  event.preventDefault();
  console.log('Update button clicked');
   
        
        
     
      var fileRef;
      try {

          for(let i = 0; i < utilityImagesToDelete.length; i++){
              fileRef = ref(storage,utilityImagesToDelete[i]);

              try {
                  await deleteObject(fileRef);
              } catch (err) {
                  console.log(err); 
                  toast.error(err);
              }
          }

          let finalUtlityImages = utilityImages;
          if(newUtilityImage.length > 0){
              const uploadPromises = newUtilityImage.map(async (utilityImage) => {
                  const file =utilityImage;
                  try {
                      const timestamp = new Date().getTime();
                      const random = Math.floor(Math.random() * 1000) + 1;
                      const uniqueName = `${timestamp}_${random}.${file.name.split('.').pop()}`;
                  
                      const storageRef = ref(storage, `${uniqueName}`);
                      const uploadTask = uploadBytesResumable(storageRef, file);

                      await uploadTask;
                      
                      return uniqueName;                  
          
                  } catch (error) {
                      console.error('Error uploading and retrieving image:', error);
                      return null; // Handle the error as needed
                  }
              });

              // Wait for all uploads to complete
              const uploadedImageNames = await Promise.all(uploadPromises);

              // Filter out any null values from failed uploads
              const validImageNames = uploadedImageNames.filter((name) => name !== null);

              finalUtlityImages = boardingNames.concat(validImageNames)
          }
    
     const data = {
        boardingId: boardingId,
        utilityType: utilityType,
        utilityId: utilityId,
        newAmount,
        newDate,
        newDescription,
        newUtilityImage: finalUtlityImages,
      };
  
      const res = await updateUtility(data).unwrap();
  
      if (res) {
        toast.success('Utility Updated successfully');
        navigate('/owner/utility');
      } else {
        toast.error('Failed to update utility');
      }
    } catch (err) {
      toast.error(err.data?.message || err.error || err);
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
                                      value={boardingId}
                                      label="Boarding Name"
                                      disabled
                                      >
                                                 
                                                         <MenuItem value={boardingId}>
                                                              {boardingNames}
                                                         </MenuItem>
                                                         
                                 </Select>
                             </FormControl>
                          </Col>
                         </Row>
                                         <Row className="mt-3" >
                                             <Col xs={6} md={2}>
                                                   <Form.Label>Amount : <span style={{color:'red'}}>*</span> 
                                                   <Tooltip title="Give your bill's amount" 
                                                   placement="top" 
                                                   arrow
                                                   >
                                                   <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                   </Tooltip>
                                                   </Form.Label>
                                             </Col>
                                             <Col   xs={6} md={14}>
                                                <InputGroup style={{width:'60%'}}>
                                                <InputGroup.Text>Rs.</InputGroup.Text>
                                                <Form.Control type="Number" placeholder="Amount" value={newAmount} onChange={ (e) => setAmount(e.target.value)} required style={{width:'40%'}}/>
                                                <InputGroup.Text>.00</InputGroup.Text>
                                                </InputGroup>
                                             </Col> 
                                         </Row>
                          <Row className="mt-3" >
                              <Col xs={6} md={2}>
                                  <Form.Label>Date : <span style={{color:'red'}}>*</span></Form.Label>
                              </Col>
                              <Col   xs={6} md={10}>
                                  <Form.Control type="date" placeholder="Date" value={newDate} onChange={ (e) => setDate(e.target.value)} required style={{width:'30%'}}/>
                              </Col> 
                          </Row>
                                           <Row className="mt-3" >
                                                 <Col xs={6} md={2}>
                                                     <Form.Label>Description :</Form.Label>
                                                 </Col>
                                                 <Col   xs={6} md={10}>
                                                     <Form.Control as="textarea" type="text" rows={3} placeholder="Description" value={newDescription} onChange={ (e) => setDescription(e.target.value)} required style={{width:'50%'}}/>
                                                 </Col> 
                                           </Row>   
                        
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Bill Images<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Add a few photos of the *outside* of the boarding." placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                            <p>({utilityImages.length+newUtilityImage.length}/2)</p>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    {(utilityImages.length+newUtilityImage.length) < 2 ?
                                                                        <Form.Group controlId="formFile" className="mb-0">
                                                                            <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                            <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                        </Form.Group>
                                                                    :<></>}
                                                                    {utilityPreviewImage.length > 0 ?
                                                                       utilityPreviewImage.map((utilityPreviewImage, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeOldImage(utilityPreviewImage)}>
                                                                                <Image src={utilityPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                            </Badge>
                                                                        ))
                                                                    :<></>}
                                                                    {newUtilityPreviewImages.length > 0 ?
                                                                        newUtilityPreviewImages.map((newUtilityPreviewImages, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(newUtilityPreviewImages)}>
                                                                                <Image src={newUtilityPreviewImages} width={100} height={100} style={{cursor:'auto'}}/>
                                                                            </Badge>
                                                                        ))
                                                                    :<></>}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                      
                            <Row style={{textAlign:'center', marginBottom:'20px' }}>
                                               <Col>
                                              
                                               <Button type="submit" className={billStyles.custombutton} >
                                                     <b>Update</b> 
                                                      </Button>
                                                        
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

export default UpdateUtilitiesPage;