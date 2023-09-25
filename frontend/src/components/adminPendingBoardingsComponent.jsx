import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, Carousel} from 'react-bootstrap';
import { Card, CardContent, TablePagination, CircularProgress, Box, Button as MuiButton, Skeleton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingsMutation, useUpdateVisibilityMutation, useDeleteBoardingMutation, useGetPendingApprovalBoardingsMutation, useApproveBoardingMutation, useRejectBoardingMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import LoadingButton from '@mui/lab/LoadingButton';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";

import Sidebar from './sideBar';

import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

import defaultImage from '/images/defaultImage.png';

const AdminPendingBoardings = () => {

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [loading, setLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [imagePreview, setImagePreview] = useState(false);
    const [boardings, setBoardings] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [tempDeleteId, setTempDeleteId] = useState('');
    
    const theme = useTheme();
    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getPendingApprovalBoardings, { isLoading }] = useGetPendingApprovalBoardingsMutation();
    const [approveBoardings] = useApproveBoardingMutation();
    const [rejectBoardings] = useRejectBoardingMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = page+'/'+pageSize
            const res = await getPendingApprovalBoardings( data ).unwrap();
            setBoardings(res.boardings);
            setTotalRows(res.totalRows);
            setLoading(false);
            setImgLoading(true);

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
                })
                .catch((error) => {
                    console.error('Error updating image URLs:', error);
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
            setLoading(true);

            const res = await rejectBoardings({boardingId:tempDeleteId}).unwrap();
            loadData();
            toast.success('Boarding rejected successfully!');
            setLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    const approveBoarding = async(id) => {
        try {
            setLoading(true);

            const res = await approveBoardings({boardingId:id}).unwrap();
            loadData();
            toast.success('Boarding approved successfully!');
            setLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    return (
        <>
            <Row style={{minHeight:'calc(100vh - 240px)'}}>
                <Col>
                    {loading ? <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                        boardings.length > 0 ? 
                            boardings.map((boarding, index) => (
                                <Card key={index} style={{cursor:'auto'}} className={`${ownerStyles.card} mt-4`}>
                                    <CardContent className={ownerStyles.cardContent}>
                                        <Row style={{height:'100%', width:'100%'}}>
                                            <Col style={{height:'100%'}} lg={4}>
                                                {imgLoading ? <Skeleton variant="rounded" animation="wave" width='100%' height='100%' /> :
                                                    <Carousel controls={false} onClick={() => setImagePreview(true)} style={{cursor:'pointer'}} className={ownerStyles.carousel}>
                                                        {boarding.boardingImages.map((image, index) => (
                                                            <Carousel.Item key={index}>
                                                                <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} height='250px' width='100%'/>
                                                            </Carousel.Item>
                                                        ))}
                                                        {boarding.room.map((room, index) => (
                                                            room.roomImages.map((image, index) => (
                                                                <Carousel.Item key={index}>
                                                                    <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} height='250px' width='100%'/>
                                                                </Carousel.Item>
                                                            ))
                                                        ))}
                                                    </Carousel>
                                                }
                                                {/*<Dialog open={imagePreview} onClose={() => setImagePreview(false)} style={{maxHeight:'90vh', maxWidth:'100vw', transform:'scale(1.5)'}}>
                                                    <DialogContent>
                                                        <Carousel fade interval={10000} style={{borderRadius:'10px'}}>
                                                            {boarding.boardingImages.map((image, index) => (
                                                                <Carousel.Item key={index}>
                                                                    <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} height='250px' width='100%'/>
                                                                </Carousel.Item>
                                                            ))}
                                                            {boarding.room.map((room, index) => (
                                                                room.roomImages.map((image, index) => (
                                                                    <Carousel.Item key={index}>
                                                                        <Image src={image? image : defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images} height='250px' width='100%'/>
                                                                    </Carousel.Item>
                                                                ))
                                                            ))}
                                                        </Carousel>
                                                    </DialogContent>
                                                </Dialog>*/}
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
                                                        <p className={ownerStyles.paras}><b>Rent:</b> Rs {boarding.rent} /Month</p>
                                                    :''}
                                                    <Row style={{marginTop:'30px'}}>
                                                        <Col lg={6}>
                                                            <MuiButton variant="contained" style={{background:'#e02200'}} onClick={(e) => handleDialogOpen(e,boarding._id)}>Reject</MuiButton>
                                                        </Col>
                                                        <Col lg={6}>
                                                            <MuiButton variant="contained" style={{background:"#2e8500"}} onClick={() => approveBoarding(boarding._id)}>Approve</MuiButton>
                                                        </Col>
                                                    </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </CardContent>
                                </Card>
                            ))
                        :
                            <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>
                                <h2>No Boardings to Approve!</h2>
                            </div>
                    }
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
        </> 
    )
};

export default AdminPendingBoardings;