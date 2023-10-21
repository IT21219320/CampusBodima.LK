import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Container, Card, Row, Col, Modal } from 'react-bootstrap';
import formStyle from '../styles/formStyle.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { MenuItem, FormControl, InputLabel, Select, Button, TextField, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BrowserUpdated as BrowserUpdatedIcon, PlaylistAdd } from '@mui/icons-material';
import UploadIcon from '@mui/icons-material/Upload';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import orderStyles from '../styles/orderStyles.module.css'
import { useAddMenuMutation, useUpdateMenuesMutation } from '../slices/menuesApiSlice';

import { useGetOwnerMenuesMutation } from '../slices/menuesApiSlice';
import DeleteMenu from './deleteMenu';

import storage from "../utils/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const MenuView = () => {
  const [menuData, setMenuData] = useState([]);
  const [tempMenuData, setTempMenuData] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedmenu, setSelectedMenu] = useState(null); // You need to manage the selected menu
  const [showAddItm, setShowAddItm] = useState('');
  const [showUpdateItm, setShowUpdateItm] = useState('');
  const [boardingNames, setBoardingNames] = useState('');
  const [menuName, setMenuName] = useState('');
  const [product, setProduct] = useState('');
  const [boarding, setBoarding] = useState('');
  const [cost, setCost] = useState('');
  const [foodType, setFoodType] = useState('');
  const [price, setPrice] = useState('');
  const [activeTab, setActiveTab] = useState('Create Menu');
  const { userInfo } = useSelector((state) => state.auth);
  const ownerId=userInfo._id;
  const [foodImage, setImage] = useState(null);
  const [createMenu, { isError, error }] = useAddMenuMutation();
  const [boardingId, setBoardingId] = useState('');
  const [getOwnerMenues, { isLoading, data: menus }] = useGetOwnerMenuesMutation(); 
  const [updateMenu] = useUpdateMenuesMutation();// Assuming data is the correct property name for the menus
  const userID = userInfo._id
  
  

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
        toast.error('Please fill out all fields with valid data.');
        return;
      }
    try {
      
      const response = await createMenu({
        userInfo_id: ownerId,
        product: product,
        boarding: boardingId,
        price: price,
        ownerId: ownerId,
      }).unwrap();


      if (response) {
        toast.success('Menu Created Successfully');
        setPrice('')
        setProduct('')
        setImage(null)
        setShowAddItm(false)
        loadMenuData()
      }
    } catch (err) {
      toast.error(err.data?.message || err.error || err);
    }
  };

  const updateSubmitHandler = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      const updatedMenu = await updateMenu({
        _id: tempMenuData._id,
        product: tempMenuData.product,
        price: tempMenuData.price,
      }).unwrap();
      toast.success('Menu updated successfully');
      setLoading(false)
      setTempMenuData('')
      setShowUpdateItm(false)
      loadMenuData()
      console.log(updatedMenu);

    } catch (err) {
      toast.error(err.data?.message || err.error || err);
      setLoading(false)
    }
  }

  const loadMenuData = async () => {
    try {
      const res = await getOwnerMenues({ ownerId: userID, boardingId }).unwrap();
      
      setMenuData(res.menu);
      setBoardingNames(res.boarding);
      if(boardingId == ''){
        setBoardingId(res.boarding[0]._id)
      }

    } catch (err) {
      console.log(err);
      toast.error(err.data?.message || err.error || err);
    }
  };
  useEffect(() => {
    loadMenuData();
  }, [boardingId]);

  const filteredMenus = menuData
    .filter((menu) => {
      return (
        menu.product.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const openDeleteModal = (menu) => {
    setSelectedMenu(menu);
    // Open the delete modal here
  };

  const closeDeleteModal = () => {
    setSelectedMenu(null);
    // Close the delete modal here
  };

  const handleDeleteSuccess = () => {
    loadMenuData();
    closeDeleteModal();
  };
  const formContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  const formBorder = {
    border: '1px solid #ccc', // Border around the form
    borderRadius: '4px',
    padding: '15px',
  };
  
  const gridContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gridGap: '10px',
    marginBottom: '15px',
  };
  
  const labelStyle = {
    fontSize: '16px',
    color: 'rgb(25, 25, 112)',
    alignSelf: 'center',
  };
  
  const inputStyle = {
    width: '100%',
   
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif',
  };
  
  const errorStyle = {
    color: 'red',
    marginTop: '10px',
    fontSize: '12px',
  };
  
  const isFormValid = () => {
    
  
    // Validate productName (under 15 characters)
    if ( product.length > 15) {
      toast.error('Product Name must be under 15 characters.');
      return false;
    }else if(product.trim() === ''){
      toast.error('Product Name can not be null');
      return false;
    }
  
    // Validate price (positive number)
    if (price.trim() === '' || isNaN(price) || parseFloat(price) <= 0) {
      toast.error('Price must be a positive number.');
      return false;
    }
  
    return true;
  };
  

  return (
    <>
      <Row>
        <Col>
          <div className={orderStyles.card}>
            <h3>Menu</h3>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <TextField
            id="search"
            label="Search In Menu"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={formStyle.searchField}
          />
        </Col>
        <Col>
          <div style={{ float: 'right', minWidth: '220px' }}>

            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Boarding Name</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={boardingId}
                label="Boarding Name"
                onChange={(e) => setBoardingId(e.target.value)}
              >
                {Array.isArray(boardingNames) && boardingNames.map((boarding) => (
                  <MenuItem key={boarding._id} value={boarding._id}>
                    {boarding.boardingName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Card>
            <Card.Header>
              Featured
              <span style={{ float: 'right' }}>
                <Button variant="contained" style={{ background: '#4ec64e' }} onClick={() => setShowAddItm(true)}>
                  <PlaylistAdd />&nbsp; Add Item
                </Button>
              </span>
            </Card.Header>
            <Card.Body>
              <TableContainer compenent={Paper}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                  <TableCell align="center"><b>Product</b></TableCell>
                  <TableCell align="center"><b>Price</b></TableCell>
                  <TableCell align="center"><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {isLoading ? (
                    <TableRow>
                    <td colSpan={7}>
                        <CircularProgress />
                      </td>
                    </TableRow>
                  ) : filteredMenus.length > 0 ? (
                    filteredMenus.map((menu, index) => (
                      <tr key={index}>
                        <TableCell align="center">{menu.product}</TableCell>
                        <TableCell align="center">{menu.price}</TableCell>
                        <TableCell align="center">
                          <Button variant="text"  color="success"
                          className={orderStyles.updatebutton}
                            onClick={() => {setShowUpdateItm(true);setTempMenuData(menu)}}>
                            <UploadIcon />
                          </Button>
                          <Button variant="text" color="error"
                            className={orderStyles.deletebutton}
                            onClick={() => openDeleteModal(menu)}
                          >
                            <DeleteIcon />
                          </Button>
                          </TableCell>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                      <td colSpan={5}>
                        <h4>No matching menus found!</h4>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              </TableContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {selectedmenu && (
        <DeleteMenu
          menu={selectedmenu}
          onClose={closeDeleteModal}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
      {/*Insert Modal */}
      <Modal show={showAddItm} onHide={() => setShowAddItm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <>
            <Container style={containerStyle} maxwidth="md">
              <Row>
                <Col>
                  <form onSubmit={submitHandler} style={formContainer} encType="multipart/form-data">
                    <div style={formBorder}>
                      <div style={gridContainer}>
                        <div style={labelStyle}>Item Name</div>
                        <TextField
                          type="text"
                          value={product}
                          onChange={(e) => setProduct(e.target.value)}
                          required
                          style={inputStyle}
                        />


                        <div style={labelStyle}>Price</div>
                        <TextField
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </form>

                </Col>
              </Row>
            </Container>
          </>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddItm(false)}>
            Close
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading} onClick={submitHandler}>
          {isLoading ? 'Creating Menu Item...' : 'Create Menu Item'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/*Update Modal */}
      <Modal show={showUpdateItm} onHide={() => {setShowUpdateItm(false);setTempMenuData('')}}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <Container style={containerStyle} maxwidth="md">
              <Row>
                <Col>
                  <form onSubmit={updateSubmitHandler} style={formContainer} encType="multipart/form-data">
                    <div style={formBorder}>
                      <div style={gridContainer}>
                        <div style={labelStyle}>Item Name</div>
                        <TextField
                          type="text"
                          value={tempMenuData.product}
                          onChange={(e) => setTempMenuData({ ...tempMenuData, product: e.target.value })}
                          required
                          style={inputStyle}
                        />

                        <div style={labelStyle}>Price</div>
                        <TextField
                          type="number"
                          value={tempMenuData.price}
                          onChange={(e) => setTempMenuData({ ...tempMenuData, price: e.target.value })}
                          required
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </form>

                </Col>
              </Row>
            </Container>
          </>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {setShowUpdateItm(false);setTempMenuData('')}}>
            Close
          </Button>
          <Button type="submit" variant="contained" disabled={loading} onClick={updateSubmitHandler}>
          {loading ? 'Updating Menu Item...' : 'Update Menu Item'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MenuView;
