import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button} from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress,useMediaQuery } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useGetUtilitiesForBoardingMutation,useUpdateUtilityMutation,useDeleteUtilityMutation} from "../slices/utilitiesApiSlice"; 
import { toast } from 'react-toastify';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";
import billStyles from '../styles/billStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';

import defaultImage from '/images/defaultImage.png'

const AllUtilitiesForBoardings = ({utilityType,boardingId}) => {

    //const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [utilities, setUtilities] = useState([]);

    
    
    const theme = useTheme();
    //const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getUtilitiesForBoarding, { isLoading }] = useGetUtilitiesForBoardingMutation();
    //const [updateUtility]=useUpdateUtilityMutation();
    //const [deleteUtility]=useDeleteUtilityMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async (pageNo) => {
        try {
            if(boardingId && utilityType){
           // setLoading(true);
            const data = boardingId+'/'+utilityType+'/'+pageNo;
            const res = await getUtilitiesForBoarding( data ).unwrap();
                
            // Create an array of promises for image retrieval
            const imagePromises = res.utilities.map(async (utilities) => {
                const updatedImages = await Promise.all(utilities.utilityImage.map(async (image, index) => {
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
                //Create a new object with the updated boardingImages property
                const updatedUtility = { ...utilities, utilityImage: updatedImages };
                return updatedUtility;
            });
  
            // Wait for all image retrieval promises to complete
            Promise.all(imagePromises)
                .then((updatedUtility) => {
                    setUtilities(updatedUtility);  
                    setTotalPages(res.totalPages); 
                    //setLoading(false); 
                })
                .catch((error) => {
                    console.error('Error updating image URLs:', error);
                    // Handle the error as needed
                });
            }
              } catch (err) {
            toast.error(err.data?.message || err.error);
            //setLoading(false);
        }
    }

    useEffect(() => {
        loadData(page);     
    },[boardingId , utilityType]);

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);       
    };
    return (
        <>
        <Row  className="d-flex justify-content-center">
        <Row   style={{ minHeight: 'calc(100vh - 240px)' }}>
          <Col>
            {isLoading ? (
              <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}><CircularProgress /></div> 
            ):( utilities.length > 0 ? (
              utilities.map((utility, index) => (
    <Card className={`${billStyles.card} mt-4  `  }>
      <CardContent className={billStyles.cardContent}>
        <Row style={{ height: '100%', width: '100%' }}>

         <Row>
         {utility.date ? (
                      <p className="ownerStyles.paras"><b>in</b> {new Date(utility.date).toLocaleDateString(undefined, { month: 'long' })} ,</p>
                    ) : null}
         </Row>
          <Col style={{ height: '100%'}} lg={4}>
            <Image src={utility.utilityImage[0] || defaultImage} onError={(e) => { e.target.src = defaultImage }} className="billStyles.images" height='80%' width='80%' />
          </Col>
          <Col lg={8}>
            <Row>
              <p className="ownerStyles.paras"><b>Amount:</b> Rs. {utility.amount} .00</p>
            </Row>
            <Row>
            {utility.date ? (
                    <p className="ownerStyles.paras"><b>Date:</b> {new Date(utility.date).toLocaleDateString()}</p>
                  ) : null}
            </Row>
            <Row>
              <Col>
              <p className="ownerStyles.paras"><b>Description:</b> {utility.description}</p>
              </Col>
              <Col>
              <Row>
              <Col>
              <Link href=''>
                    <button type="button" className={billStyles.custombutton}>
                    <DeleteIcon /> Delete
                    </button >
              </Link>
              </Col>
              <Col>
              <Link href=''>
                    <button type="button" className={billStyles.custombutton}>
                    <EditOutlinedIcon /> Edit
                    </button >
              </Link>
              </Col>
              </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </CardContent>
    </Card>

              ))
            ): null
        )}
          </Col>
        </Row>
        {totalPages <= 1 ? <></> :(
          <Row>
            <Col className="mt-3"><Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" disabled={isLoading} style={{ float: 'right' }} /></Col>
          </Row>
        )}
        </Row>
      </>
    )

              }
export default AllUtilitiesForBoardings; 