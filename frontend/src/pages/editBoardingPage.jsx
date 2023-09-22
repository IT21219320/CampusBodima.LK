import { useState, useEffect } from "react";
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Container, Row, Col, Image, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Button, Link, CircularProgress, Box, Tooltip, Checkbox, FormControlLabel, ToggleButton, ToggleButtonGroup, Collapse, IconButton, Alert, Badge, Slider, Modal, Backdrop, LinearProgress } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useGetBoardingByIdMutation, useUpdateBoardingMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';

import { geoCoding } from '../utils/geoCoding.js'
import { ImageToBase64 } from "../utils/ImageToBase64";
import storage from "../utils/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject  } from "firebase/storage";

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

const EditBoardingPage = () => {

    const { userInfo } = useSelector((state) => state.auth);
    
    const [noticeStatus, setNoticeStatus] = useState(true);
    const [userLocation, setUserLocation] = useState('');
    const [viewUserInfo, setViewUserInfo] = useState();
    const [boardingName, setBoardingName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [location, setLocation] = useState('');
    const [facilities, setFacilities] = useState([]);
    const [utilityBills, setUtilityBills] = useState('No');
    const [food, setFood] = useState('No');
    const [gender, setGender] = useState('Any');
    const [boardingType, setBoardingType] = useState('');
    const [noOfRooms, setNoOfRooms] = useState(1);
    const [noOfCommonBaths, setNoOfCommonBaths] = useState(0);
    const [noOfAttachBaths, setNoOfAttachBaths] = useState(0);
    const [rent, setRent] = useState('');
    const [keyMoney, setKeyMoney] = useState(0);
    const [description, setDescription] = useState('');
    const [boardingImages, setBoardingImages] = useState([]);
    const [boardingImagesToDelete, setBoardingImagesToDelete] = useState([]);
    const [boardingPreviewImages, setBoardingPreviewImages] = useState([]);
    const [newBoardingImages, setNewBoardingImages] = useState([]);
    const [newBoardingPreviewImages, setNewBoardingPreviewImages] = useState([]);
    const [backDropOpen, setBackDropOpen] = useState(false);   

    const [getBoardingById, {isLoading}] = useGetBoardingByIdMutation();
    const [updateBoarding, {isLoading2}] = useUpdateBoardingMutation();
    
    const { boardingId } = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const availableFacilities = ["Air Conditioning", "Washing Machine", "Hot Water", "Free Wi-Fi"];

    const roomMarks = [{value: 1, label: '1'}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    const bathMarks = [{value: 0, label: '0'}, {value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]


    const loadData = async () => {
        try {
            setBackDropOpen(true);
            const res = await getBoardingById( boardingId ).unwrap();

            setBoardingName(res.boarding.boardingName);
            setAddress(res.boarding.address);
            setCity(res.boarding.city);
            setLocation(res.boarding.location);
            setFacilities(res.boarding.facilities);
            setUtilityBills(res.boarding.utilityBills ? 'Yes' : 'No');
            setFood(res.boarding.food ? 'Yes' : 'No');
            setGender(res.boarding.gender);
            setBoardingType(res.boarding.boardingType);
            setBoardingImages(res.boarding.boardingImages);

            if(res.boarding.boardingType == 'Annex'){
                setNoOfRooms(parseInt(res.boarding.noOfRooms));
                setNoOfAttachBaths(parseInt(res.boarding.noOfAttachBaths));
                setNoOfCommonBaths(parseInt(res.boarding.noOfCommonBaths));
                setRent(parseInt(res.boarding.rent));
                setKeyMoney(parseInt(res.boarding.keyMoney));
                setDescription(res.boarding.description);
            }

            // Create an array of promises for image retrieval
                const updatedImages = await Promise.all(res.boarding.boardingImages.map(async (image, index) => {
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
                    setBoardingPreviewImages(imageUrl);
                })
                .catch((error) => {
                    console.error('Error updating image URLs:', error);
                    // Handle the error as needed
                });




                setBackDropOpen(false);
            
        } catch (err) {
            setBackDropOpen(false);
            toast.error(err.data?.message || err.error);
        }
    }

    useEffect(() => {
        setViewUserInfo(true);
        loadData();
    },[]);

    const handleMapClick = (event) => {
        setLocation({
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        });
        setUserLocation({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        });

        geoCoding(event.latLng.lat(), event.latLng.lng())
        .then((cityName) => {
            setCity(cityName);
        })
        .catch((error) => {
            toast.error(`Error: ${error} Please select again!`);
        });

    };

    const handleFacilitySelection = (facility) => {
        if (facilities.includes(facility)) {
          setFacilities(facilities.filter((f) => f !== facility));
        } else {
          setFacilities([...facilities, facility]);
        }
    };

    const previewImage = async(e) => {
        const data = await ImageToBase64(e.target.files[0]);

        setNewBoardingImages([...newBoardingImages,e.target.files[0]]);
        setNewBoardingPreviewImages([...newBoardingPreviewImages,data]);
    }

    const removeOldImage = async(imageToRemove) => {
        // Find the index of the item to remove in boardingImages
        const indexToRemove = boardingPreviewImages.indexOf(imageToRemove);
        
        if (indexToRemove !== -1) {
            // Create a copy of the arrays with the item removed
            const updatedPreviewImages = [...boardingPreviewImages];
            const updatedImages = [...boardingImages];
            const updatedImagesToDelete = [...boardingImagesToDelete];

            updatedImagesToDelete.push(updatedImages[indexToRemove]);
            updatedPreviewImages.splice(indexToRemove, 1);
            updatedImages.splice(indexToRemove, 1);

            // Update the state with the updated arrays
            setBoardingPreviewImages(updatedPreviewImages);
            setBoardingImages(updatedImages);
            setBoardingImagesToDelete(updatedImagesToDelete);

        }
        
    };

    const removeImage = (imageToRemove) => {
        // Find the index of the item to remove in boardingImages
        const indexToRemove = newBoardingPreviewImages.indexOf(imageToRemove);

        if (indexToRemove !== -1) {
            // Create a copy of the arrays with the item removed
            const updatedPreviewImages = [...newBoardingPreviewImages];
            const updatedImages = [...newBoardingImages];

            updatedPreviewImages.splice(indexToRemove, 1);
            updatedImages.splice(indexToRemove, 1);

            // Update the state with the updated arrays
            setNewBoardingPreviewImages(updatedPreviewImages);
            setNewBoardingImages(updatedImages);
        }
        
    };

    const sliderValueText = (value) => {
        if(value < 11){
            return value;
        }
        else{
            return `10+`
        }
    }

    const submitHandler = async(e) => {
        e.preventDefault();
        if(city == ''){
            toast.error('Please select the loaction on the map to set the city');
        }
        else if(boardingType == ''){
            toast.error('Please Select a boarding type');
        }
        else if(boardingImages.length < 1){
            toast.error('Please add atleast 1 image to proceed');
        }
        else if(boardingType == 'Annex' && noOfAttachBaths == '0' && noOfCommonBaths == '0'){
            toast.error("You should have atleast 1 bathroom")
        }
        else if(boardingType == 'Annex' && parseInt(rent) <= 0){
            toast.error("Please enter a valid rent amount")
        }
        else{
            setBackDropOpen(true);
            
            var res;
            var fileRef;

            try {

                for(let i = 0; i < boardingImagesToDelete.length; i++){
                    fileRef = ref(storage,boardingImagesToDelete[i]);
    
                    try {
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.log(err); 
                        toast.error(err);
                    }
                }

                let finalBoardingImages = boardingImages;
                if(newBoardingImages.length > 0){
                    const uploadPromises = newBoardingImages.map(async (boardingImage) => {
                        const file = boardingImage;
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

                    finalBoardingImages = boardingImages.concat(validImageNames)
                }
                
                if(boardingType == 'Annex'){
                    res = await updateBoarding({ boardingId, boardingName, address, city, location, facilities, utilityBills: utilityBills=='Yes', food:food=='Yes', gender, boardingType, noOfRooms, noOfCommonBaths, noOfAttachBaths, rent, keyMoney, description, boardingImages:finalBoardingImages });
                }
                else{
                    res = await updateBoarding({ boardingId, boardingName, address, city, location, facilities, utilityBills: utilityBills=='Yes', food:food=='Yes', gender, boardingType, boardingImages:finalBoardingImages });
                    console.log(res);
                }

                if(res.error){
                    toast.error(res.error.data.message);
                    setBackDropOpen(false);
                }
                else{
                    toast.success('Boarding Registered Successfully!')

                    navigate('/owner/boardings/');

                }

            } catch (err) {
                setBackDropOpen(false);
                toast.error(err.data?.message || err.error || err);
            }
        }
    }


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
                                <Link underline="hover" key="3" color="inherit" href="/owner/boardings">Boardings</Link>,
                                <Link underline="hover" key="3" color="inherit" href={`/owner/boardings/${boardingId}/rooms`}>{boardingName}</Link>,
                                <Typography key="4" color="text.primary">Edit</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Fade in={viewUserInfo} >
                        <Form onSubmit={submitHandler}>
                            <Row className='mt-4'>
                                <Col className="mb-1">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px', textAlign:'center'}}>
                                            <h4 style={{margin:0}}><b>Edit Boarding</b></h4>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col className="mb-3">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px'}}>
                                            <Row>
                                                <Col><p><b>New Boarding</b></p></Col>
                                            </Row>
                                            <Row style={{marginBottom:'10px'}}>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>
                                                                Boarding Name<span style={{color:'red'}}>*</span> 
                                                                <Tooltip title="Give a unique name for your boarding" placement="top" arrow>
                                                                    <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                                </Tooltip>
                                                            </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="Boarding Name" value={boardingName} onChange={ (e) => setBoardingName(e.target.value)} required style={{width:'95%'}}/>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Address<span style={{color:'red'}}>*</span> </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="143/A, New Kandy Rd, Malabe" value={address} onChange={ (e) => setAddress(e.target.value)} required style={{width:'95%'}}/>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>City<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Select location from map to set the city" placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="Malabe" value={city} onChange={ (e) => setCity(e.target.value)} required style={{width:'95%'}}/>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Location<span style={{color:'red'}}>*</span> </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%', textAlign:'left'}} xs={12} md={8}>
                                                            <GoogleMap
                                                                mapContainerStyle={{ width: '95%', height: '300px', boxShadow:'#000000a1 0px 0px 6px -1px', borderRadius:'10px' }}
                                                                center={ userLocation || {lat: 6.914805296158741, lng: 79.97291231369822 } } // Default center SLIIT if user doesnt exist
                                                                zoom={10}
                                                                onClick={handleMapClick}
                                                            >
                                                                {location && <Marker position={location} />}
                                                            </GoogleMap>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Facilities</Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                {availableFacilities.slice(0,Math.ceil(availableFacilities.length / 2)).map((facility) => (
                                                                    <FormControlLabel
                                                                        key={facility}
                                                                        control={<Checkbox style={{paddingTop:0, paddingBottom:0}} checked={facilities.includes(facility)} onChange={() => handleFacilitySelection(facility)} />}
                                                                        label={facility}
                                                                        style={{whiteSpace:'nowrap'}}
                                                                    />
                                                                ))}
                                                                </Col>
                                                                <Col>
                                                                {availableFacilities.slice(Math.ceil(availableFacilities.length / 2)).map((facility) => (
                                                                    <FormControlLabel
                                                                        key={facility}
                                                                        control={<Checkbox style={{paddingTop:0, paddingBottom:0}} checked={facilities.includes(facility)} onChange={() => handleFacilitySelection(facility)} />}
                                                                        label={facility}
                                                                        style={{whiteSpace:'nowrap'}}
                                                                    />
                                                                ))}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Utility Bills<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Are you charging for any utility bills such as water or electricity seperately?" placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    <ToggleButtonGroup
                                                                        color={utilityBills==="Yes" ? "success" : "error"}
                                                                        value={utilityBills}
                                                                        exclusive
                                                                        onChange={(e) => setUtilityBills(e.target.value)}
                                                                        required
                                                                    >
                                                                        <ToggleButton value="Yes" >Yes</ToggleButton>
                                                                        <ToggleButton value="No" >No</ToggleButton>
                                                                    </ToggleButtonGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Food<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Are you providing food for the occupants? *Select YES only if you are charging Seperately" placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    <ToggleButtonGroup
                                                                        color={food==="Yes" ? "success" : "error"}
                                                                        value={food}
                                                                        exclusive
                                                                        onChange={(e) => setFood(e.target.value)}
                                                                        required
                                                                    >
                                                                        <ToggleButton value="Yes" >Yes</ToggleButton>
                                                                        <ToggleButton value="No" >No</ToggleButton>
                                                                    </ToggleButtonGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Gender<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Is the boarding place for Males, Females, or anyone?" placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    <ToggleButtonGroup
                                                                        color="primary"
                                                                        value={gender}
                                                                        exclusive
                                                                        onChange={(e) => setGender(e.target.value)}
                                                                        required
                                                                    >
                                                                        <ToggleButton value="Male" >Male</ToggleButton>
                                                                        <ToggleButton value="Female" >Female</ToggleButton>
                                                                        <ToggleButton value="Any" >Any</ToggleButton>
                                                                    </ToggleButtonGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Boarding Type<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Select Annex if your are going to rent out the whole building/floor or select Hostel if you are going to rent out room by room" placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    <ToggleButtonGroup
                                                                        color="primary"
                                                                        value={boardingType}
                                                                        exclusive
                                                                        required
                                                                    >
                                                                        <ToggleButton value={boardingType} >{boardingType}</ToggleButton>
                                                                    </ToggleButtonGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    {boardingType === "Hostel" ? 
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Boarding Images<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Add a few photos of the *outside* of the boarding." placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                            <p>({boardingImages.length+newBoardingImages.length}/2)</p>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    {(boardingImages.length+newBoardingImages.length) < 2 ?
                                                                        <Form.Group controlId="formFile" className="mb-0">
                                                                            <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                            <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                        </Form.Group>
                                                                    :<></>}
                                                                    {boardingPreviewImages.length > 0 ?
                                                                        boardingPreviewImages.map((boardingPreviewImage, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeOldImage(boardingPreviewImage)}>
                                                                                <Image src={boardingPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                            </Badge>
                                                                        ))
                                                                    :<></>}
                                                                    {newBoardingPreviewImages.length > 0 ?
                                                                        newBoardingPreviewImages.map((newBoardingPreviewImage, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(newBoardingPreviewImage)}>
                                                                                <Image src={newBoardingPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                            </Badge>
                                                                        ))
                                                                    :<></>}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    : <></> }
                                                </Col>
                                            </Row>
                                            {boardingType === "Annex" ?
                                            <> 
                                                <hr />
                                                <Row style={{marginTop:'20px'}}>
                                                    <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                        <Row style={{marginBottom:'5px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>
                                                                    Rooms 
                                                                </Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Slider 
                                                                    value={noOfRooms=='10+' ? 11 : noOfRooms} 
                                                                    valueLabelDisplay={noOfRooms > 1 ? 'on' : "auto"} 
                                                                    step={1} 
                                                                    min={1} 
                                                                    max={11} 
                                                                    marks={roomMarks}
                                                                    style={{width:'95%'}}
                                                                    valueLabelFormat={sliderValueText} 
                                                                    onChange={(e) => { e.target.value < 11 ? setNoOfRooms(e.target.value) : setNoOfRooms('10+')}}
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <Row style={{marginBottom:'5px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>
                                                                    Attached Bathrooms 
                                                                </Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Slider 
                                                                    value={noOfAttachBaths=='10+' ? 11 : noOfAttachBaths} 
                                                                    valueLabelDisplay={noOfAttachBaths > 1 ? 'on' : "auto"}
                                                                    step={1} 
                                                                    marks={bathMarks} 
                                                                    min={0} 
                                                                    max={11} 
                                                                    color="secondary"
                                                                    style={{width:'95%'}}
                                                                    valueLabelFormat={sliderValueText} 
                                                                    onChange={(e) => { e.target.value < 11 ? setNoOfAttachBaths(e.target.value) : setNoOfAttachBaths('10+')}}
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>
                                                                    Common Bathrooms 
                                                                </Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Slider 
                                                                    value={noOfCommonBaths=='10+' ? 11 : noOfCommonBaths} 
                                                                    valueLabelDisplay={noOfCommonBaths > 1 ? 'on' : "auto"}
                                                                    step={1} 
                                                                    marks={bathMarks}
                                                                    min={0} 
                                                                    max={11} 
                                                                    color="secondary"
                                                                    style={{width:'95%'}}
                                                                    valueLabelFormat={sliderValueText} 
                                                                    onChange={(e) => { e.target.value < 11 ? setNoOfCommonBaths(e.target.value) : setNoOfCommonBaths('10+')}}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                        <Row style={{marginTop:'10px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>Monthly Rent<span style={{color:'red'}}>*</span></Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <InputGroup style={{width:'95%'}}>
                                                                    <InputGroup.Text>Rs.</InputGroup.Text>
                                                                    <Form.Control aria-label="Amount (to the nearest Rupee)" placeholder="10000" type="number" min={0} value={rent} onChange={(e) => setRent(e.target.value.replace('.', ''))} required />
                                                                    <InputGroup.Text>.00</InputGroup.Text>
                                                                </InputGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row style={{marginTop:'10px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>Key Money</Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <InputGroup style={{width:'95%'}}>
                                                                    <Form.Control type="number" min={0} value={keyMoney} onChange={(e) => setKeyMoney(e.target.value)} required />
                                                                    <InputGroup.Text>Month{keyMoney>1 ? 's' : ''}</InputGroup.Text>
                                                                </InputGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row style={{marginTop:'10px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>Description<span style={{color:'red'}}>*</span></Form.Label>
                                                                <p>{description.length}/5000</p>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <InputGroup style={{width:'95%'}}>
                                                                    <Form.Control as="textarea" rows={3} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} required />
                                                                </InputGroup>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <Row style={{marginTop:'20px'}}>
                                                    <Col style={{height:'100%'}} xs={12} md={4} lg={2}>
                                                        <Form.Label style={{margin:0}}>Boarding Images<span style={{color:'red'}}>*</span></Form.Label>
                                                        <Tooltip title="Add up to a maximum of 5 photos of the Annex." placement="top" arrow>
                                                            <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                        </Tooltip>
                                                        <p>({boardingImages.length+newBoardingImages.length}/5)</p>
                                                    </Col>
                                                    <Col style={{height:'100%'}} xs={12} md={8} lg={10}>
                                                        <Row>
                                                            <Col>
                                                                {(boardingImages.length+newBoardingImages.length) < 5 ?
                                                                    <Form.Group controlId="formFile" className="mb-0">
                                                                        <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                        <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                    </Form.Group>
                                                                :<></>}
                                                                {boardingPreviewImages.length > 0 ?
                                                                    boardingPreviewImages.map((boardingPreviewImage, index) => (
                                                                        <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeOldImage(boardingPreviewImage)}>
                                                                            <Image src={boardingPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                        </Badge>
                                                                    ))
                                                                :<></>}
                                                                {newBoardingPreviewImages.length > 0 ?
                                                                    newBoardingPreviewImages.map((newBoardingPreviewImage, index) => (
                                                                        <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(newBoardingPreviewImage)}>
                                                                            <Image src={newBoardingPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                        </Badge>
                                                                    ))
                                                                :<></>}
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </>
                                            : <></>}
                                            <Row style={{marginTop:'40px'}}>
                                                <Col>
                                                    <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Update</Button>
                                                    <Backdrop
                                                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                                                        open={backDropOpen}
                                                    >
                                                        <CircularProgress color="inherit" />
                                                    </Backdrop>
                                                </Col>
                                            </Row>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                        </Form>
                    </Fade>
                </Container>
            </div>
        </>
    );
}

export default EditBoardingPage;