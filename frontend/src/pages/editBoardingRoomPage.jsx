import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Container, Row, Col, Image, InputGroup } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Button, Link, CircularProgress, Tooltip, Collapse, IconButton, Alert, Badge, Slider, Backdrop } from "@mui/material";
import { NavigateNext, HelpOutlineRounded, Close, AddPhotoAlternate } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useGetRoomByIdMutation, useUpdateRoomMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';

import { ImageToBase64 } from "../utils/ImageToBase64";
import storage from "../utils/firebaseConfig";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';

const EditBoardingRoomPage = () => {

    const { userInfo } = useSelector((state) => state.auth);
    const { boardingId, boardingName, roomId } = useParams();
    
    const [viewUserInfo, setViewUserInfo] = useState();
    const [roomNo, setRoomNo] = useState('');
    const [noOfBeds, setNoOfBeds] = useState(1);
    const [noOfCommonBaths, setNoOfCommonBaths] = useState(0);
    const [noOfAttachBaths, setNoOfAttachBaths] = useState(0);
    const [rent, setRent] = useState('');
    const [keyMoney, setKeyMoney] = useState(0);
    const [description, setDescription] = useState('');
    const [roomImages, setRoomImages] = useState([]);
    const [roomImagesToDelete, setRoomImagesToDelete] = useState([]);
    const [roomPreviewImages, setRoomPreviewImages] = useState([]);
    const [newRoomImages, setNewRoomImages] = useState([]);
    const [newRoomPreviewImages, setNewRoomPreviewImages] = useState([]);
    const [backDropOpen, setBackDropOpen] = useState(false);  

    const [getRoom, {isLoading}] = useGetRoomByIdMutation();
    const [updateRoom] = useUpdateRoomMutation();

    const navigate = useNavigate();

    const roomMarks = [{value: 1, label: '1'}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    const bathMarks = [{value: 0, label: '0'}, {value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}, {value: 8}, {value: 9}, {value: 10}, {value: 11, label: '10+'}]
    
    const loadData = async() => {
        setBackDropOpen(true);

        try {
            const res = await getRoom(roomId).unwrap();;
            console.log(res);
            setRoomNo(res.room.roomNo);
            setRent(res.room.rent);
            setDescription(res.room.description)
            setKeyMoney(res.room.keyMoney);
            setNoOfAttachBaths(parseInt(res.room.noOfAttachBaths));
            setNoOfCommonBaths(parseInt(res.room.noOfCommonBaths));
            setNoOfBeds(parseInt(res.room.noOfBeds));
            setRoomImages(res.room.roomImages);
            setBackDropOpen(false);


            const updatedImages = await Promise.all(res.room.roomImages.map(async (image, index) => {
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
                setRoomPreviewImages(imageUrl);
            })
            .catch((error) => {
                console.error('Error updating image URLs:', error);
                // Handle the error as needed
            });


        } catch (err) {
            setBackDropOpen(false);
            toast.error(err.data?.message || err.error);
            navigate(`/owner/boardings/${boardingId}/rooms`);
        }

    }

    useEffect(() => {
        loadData()
        setViewUserInfo(true);
    },[]);

    const previewImage = async(e) => {
        const data = await ImageToBase64(e.target.files[0]);

        setNewRoomImages([...newRoomImages,e.target.files[0]]);
        setNewRoomPreviewImages([...newRoomPreviewImages,data]);
    }

    const removeOldImage = async(imageToRemove) => {
        // Find the index of the item to remove in boardingImages
        const indexToRemove = roomPreviewImages.indexOf(imageToRemove);
        
        if (indexToRemove !== -1) {
            // Create a copy of the arrays with the item removed
            const updatedPreviewImages = [...roomPreviewImages];
            const updatedImages = [...roomImages];
            const updatedImagesToDelete = [...roomImagesToDelete];

            updatedImagesToDelete.push(updatedImages[indexToRemove]);
            updatedPreviewImages.splice(indexToRemove, 1);
            updatedImages.splice(indexToRemove, 1);

            // Update the state with the updated arrays
            setRoomPreviewImages(updatedPreviewImages);
            setRoomImages(updatedImages);
            setRoomImagesToDelete(updatedImagesToDelete);

        }
        
    };
    
    const removeImage = (imageToRemove) => {
        // Find the index of the item to remove in boardingImages
        const indexToRemove = newRoomPreviewImages.indexOf(imageToRemove);

        if (indexToRemove !== -1) {
            // Create a copy of the arrays with the item removed
            const updatedPreviewImages = [...newRoomPreviewImages];
            const updatedImages = [...newRoomImages];

            updatedPreviewImages.splice(indexToRemove, 1);
            updatedImages.splice(indexToRemove, 1);

            // Update the state with the updated arrays
            setNewRoomPreviewImages(updatedPreviewImages);
            setNewRoomImages(updatedImages);
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
        else if((roomImages.length+newRoomImages.length) < 1){
            toast.error('Please add atleast 1 image to proceed');
        }
        else{
            setBackDropOpen(true);
            
            var fileRef;

            try {

                for(let i = 0; i < roomImagesToDelete.length; i++){
                    fileRef = ref(storage,roomImagesToDelete[i]);
    
                    try {
                        await deleteObject(fileRef);
                    } catch (err) {
                        console.log(err); 
                        toast.error(err);
                    }
                }

                let finalRoomImages = roomImages;
                if(newRoomImages.length > 0){
                    const uploadPromises = newRoomImages.map(async (roomImage) => {
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

                    finalRoomImages = roomImages.concat(validImageNames)
                }

                const res = await updateRoom({ roomId, roomNo, roomImages:finalRoomImages, noOfBeds, noOfCommonBaths, noOfAttachBaths, rent, keyMoney, description }).unwrap();

                
                toast.success("Room updated successfully!")
                navigate(`/owner/boardings/${boardingId}/rooms/${roomId}/occupants`)

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
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/owner/boardings">Boardings</Link>,
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}/rooms`}>{boardingName}</Link>,
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}/rooms`}>Rooms</Link>,
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}/rooms/${roomId}`}>Room {roomNo}</Link>,
                                <Typography key="6" color="text.primary">Edit</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    <Fade in={viewUserInfo} >
                        <Form onSubmit={submitHandler}>
                            <Row className='mt-4'>
                                <Col className="mb-1">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px', textAlign:'center'}}>
                                            <h4 style={{margin:0}}><b>Edit Room</b></h4>
                                        </CardContent>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Col className="mb-3">
                                    <Card className={CreateBoardingStyles.card}>
                                        <CardContent style={{padding:'25px'}}>
                                            <Row>
                                                <Col><p><b>Edit Room</b></p></Col>
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
                                                            <Form.Control type="number" placeholder="1" min={1} value={roomNo} disabled required style={{width:'95%'}}/>
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
                                                                max={11} 
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
                                                    <p>({roomImages.length+newRoomImages.length}/5)</p>
                                                </Col>
                                                <Col style={{height:'100%'}} xs={12} md={8} lg={10}>
                                                    <Row>
                                                        <Col>
                                                            {roomImages.length+newRoomImages.length < 5 ?
                                                                <Form.Group controlId="formFile" className="mb-0">
                                                                    <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}><AddPhotoAlternate/> Add a photo</Form.Label>
                                                                    <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                                                </Form.Group>
                                                            :<></>}
                                                            
                                                            {roomPreviewImages.length > 0 ?
                                                                roomPreviewImages.map((roomPreviewImage, index) => (
                                                                    <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeOldImage(roomPreviewImage)}>
                                                                        <Image src={roomPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                    </Badge>
                                                                ))
                                                            :<></>}
                                                            {newRoomPreviewImages.length > 0 ?
                                                                newRoomPreviewImages.map((newRoomPreviewImage, index) => (
                                                                    <Badge key={index} color="error" badgeContent={<Close style={{fontSize:'xx-small'}}/>} style={{cursor: 'pointer', marginRight:'10px', marginBottom:'10px'}} onClick={() => removeImage(newRoomPreviewImage)}>
                                                                        <Image src={newRoomPreviewImage} width={100} height={100} style={{cursor:'auto'}}/>
                                                                    </Badge>
                                                                ))
                                                            :<></>}
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
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

export default EditBoardingRoomPage;