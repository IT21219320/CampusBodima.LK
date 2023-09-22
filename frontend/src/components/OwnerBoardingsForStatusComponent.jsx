import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress, Box, Collapse, IconButton, Alert, Switch, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { Close, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOwnerBoardingsMutation, useUpdateVisibilityMutation, useDeleteBoardingMutation } from '../slices/boardingsApiSlice';
import { toast } from 'react-toastify';
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import LoadingButton from '@mui/lab/LoadingButton';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";

import Sidebar from './sideBar';

import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

import defaultImage from '/images/defaultImage.png'

const OwnerBoardingsForStatus = ({children}) => {

    const [noticeStatus, setNoticeStatus] = useState(true);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [boardings, setBoardings] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [tempDeleteId, setTempDeleteId] = useState('');
    
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getOwnerBoardings, { isLoading }] = useGetOwnerBoardingsMutation();
    const [updateVisibility] = useUpdateVisibilityMutation();
    const [deleteOwnerBoarding] = useDeleteBoardingMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async (pageNo) => {
        try {
            setLoading(true);
            const data = userInfo._id+'/'+pageNo+'/'+children;
            const res = await getOwnerBoardings( data ).unwrap();

            // Create an array of promises for image retrieval
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
                .then((updatedBoardings) => {
                    setBoardings(updatedBoardings);  
                    setTotalPages(res.totalPages); 
                    setLoading(false); 
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
        loadData(page);     
    },[]);

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);       
    };

    const toggleVisibility = async(e, id, index) => {
        e.preventDefault();
        try {
            setLoading(true);

            const res = await updateVisibility({id}).unwrap();

            const updatedBoardings = [...boardings];
            updatedBoardings[index] = {
                ...updatedBoardings[index],
                visibility: !updatedBoardings[index].visibility,
            };
            setBoardings(updatedBoardings);
            toast.success('Boarding visibility updated successfully!');
            setLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    const handleDialogOpen = (e, id, images) => {
        e.preventDefault();
        setTempDeleteId(id);
        setConfirmDialog(true);
    }

    const handleDialogClose = () => {
        setTempDeleteId('');
        setConfirmDialog(false);
    }

    const deleteBoarding = async() => {
        handleDialogClose();
        try {
            setLoading(true);

            const res = await deleteOwnerBoarding(tempDeleteId).unwrap();

            const updatedBoardings = boardings.filter((boarding) => boarding._id !== tempDeleteId);
            setBoardings(updatedBoardings);
            toast.success('Boarding Deleted successfully!');
            setLoading(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    }

    const editBoarding = (e, index) => {
        e.preventDefault();

        const id = boardings[index]._id;
        const type = boardings[index].boardingType;

        if(type == 'Annex' && boardings[index].occupant){
            toast.error("Cannot update Annex while it is occupied");
        }
        else{
            navigate(`/owner/boardings/${id}/edit`);
        }
    }

    return (
        <>
            {children!='Approved' && boardings.length > 0 ? 
            <Row>
                <Col>
                    <Collapse in={noticeStatus}>
                        <Alert
                            action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => { setNoticeStatus(false); }} > <Close fontSize="inherit" /> </IconButton> }
                            sx={{ mt: 2, }}
                            severity={children=='PendingRoom' ? "warning" : "info"}
                        >
                            {children=='PendingRoom' ?
                            <><strong>Warning</strong> -  Please add atleast 1 room to your boarding.</>
                            :
                            <><strong>Info</strong> -  Please wait while an admin reviews and approves your boarding.</>
                            }
                        </Alert>
                    </Collapse>
                </Col>
            </Row>
            : ''}
            <Row style={{minHeight:'calc(100vh - 240px)'}}>
                <Col>
                    {loading ? <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> : 
                        boardings.length > 0 ? 
                            boardings.map((boarding, index) => (
                                <Link key={index} to={`/owner/boardings/${userInfo._id}/rooms`} style={{textDecoration:'none'}}>
                                    <Card className={`${ownerStyles.card} mt-4`}>
                                        <CardContent className={ownerStyles.cardContent}>
                                            <Row style={{height:'100%', width:'100%'}}>
                                                <Col style={{height:'100%'}} lg={4}>
                                                {/*<AutoPlaySwipeableViews
                                                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                                    index={activeImage}
                                                    onChangeIndex={handleImageChange}
                                                    enableMouseEvents
                                                >
                                                    {boarding.boardingImages.map((image, index) => (
                                                        <div key={index}>
                                                        {Math.abs(activeImage - index) <= 2 ? (
                                                            <Box
                                                            component="img"
                                                            sx={{
                                                                height: 255,
                                                                display: 'block',
                                                                maxWidth: 400,
                                                                overflow: 'hidden',
                                                                width: '100%',
                                                            }}
                                                            src={image}
                                                            />
                                                        ) : null}
                                                        </div>
                                                    ))}
                                                </AutoPlaySwipeableViews>*/}
                                                    <Image src={boarding.boardingImages[0] ?  boarding.boardingImages[0]: defaultImage } onError={ (e) => {e.target.src=defaultImage}} className={ownerStyles.images}height='100%' width='100%'/>
                                                </Col>
                                                <Col lg={8}>
                                                    <Row>
                                                        <Col>
                                                            <h2>{boarding.boardingName.toUpperCase()}</h2>
                                                            <p style={{color: 'dimgray'}}>{boarding.city}, {boarding.boardingType}</p>
                                                        </Col>
                                                        {children!='PendingApproval' ? 
                                                        <Col lg={2}>
                                                            <Row style={{marginTop:'-15px', marginRight:'-30px', justifyContent:'flex-end'}}>
                                                                <Col style={{display:'contents'}}>
                                                                    <Tooltip title="Edit" placement="top" arrow>
                                                                        <button className={`${ownerStyles.ctrls} ${ownerStyles.edtBtn}`} onClick={(e) => editBoarding(e,index)}>
                                                                            <FiEdit />
                                                                        </button>
                                                                    </Tooltip>
                                                                </Col>
                                                                <Col style={{display:'contents'}}>
                                                                    <Tooltip title="Delete" placement="top" arrow>
                                                                        <button className={`${ownerStyles.ctrls} ${ownerStyles.deleteBtn}`} onClick={(e) => handleDialogOpen(e,boarding._id,boarding.boardingImages)}>
                                                                            <RiDeleteBinLine />
                                                                        </button>
                                                                    </Tooltip>
                                                                </Col>
                                                                {boarding.status=='Approved' ?
                                                                <Col style={{display:'contents'}}>
                                                                    <Tooltip title={boarding.visibility ? 'Mark as unavailable' : 'Mark as available for rent'} placement="top" arrow>
                                                                        <Switch checked={boarding.visibility} color="secondary" sx={{mt:'-5px'}} onClick={(e) => toggleVisibility(e,boarding._id,index)} />
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
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        :
                            <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>
                                {children=='Approved' ? 
                                    <h2>You don't have any registered boardings!</h2>
                                : children=='PendingRoom' ?
                                    <h2>You don't have any Hostels without rooms!</h2>
                                :   
                                    <h2>You don't have any boardings pending approval!</h2>
                                }
                            </div>
                    }
                </Col>
            </Row>
            {totalPages <= 1 ? <></> : 
            <Row>
                <Col className="mt-3"><Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" disabled={isLoading} style={{float:'right'}}/></Col>
            </Row>
            }
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
                <DialogTitle id="responsive-dialog-title">
                    {"Are you sure you want to delete this boarding?"}
                </DialogTitle>
                <DialogActions>
                    <Button autoFocus onClick={handleDialogClose}>
                        Cancel
                    </Button>
                    <Button onClick={deleteBoarding} autoFocus variant="danger">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </> 
    )
};

export default OwnerBoardingsForStatus;