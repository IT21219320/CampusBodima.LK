import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Table, Button, Tabs, Tab, Modal, InputGroup, } from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, Pagination, CircularProgress, Box, FormControl, InputLabel, MenuItem, Select, Autocomplete, TextField, Paper, InputBase } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NavigateNext } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetOwnerBoardingMutation,
  useGetKitchenUsersEmailsMutation,
  useAddKitchenUserMutation,
  useUpdateKitchenUserMutation,
  useDeleteKitchenUserMutation,
  useGetBoardingManagerMutation,
} from '../slices/ingredientsApiSlice';
import ownerAllTicketsStyles from '../styles/ownerAllTicketsStyles.module.css';
import { toast } from 'react-toastify';

//import SwipeableViews from 'react-swipeable-views';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';
import ownerStyles from '../styles/ownerStyles.module.css';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import ingredientStyles from '../styles/ingredientStyles.module.css';

import AllIngredients from '../components/allIngredientsComponent';
import ReduceinventoryPage from '../components/reduceinventoryComponent';
import CentralinventoryPage from '../components/centralinventoryComponent';
import IngredientReport from '../components/ingredientReportComponent';

import defaultImage from '/images/defaultImage.png';

//const AutoPlaySwipeableViews = SwipeableViews;

const OwnerIngredientPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [boardingId, setBoardingId] = useState('');
  const [sBoardingId, selectedBoardingId] = useState('');
  const [boardingNames, setBoardingNames] = useState([]);
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [managersEmails, setManagersEmails] = useState([]);
  const [ManagerId, setManagerId] = useState('');
  const [newManagerId, setNewManagerId] = useState('');
  const [selectedManagerEmail, setSelectedManagerEmail] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getOwnerBoarding, { isLoading }] = useGetOwnerBoardingMutation();
  const [getManagersEmails, { isLoading2 }] =
    useGetKitchenUsersEmailsMutation();
  const [addKitchenUser, { isLoading3 }] = useAddKitchenUserMutation();
  const [updateKitchenUser, { isLoading4 }] = useUpdateKitchenUserMutation();
  const [deleteKitchenUser, { isLoading5 }] = useDeleteKitchenUserMutation();
  const [getBoardingManager, { isLoading6 }] = useGetBoardingManagerMutation();

  // Function to fetch boarding names from the API
  const loadData = async () => {
    try {
      const ownerId = userInfo._id;

      const res = await getOwnerBoarding(ownerId).unwrap();
      loadManagersEmails();
      setBoardingNames(res.boardings);

      if (!boardingId) {
        if (res.boardings.length > 0 && res.boardings[0].inventoryManager) {
          // Set the default selected boarding ID to the first one in the list

          const boardId = res.boardings[0]._id;
          if (boardId) {
            setBoardingId(boardId);
            const res = await getBoardingManager(boardId).unwrap();
            setSelectedManagerEmail(res.manager.email);
            setManagerId(res.manager._id);
          }
        }
      } else {
        const res = await getBoardingManager(boardingId).unwrap();
        setSelectedManagerEmail(res.manager.email);
        setManagerId(res.manager._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch managers' emails
  const loadManagersEmails = async () => {
    try {
      const res = await getManagersEmails().unwrap();
      setManagersEmails(res.user);
    } catch (error) {
      console.error("Error fetching managers' emails:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [boardingId]);

  // Function to handle when a boarding is selected
  const handleBoardingSelect = (event) => {
    const boarding = boardingNames.find(
      (item) => item._id === event.target.value
    );

    if (!boarding.inventoryManager) {
      selectedBoardingId(event.target.value);
      loadManagersEmails();
      setShowModal(true);
    } else {
      setBoardingId(event.target.value);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseModal2 = () => {
    setShowModal2(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const data = {
        boardingId: sBoardingId,
        ManagerId,
      };

      const res = await addKitchenUser(data).unwrap();

      if (res && res.user) {
        toast.success('Manager added successfully');
        setBoardingId(sBoardingId);
        setManagerId(ManagerId);
      } else {
        toast.error('Failed to add Manager');
      }
    } catch (err) {
      console.error('Error adding Manager:', err);
      toast.error(err.data?.error || err.data?.message || err.error || err);
    } finally {
      handleCloseModal();
    }
  };

  const submitHandler2 = async (e) => {
    e.preventDefault();

    try {
      const data = {
        boardingId: boardingId,
        newManagerId: newManagerId,
      };

      console.log(data);

      const res = await updateKitchenUser(data).unwrap();

      if (res && res.user) {
        toast.success('Manager Updated successfully');
      } else {
        toast.error('Failed to Update Manager');
      }
    } catch (err) {
      console.error('Error adding Manager:', err);
      toast.error(err.data?.error || err.data?.message || err.error || err);
    } finally {
      handleCloseModal2();
    }
  };

  const handleDeleteManager = async (boardingId, ManagerId) => {
    try {
      const data = `${boardingId}/${ManagerId}`;
      console.log(data);
      const res = await deleteKitchenUser(data).unwrap();
      if (res.message == 'Manager removed from Boarding successfully') {
        toast.success('Manager removed from Boarding successfully');
        handleCloseModal2();
        setBoardingId('');
        setManagerId('')
        setSelectedManagerEmail('')
      } else {
        toast.error('Failed to delete Manager');
      }
    } catch (err) {
      toast.error(err.data?.message || err.error);
    }
  };

  return (
    <>
      <Sidebar />
      <div className={dashboardStyles.mainDiv}>
        <Container className={dashboardStyles.container}>
          <Row>
            <Col>
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
                aria-label="breadcrumb"
                className="py-2 ps-3 mt-4 bg-primary-subtle"
              >
                <Link underline="hover" key="1" color="inherit" href="/">
                  Home
                </Link>
                ,
                <Link underline="hover" key="2" color="inherit" href="/profile">
                  {userInfo.userType == 'owner' ? (
                    'Owner'
                  ) : userInfo.userType == 'occupant' ? (
                    'Occupant'
                  ) : userInfo.userType == 'admin' ? (
                    'Admin'
                  ) : userInfo.userType == 'kitchen' ? (
                    'Kitchen'
                  ) : (
                    <></>
                  )}
                </Link>
                ,
                <Typography key="3" color="text.primary">
                  Ingredients
                </Typography>
              </Breadcrumbs>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col className="mb-3" xs={12} md={12}>

              <Row>
                <Col>
                  <Card variant="outlined" className={ownerAllTicketsStyles.card}>
                    <CardContent>
                      <h1 style={{ fontSize: '40px', color: '#685DD8', textAlign: 'center'}}>
                        Inventory
                      </h1>
                    </CardContent>
                  </Card>
                </Col>
              </Row> 

              <Row> 
                <Col lg={7}>
                {boardingId ? 
                 <div>
                  <Row>
                  <Col lg={4} style={{ width: '24%', important: 'true', padding: '0px' }}> 
                  <p style={{margin: '5% 16px',fontWeight: 'bold'}}>Manager Email:</p>
                  </Col>
                  <Col lg={6} style={{padding: '0px'}}>
                  <InputGroup className="mb-3" style={{ maxWidth: '310px' }}>
                    <Form.Control
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      value={selectedManagerEmail}
                      readOnly
                    />
                    <Button
                      variant="outline-secondary"
                      id="button-addon2"
                      onClick={() => setShowModal2(true)}
                    >
                      Update
                    </Button>
                  </InputGroup>
                  </Col>
                  </Row>
                 </div>
                  : ''}
                </Col>
                <Col>
                </Col>
                <Col className="ml-5">
                  <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth size='small'>
                      <InputLabel id="demo-simple-select-label">
                        Boarding Name
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={boardingId}
                        label="Boarding Name"
                        onChange={handleBoardingSelect}
                      >
                        {boardingNames.map((boarding) => (
                          <MenuItem key={boarding._id} value={boarding._id}>
                            {boarding.boardingName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Tabs
                    defaultActiveKey="Ingredients"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    onSelect={(k) => setActiveTab(k)}
                  >
                    <Tab eventKey="Ingredients" title="Ingredients">
                      {activeTab == 'Ingredients' && boardingId ? (
                        <AllIngredients boardingId={boardingId} />
                      ) : (
                        <div
                          style={{
                            height: '68vh',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'dimgrey',
                          }}
                        >
                          {boardingId ? (
                            <h2>You don't have any Ingredients!</h2>
                          ) : (
                            <>
                              {userInfo.userType === 'owner' ? (
                                <h2>Please Select a boarding!</h2>
                              ) : (
                                <h2>You do not assign to any boarding!</h2>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </Tab>
                    <Tab eventKey="Report" title="Inventory Report">
                      {activeTab == 'Report' && boardingId ? (
                        <IngredientReport boardingId={boardingId} />
                      ) : (
                        <div
                          style={{
                            height: '68vh',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'dimgrey',
                          }}
                        >
                          {boardingId ? (
                            <h2>You don't have any Ingredients!</h2>
                          ) : (
                            <>
                              {userInfo.userType === 'owner' ? (
                                <h2>Please Select a boarding!</h2>
                              ) : (
                                <h2>You do not assign to any boarding!</h2>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </Tab>
                  </Tabs>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bootstrap Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Inventory Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            Managers Emails
          </Typography>

          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={managersEmails}
            sx={{ width: 300 }}
            getOptionLabel={(option) => option.email}
            renderInput={(params) => (
              <TextField {...params} label="Search..." />
            )}
            onChange={(e, selectedManager) => {
              setManagerId(selectedManager ? selectedManager._id : '');
            }}
            value={
              null
            } // Find the manager object by ID and set it as the value
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button type="submit" variant="primary" onClick={submitHandler}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Merged Modal */}
      <Modal
        show={showModal2}
        onHide={handleCloseModal2}
        size="mg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Inventory Manager
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Emails</h4>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={managersEmails}
            value={managersEmails.find((user) => user._id == ManagerId) || null} // Find the manager object by ID and set it as the value
            sx={{ width: 300 }}
            getOptionLabel={(option) => option.email}
            renderInput={(params) => (
              <TextField {...params} label="Search..." />
            )}
            onChange={(e, selectedManager) =>
              setNewManagerId(selectedManager ? selectedManager._id : '')
            } // Set the selected managers ID
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={submitHandler2}>
            Update
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={() => handleDeleteManager(boardingId, ManagerId)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OwnerIngredientPage;
