import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Container, Row, Col, Image, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Button, Link, CircularProgress, Tooltip, Collapse, IconButton, Alert, Badge, Slider, Backdrop } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Close, AddPhotoAlternate } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAddRoomMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';

import { ImageToBase64 } from "../utils/ImageToBase64";
import storage from "../utils/firebaseConfig";
import { ref, uploadBytesResumable } from "firebase/storage";

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

const AddBoardingRoomPage = () => {

    const { userInfo } = useSelector((state) => state.auth);
    const { boardingId, boardingName, roomNo } = useParams();
    
    const [noticeStatus, setNoticeStatus] = useState(true);
    const [viewUserInfo, setViewUserInfo] = useState();
    const [roomID, setRoomID] = useState(roomNo);
    const [noOfBeds, setNoOfBeds] = useState(1);
    const [noOfCommonBaths, setNoOfCommonBaths] = useState(0);
    const [noOfAttachBaths, setNoOfAttachBaths] = useState(0);
    const [rent, setRent] = useState('');
    const [keyMoney, setKeyMoney] = useState(0);
    const [description, setDescription] = useState('');
    const [roomImages, setRoomImages] = useState([]);
    const [roomPreviewImages, setRoomPreviewImages] = useState([]);
    const [backDropOpen, setBackDropOpen] = useState(false);  

    const [addRoom, {isLoading}] = useAddRoomMutation();

    const navigate = useNavigate();

    const roomMarks = [{value: 1, label: '1'}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10, label: '10'}]
    const bathMarks = [{value: 0, label: '0'}, {value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    

    useEffect(() => {
        setViewUserInfo(true);
    },[]);

    const previewImage = async(e) => {
        const data = await ImageToBase64(e.target.files[0]);

        setRoomImages([...roomImages,e.target.files[0]]);
        setRoomPreviewImages([...roomPreviewImages,data]);
    }
    
    const removeImage = (imageToRemove) => {
        // Find the index of the item to remove in roomImages
        const indexToRemove = roomPreviewImages.indexOf(imageToRemove);

        if (indexToRemove !== -1) {
            // Create a copy of the arrays with the item removed
            const updatedPreviewImages = [...roomPreviewImages];
            const updatedImages = [...roomImages];

            updatedPreviewImages.splice(indexToRemove, 1);
            updatedImages.splice(indexToRemove, 1);

            // Update the state with the updated arrays
            setRoomPreviewImages(updatedPreviewImages);
            setRoomImages(updatedImages);
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
    
        if(parseInt(rent) <= 0){
            toast.error("Please enter a valid rent amount")
        }
        else if(noOfAttachBaths == '0' && noOfCommonBaths == '0'){
            toast.error("You should have atleast 1 bathroom")
        }
        else if(roomImages.length < 1){
            toast.error('Please add atleast 1 image to proceed');
        }
        else{
            setBackDropOpen(true);
            const uploadPromises = roomImages.map(async (roomImage) => {
                const file = roomImage;
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
            
            try {
                

                const res = await addRoom({ roomNo:roomID, boardingId, roomImages:validImageNames, noOfBeds, noOfCommonBaths, noOfAttachBaths, rent, keyMoney, description }).unwrap();
                
                toast.success("Room added successfully!")
                navigate(`/owner/boardings/${boardingId}/rooms`)

            } catch (err) {
                setBackDropOpen(false);
                console.log(err);
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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/owner/boardings">Boardings</Link>,
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}/rooms`}>{boardingName}</Link>,
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
                                    <Card className={`${CreateBoardingStyles.card} ${CreateBoardingStyles.cardHeading}`}>
                                        <CardContent style={{padding:'18px', textAlign:'center'}}>
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
                                                            <Form.Control type="text" placeholder="Boarding Name" value={boardingName} disabled style={{width:'95%'}}/>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'15px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Room No<span style={{color:'red'}}>*</span> </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="number" placeholder="1" min={1} value={roomID} onChange={(e) => setRoomID(e.target.value)} required style={{width:'95%'}}/>
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'15px'}}>
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
                                                    <Row style={{marginTop:'15px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Key Money</Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <InputGroup style={{width:'95%'}}>
                                                                <Form.Control type="number" min={0} max={12} value={keyMoney} onChange={(e) => setKeyMoney(e.target.value)} required />
                                                                <InputGroup.Text>Month{keyMoney>1 ? 's' : ''}</InputGroup.Text>
                                                            </InputGroup>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>
                                                                Beds 
                                                            </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Slider 
                                                                value={noOfBeds=='10+' ? 11 : noOfBeds} 
                                                                valueLabelDisplay={noOfBeds > 1 ? 'on' : "auto"} 
                                                                step={1} 
                                                                min={1} 
                                                                max={10} 
                                                                marks={roomMarks}
                                                                style={{width:'95%'}}
                                                                valueLabelFormat={sliderValueText} 
                                                                onChange={(e) => { e.target.value < 11 ? setNoOfBeds(e.target.value) : setNoOfBeds('10+')}}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row  style={{marginTop:'20px'}}>
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
                                                    <Row style={{marginTop:'20px'}}>
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
                                            </Row>
                                            <Row style={{marginTop:'10px'}}>
                                                <Col style={{height:'100%'}} xs={12} md={2}>
                                                    <Form.Label style={{margin:0}}>Description<span style={{color:'red'}}>*</span></Form.Label>
                                                    <p>{description.length}/5000</p>
                                                </Col>
                                                <Col style={{height:'100%'}} xs={12} md={10}>
                                                    <InputGroup style={{width:'98%'}}>
                                                        <Form.Control as="textarea" rows={3} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} required />
                                                    </InputGroup>
                                                </Col>
                                            </Row>
                                            <hr />
                                            <Row style={{marginTop:'20px'}}>
                                                <Col style={{height:'100%'}} xs={12} md={4} lg={2}>
                                                    <Form.Label style={{margin:0}}>Room Images<span style={{color:'red'}}>*</span></Form.Label>
                                                    <Tooltip title="Add up to a maximum of 5 photos of the Annex." placement="top" arrow>
                                                        <HelpOutlineRounded style={{color:'#707676', fontSize:'large'}} />
                                                    </Tooltip>
                                                    <p>({roomImages.length}/5)</p>
                                                </Col>
                                                <Col style={{height:'100%'}} xs={12} md={8} lg={10}>
                                                    <Row>
                                                        <Col>
                                                            {roomPreviewImages.length < 5 ?
                                                                <Form.Group controlId="formFile" className="mb-0">
                                                                    <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                    <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                </Form.Group>
                                                            :<></>}
                                                            {roomPreviewImages.length > 0 ?
                                                                roomPreviewImages.map((roomPreviewImage,index) => (
                                                                    <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(roomPreviewImage)}>
                                                                        <Image src={roomPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                    </Badge>
                                                                ))
                                                            :<></>}
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row style={{marginTop:'40px'}}>
                                                <Col>
                                                    <Button type="submit" className={CreateBoardingStyles.submitBtn} variant="contained">Finish</Button>
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