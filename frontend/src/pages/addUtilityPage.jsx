import { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, FloatingLabel} from 'react-bootstrap';
import { Breadcrumbs, Typography, Fade, Card, CardContent, Link, InputLabel, Select, MenuItem, FormControl, TextField,} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import { useAddUtilitiesMutation } from '../slices/utilitiesApiSlice';
import { useGetOwnerBoardingsMutation } from '../slices/boardingsApiSlice';

import dashboardStyles from '../styles/dashboardStyles.module.css';
import Sidebar from '../components/sideBar';


const addUtilities = () =>{

    const [boardingId, setBoardingId] = useState([]);
    const [utilityType,setUtilityType] = useState('Electricity');
    const [ amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [utilityImage,setUtilityImage] = useState('');

    
    const navigate = useNavigate();
     
    const [addUtilities, {isLoading}] = useAddUtilitiesMutation(); 


    const { userInfo } = useSelector((state) => state.auth);
    
    const [getOwnerBoardings, { loading }] = useGetOwnerBoardingsMutation();
    
    useEffect(() => {
    const loadData = async () => {
        try {
            const data = userInfo._id;
            const res = await getOwnerBoardings( data ).unwrap();
            console.log('res.boardings:', res.boardings);
            if (Array.isArray(res.boardings)) {
                setBoardingId(res.boardings);
              } else {
                console.error("boardings data is not an array:", res.boardings);
              } 
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    };
    loadData();
},[getOwnerBoardings, userInfo._id]);

console.log('boardingId:', boardingId);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
      PaperProps: {
      style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

       const handleChange = (event) => {
        const {
          target: { value },
        } = event;
        setBoardingId(value);
      };

 return(
    <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userInfo.userType == 'owner' ? 'Owner' : (userInfo.userType == 'occupant' ? 'Occupant' : userInfo.userType == 'admin' ? 'Admin' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">AddUtility</Typography>
                            </Breadcrumbs>
                            <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-name-label">Boarding Name</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          multiple
          value={boardingId}
          onChange={handleChange}
        >
          {boardingId.map((id) => (
            <MenuItem
              key={id}
              value={id}
            >
              {id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
                                                            
                        </Col>
                    </Row>

                </Container>    
            </div>
    </>        
 )  

};

export default addUtilities;