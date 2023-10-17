import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Container, Row, Col, Table } from 'react-bootstrap';
import formStyle from '../styles/formStyle.module.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Breadcrumbs, Typography, Fade, Card, CardContent,Link, Button, TextField ,CircularProgress} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BrowserUpdated as BrowserUpdatedIcon } from '@mui/icons-material';

// Assuming MenuStyles and DeleteOrder are correctly imported.
//import menuStyles from '../styles/menuStyles.module.css';
import DeleteOrder from '../pages/DeleteOrder'; // Make sure to provide the correct path

import { useGetOwnerMenuesMutation } from '../slices/menuesApiSlice';
import orderStyles from '../styles/orderStyles.module.css';
import DeleteMenu from './deleteMenu';

const MenuView = () => {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedmenu, setSelectedMenu] = useState(null); // You need to manage the selected menu

  const { userInfo } = useSelector((state) => state.auth);
  const [getOwnerMenues, { isLoading, data: menus }] = useGetOwnerMenuesMutation(); // Assuming data is the correct property name for the menus
  const userID = userInfo._id
  const loadMenuData = async () => {
    try {
      const res = await getOwnerMenues({ ownerId: userID }).unwrap();
       
      setMenuData(res.menu);
    } catch (error) {
     
      toast.error('Failed to fetch orders. Please try again later.');
    }
  };
  useEffect(() => {
    loadMenuData();
  }, []);

  const filteredMenus = menuData
  .filter((menu) => {
    return (
      menu.menuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.foodType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  

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
        </Row>
        <Row>
        <Col>
          <Table striped bordered hover className={orderStyles.table}>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                <th>Menu Name</th>
                <th>Product</th>
                <th>Food Type</th>
                <th>Cost</th>
                <th>Price</th>
                {/*<th>Owner</th>*/}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                  <td colSpan={7}>
                    <CircularProgress />
                  </td>
                </tr>
              ) : filteredMenus.length > 0 ? (
                filteredMenus.map((menu, index) => (
                  <tr key={index}>
                    <td>{menu.menuName}</td>
                    <td>{menu.product}</td>
                    <td>{menu.foodType}</td>
                    <td>{menu.cost}</td>
                    <td>{menu.price}</td>
                    {/*<td>{menu.owner}</td>*/}
                    <td align="center">
                    <Button  style={{ background: ' lightgreen', color: 'white', marginRight: '10px' }}
                          onClick={() => navigate(`/owner/menu/updateMenu/${menu._id}`)}>
                              <BrowserUpdatedIcon />
                          </Button>
                      <Button
                        style={{ background: 'red', color: 'white' }}
                        onClick={() => openDeleteModal(menu)}
                      >
                        <DeleteIcon />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ height: '100%', width: '100%', textAlign: 'center', color: 'blue' }}>
                  <td colSpan={7}>
                    <h4>No matching menus found!</h4>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
      {selectedmenu && (
        <DeleteMenu
          menu={selectedmenu}
          onClose={closeDeleteModal}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};

export default MenuView;
