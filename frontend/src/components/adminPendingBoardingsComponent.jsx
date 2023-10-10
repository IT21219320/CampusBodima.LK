import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Carousel, Table} from 'react-bootstrap';
import { Card, CardContent, TablePagination, CircularProgress, Box, Button as MuiButton, Skeleton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, Backdrop, IconButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingsMutation, useUpdateVisibilityMutation, useDeleteBoardingMutation, useGetPendingApprovalBoardingsMutation, useApproveBoardingMutation, useRejectBoardingMutation, useApproveRoomMutation, useRejectRoomMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { BiShowAlt } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import LoadingButton from '@mui/lab/LoadingButton';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";

import ownerStyles from '../styles/ownerStyles.module.css';
import adminStyles from '../styles/adminStyles.module.css';

import defaultImage from '/images/defaultImage.png';

const AdminPendingBoardings = () => {

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [loading, setLoading] = useState(false);
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [boardings, setBoardings] = useState([]);
    const [tempBoarding, setTempBoarding] = useState('');
    const [showBoarding, setShowBoarding] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [roomConfirmDialog, setRoomConfirmDialog] = useState(false);
    const [tempDeleteId, setTempDeleteId] = useState('');
    const [tempRoomDeleteId, setTempRoomDeleteId] = useState('');
    
    const theme = useTheme();
    const largeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getPendingApprovalBoardings, { isLoading }] = useGetPendingApprovalBoardingsMutation();
    const [approveBoardings] = useApproveBoardingMutation();
    const [rejectBoardings] = useRejectBoardingMutation();
    const [approveRooms] = useApproveRoomMutation();
    const [rejectRooms] = useRejectRoomMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = page+'/'+pageSize
            const res = await getPendingApprovalBoardings( data ).unwrap();
            setBoardings(res.boardings);
            setTotalRows(res.totalRows);
            setImgLoading(true);

            console.log(res);

            const imagePromises = res.boardings.map(async (boarding) => {
            const updatedImages = await Promise.all(boarding.boardingImages.map(async (image, index) => {
                try {
                const imageUrl = await getDownloadURL(ref(storage, image));
                // Update the URL for the image in the boardingImages array
                return imageUrl;
                } catch (error) {
                console.error('Error retrieving image URL:', error);
                // Handle the error as needed
                return null; // or a default value if there's an error
                }
            }));
            // Create a new object with the updated boardingImages property
            const updatedBoarding = { ...boarding, boardingImages: updatedImages };
            return updatedBoarding;
            });
  
            // Wait for all image retrieval promises to complete
            Promise.all(imagePromises)
                .then(async (updatedBoardings) => {
                    // Collect room image URLs and update the state
                    const roomImageUrls = [];
                    
                    async function downloadRoomImages(boardings) {
                        // Create an array of promises for room image retrieval
                        const roomPromises = boardings.map(async (boarding) => {
                          if (boarding.room.length > 0) {
                            const updatedRooms = await Promise.all(boarding.room.map(async (room) => {
                              if (room.roomImages.length > 0) {
                                const updatedImages = await Promise.all(room.roomImages.map(async (roomImage) => {
                                  try {
                                    const url = await getDownloadURL(ref(storage, roomImage));
                                    return url;
                                  } catch (error) {
                                    console.error('Error retrieving room image URL:', error);
                                    // Handle the error as needed
                                    return null; // or a default value if there's an error
                                  }
                                }));
                                // Create a new room object with updated roomImages property
                                return { ...room, roomImages: updatedImages };
                              } else {
                                // No room images to update
                                return room;
                              }
                            }));
                            // Create a new boarding object with updated room property
                            return { ...boarding, room: updatedRooms };
                          } else {
                            // No rooms to update
                            return boarding;
                          }
                        });
                      
                        // Wait for all room promises to complete
                        const updatedBoardings = await Promise.all(roomPromises);
                      
                        return updatedBoardings;
                      }


                    const updatedRoomsNBoardings = await downloadRoomImages(updatedBoardings);
                      

                    console.log(updatedRoomsNBoardings); 

                    // Update your state and perform other actions as needed
                    setBoardings(updatedRoomsNBoardings);
                    setTotalRows(res.totalRows);
                    setImgLoading(false);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error updating image URLs:', error);
                    setLoading(false);
                    // Handle the error as needed
                });

            
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();     
    },[page,pageSize]);

    const handleView = (boarding) => {
        setTempBoarding(boarding);
        setShowBoarding(true)
    }

    const handleDialogOpen = (e, id) => {
        e.preventDefault();
        setTempDeleteId(id);
        setConfirmDialog(true);
    }

    const handleDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    }

    const rejectBoarding = async() => {
        handleDialogClose();
        try {
            setApprovalLoading(true);

            const res = await rejectBoardings({boardingId:tempDeleteId}).unwrap();
            setShowBoarding(false);
            setTempBoarding('')
            toast.success('Boarding rejected successfully!');
            setApprovalLoading(false);
            loadData();
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setApprovalLoading(false);
        }
    }

    const approveBoarding = async(id) => {
        try {
            setApprovalLoading(true);

            const res = await approveBoardings({boardingId:id}).unwrap();
            setShowBoarding(false);
            setTempBoarding('')
            toast.success('Boarding approved successfully!');
            setApprovalLoading(false);
            loadData();
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setApprovalLoading(false);
        }
    }

    const handleRoomDialogOpen = (e, id) => {
        e.preventDefault();
        setTempRoomDeleteId(id);
        setRoomConfirmDialog(true);
    }

    const handleRoomDialogClose = () => {
        setTempRoomDeleteId('');
        setRoomConfirmDialog(false);
    }

    const rejectRoom = async() => {
        handleRoomDialogClose();
        try {
            setApprovalLoading(true);

            const res = await rejectRooms({roomId:tempRoomDeleteId}).unwrap();

            const updatedTempBoarding = { ...tempBoarding }; 
            if (updatedTempBoarding.room) {
                updatedTempBoarding.room = updatedTempBoarding.room.filter(room => room._id !== id);
            }
            setTempBoarding(updatedTempBoarding);

            console.log(res);
            loadData();
            toast.success('Room rejected successfully!');
            setApprovalLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setApprovalLoading(false);
        }
    }

    const approveRoom = async(id) => {
        try {
            setApprovalLoading(true);

            const res = await approveRooms({roomId:id}).unwrap();

            const updatedTempBoarding = { ...tempBoarding }; // Create a shallow copy of tempBoarding
            if (updatedTempBoarding.room) {
                updatedTempBoarding.room = updatedTempBoarding.room.filter(room => room._id !== id);
            }
            setTempBoarding(updatedTempBoarding);

            if(updatedTempBoarding.status != "PendingApproval" && updatedTempBoarding.room?.every(room => room.status !== "PendingApproval")){
                setTempBoarding('');
                setShowBoarding(false);
            }
            
            loadData();
            toast.success('Room approved successfully!');
            setApprovalLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setApprovalLoading(false);
        }
    }

    return (
        <>
            <Row style={{minHeight:'calc(100vh - 240px)'}}>
                <Col>
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>Boarding Name</th>
                                <th>Boarding Type</th>
                                <th>City</th>
                                <th>Owner Name</th>
                                <th>Owner Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody> 
                        {loading ? <tr style={{width:'100%',height:'100%', textAlign:'center'}}><td colSpan={6}><CircularProgress /></td></tr> :
                        boardings.length > 0 ? 
                            boardings.map((boarding, index) => (
                            <tr key={index}>
                                <td>{boarding.boardingName}</td>
                                <td>{boarding.boardingType}</td>
                                <td>{boarding.city}</td>
                                <td>{boarding.owner.firstName}</td>
                                <td>{boarding.owner.email}</td>
                                <td><MuiButton variant="contained" onClick={() => handleView(boarding)}>View &nbsp;<BiShowAlt style={{fontSize:'1.5em'}}/></MuiButton></td>
                            {/**/}
                            </tr>
                            ))
                        :
                            <tr style={{height:'100%', width:'100%', textAlign:'center', color:'dimgrey'}}>
                                <td colSpan={6}>No Boardings to Approve!</td>
                            </tr>
                        
                        }
                    </tbody>
                </Table>
                </Col>
            </Row>
            <Row>
                <Col className="mt-3">
                    <TablePagination
                        component="div"
                        count={totalRows}
                        page={page}
                        onPageChange={(pg) => setPage(pg)}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={(e) => { 
                            setPageSize(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Col>
            </Row>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showBoarding}
            >
                <Card className={`${adminStyles.card} mt-4`}>
                    <IconButton style={{float:'right'}} onClick={() => {setShowBoarding(false);setTempBoarding('')}}><Close /></IconButton>
                    <CardContent className={ownerStyles.cardContent}>
                        <Row style={{height:'100%', width:'100%'}}>
                            <Col style={{height:'100%'}} lg={4}>
                                {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='100%' /> :
                                    <Carousel fade controls={false} onClick={() => setImagePreview(true)} style={{cursor:'pointer'}} className={ownerStyles.carousel}>
                                        {tempBoarding.boardingImages?.map((image, index) => (
                                            <Carousel.Item key={index}>
                                                <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={adminStyles.images} height='250px' width='100%'/>
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                }
                            </Col>
                            <Col lg={8}>
                                <Row>
                                    <Col>
                                        <h2>{tempBoarding.boardingName?.toUpperCase()}</h2>
                                        <p style={{color: 'dimgray'}}>{tempBoarding.city}, {tempBoarding.boardingType}</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p className={ownerStyles.paras}><b>Address:</b> {tempBoarding.address}</p>
                                        <p className={ownerStyles.paras}><b>Rooms:</b> {tempBoarding.boardingType=='Annex' ? tempBoarding.noOfRooms : tempBoarding.room?.length}</p>
                                        {tempBoarding.boardingType=='Annex' ? 
                                            <p className={ownerStyles.paras}><b>Baths:</b> {parseInt(tempBoarding.noOfCommonBaths)+parseInt(tempBoarding.noOfAttachBaths)}</p> 
                                        : ''}
                                        <p className={ownerStyles.paras}><b>Gender:</b> {tempBoarding.gender}</p>
                                    </Col>
                                    <Col>
                                        <p className={ownerStyles.paras}><b>Utility Bills:</b> {tempBoarding.utilityBills ? 'Yes' : 'No'}</p>
                                        <p className={ownerStyles.paras}><b>Food:</b> {tempBoarding.food ? 'Yes' : 'No'}</p>
                                        {tempBoarding.facilities?.length > 0 ?
                                        <>
                                            <p className={ownerStyles.paras} style={{marginBottom:0}}><b>Facilities</b></p>
                                            <ul style={{paddingLeft:'0.5em'}}>
                                                {tempBoarding.facilities?.map((facility,index) => (
                                                <li key={index} style={{color:'dimgray', listStyleType:'none'}} className={ownerStyles.facilities}>{facility}</li>
                                                ))}
                                            </ul>
                                        </>
                                        :''}
                                    </Col>
                                    <Col>
                                    {tempBoarding.boardingType == 'Annex' ? 
                                        <p className={ownerStyles.paras}><b>Rent:</b> Rs {tempBoarding.rent} /Month</p>
                                    :
                                    tempBoarding.status == 'PendingApproval' ? // show the approve reject buttons for hostel if the boarding is pending
                                    <>
                                        <Row style={{marginTop:'0px'}}>
                                            <Col>
                                                <MuiButton variant="contained" style={{background:"#2e8500"}} onClick={() => approveBoarding(tempBoarding._id)}>{tempBoarding.room?.some(room => room.status == 'PendingApproval') ? 'Approve All' : 'Approve'}</MuiButton>
                                            </Col>
                                        </Row>
                                        <Row style={{marginTop:'15px'}}>
                                            <Col>
                                                <MuiButton variant="contained" style={{background:'#e02200'}} onClick={(e) => handleDialogOpen(e,tempBoarding._id)}>{tempBoarding.room?.some(room => room.status == 'PendingApproval') ? 'Reject All' : 'Reject'}</MuiButton>
                                            </Col>
                                        </Row>
                                    </>
                                    : ''
                                    }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        {tempBoarding.boardingType=="Annex" ? 
                        <>
                            <Row style={{marginTop:'30px'}}>
                                <Col>
                                    <p style={{color: 'dimgray'}}>{tempBoarding.description}</p>
                                </Col>
                            </Row>
                            <Row style={{marginTop:'30px'}}>
                                <Col lg={6}>
                                    <MuiButton variant="contained" style={{background:"#2e8500"}} onClick={() => approveBoarding(tempBoarding._id)}>Approve</MuiButton>
                                </Col>
                                <Col lg={6}>
                                    <MuiButton variant="contained" style={{background:'#e02200'}} onClick={(e) => handleDialogOpen(e,tempBoarding._id)}>Reject</MuiButton>
                                </Col>
                            </Row>
                        </>
                        : '' }
                        
                        {tempBoarding.room?.map((room, index) => (
                                <Row key={index} style={{height:'100%', width:'100%'}}>
                                    <Col style={{height:'100%', width:'100%'}}>    
                                        <Card className={`${ownerStyles.card} mt-4`} style={{minHeight:'315px', height:'auto'}}>
                                            <CardContent className={ownerStyles.cardContent}>
                                                <Row key={index} style={{height:'100%', width:'100%'}}>
                                                    <Col style={{height:'100%'}} lg={4}>
                                                        {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='100%' /> :
                                                            <Carousel fade controls={false} onClick={() => setImagePreview(true)} style={{cursor:'pointer'}} className={ownerStyles.carousel}>
                                                                {room.roomImages?.map((image, index) => (
                                                                    <Carousel.Item key={index}>
                                                                        <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={adminStyles.images} height='250px' width='100%'/>
                                                                    </Carousel.Item>
                                                                ))}
                                                            </Carousel>
                                                        }
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
                                                                <p className={ownerStyles.paras}><b>Occupants:</b> {room.occupant.length}</p>
                                                            </Col>
                                                            <Col>
                                                                <p className={ownerStyles.paras}><b>Rent:</b> Rs {room.rent} /Month</p>
                                                                <p className={ownerStyles.paras}><b>Key Money:</b> {room.keyMoney} Months</p>
                                                            </Col>
                                                        </Row>
                                                        <Row style={{marginTop:'30px'}}>
                                                            <Col>
                                                                <p style={{color: 'dimgray'}}>{room.description}</p>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                    {room.status == "PendingApproval" ?
                                                <Row style={{marginTop:'30px'}}>
                                                    <Col lg={6}>
                                                        <MuiButton variant="contained" style={{background:"#2e8500"}} onClick={() => approveRoom(room._id)}>Approve</MuiButton>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <MuiButton variant="contained" style={{background:'#e02200'}} onClick={(e) => handleRoomDialogOpen(e,room._id)}>Reject</MuiButton>
                                                    </Col>
                                                </Row>
                                                    : ''}
                                            </CardContent>
                                        </Card>
                                    </Col>
                                </Row>
                        ))}
                    </CardContent>
                </Card>
            </Backdrop>
            <Dialog
                fullScreen={fullScreen}
                open={confirmDialog}
                onClose={handleDialogClose}
                aria-labelledby="responsive-dialog-title"
                style={{padding:'15px'}}
            >
                <DialogContent className={ownerStyles.confirmIcon}>
                    <Warning style={{fontSize:'100px'}} />
                </DialogContent>
                <DialogTitle>
                    {"Are you sure you want to reject this boarding?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={rejectBoarding} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullScreen={fullScreen}
                open={roomConfirmDialog}
                onClose={handleRoomDialogClose}
                aria-labelledby="responsive-dialog-title"
                style={{padding:'15px'}}
            >
                <DialogContent className={ownerStyles.confirmIcon}>
                    <Warning style={{fontSize:'100px'}} />
                </DialogContent>
                <DialogTitle>
                    {"Are you sure you want to reject this Room?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleRoomDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={rejectRoom} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={approvalLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </> 
    )
};

export default AdminPendingBoardings;