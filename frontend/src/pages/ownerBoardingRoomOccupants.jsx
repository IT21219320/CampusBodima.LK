import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Carousel, Tabs, Tab, Spinner, Modal, Form, } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, CircularProgress, Dialog, DialogContent, Skeleton, useMediaQuery, Tooltip, Switch, DialogTitle, DialogActions, Collapse, Alert, IconButton, Avatar } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { NavigateNext, MeetingRoom, Warning, Close, Email, Phone, HighlightOffRounded } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useAddOccupantMutation, useDeleteBoardingMutation, useDeleteReservationMutation, useDeleteRoomMutation, useGetReservationsByBoardingIdMutation, useGetReservationsByRoomIdMutation, useGetRoomByIdMutation, useUpdateRoomVisibilityMutation, useUpdateVisibilityMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { StringToAvatar } from "../utils/StringToAvatar";
import { ref, getDownloadURL } from "firebase/storage";
import storage from "../utils/firebaseConfig";

import Sidebar from '../components/sideBar';

import ownerStyles from '../styles/ownerStyles.module.css';
import occupantStyles from '../styles/occupantStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import '../styles/overrideCss.css';

import defaultImage from '/images/defaultImage.png';
import { FiEdit } from "react-icons/fi";
import { MdPersonRemoveAlt1 } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { BsPersonFillAdd } from "react-icons/bs";

