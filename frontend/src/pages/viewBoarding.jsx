import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Carousel, Tabs, Tab, } from 'react-bootstrap';
import { Button as MuiButton, Typography, Fade, Card, CardContent, Link, CircularProgress, Dialog, DialogContent, Skeleton, useMediaQuery, Tooltip, Switch, DialogTitle, DialogActions, Collapse, Alert, IconButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext, MeetingRoom, Warning, Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useDeleteBoardingMutation, useGetBoardingByIdMutation, useUpdateVisibilityMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { ref, getDownloadURL } from "firebase/storage";
import storage from "../utils/firebaseConfig";

import Sidebar from '../components/sideBar';
import Header from '../components/header'

import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import '../styles/overrideCss.css';

import defaultImage from '/images/defaultImage.png';
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";

const ViewBoarding = () => {
    const theme = useTheme();

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [viewUserInfo, setViewUserInfo] = useState();
    const [boarding, setBoarding] = useState('');
    const [imgLoading, setImgLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [imagePreview, setImagePreview] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [tempDeleteId, setTempDeleteId] = useState('');

    const {boardingId} = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [getOwnerBoardingsById, {isLoading}] = useGetBoardingByIdMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            setImgLoading(true);
            const res = await getOwnerBoardingsById( boardingId ).unwrap();

            // Create an array of promises for image retrieval
                const updatedImages = res.boarding.boardingImages.map(async (image, index) => {
                    try {
                        const imageUrl = await getDownloadURL(ref(storage, image));
                        
                        // Update the URL for the image in the boardingImages array
                        return imageUrl;
                    } catch (error) {
                        console.log('Error retrieving image URL:', error);
                        setImgLoading(false);
                        // Handle the error as needed
                        return null; // or a default value if there's an error
                    }
                });
                // Create a new object with the updated boardingImages property
  
            // Wait for all image retrieval promises to complete
            Promise.all(updatedImages)
                .then((imageUrl) => {
                    const updatedBoarding = { ...res.boarding, boardingImages: imageUrl };

                    const roomImagePromises = updatedBoarding.room.map(async (room, index) => {
                        const updatedRoomImages = await Promise.all(room.roomImages.map(async (image, index) => {
                            try {
                                const roomImageUrl = await getDownloadURL(ref(storage, room.roomImages[0]));
                                return roomImageUrl;
                            } catch (error) {
                                console.log('Error retrieving image URL:', error);
                                // Handle the error as needed
                                return null; // or a default value if there's an error
                            }
                        }))
                        const updatedRoom = { ...room, roomImages: updatedRoomImages };
                        return updatedRoom;
                    })

                    Promise.all(roomImagePromises)
                        .then((updatedRoom) => {
                            const updatedRoomNBoarding = { ...updatedBoarding, room: updatedRoom };
                            console.log({...updatedRoomNBoarding});
                            setBoarding(updatedRoomNBoarding);
                            setImgLoading(false);
                        })

                })
                .catch((error) => {
                    console.log('Error updating image URLs:', error); 
                    setImgLoading(false); 
                    // Handle the error as needed
                });

                

            
        } catch (err) {
            toast.error(err.data?.message || err.error);
            navigate('/search')
        }
    }

    useEffect(() => {
        setViewUserInfo(true);
        loadData();     
    },[]);

    return (
        <>
            <div className={dashboardStyles.mainDiv}>
                <Header />
                <Container className={dashboardStyles.container}>
                            
                    <Fade in={viewUserInfo} >
                        <Row className='mt-4'>
                            <Col className="mb-3" xs={12} md={12}>
                                {(isLoading || !boarding || loading) ? <div style={{width:'100%',height:'80vh',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Row style={{height:'100%', width:'100%'}}>
                                                    <Col xs={12} lg={4}>
                                                        {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='100%' /> :
                                                        <Carousel controls={false} onClick={() => setImagePreview(largeScreen)} style={largeScreen? {cursor:'pointer'} : {cursor:'auto'}} className={ownerStyles.carousel}>
                                                            {boarding.boardingImages.map((image, index) => (
                                                                <Carousel.Item key={index}>
                                                                    {Math.abs(activeImage - index) <= 2 ? (
                                                                        <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} height='250px' width='100%'/>
                                                                    ) : null}
                                                                </Carousel.Item>
                                                            ))}
                                                        </Carousel>
                                                        }
                                                        <Dialog open={imagePreview} onClose={() => setImagePreview(false)} style={{maxHeight:'90vh', maxWidth:'100vw', transform:'scale(1.5)'}}>
                                                            <DialogContent>
                                                                <Carousel fade interval={10000} style={{borderRadius:'10px'}}>
                                                                    {boarding.boardingImages.map((image, index) => (
                                                                        <Carousel.Item key={index}>
                                                                            {Math.abs(activeImage - index) <= 2 ? (
                                                                                <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} style={{height:'50vh', objectFit:'contain', background:'black'}}/>
                                                                            ) : null}
                                                                        </Carousel.Item>
                                                                    ))}
                                                                </Carousel>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </Col>
                                                    <Col lg={8}>
                                                        <Row>
                                                            <Col>
                                                                <h2>{boarding.boardingName.toUpperCase()}</h2>
                                                                <p style={{color: 'dimgray'}}>{boarding.city}, {boarding.boardingType}</p>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <p className={ownerStyles.paras}><b>Address:</b> {boarding.address}</p>
                                                                <p className={ownerStyles.paras}><b>Rooms:</b> {boarding.boardingType=='Annex' ? boarding.noOfRooms : boarding.room.length}</p>
                                                                {boarding.boardingType=='Annex' ? 
                                                                    <p className={ownerStyles.paras}><b>Baths:</b> {parseInt(boarding.noOfCommonBaths)+parseInt(boarding.noOfAttachBaths)}</p> 
                                                                : ''}
                                                                <p className={ownerStyles.paras}><b>Gender:</b> {boarding.gender}</p>
                                                            </Col>
                                                            <Col>
                                                                <p className={ownerStyles.paras}><b>Utility Bills:</b> {boarding.utilityBills ? 'Yes' : 'No'}</p>
                                                                <p className={ownerStyles.paras}><b>Food:</b> {boarding.food ? 'Yes' : 'No'}</p>
                                                                {boarding.facilities.length > 0 ?
                                                                <>
                                                                    <p className={ownerStyles.paras} style={{marginBottom:0}}><b>Facilities</b></p>
                                                                    <ul style={{paddingLeft:'0.5em'}}>
                                                                        {boarding.facilities.map((facility,index) => (
                                                                        <li key={index} style={{color:'dimgray', listStyleType:'none'}} className={ownerStyles.facilities}>{facility}</li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                                :''}
                                                            </Col>
                                                            <Col>
                                                            {boarding.boardingType == 'Annex' ? 
                                                                <>
                                                                    <p className={ownerStyles.paras}><b>Rent:</b> Rs {boarding.rent} /Month</p>
                                                                    {!boarding.occupant ? 
                                                                        <MuiButton variant="contained" onClick={() => navigate(`/occupant/reservations/reserve/${boarding._id}`)}>Book Now</MuiButton>
                                                                    : ''}
                                                                </>
                                                            :''}
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        {boarding.boardingType == "Hostel" ?
                                        <Row style={{minHeight:'calc(100vh - 240px)'}}>
                                            <Col className="mt-4 mb-0">
                                                <h3>Rooms</h3>
                                                {boarding.room.length > 0 ? 
                                                    boarding.room.some(room => room.status == "Approved") ?
                                                        boarding.room.map((room, index) => (
                                                            room.status=="Approved" ? 
                                                                <Card key={index} className={`${ownerStyles.card} mt-4`}>
                                                                    <CardContent className={ownerStyles.cardContent}>
                                                                        <Row style={{height:'100%', width:'100%'}}>
                                                                            <Col style={{height:'100%'}} xs={4}>
                                                                                {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='100%' /> :<Image src={room.roomImages[0] ? room.roomImages[0] : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images}height='100%' width='100%'/> }
                                                                            </Col>
                                                                            <Col lg={8}>
                                                                                <Row>
                                                                                    <Col>
                                                                                        <h2>Room No: {room.roomNo}</h2>
                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col>
                                                                                        <p className={ownerStyles.paras}><b>Beds:</b> {room.noOfBeds}</p>
                                                                                        <p className={ownerStyles.paras}><b>Baths:</b> {parseInt(room.noOfAttachBaths)+parseInt(room.noOfCommonBaths)}</p>
                                                                                    </Col>
                                                                                    <Col>
                                                                                    {boarding.boardingType == 'Hostel' ? 
                                                                                        <>
                                                                                            <p className={ownerStyles.paras}><b>Rent:</b> Rs {room.rent} /Month</p>
                                                                                            <p className={ownerStyles.paras}><b>Key Money:</b> {room.keyMoney} Months</p>
                                                                                            {room.occupant.length < room.noOfBeds ? 
                                                                                                <MuiButton variant="contained" onClick={() => navigate(`/occupant/reservations/reserve/${boarding._id}/${room._id}`)}>Book Now</MuiButton>
                                                                                            : ''}
                                                                                        </>
                                                                                    :''}
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>
                                                                    </CardContent>
                                                                </Card>
                                                            : ''
                                                        ))
                                                    :   
                                                    ''
                                                :
                                                    <div style={{height:'60vh', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>
                                                        <h2>You don't have any registered rooms!</h2>
                                                    </div>
                                                }
                                            </Col>
                                        </Row>
                                        : ''}
                                    </Col>
                                </Row>
                                }
                            </Col>
                        </Row>
                    </Fade>
                </Container>
            </div>
        </> 
    )
};

export default ViewBoarding;