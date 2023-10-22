import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Carousel, Tabs, Tab, } from 'react-bootstrap';
import { Button as MuiButton, Typography, Fade, Card, CardContent, Link, CircularProgress, Dialog, DialogContent, Skeleton, useMediaQuery, Tooltip, Switch, DialogTitle, DialogActions, Collapse, Alert, IconButton, Avatar } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext, MeetingRoom, Warning, Close, Call } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useDeleteBoardingMutation, useGetBoardingByIdMutation, useUpdateVisibilityMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { StringToAvatar } from "../utils/StringToAvatar";
import { ref, getDownloadURL } from "firebase/storage";
import storage from "../utils/firebaseConfig";


import Sidebar from '../components/sideBar';
import Header from '../components/header'

import ownerStyles from '../styles/ownerStyles.module.css';
import searchStyles from '../styles/searchStyles.module.css';
import viewBoardingStyles from '../styles/viewBoardingStyles.module.css';
import '../styles/overrideCss.css';

import defaultImage from '/images/defaultImage.png';
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import FeedbackBoarding from "../components/feedbackBoardingComponent";

const ViewBoarding = () => {
    const theme = useTheme();

    const [viewUserInfo, setViewUserInfo] = useState();
    const [boarding, setBoarding] = useState('');
    const [imgLoading, setImgLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [imagePreview, setImagePreview] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

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

            let boardingOccupantCount = 0
            let boardingBedCount = 0
            for(let i = 0; i < res.boarding.room.length; i++){
                boardingBedCount += res.boarding.room[i].noOfBeds;
            }
            for(let i = 0; i < res.boarding.room.length; i++){
                boardingOccupantCount += res.boarding.room[i].occupant.length;
            }

            if((res.boarding.boardingType=="Annex" && res.boarding.occupant) || (res.boarding.boardingType=="Hostel" && boardingOccupantCount==boardingBedCount)){
                toast.error("Boarding is full")
                navigate('/search')
            }

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
            <div className={searchStyles.mainDiv}>
                <Header />
                <Container className={searchStyles.container}>    
                    <Row>
                        <Col className="mb-3 mt-4" xs={12} md={12}>
                            {(isLoading || !boarding || loading) ? <div style={{width:'100%',height:'80vh',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                            <Row>
                                <Col>
                                    <Row>
                                        <Col>
                                            <Row>
                                                <Col>
                                                    <h2>{boarding.boardingName.toUpperCase()}</h2>
                                                    <p style={{ color: 'dimgray' }}>
                                                        Posted on {new Date(boarding.updatedAt).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}, {boarding.city}, {boarding.boardingType}
                                                    </p>
                                                </Col>
                                            </Row>
                                            <Row style={{width:'100%'}}>
                                                <Col xs={12} lg={9} style={{paddingBottom:'20px'}}>
                                                    {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='500px'/> :
                                                    <Carousel controls={true} className={ownerStyles.carousel}> {/*onClick={() => setImagePreview(largeScreen)} style={largeScreen? {cursor:'pointer'} : {cursor:'auto'}}*/}
                                                        {boarding.boardingImages.map((image, index) => (
                                                            <Carousel.Item key={index}>
                                                                {Math.abs(activeImage - index) <= 2 ? (
                                                                    <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} width='100%' height='500px' style={{objectFit:'contain'}}/>
                                                                ) : null}
                                                            </Carousel.Item>
                                                        ))}
                                                    </Carousel>
                                                    }
                                                </Col>
                                                <Col xs={12} lg={3} style={{paddingBottom:'20px'}}>
                                                    <Row>
                                                        <Col>
                                                            <Card>
                                                                <CardContent>
                                                                    <Row>
                                                                        <Col style={{display: 'flex',flexWrap: 'wrap', marginLeft:'10px'}}>  
                                                                            <div style={{paddingRight:'10px'}}>
                                                                            { boarding.owner.image ? 
                                                                                    <Image alt={boarding.owner.firstName+" "+boarding.owner.lastName} src={boarding.owner.image} style={{ width: 50, height: 50, cursor:'pointer', borderRadius:'3px' }} /> 
                                                                                : 
                                                                                <Typography component="div">
                                                                                    <Avatar alt={boarding.owner.firstName+" "+boarding.owner.lastName} {...StringToAvatar(boarding.owner.firstName+" "+boarding.owner.lastName)} style={{ width: 50, height: 50, fontSize: 20, cursor:'pointer', borderRadius:'3px' }} />
                                                                                </Typography> 
                                                                            }
                                                                            </div>
                                                                            <div style={{textAlign:'left'}}>
                                                                                <b>
                                                                                    <span style={{textWrap:'nowrap'}}>{boarding.owner.firstName+" "+boarding.owner.lastName}</span>
                                                                                    <br />
                                                                                    <span style={{fontSize:13}}>Member Since {new Date(boarding.owner.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                                                                                </b>
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                    <hr />
                                                                    <Row>
                                                                        <Col lg={2} xs={1} style={{marginLeft:'10px'}}>
                                                                            <Call style={{background:'#0172bd', borderRadius:'50%', padding:'5px', fontSize:'30px', color:'white'}}/>
                                                                        </Col>
                                                                        <Col>
                                                                            <b>Contact Owner</b><br />
                                                                            0{boarding.owner.phoneNo}
                                                                        </Col>
                                                                    </Row>
                                                                </CardContent>
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>                    
                                                            <Card style={{marginTop:'25px', height:'300px'}}>
                                                                <CardContent style={{height:'100%'}}>
                                                                    {boarding.location.lat && boarding.location.lng ? 
                                                                    <iframe
                                                                        width={'100%'}
                                                                        height='100%'
                                                                        style={{border:0}}
                                                                        referrerPolicy="no-referrer-when-downgrade"
                                                                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${boarding.location.lat},${boarding.location.lng}`}
                                                                        allowFullScreen>
                                                                    </iframe>
                                                                    : 'Location Details Not Available'
                                                                    }
                                                                </CardContent>
                                                            </Card>             
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            {boarding.boardingType == 'Annex' ? 
                                            <Row>
                                                <Col>
                                                    <h3 style={{color:'rgb(0, 177, 92)'}}><b> Rs {boarding.rent} /Month</b></h3>
                                                </Col>
                                            </Row>
                                            :''}
                                            <Row style={{marginTop:'30px'}}>
                                                <Col>
                                                    <p className={ownerStyles.paras}><b>Address:</b> {boarding.address}</p>
                                                    <p className={ownerStyles.paras}><b>Rooms:</b> {boarding.boardingType=='Annex' ? boarding.noOfRooms : boarding.room.length}</p>
                                                    {boarding.boardingType=='Annex' ? 
                                                        <p className={ownerStyles.paras}><b>Baths:</b> {parseInt(boarding.noOfCommonBaths)+parseInt(boarding.noOfAttachBaths)}</p> 
                                                    : ''}
                                                    <p className={ownerStyles.paras}><b>Gender:</b> {boarding.gender}</p>
                                                    {boarding.boardingType=='Annex' ? 
                                                    <   p className={ownerStyles.paras}><b>Key Money:</b> {boarding.keyMoney} Months</p>
                                                    : ''}
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
                                                <Col style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                    {boarding.boardingType=="Annex" && !boarding.occupant? 
                                                        <MuiButton style={{padding:'10px 20px'}} variant="contained" onClick={() => navigate(`/occupant/reservations/reserve/${boarding._id}`)}>Book Now</MuiButton>
                                                    : ''}
                                                </Col>
                                            </Row>
                                            {boarding.boardingType=="Annex" && !boarding.occupant? 
                                            <Row style={{marginTop:'10px'}}>
                                                <Col>
                                                    <p className={ownerStyles.paras}><b>Description</b></p>
                                                    <pre>{boarding.description}</pre>
                                                </Col>
                                            </Row>
                                            : ''}
                                        </Col>
                                    </Row>
                                    {boarding.boardingType == "Hostel" ?
                                    <Row style={{minHeight:'calc(100vh - 240px)'}}>
                                        <Col className="mt-4 mb-0">
                                            <h3>Rooms</h3>
                                            <div style={{display:'flex', flexWrap:'wrap', flexDirection:'row'}}>
                                            {boarding.room.length > 0 ? 
                                                boarding.room.some(room => room.status == "Approved") ?
                                                    boarding.room.map((room, index) => (
                                                        room.status=="Approved" ?
                                                            <Card key={index} className={`${viewBoardingStyles.card} ${room.noOfBeds == room.occupant.length? viewBoardingStyles.full : (room.visibility == false ? viewBoardingStyles.unavailable : '') } m-4`}>
                                                                <CardContent className={`${ownerStyles.cardContent} ${room.noOfBeds == room.occupant.length || room.visibility == false ? viewBoardingStyles.blur : '' }`}>
                                                                    {console.log(room.noOfBeds == room.occupant.length)}
                                                                    <Row>
                                                                        <Col style={{paddingBottom:'20px', width:'300px'}}>
                                                                            {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='200px'/> :
                                                                            <Carousel controls={false} className={ownerStyles.carousel} onClick={() => {setImagePreview(largeScreen);setPreviewImages({images:room.roomImages,description:room.description})}} style={largeScreen? {cursor:'pointer'} : {cursor:'auto'}}>
                                                                                {room.roomImages.map((image, index) => (
                                                                                    <Carousel.Item key={index}>
                                                                                        {Math.abs(activeImage - index) <= 2 ? (
                                                                                            <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} width='300px' height='200px' style={{objectFit:'contain'}}/>
                                                                                        ) : null}
                                                                                    </Carousel.Item>
                                                                                ))}
                                                                            </Carousel>
                                                                            }
                                                                        </Col>
                                                                    </Row>
                                                                    <Row style={{width:'100%'}}>
                                                                        <Col>
                                                                            <Row>
                                                                                <Col>
                                                                                    <h4 style={{color:'rgb(0, 177, 92)'}}><b> Rs {room.rent} /Month</b></h4>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col lg={5}>
                                                                                    <p className={ownerStyles.paras}><b>Beds:</b> {room.noOfBeds}</p>
                                                                                </Col>
                                                                                <Col lg={5}>
                                                                                    <p className={ownerStyles.paras}><b>Baths:</b> {parseInt(room.noOfAttachBaths)+parseInt(room.noOfCommonBaths)}</p>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col>
                                                                                    <p className={ownerStyles.paras}><b>Occpants:</b> {room.occupant.length}/{room.noOfBeds}</p>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col>
                                                                                    <p className={ownerStyles.paras}><b>Key Money:</b> &nbsp;&nbsp;{room.keyMoney} Months</p>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col style={{textAlign:'center'}}>
                                                                                    {room.occupant.length < room.noOfBeds && room.visibility == true ? 
                                                                                        <MuiButton variant="contained" onClick={() => navigate(`/occupant/reservations/reserve/${boarding._id}/${room._id}`)}>Book Now</MuiButton>
                                                                                    : ''}
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
                                                    <h2>No rooms available!</h2>
                                                </div>
                                            }
                                            </div>
                                        </Col>
                                    </Row>
                                    : ''}
                                    <Row style={{width:'100%'}}>
                                        <Col className={`mt-3 `}>
                                            <FeedbackBoarding boardingId={boardingId} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            }
                        </Col>
                    </Row>
                </Container>
                
                <Dialog open={imagePreview} onClose={() => setImagePreview(false)} style={{maxHeight:'90vh', maxWidth:'100vw', transform:'scale(1.5)'}}>
                    <DialogContent>
                        <Carousel fade interval={10000} style={{borderRadius:'10px', width:'75vh'}}>
                            {previewImages.images?.map((image, index) => (
                                <Carousel.Item key={index}>
                                        <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} style={{height:'50vh', objectFit:'contain', background:'black'}}/>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </DialogContent>
                </Dialog>
            </div>
        </> 
    )
};

export default ViewBoarding;