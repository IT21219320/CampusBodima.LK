import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Image, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Button, Link, CircularProgress, Box, Tooltip, Checkbox, FormControlLabel, ToggleButton, ToggleButtonGroup, Collapse, IconButton, Alert, Badge, Slider, Modal, Backdrop } from "@mui/material";
import { MuiOtpInput } from 'mui-one-time-password-input'
import { NavigateNext, HelpOutlineRounded, Check, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useRegisterBoardingMutation } from '../slices/boardingsApiSlice';
import { useGenerateSMSOTPMutation, useVerifySMSOTPMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';

import { geoCoding } from '../utils/geoCoding.js'
import { ImageToBase64 } from "../utils/ImageToBase64";

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

const RegisterBoardingPage = () => {

    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const { userInfo } = useSelector((state) => state.auth);
    
    const [noticeStatus, setNoticeStatus] = useState(true);
    const [userLocation, setUserLocation] = useState();
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
    const [phoneNo, setPhoneNo] = useState(userInfo.phoneNo ? userInfo.phoneNo : '');
    const [bankAccNo, setBankAccNo] = useState(userInfo.bankAccNo ? userInfo.bankAccNo : '');
    const [bankAccName, setBankAccName] = useState(userInfo.bankAccName ? userInfo.bankAccName : '');
    const [bankName, setBankName] = useState(userInfo.bankName ? userInfo.bankName : '');
    const [bankBranch, setBankBranch] = useState(userInfo.bankBranch ? userInfo.bankBranch : '');    
    const [modalOpen, setModalOpen] = useState(false);        
    const [backDropOpen, setBackDropOpen] = useState(false);        
    const [otp, setOTP] = useState('');    

    const [generateSMSOTP, {isLoading}] = useGenerateSMSOTPMutation();
    const [verifySMSOTP, {isLoading2}] = useVerifySMSOTPMutation();
    const [registerBoarding, {isLoading3}] = useRegisterBoardingMutation();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const availableFacilities = ["Air Conditioning", "Washing Machine", "Hot Water", "Free Wi-Fi"];

    const roomMarks = [{value: 1, label: '1'}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    const bathMarks = [{value: 0, label: '0'}, {value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        borderRadius: '5px',
        boxShadow: 24,
        p: 4,
        textAlign:'center'
    };

    useEffect(() => {
        setViewUserInfo(true);

        // Check if geolocation is available in the browser
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                // Retrieve the user's latitude and longitude
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Set the user's location in state
                setUserLocation({ lat: userLat, lng: userLng });
                },
                (error) => {
                toast.error('Error getting user location:', error);
                }
            );
        } else {
        toast.error('Geolocation is not available in this browser.');
        }

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

        setBoardingImages([...boardingImages,data]);
    }

    const removeImage = (imageToRemove) => {
        const updatedImages = boardingImages.filter((image) => image !== imageToRemove);
      
        setBoardingImages(updatedImages);
    };

    const handleBoardingTypeChange = (e) => {
        setBoardingType(e.target.value);

        if(e.target.value == 'Hostel' && boardingImages.length > 2){
            while (boardingImages.length > 2) {   
                boardingImages.pop();
            }
        }

    }

    const sliderValueText = (value) => {
        if(value < 11){
            return value;
        }
        else{
            return `10+`
        }
    }

    const sendOTP = async() => {
        const _id = userInfo._id;
        if(phoneNo == null || phoneNo == ''){
            toast.error("Enter Phone Number to Verify")
        } 
        else if(phoneNo.length != 9){
            toast.error("Enter a valid Phone Number")
        }
        else{
            try {
                const res = await generateSMSOTP({ _id, phoneNo }).unwrap();
                toast.success("OTP Sent");
                setModalOpen(true);
            } catch (err) {
                toast.error(err);
            }       
        }
    }

    const verifyOTP = async() => {
        const _id = userInfo._id;
        try {
            const res = await verifySMSOTP({ _id, otp, phoneNo }).unwrap();
            dispatch(setUserInfo({...res})); 
            toast.success('Your phone number is verified!');
            setModalOpen(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
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
        else if(userInfo.phoneNo == '' || userInfo.phoneNo == null){
            toast.error('Please add a phone No');
        }
        else if(boardingType == 'Annex' && noOfAttachBaths == '0' && noOfCommonBaths == '0'){
            toast.error("You should have atleast 1 bathroom")
        }
        else{
            setBackDropOpen(true);
            var res;
                try {

                    if(boardingType == 'Annex'){
                        res = await registerBoarding({ ownerId:userInfo._id, boardingName, address, city, location, facilities, utilityBills: utilityBills=='Yes', food:food=='Yes', gender, boardingType, noOfRooms, noOfCommonBaths, noOfAttachBaths, rent, keyMoney, description, boardingImages, phoneNo, bankAccNo, bankAccName, bankName, bankBranch });
                    }
                    else{
                        res = await registerBoarding({ ownerId:userInfo._id, boardingName, address, city, location, facilities, utilityBills: utilityBills=='Yes', food:food=='Yes', gender, boardingType, boardingImages, phoneNo, bankAccNo, bankAccName, bankName, bankBranch });
                    }

                    if(res.error){
                        toast.error(res.error.data.message);
                        setBackDropOpen(false);
                    }
                    else{
                        toast.success('Boarding Registered Successfully!')
                        dispatch(setUserInfo({...res.data.owner}));

                        if(boardingType == 'Annex'){
                            navigate('/owner/boardings/');
                        }
                        else{
                            const boardingId = res.data.boarding._id;
                            navigate(`/owner/boardings/${boardingId}/${boardingName}/rooms/add`);
                        }

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
                                <Typography key="4" color="text.primary">Add</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Collapse in={noticeStatus}>
                        <Alert
                            action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                            sx={{ mt: 2, bgcolor:'rgb(177 232 255)' }}
                            severity="info"
                        >
                            <strong>Info</strong> -  You only need to complete this form once, so take your time, relax, and complete it at your convenience.
                        </Alert>
                    </Collapse>
                    <Fade in={viewUserInfo} >
                        <Form onSubmit={submitHandler}>
                            <Row className='mt-4'>
                                <Col className="mb-1">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px', textAlign:'center'}}>
                                            <h4 style={{margin:0}}><b>Register Boarding</b></h4>
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
                                                            <LoadScript googleMapsApiKey={GOOGLE_API_KEY}>
                                                                <GoogleMap
                                                                    mapContainerStyle={{ width: '95%', height: '300px', boxShadow:'#000000a1 0px 0px 6px -1px', borderRadius:'10px' }}
                                                                    center={ userLocation || {lat: 6.914805296158741, lng: 79.97291231369822 } } // Default center SLIIT if user doesnt exist
                                                                    zoom={10}
                                                                    onClick={handleMapClick}
                                                                >
                                                                    {location && <Marker position={location} />}
                                                                </GoogleMap>
                                                            </LoadScript>
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
                                                                        onChange={handleBoardingTypeChange}
                                                                        required
                                                                    >
                                                                        <ToggleButton value="Annex" >Annex</ToggleButton>
                                                                        <ToggleButton value="Hostel" >Hostel</ToggleButton>
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
                                                            <p>({boardingImages.length}/2)</p>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    {boardingImages.length < 2 ?
                                                                        <Form.Group controlId="formFile" className="mb-0">
                                                                            <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                            <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                        </Form.Group>
                                                                    :<></>}
                                                                    {boardingImages.length > 0 ?
                                                                        boardingImages.map((boardingImage, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(boardingImage)}>
                                                                                <Image src={boardingImage} width={100} height={100} style={{cursor:'auto'}}/>
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
                                                        <p>({boardingImages.length}/5)</p>
                                                    </Col>
                                                    <Col style={{height:'100%'}} xs={12} md={8} lg={10}>
                                                        <Row>
                                                            <Col>
                                                                {boardingImages.length < 5 ?
                                                                    <Form.Group controlId="formFile" className="mb-0">
                                                                        <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                        <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                    </Form.Group>
                                                                :<></>}
                                                                {boardingImages.length > 0 ?
                                                                    boardingImages.map((boardingImage,index) => (
                                                                        <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(boardingImage)}>
                                                                            <Image src={boardingImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                        </Badge>
                                                                    ))
                                                                :<></>}
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </>
                                            : <></>}
                                            <hr />
                                            <Row style={{marginTop:'20px'}}>
                                                <Col>
                                                    <p>
                                                        <b>Bank Details</b>
                                                        <Tooltip title="Enter your bank details so that occupants can make monthly payments" placement="top" arrow>
                                                            <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                        </Tooltip>
                                                    </p>
                                                </Col>
                                            </Row>
                                            <Row style={{marginBottom:'10px'}}>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Bank Account No.<span style={{color:'red'}}>*</span></Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="number" placeholder="01234565345" value={bankAccNo} onChange={ (e) => setBankAccNo(e.target.value)} required readOnly={userInfo.bankAccNo ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>
                                                                Account Holder Name<span style={{color:'red'}}>*</span> 
                                                            </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="James Bond" value={bankAccName} onChange={ (e) => setBankAccName(e.target.value)} required readOnly={userInfo.bankAccName ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Bank Name<span style={{color:'red'}}>*</span></Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="BOC" value={bankName} onChange={ (e) => setBankName(e.target.value)} required readOnly={userInfo.bankName ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>
                                                                Branch Name<span style={{color:'red'}}>*</span> 
                                                            </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="Gampaha Branch" value={bankBranch} onChange={ (e) => setBankBranch(e.target.value)} required readOnly={userInfo.bankBranch ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <hr />
                                            <Row style={{marginTop:'20px'}}>
                                                <Col>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4} lg={2}>
                                                            <Form.Label style={{margin:0}}>Phone Number<span style={{color:'red'}}>*</span></Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8} ls={10}>
                                                            {userInfo.phoneNo ?
                                                                <InputGroup style={{width:'fit-content'}}>
                                                                    <InputGroup.Text style={{color:'green'}}><Check /></InputGroup.Text>
                                                                    <Form.Control type="text" placeholder="PhoneNo" value={phoneNo} required readOnly style={{width:'fit-content'}}/>
                                                                </InputGroup>
                                                            :
                                                            <InputGroup style={{width:'fit-content'}}>
                                                                <InputGroup.Text>(+94)</InputGroup.Text>
                                                                <Form.Control placeholder="715447792" type="text" maxLength={9} value={phoneNo} onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ''))}/>
                                                                <LoadingButton loading={isLoading} variant="contained" className="ms-2" onClick={sendOTP}>Add</LoadingButton>
                                                            </InputGroup>
                                                            }
                                                            <Modal
                                                                open={modalOpen}
                                                                onClose={() => setModalOpen(false)}
                                                                aria-labelledby="OTP Modal"
                                                                aria-describedby="OTP Modal"
                                                            >
                                                                <Box sx={style}>
                                                                    
                                                                    <h1>OTP Verification</h1>
                                                                    <br />
                                                                    <p className="text-start">The OTP code has being sent to +94{phoneNo}. Please enter the code below to verify.</p>
                                                                    <MuiOtpInput value={otp} length={6} onChange={ (e) => setOTP(e)} />
                                                                    <LoadingButton loading={isLoading2} onClick={ verifyOTP } color="primary" variant="contained" className="mt-3">Verify OTP</LoadingButton>
                                                                    <LoadingButton loading={isLoading} onClick={ sendOTP } color="primary" variant="contained" className="mt-3 ms-3"><Sync /> Resend</LoadingButton>
                                                                    
                                                                </Box>
                                                            </Modal>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row style={{marginTop:'40px'}}>
                                                <Col>
                                                    <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Register Boarding</Button>
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

export default RegisterBoardingPage;