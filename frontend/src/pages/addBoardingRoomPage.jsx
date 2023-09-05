import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Container, Row, Col, Image, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Button, Link, CircularProgress, Box, Tooltip, Checkbox, FormControlLabel, ToggleButton, ToggleButtonGroup, Collapse, IconButton, Alert, Badge, Slider, Modal, Backdrop } from "@mui/material";
import { MuiOtpInput } from 'mui-one-time-password-input'
import { NavigateNext, HelpOutlineRounded, Close, AddPhotoAlternate, Sync } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { setUserInfo } from "../slices/authSlice";
import { useAddRoomMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import LoadingButton from '@mui/lab/LoadingButton';

import { ImageToBase64 } from "../utils/ImageToBase64";

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

const AddBoardingRoomPage = () => {

    const { userInfo } = useSelector((state) => state.auth);
    const { boardingId, boardingName } = useParams();
    
    const [noticeStatus, setNoticeStatus] = useState(true);
    const [viewUserInfo, setViewUserInfo] = useState();
    const [noOfRooms, setNoOfRooms] = useState(1);
    const [noOfCommonBaths, setNoOfCommonBaths] = useState(0);
    const [noOfAttachBaths, setNoOfAttachBaths] = useState(0);
    const [rent, setRent] = useState('');
    const [keyMoney, setKeyMoney] = useState(0);
    const [description, setDescription] = useState('');
    const [roomImages, setRoomImages] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);        
    const [backDropOpen, setBackDropOpen] = useState(false);  

    const [addRoom, {isLoading}] = useAddRoomMutation();

    const navigate = useNavigate();

    const roomMarks = [{value: 1, label: '1'}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    const bathMarks = [{value: 0, label: '0'}, {value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    

    useEffect(() => {
        setViewUserInfo(true);
    },[]);

    const previewImage = async(e) => {
        const data = await ImageToBase64(e.target.files[0]);

        setRoomImages([...roomImages,data]);

        console.log(roomImages);
    }

    const removeImage = (imageToRemove) => {
        const updatedImages = roomImages.filter((image) => image !== imageToRemove);
      
        setRoomImages(updatedImages);
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
        if(boardingImages.length < 1){
            toast.error('Please add atleast 1 image to proceed');
        }
        else{
            setBackDropOpen(true);
                try {
                    
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
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}`}>{boardingName}</Link>,
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}/rooms`}>Rooms</Link>,
                                <Typography key="6" color="text.primary">Add</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Collapse in={noticeStatus}>
                        <Alert
                            action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                            sx={{ mt: 2, bgcolor:'rgb(177 232 255)' }}
                            severity="info"
                        >
                            <strong>Info</strong> -  One last Step to complete and your boarding will be all good to go
                        </Alert>
                    </Collapse>
                    <Fade in={viewUserInfo} >
                        <Form onSubmit={submitHandler}>
                            <Row className='mt-4'>
                                <Col className="mb-1">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px', textAlign:'center'}}>
                                            <h4 style={{margin:0}}><b>Add Room</b></h4>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col className="mb-3">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px'}}>
                                            <Row>
                                                <Col><p><b>New Room</b></p></Col>
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
                                                            <Form.Control type="text" placeholder="143/A, New Kandy Rd, Malabe" value={''} onChange={ (e) => setAddress(e.target.value)} required style={{width:'95%'}}/>
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
                                                            <Form.Control type="text" placeholder="Malabe" value={'city'} onChange={ (e) => setCity(e.target.value)} readOnly required style={{width:'95%'}}/>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
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
                                                                        color={'utilityBills'==="Yes" ? "success" : "error"}
                                                                        value={'utilityBills'}
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
                                                                        color={'food'==="Yes" ? "success" : "error"}
                                                                        value={'food'}
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
                                                                        value={'gender'}
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
                                                                        value={'boardingType'}
                                                                        exclusive
                                                                        required
                                                                    >
                                                                        <ToggleButton value="Annex" >Annex</ToggleButton>
                                                                        <ToggleButton value="Hostel" >Hostel</ToggleButton>
                                                                    </ToggleButtonGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'20px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Boarding Images<span style={{color:'red'}}>*</span></Form.Label>
                                                            <Tooltip title="Add a few photos of the *outside* of the boarding." placement="top" arrow>
                                                                <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                            </Tooltip>
                                                            <p>({roomImages.length}/2)</p>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Row>
                                                                <Col>
                                                                    {roomImages.length < 2 ?
                                                                        <Form.Group controlId="formFile" className="mb-0">
                                                                            <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                            <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                        </Form.Group>
                                                                    :<></>}
                                                                    {roomImages.length > 0 ?
                                                                        roomImages.map((roomImage, index) => (
                                                                            <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(boardingImage)}>
                                                                                <Image src={roomImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                            </Badge>
                                                                        ))
                                                                    :<></>}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
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
                                                    <p>({roomImages.length}/5)</p>
                                                </Col>
                                                <Col style={{height:'100%'}} xs={12} md={8} lg={10}>
                                                    <Row>
                                                        <Col>
                                                            {roomImages.length < 5 ?
                                                                <Form.Group controlId="formFile" className="mb-0">
                                                                    <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                    <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                </Form.Group>
                                                            :<></>}
                                                            {roomImages.length > 0 ?
                                                                roomImages.map((roomImage,index) => (
                                                                    <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(boardingImage)}>
                                                                        <Image src={roomImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                    </Badge>
                                                                ))
                                                            :<></>}
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

export default AddBoardingRoomPage;