const OwnerBoardingRoomOccupants = () => {
    const theme = useTheme();

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [viewUserInfo, setViewUserInfo] = useState();
    const [room, setRoom] = useState('');
    const [reservations, setReservations] = useState('');
    const [reservationLoading, setReservationLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [imagePreview, setImagePreview] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [tempDeleteId, setTempDeleteId] = useState('');
    const [reservationConfirmDialog, setReservationConfirmDialog] = useState(false);
    const [tempReservationDeleteId, setTempReservationDeleteId] = useState('');
    const [email, setEmail] = useState('');
    const [showModal, setShowModal] = useState(false);

    const {boardingId, roomId} = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [getOwnerRoomById, {isLoading}] = useGetRoomByIdMutation();
    const [getRoomReservations] = useGetReservationsByRoomIdMutation();
    const [updateRoomVisibility] = useUpdateRoomVisibilityMutation();
    const [addOccpant] = useAddOccupantMutation();
    const [deleteOwnerBoardingRoom] = useDeleteRoomMutation();
    const [deleteOccupantReservation] = useDeleteReservationMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            setImgLoading(true);
            const res = await getOwnerRoomById( roomId ).unwrap();
            console.log(res);
            // Create an array of promises for image retrieval
                const updatedImages = res.room.roomImages.map(async (image, index) => {
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
                    
                    const updatedRoom = { ...res.room, roomImages: imageUrl };
                        
                    setRoom(updatedRoom);
                    setImgLoading(false);

                    /*const roomImagePromises = updatedBoarding.room.map(async (room, index) => {
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
                            
                            setBoarding(updatedRoomNBoarding);
                            setImgLoading(false);
                        })*/
                })
                .catch((error) => {
                    console.log('Error updating image URLs:', error); 
                    setImgLoading(false); 
                    // Handle the error as needed
                });

            try {
                setReservationLoading(true);
                const reservationRes = await getRoomReservations( roomId ).unwrap();
                setReservations(reservationRes.reservations);
                setReservationLoading(false)
            } catch (err) {
                setReservations('');
                setReservationLoading(false)
                toast.info(err.data?.message || err.error);
            }    
                

            
        } catch (err) {
            toast.error(err.data?.message || err.error);
            navigate(`/owner/boardings/${boardingId}/rooms`)
        }
    }

    useEffect(() => {
        setViewUserInfo(true);
        loadData();     
    },[]);

    const toggleRoomVisibility = async(e, id) => {
        e.preventDefault();
        try {
            setLoading(true);

            const res = await updateRoomVisibility({id}).unwrap();

            let updatedroom = room;
            updatedroom = {
                ...updatedroom,
                visibility: !updatedroom.visibility,
            };
            
            toast.success('Room visibility updated successfully!');
            setLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    const handleRoomDialogOpen = (e, id) => {
        e.preventDefault();
        setTempDeleteId(id);
        setConfirmDialog(true);
    }

    const handleRoomDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    }

    const deleteRoom = async() => {
        handleRoomDialogClose();
        try {
            setLoading(true);

            const res = await deleteOwnerBoardingRoom(tempDeleteId).unwrap();

            toast.success('Room Deleted successfully!');
            if(parseInt(res.roomCount) == 0){
                toast.info('Your boarding has being moved to incomplete section!');
            }

            setLoading(false);
            navigate(`/owner/boardings/${boardingId}/rooms`)
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    const editRoom = (e,index) => {
        e.preventDefault();
        const id = room._id;

        if(room.occupant.length > 0){
            toast.error("Cannot update Room while it is occupied");
        }
        else{
            navigate(`/owner/boardings/${boardingId}/${room.boardingId.boardingName}/rooms/${id}/edit`)
        }
    }

    const handleAddOccupant = async(e) => {
        e.preventDefault()
        setShowModal(false);
        setLoading(true);
        if(room.occupant.length == room.noOfBeds){
            toast.error('Room is full!')
        }
        else{
            try {
                const res = await addOccpant({Email:email,BoardingId:boardingId,RoomID:roomId}).unwrap();

                loadData();
                toast.success('Invitation sent successfully')
                setLoading(false);
                setEmail('');
            } catch (err) {
                setEmail('');
                toast.error(err.data?.message || err.error);
                setLoading(false);
            }
        }
    }

    const handleReservationDialogOpen = (e, id) => {
        e.preventDefault();
        setTempReservationDeleteId(id);
        setReservationConfirmDialog(true);
    }

    const handleReservationDialogClose = () => {
        setTempReservationDeleteId('');
        setReservationConfirmDialog(false);
    }

    const deleteReservation = async() => {
        handleReservationDialogClose();
        try {
            setLoading(true);

            const res = await deleteOccupantReservation(tempReservationDeleteId).unwrap();

            toast.success('Occupant Removed successfully!');
            loadData()
            setLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : userInfo.userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Link underline="hover" key="3" color="inherit" href="/owner/boardings/">Boardings</Link>,
                                <Link underline="hover" key="4" color="inherit" href={`/owner/boardings/${boardingId}/rooms`}>{room.boardingId?.boardingName}</Link>,
                                <Typography key="5" color="text.primary">Room {room.roomNo}</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>

                    {room.status != 'Approved' && !loading ? 
                    <Row>
                        <Col>
                            <Collapse in={noticeStatus}>
                                <Alert
                                    action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                                    sx={{ mt: 2, }}
                                    severity="info"
                                >
                                    <><strong>Info</strong> -  Please wait while an admin reviews and approves your Room.</>      
                                </Alert>
                            </Collapse>
                        </Col>
                    </Row>
                    : ''}
                            
                    <Fade in={viewUserInfo} >
                        <Row className='mt-4'>
                            <Col className="mb-3" xs={12} md={12}>
                                {(isLoading || !room || loading) ? <div style={{width:'100%',height:'80vh',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Row style={{height:'100%', width:'100%'}}>
                                                    <Col xs={12} lg={4}>
                                                        {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='100%' /> :
                                                        <Carousel controls={false} onClick={() => setImagePreview(largeScreen)} style={largeScreen? {cursor:'pointer'} : {cursor:'auto'}} className={ownerStyles.carousel}>
                                                            {room.roomImages.map((image, index) => (
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
                                                                    {room.roomImages.map((image, index) => (
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
                                                                <h2>{room.boardingId.boardingName.toUpperCase()}</h2>
                                                                <p style={{color: 'dimgray'}}>{room.boardingId.address}</p>
                                                            </Col>
                                                            {room.status!='PendingApproval' ? 
                                                            <Col lg={2}>
                                                                <Row style={{marginRight:'-30px', justifyContent:'flex-end'}}>
                                                                    <Col style={{display:'contents'}}>
                                                                        <Tooltip title="Edit" placement="top" arrow>
                                                                            <button className={`${ownerStyles.ctrls} ${ownerStyles.edtBtn}`} onClick={(e) => editRoom(e)}>
                                                                                <FiEdit />
                                                                            </button>
                                                                        </Tooltip>
                                                                    </Col>
                                                                    <Col style={{display:'contents'}}>
                                                                        <Tooltip title="Delete" placement="top" arrow>
                                                                            <button className={`${ownerStyles.ctrls} ${ownerStyles.deleteBtn}`} onClick={(e) => handleRoomDialogOpen(e,room._id)}>
                                                                                <RiDeleteBinLine />
                                                                            </button>
                                                                        </Tooltip>
                                                                    </Col>
                                                                    {room.status=='Approved' ?
                                                                    <Col style={{display:'contents'}}>
                                                                        <Tooltip title={room.visibility ? 'Mark as unavailable' : 'Mark as available for rent'} placement="top" arrow>
                                                                            <Switch checked={room.visibility} color="secondary" sx={{mt:'-5px'}} onClick={(e) => toggleRoomVisibility(e,room._id)} />
                                                                        </Tooltip>
                                                                    </Col>
                                                                    :''}
                                                                </Row>
                                                            </Col>
                                                            :
                                                            ''}
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <p className={ownerStyles.paras}><b>Room No:</b> {room.roomNo}</p>
                                                                <p className={ownerStyles.paras}><b>Beds:</b> {room.noOfBeds}</p>
                                                                {room.noOfAttachBaths!=0 ? 
                                                                    <p className={ownerStyles.paras}><b> Attached Baths:</b> {room.noOfAttachBaths}</p> 
                                                                : ''}
                                                                {room.noOfCommonBaths!=0 ? 
                                                                    <p className={ownerStyles.paras}><b> Common Baths:</b> {room.noOfCommonBaths}</p> 
                                                                : ''}
                                                                <p className={ownerStyles.paras}><b>Gender:</b> {room.boardingId.gender}</p>
                                                            </Col>
                                                            <Col>
                                                                <p className={ownerStyles.paras}><b>Utility Bills:</b> {room.boardingId.utilityBills ? 'Yes' : 'No'}</p>
                                                                <p className={ownerStyles.paras}><b>Food:</b> {room.boardingId.food ? 'Yes' : 'No'}</p>
                                                                {room.boardingId.facilities.length > 0 ?
                                                                <>
                                                                    <p className={ownerStyles.paras} style={{marginBottom:0}}><b>Facilities</b></p>
                                                                    <ul style={{paddingLeft:'0.5em'}}>
                                                                        {room.boardingId.facilities.map((facility,index) => (
                                                                        <li key={index} style={{color:'dimgray', listStyleType:'none'}} className={ownerStyles.facilities}>{facility}</li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                                :''}
                                                            </Col>
                                                            <Col>
                                                                <p className={ownerStyles.paras}><b>Rent:</b> Rs {room.rent} /Month</p>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row className=" mt-4" style={{textAlign:'right'}}>
                                            <Col>
                                                {room.status == 'Approved'?
                                                    (room.occupant.length!=room.noOfBeds) ? 
                                                    <Button className={`${ownerStyles.addBtn}`} onClick={() => setShowModal(true)}>
                                                        <BsPersonFillAdd style={{fontSize:'1.5em', marginRight:'5px'}}/>
                                                        Add Existing occupant
                                                    </Button>
                                                    : 
                                                    <h3 style={{textAlign:'left', fontFamily:'fantasy', marginBottom:0}}>OCCUPANTS</h3>
                                                : ''
                                                }
                                            </Col>
                                        </Row>
                                        <hr />
                                        <Row style={{minHeight:'calc(100vh - 400px)'}}>
                                            <Col>
                                                { reservationLoading ? <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><Spinner animation="grow" variant="info" /></div> : 
                                                    
                                                    reservations.length > 0 ? 
                                                        <div style={{height:'100%', width:'100%',display:'flex', color:'dimgrey'}}>                                                    
                                                            {reservations.map((reservation, index) => (
                                                                reservation.status == 'PendingInvite' ? 
                                                                <Card key={index} className={`${occupantStyles.card} mt-4`}>
                                                                    <CardContent className={`${occupantStyles.cardContent}`}>
                                                                        <div className={occupantStyles.removeBtnPos}>
                                                                            <Tooltip title="Cancel Invitation" placement="top" arrow>
                                                                                <button className={`${occupantStyles.ctrls} ${occupantStyles.deleteBtn}`} onClick={(e) => handleReservationDialogOpen(e,reservation._id)}>
                                                                                    <MdPersonRemoveAlt1 />
                                                                                </button>
                                                                            </Tooltip>
                                                                        </div>
                                                                        <div className={`${occupantStyles.pendingInviteContent}`}>
                                                                        <Row>
                                                                            <Col>
                                                                                <Typography component="div" className={occupantStyles.pendingInviteIcon}>
                                                                                    <Avatar alt={"Pending Invite"} {...StringToAvatar("Pending Invite")} style={{ width: 80, height: 80, fontSize: 50 }} />
                                                                                </Typography> 
                                                                            </Col>
                                                                        </Row>
                                                                        <Row style={{textAlign:'center'}}>
                                                                            <Col>
                                                                                <h3 style={{marginTop:'10px'}}>Pending Invite</h3>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row className={occupantStyles.userInfoRow}>
                                                                            <Col style={{display:'flex',justifyContent:'center'}}><Email style={{marginRight:'5px'}}/><a href={`mailto:${reservation.boardingType}`} style={{textDecoration:'none', color:'inherit'}}>{reservation.boardingType}</a></Col>
                                                                        </Row>
                                                                        <Row className={occupantStyles.userInfoRow}>
                                                                            <Col style={{display:'flex',justifyContent:'center'}}><Phone style={{marginRight:'5px'}}/>{reservation.occupantID?.phoneNo ? reservation.occupantID.phoneNo : 'Not Available'}</Col>
                                                                        </Row>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                                :
                                                                <Card key={index} className={`${occupantStyles.card} mt-4 ${reservation.status=="Pending" ? occupantStyles.pending : ''}`}>
                                                                    <CardContent className={`${occupantStyles.cardContent} ${reservation.status=="Pending" ? occupantStyles.pendingContent : ''}`}>
                                                                        <Row>
                                                                            <Col>
                                                                            {reservation.status=="Approved" ?
                                                                                <div className={occupantStyles.removeBtnPos}>
                                                                                    <Tooltip title="Remove Occupant" placement="top" arrow>
                                                                                        <button className={`${occupantStyles.ctrls} ${occupantStyles.deleteBtn}`} onClick={(e) => handleReservationDialogOpen(e,reservation._id)}>
                                                                                            <MdPersonRemoveAlt1 />
                                                                                        </button>
                                                                                    </Tooltip>
                                                                                </div>
                                                                            :''}
                                                                            {reservation.occupantID.image ? 
                                                                                <Avatar alt={reservation.occupantID.firstName+" "+reservation.occupantID.lastName} src={reservation.occupantID.image} sx={{ width: 80, height: 80 }} /> 
                                                                                : 
                                                                                <Typography component="div">
                                                                                    <Avatar alt={reservation.occupantID.firstName+" "+reservation.occupantID.lastName} {...StringToAvatar(reservation.occupantID.firstName+" "+reservation.occupantID.lastName)} style={{ width: 80, height: 80, fontSize: 50 }} />
                                                                                </Typography> 
                                                                            }
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col>
                                                                                <h3 style={{marginTop:'10px'}}>{reservation.occupantID.firstName+" "+(reservation.occupantID.lastName?reservation.occupantID.lastName:'')}</h3>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row className={occupantStyles.userInfoRow}>
                                                                            <Col style={{display:'flex',justifyContent:'center'}}><Email style={{marginRight:'5px'}}/><a href={`mailto:${reservation.occupantID.email}`} style={{textDecoration:'none', color:'inherit'}}>{reservation.occupantID.email}</a></Col>
                                                                        </Row>
                                                                        <Row className={occupantStyles.userInfoRow}>
                                                                            <Col style={{display:'flex',justifyContent:'center'}}><Phone style={{marginRight:'5px'}}/>{reservation.occupantID.phoneNo ? reservation.occupantID.phoneNo : 'Not Available'}</Col>
                                                                        </Row>
                                                                        <Row className={occupantStyles.userInfoRow}>
                                                                            <Col style={{display:'flex',justifyContent:'center'}}>{reservation.occupantID.gender}</Col>
                                                                        </Row>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    : 
                                                    <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>                                                    
                                                        <h2>You don't have any Reservations for this Room!</h2>
                                                    </div>
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                }
                            </Col>
                        </Row>
                    </Fade>
                </Container>
            </div>
            <Dialog
                fullScreen={fullScreen}
                open={confirmDialog}
                onClose={handleRoomDialogClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogContent className={ownerStyles.confirmIcon}>
                    <Warning style={{fontSize:'100px'}} />
                </DialogContent>
                <DialogTitle id="responsive-dialog-title">
                    {"Are you sure you want to delete this room?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleRoomDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={deleteRoom} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullScreen={fullScreen}
                open={reservationConfirmDialog}
                onClose={handleReservationDialogClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogContent className={ownerStyles.confirmIcon}>
                    <Warning style={{fontSize:'100px'}} />
                </DialogContent>
                <DialogTitle id="responsive-dialog-title">
                    {"Are you sure you want to remove this Occupant?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleReservationDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={deleteReservation} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Modal show={showModal} onHide={() => {setShowModal(false);setEmail('');}}>
                <Modal.Header closeButton>
                    <Modal.Title>Send Invitation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => {setShowModal(false);setEmail('');}}>
                    Cancel
                </Button>
                <Button variant="primary" autoFocus onClick={(e) => handleAddOccupant(e)}>
                    Send
                </Button>
                </Modal.Footer>
            </Modal>
        </> 
    )
};

export default OwnerBoardingRoomOccupants