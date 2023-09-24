import { useState, useEffect } from "react";
import { Row, Col, Image, Button,Form } from 'react-bootstrap';
import { Card, CardContent, Pagination, CircularProgress,IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { useGetUtilitiesForBoardingMutation, useDeleteUtilityMutation } from "../slices/utilitiesApiSlice";
import { toast } from 'react-toastify';
import SearchIcon from '@mui/icons-material/Search';
import storage from "../utils/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";
import defaultImage from '/images/defaultImage.png';
import { Link as CustomLink } from "react-router-dom";
import ownerStyles from '../styles/ownerStyles.module.css';
import BillStyles from '../styles/billStyles.module.css';


const AllUtilitiesForBoardings = ({ boardingId, utilityType }) => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [utilities, setUtilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const dispatch = useDispatch();

    const [getUtilitiesForBoarding, { isLoading }] = useGetUtilitiesForBoardingMutation();
    const [deleteUtility,{isLoadings}] = useDeleteUtilityMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const loadData = async (pageNo) => {
        try {
            if (boardingId && utilityType) {
                const res = await getUtilitiesForBoarding({boardingId,utilityType,pageNo,searchQuery }).unwrap();
                console.log(res);
                setUtilities(res.utility);
                setTotalPages(res.totalPages);

                // Load utility images
                const updatedUtilities = await Promise.all(res.utility.map(async (utility) => {
                    const updatedImages = await Promise.all(utility.utilityImage.map(async (image, index) => {
                        try {
                            const imageUrl = await getDownloadURL(ref(storage, image));
                            return imageUrl;
                        } catch (error) {
                            console.error('Error retrieving image URL:', error);
                            return null;
                        }
                    }));
                    return { ...utility, utilityImage: updatedImages };
                }));

                setUtilities(updatedUtilities);
                setLoading(false);
            }
        } catch (err) {
            toast.error(err.data?.message || err.error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(page);
    }, [boardingId,utilityType,searchQuery]);

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);
        console.log(utilities);
    };

    const handleDeleteUtility = async (utilityId) => {
        try {
            const data = `${utilityId}`;
            const res = await deleteUtility(data).unwrap();
            console.log(res);
            if (res.message===" Utility deleted successfully") {
                toast.success("Utility deleted successfully");
                loadData(page);
            } else {
                toast.error("Failed to delete utility");
            }
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    };
    const handleSort = (order) => {
        const sortedUtilities = [...utilities];
        if (order === "asc") {
            sortedUtilities.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (order === "desc") {
            sortedUtilities.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        setUtilities(sortedUtilities);
    };
    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };
    return (
        <>
            <Row className="d-flex justify-content-center">
                <Row style={{ minHeight: 'calc(100vh - 240px)' }}>
                    <Row>
                        <Col>
                                            <div style={{ marginBottom: '10px', textAlign: 'left', color:'darkslategray' }}>
                                <label className={BillStyles.sortinglable}>Sort by Date:</label>
                                <select onChange={(e) => handleSort(e.target.value)} style={{ marginLeft: '10px', padding: '5px',color:'darkslategray'  }}>
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                            </Col>
                            <Col>
                            <Form.Group controlId="searchQuery" style={{ maxWidth: '300px' }}>
                             <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Form.Control
                                type="text"
                                placeholder="Search…"
                                value={searchQuery}
                                onChange={handleSearch} // Handle search query change
                            />
                            <IconButton>
                                <SearchIcon />
                            </IconButton>
                            </div>
                            </Form.Group>
                            </Col>
                            
                            </Row>
                    <Col>
                        {isLoading || loading ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress />
                            </div>
                        ) : (utilities.length > 0 ? (
                            utilities.map((utility, index) => (
                                <Card className={`${ownerStyles.card} mt-4`} key={utility._id} >
                                    <CardContent className={ownerStyles.cardContent}>
                                        <Row>
                                            <Col lg={4}>
                                                <Image
                                                    src={utility.utilityImage[0] || defaultImage}
                                                    onError={(e) => { e.target.src = defaultImage }}
                                                    alt="Utility"
                                                    fluid
                                                />
                                            </Col>
                                            <Col lg={8}>
                                                <Row>
                                                    <p><b>Amount:</b> Rs. {utility.amount} .00</p>
                                                </Row>
                                                <Row>
                                                    {utility.date ? (
                                                        <p><b>Date:</b> {new Date(utility.date).toLocaleDateString()}</p>
                                                    ) : null}
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <p><b>Description:</b> {utility.description}</p>
                                                    </Col>
                                                    <Col>
                                                        <Row>
                                                            <Col>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => handleDeleteUtility(utility._id)}
                                                                >
                                                                    <DeleteIcon /> Delete
                                                                </Button>
                                                            </Col>
                                                            <Col>
                                                                <CustomLink to={`/owner/utility/update/${boardingId}/${utilityType}/${utility._id}`}>
                                                                    <Button type="button">
                                                                        <EditOutlinedIcon /> Edit
                                                                    </Button>
                                                                </CustomLink>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </CardContent>
                                </Card>
                            ))
                        ) : null)}
                    </Col>
                </Row>
                {totalPages > 1 && (
                    <Row>
                        <Col className="mt-3">
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" />
                        </Col>
                    </Row>
                )}
            </Row>
        </>
    );
};

export default AllUtilitiesForBoardings;
