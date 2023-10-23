import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, InputGroup, Image } from 'react-bootstrap';
import { CardContent, InputLabel, Select, MenuItem, FormControl, Backdrop, CircularProgress, List, ListItem, Divider, ListItemText, ListItemAvatar, Avatar, Typography, Badge, Link, Checkbox } from '@mui/material';
import { NavigateNext, HelpOutlineRounded, Close, AddPhotoAlternate } from '@mui/icons-material';
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import BillStyles from '../styles/billStyles.module.css';
import { toast } from 'react-toastify';
import { useAddUtilitiesMutation, useGetUtilityBoardingMutation, useGetOccupantMutation } from '../slices/utilitiesApiSlice';
import Tooltip from '@mui/material/Tooltip';
import { ImageToBase64 } from "../utils/ImageToBase64";
import Card from 'react-bootstrap/Card';

import dashboardStyles from '../styles/utilityFormStyle.module.css';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import storage from "../utils/firebaseConfig";

const ITEM_HEIGHT = 38;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


const AddUtilitiesPage = () => {

  const getCurrentMonthValue = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Ensure two digits for month
    return `${year}-${month}`;
  };



  const { userInfo } = useSelector((state) => state.auth);


  const [boardingData, setBoardingData] = useState([]);
  const [utilityType, setUtilityType] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(getCurrentMonthValue());
  const [description, setDescription] = useState('');
  const [utilityImage, setUtilityImage] = useState([]);
  const [utilityPreviewImage, setUtilityPreviewImage] = useState([]);
  const [occupantID, setOccupantId] = useState([]);
  const [selectedBoardingId, setSelectedBoardingId] = useState('');
  const [backDropOpen, setBackDropOpen] = useState(false);


  const [occupantData, setOccupantData] = useState([]);
  const [selectedOccupant, setSelectedOccupant] = useState([]);


  const navigate = useNavigate();

  const [addUtilities, { isLoading }] = useAddUtilitiesMutation();
  const [getUtilityBording, { isLoadings }] = useGetUtilityBoardingMutation();
  const [getOccupant, { isLoading2 }] = useGetOccupantMutation();
  const navigateTo = () => {
    navigate('/owner/utility/');
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = userInfo._id;
        const res = await getUtilityBording(data).unwrap();
        console.log('res.boardings:', res.boardings);
        if (Array.isArray(res.boardings)) {
          const boardingData = res.boardings.map((boarding) => ({
            id: boarding._id,
            name: boarding.boardingName,
          }));
          setBoardingData(boardingData);
        } else {
          console.error("boardings data is not an array:", res.boardings);
        }



      } catch (err) {
        toast.error(err.data?.message || err.error);
      }
    };
    loadData();
  }, [getUtilityBording, userInfo._id]);

  const fetchOccupantsForBoarding = async (boardingId) => {
    try {
      const response = await getOccupant(boardingId).unwrap();
      const occupantsData = response.occupants;

      return occupantsData;
    } catch (err) {
      toast.error(err.data?.message || err.error);
      return [];
    }
  };


  const handleBoardingNameChange = async (event) => {
    try {
      const selectedBoardingId = event.target.value;
      setSelectedBoardingId(selectedBoardingId);

      // Fetch occupants for the selected boarding
      const occupantsData = await fetchOccupantsForBoarding(selectedBoardingId);
      setOccupantData(occupantsData);

      const selectedOccupants = occupantsData.map(occupant => occupant._id);
      setSelectedOccupant(selectedOccupants);
      console.log(selectedOccupants);
    } catch (err) {
      toast.error(err.data?.message || err.error);
    }
  }


  const handleUtilityFormSubmit = async (event) => {
    event.preventDefault();

    const utilityData = {
      boardingId: selectedBoardingId,
      utilityType: 'Electricity',
      amount,
      month,
      description,
      utilityImage,
    };
    if (selectedOccupant.length > 0) {
      utilityData.occupantIDs = selectedOccupant;
    }


    try {
      const costPerOcccupant = amount / selectedOccupant.length;
      utilityData.perCost = costPerOcccupant;

      const uploadPromises = utilityImage.map(async (file) => {

        try {
          const timestamp = new Date().getTime();
          const random = Math.floor(Math.random() * 1000) + 1;
          const uniqueName = `${timestamp}_${random}.${file.name.split('.').pop()}`;

          const storageRef = ref(storage, uniqueName);
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

      console.log(validImageNames)

      //res= await addUtilities({utilityImage:validImageNames});

      const response = await addUtilities({ ...utilityData, utilityImage: validImageNames }).unwrap();
      console.log('Utility added:', response);
      toast.success('Utility added successfully');
      navigate('/owner/utility');

    } catch (err) {
      toast.error(err.data?.message || err.error);
    }
  }

  const previewImage = async (e) => {
    const data = await ImageToBase64(e.target.files[0]);

    setUtilityImage([...utilityImage, e.target.files[0]]);
    setUtilityPreviewImage([...utilityPreviewImage, data]);
  }


  const removeImage = (imageToRemove) => {
    // Find the index of the item to remove in boardingImages
    const indexToRemove = utilityPreviewImage.indexOf(imageToRemove);

    if (indexToRemove !== -1) {
      // Create a copy of the arrays with the item removed
      const updatedPreviewImages = [...utilityPreviewImage];
      const updatedImages = [...utilityImage];

      updatedPreviewImages.splice(indexToRemove, 1);
      updatedImages.splice(indexToRemove, 1);

      // Update the state with the updated arrays
      setUtilityPreviewImage(updatedPreviewImages);
      setUtilityImage(updatedImages);
    }

  };



  const handleAmountChange = (e) => {
    const enteredAmount = e.target.value;

    // Use a regular expression to check if the entered value is a valid number
    if (/^\d*\.?\d*$/.test(enteredAmount)) {
      // If it's a valid number, update the state
      setAmount(enteredAmount);
    } else {
      // If it's not a valid number, show a toast message
      toast.error("Please enter a valid number");
    }
  };
  // Function to handle occupant selection
  const handleOccupantSelection = (occupantId) => {
    if (selectedOccupant.includes(occupantId)) {
      // If occupant is already selected, remove them from the selectedOccupant array
      setSelectedOccupant((prevSelected) => prevSelected.filter((id) => id !== occupantId));
    } else {
      // If occupant is not selected, add them to the selectedOccupant array
      setSelectedOccupant((prevSelected) => [...prevSelected, occupantId]);
    }
  };
  return (
    <>

      <br />
      <Card style={{ boxShadow: '2px 2px 5px 0px rgb(0 0 0 / 27%', width: '64rem', margin: 'auto'}}>

        <Card.Body>
          <Row className="d-flex justify-content-center">
            <Col md={12}>

              <form onSubmit={handleUtilityFormSubmit}>
                <Row className='mt-4'>
                  <Col md={7} >
                    <Card className={CreateBoardingStyles.card}>
                      <CardContent style={{ padding: '25px' }}>
                        <div><Row>
                          <Form.Label>Select Boarding Name</Form.Label>
                        </Row><Row>
                            <FormControl sx={{ m: 1, width: 300 }}>
                              <InputLabel id="boarding-name-label">Boarding Name</InputLabel>
                              <Select
                                className={BillStyles.select}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedBoardingId}
                                label="Boarding Name"
                                onChange={handleBoardingNameChange}
                              >
                                {boardingData.map((boarding) => (
                                  <MenuItem key={boarding.id} value={boarding.id}>
                                    {boarding.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Row>
                        </div>

                        <div className="mt-3">
                          <Form.Label>
                            Total Amount : <span style={{ color: 'red' }}>*</span>
                            <Tooltip title="Give your bill's amount" placement="top" arrow>
                              <HelpOutlineRounded style={{ color: '#707676', fontSize: 'large' }} />
                            </Tooltip>
                          </Form.Label>
                          <InputGroup style={{ width: '60%' }}>
                            <InputGroup.Text>Rs.</InputGroup.Text>
                            <Form.Control
                              type="Number"
                              placeholder="Amount"
                              value={amount}
                              onChange={handleAmountChange}
                              required
                              style={{ width: '40%' }}
                            />
                            <InputGroup.Text>.00</InputGroup.Text>
                          </InputGroup>
                        </div>

                        <div className="mt-3">
                          <Form.Label>Month : <span style={{ color: 'red' }}>*</span></Form.Label>
                          <Form.Control
                            type="month"
                            placeholder="Month"
                            value={month} // Display the selected month
                            readOnly // Make the input read-only
                            required
                            style={{ width: '30%' }}
                            min={getCurrentMonthValue()}
                            max={getCurrentMonthValue()}
                          ></Form.Control>

                        </div>

                        <div className="mt-3">
                          <Form.Label>Description :</Form.Label>
                          <Form.Control
                            as="textarea"
                            type="text"
                            label="Enter Description"
                            rows={3}
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ width: '70%' }}
                          />
                        </div>

                        <div className="mt-4">
                          <Form.Label>Bill Image<span style={{ color: 'red' }}>*</span></Form.Label>
                          <p>({utilityImage.length}/2)</p>
                          <Row>
                            <Col>
                              {utilityImage.length < 2 ? (
                                <Form.Group controlId="formFile" className="mb-0">
                                  <Form.Label className={`${CreateBoardingStyles.addImgLabel}`}>
                                    <AddPhotoAlternate /> Add a photo
                                  </Form.Label>
                                  <Form.Control type="file" accept="image/*" onChange={previewImage} hidden />
                                </Form.Group>
                              ) : (
                                <></>
                              )}
                              {utilityPreviewImage.length > 0 ? (
                                utilityPreviewImage.map((utilityPreviewImage, index) => (
                                  <Badge
                                    key={index}
                                    color="error"
                                    badgeContent={<Close style={{ fontSize: 'xx-small' }} />}
                                    style={{ cursor: 'pointer', marginRight: '10px', marginBottom: '10px' }}
                                    onClick={() => removeImage(utilityPreviewImage)}
                                  >
                                    <Image src={utilityPreviewImage} width={100} height={100} style={{ cursor: 'auto' }} />
                                  </Badge>
                                ))
                              ) : (
                                <></>
                              )}
                            </Col>
                          </Row>
                        </div>
                      </CardContent>
                    </Card>
                  </Col>
                  <Col md={5}>
                    <Card className={CreateBoardingStyles.card}  >
                      <CardContent style={{ padding: '25px' }}>

                        <Form.Label>Select Occupants:</Form.Label>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100px', overflow: 'auto' }}>
                          {occupantData.map((occupant) => (
                            <div key={occupant._id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                              <label style={{ flex: 1 }}>
                                <Checkbox
                                  checked={selectedOccupant.includes(occupant._id)}
                                  onChange={() => handleOccupantSelection(occupant._id)}
                                />
                                {occupant.firstName}
                              </label>
                            </div>
                          ))}
                        </div>

                      </CardContent>

                    </Card>
                  </Col>
                  <Row style={{ marginTop: '20px' }}>


                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        style={{
                          backgroundColor: 'green',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '5px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          width: '150px',
                          height: '50px',
                        }}
                      >
                        Submit
                      </Button>
                      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backDropOpen}>
                        <CircularProgress color="inherit" />
                      </Backdrop>
                    </div>

                  </Row>

                </Row>

              </form>

            </Col>
          </Row>
        </Card.Body>
      </Card>


    </>
  );

};

export default AddUtilitiesPage;