import * as React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo, clearUserInfo } from "../slices/authSlice";
import { useGenerateSMSOTPMutation, useLogoutMutation, useUpdateUserMutation, useVerifySMSOTPMutation } from '../slices/usersApiSlice';
import { ImageToBase64 } from "../utils/ImageToBase64";
import { StringToAvatar } from "../utils/StringToAvatar";
import { toast } from 'react-toastify';
import { Breadcrumbs, Typography, Link, Grid, Card, CardContent, Avatar, Badge, Fade, Button, Stack, List, Divider, IconButton, Modal, Box } from '@mui/material';
import { MuiOtpInput } from 'mui-one-time-password-input'
import { Container, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Check, Sync, Close} from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import LoadingButton from '@mui/lab/LoadingButton';

import Sidebar from '../components/sideBar';

import dashboardStyles from '../styles/dashboardStyles.module.css';

const ProfilePage = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [accType, setAccType] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [image, setImage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [viewUserInfo, setViewUserInfo] = useState();
    const [updateUserInfo, setUpdateUserInfo] = useState();
    const [userType, setUserType] = useState('');
    const [gender, setGender] = useState('');
    const [totalPayable, setTotalPayable] = useState('');
    const [phoneNo, setPhoneNo] = useState(userInfo.phoneNo ? userInfo.phoneNo : '');
    const [bankAccNo, setBankAccNo] = useState(userInfo.bankAccNo ? userInfo.bankAccNo : '');
    const [bankAccName, setBankAccName] = useState(userInfo.bankAccName ? userInfo.bankAccName : '');
    const [bankName, setBankName] = useState(userInfo.bankName ? userInfo.bankName : '');
    const [bankBranch, setBankBranch] = useState(userInfo.bankBranch ? userInfo.bankBranch : '');    
    const [modalOpen, setModalOpen] = useState(false);        
    const [otp, setOTP] = useState('');    
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [update, {isLoading}] = useUpdateUserMutation();
    const [ logout ] = useLogoutMutation();
    const [generateSMSOTP, {isLoading1}] = useGenerateSMSOTPMutation();
    const [verifySMSOTP, {isLoading2}] = useVerifySMSOTPMutation();

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        borderRadius: '5px',
        boxShadow: 24,
        p: 4,
        textAlign:'center'
    };

    useEffect(() => {
        setEmail(userInfo.email);
        setAccType(userInfo.accType);
        setImage(userInfo.image);
        setImagePath(userInfo.image);
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
        setUserType(userInfo.userType);
        setPhoneNo(userInfo.phoneNo);
        setGender(userInfo.gender);
        setTotalPayable(userInfo.totalPayable);
        setViewUserInfo(true);
        setUpdateUserInfo(false);
        document.getElementById('updateUser').style.display = 'none';
        document.getElementById('viewUser').style.display = 'flex';
    }, [userInfo]);

    const logoutHandler = async () => {
        try {
            await logout().unwrap();
            dispatch(clearUserInfo());
            toast.success("Logged Out");
            navigate('/');
        } catch (err) {
            toast.error(err);
        }
    }

    const editProfile = () => {
        setViewUserInfo(false);
        document.getElementById('viewUser').style.display = 'none';
        document.getElementById('updateUser').style.display = 'flex';
        setUpdateUserInfo(true);
    }

    const viewProfile = () => {
        setViewUserInfo(true);
        setEmail(userInfo.email);
        setAccType(userInfo.accType);
        setImage(userInfo.image);
        setImagePath(userInfo.image);
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
        setUserType(userInfo.userType);
        setPhoneNo(userInfo.phoneNo);
        setGender(userInfo.gender);
        setTotalPayable(userInfo.totalPayable);
        setPhoneNo(userInfo.phoneNo ? userInfo.phoneNo : '');
        setBankAccNo(userInfo.bankAccNo ? userInfo.bankAccNo : '');
        setBankAccName(userInfo.bankAccName ? userInfo.bankAccName : '');
        setBankName(userInfo.bankName ? userInfo.bankName : '');
        setBankBranch(userInfo.bankBranch ? userInfo.bankBranch : '');
        document.getElementById('viewUser').style.display = 'flex';
        document.getElementById('updateUser').style.display = 'none';
        setUpdateUserInfo(false);
    }

    const previewImage = async(e) => {

        setImagePath(URL.createObjectURL(e.target.files[0]));
        const data = await ImageToBase64(e.target.files[0]);
        setImage(data);

    }

    const sendOTP = async() => {
        const _id = userInfo._id;
        if(phoneNo == null || phoneNo == ''){
            toast.error("Enter Phone Number to Verify")
        } 
        else if(phoneNo.length != 9){
            toast.error("Enter a valid Phone Number")
        }
        else{
            try {
                const res = await generateSMSOTP({ _id, phoneNo }).unwrap();
                toast.success("OTP Sent");
                setModalOpen(true);
            } catch (err) {
                toast.error(err);
            }       
        }
    }

    const verifyOTP = async() => {
        const _id = userInfo._id;
        try {
            const res = await verifySMSOTP({ _id, otp, phoneNo }).unwrap();
            dispatch(setUserInfo({...res})); 
            toast.success('Your phone number is verified!');
            setModalOpen(false);
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }
    
    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(password);
        console.log(confirmPassword);
        if(password != confirmPassword && password != null){
            toast.error('Passwords do not match');
        }
        else{
            if(password == ''){
                setPassword(userInfo.password);
            }
            try {
                const res = await update({ email, image, firstName, lastName, password, userType, phoneNo, gender, bankAccNo, bankAccName, bankName, bankBranch }).unwrap();
                dispatch(setUserInfo({...res}));
                toast.success('Profile Updated');
                navigate('/profile');
            } catch (err) {
                toast.error(err.data?.message || err.error);
            }
        }
    }

    return (
        <>
            <Sidebar />
            <div className={dashboardStyles.mainDiv}>
                <Container className={dashboardStyles.container}>
                    <Row>
                        <Col>
                            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" className="py-2 ps-3 mt-4 bg-primary-subtle">
                                <Link underline="hover" key="1" color="inherit" href="/">Home</Link>,
                                <Link underline="hover" key="2" color="inherit" href="/profile">{userType == 'owner' ? 'Owner' : (userType == 'occupant' ? 'Occupant' : userType == 'admin' ? 'Admin' : userType == 'kitchen' ? 'Kitchen' : <></>)}</Link>,
                                <Typography key="3" color="text.primary">Profile</Typography>
                            </Breadcrumbs>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col>
                            <Card className='mt-3 py-3 text-center'>
                                {userType == 'owner' ? <h2>Owner Dashboard</h2> : (userType == 'occupant' ? <h2>Occupant Dashboard</h2> : userType == 'admin' ? <h2>Admin Dashboard</h2> : userType == 'kitchen' ? <h2>Inventory Manager Dashboard</h2> : <></>)}
                            </Card>
                        </Col>
                    </Row>
                    <Fade in={viewUserInfo} >
                        <Row className='mt-3'id='viewUser'>
                            <Col className="mb-3" xs={12} md={4}>
                                <Row>
                                    <Col>
                                        <Card>
                                            <CardContent className={dashboardStyles.cardContent}>
                                                
                                                { imagePath ? 
                                                    <Avatar alt={firstName+" "+lastName} src={imagePath} sx={{ width: 130, height: 130 }} referrerPolicy="no-referrer" /> 
                                                    : 
                                                    <Typography component="div">
                                                        <Avatar alt={firstName+" "+lastName} {...StringToAvatar(firstName+" "+lastName)} style={{ width: 130, height: 130, fontSize: 50 }} />
                                                    </Typography> 
                                                }
                                                
                                                <Typography sx={{ fontWeight: 'bold' }} className='mt-4 text-center'>{firstName+" "+lastName}</Typography>
                                                <Stack direction="row" spacing={2} className='mt-5'>
                                                    <Button variant="contained" color="primary" onClick={editProfile} startIcon={<EditIcon />}>Edit</Button>
                                                    <Button variant="outlined" color="error" onClick={ logoutHandler }>Logout</Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Col>
                                </Row>
                                {/*userType == 'occupant' ? 
                                <Row>
                                    <Col>
                                        <Card className='mt-3'>
                                            <CardContent className={`${dashboardStyles.cardContent} pt-3 pb-3`}>
                                                <h4>Total Payable</h4>
                                                <h3>Rs. {totalPayable}</h3>
                                            </CardContent>
                                        </Card>
                                    </Col>
                                </Row>
                                :<></>*/}
                            </Col>
                            <Col className="mb-3" xs={12} md={8}>
                                <Card>
                                    <CardContent className={`${dashboardStyles.cardContent} ${dashboardStyles.compact}`}>
                                        <List sx={{width:'100%'}} component="nav">
                                            <Row className='py-3'>
                                                <Col>
                                                    <b>First Name</b>
                                                </Col>
                                                <Col>
                                                    {firstName}
                                                </Col>
                                            </Row>
                                            <Divider sx={{borderColor:'initial'}}/>
                                            <Row className='py-3'>
                                                <Col>
                                                    <b>Last Name</b>
                                                </Col>
                                                <Col>
                                                    {lastName}
                                                </Col>
                                            </Row>
                                            <Divider sx={{borderColor:'initial'}}/>
                                            <Row className='py-3'>
                                                <Col>
                                                    <b>Username</b>
                                                </Col>
                                                <Col>
                                                    {firstName+" "+lastName}
                                                </Col>
                                            </Row>
                                            <Divider sx={{borderColor:'initial'}}/>
                                            <Row className='py-3'>
                                                <Col>
                                                    <b>Email</b>
                                                </Col>
                                                <Col>
                                                    {email}
                                                </Col>
                                            </Row>
                                            <Divider sx={{borderColor:'initial'}}/>
                                            <Row className='py-3'>
                                                <Col>
                                                    <b>Gender</b>
                                                </Col>
                                                <Col>
                                                    {gender}
                                                </Col>
                                            </Row>
                                            <Divider sx={{borderColor:'initial'}}/>
                                            { userType != "owner"?
                                            <>
                                            <Row className='my-2'>
                                                <Col>
                                                    <b>Phone Number</b>
                                                </Col>
                                                <Col>
                                                    {userInfo.phoneNo ?
                                                        <InputGroup style={{width:'fit-content'}}>
                                                            <InputGroup.Text style={{color:'green'}}><Check /></InputGroup.Text>
                                                            <Form.Control type="text" placeholder="PhoneNo" value={phoneNo} required readOnly style={{width:'fit-content'}}/>
                                                        </InputGroup>
                                                    :
                                                    <InputGroup style={{width:'fit-content'}}>
                                                        <InputGroup.Text>(+94)</InputGroup.Text>
                                                        <Form.Control placeholder="715447792" type="text" maxLength={9} value={phoneNo} onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ''))}/>
                                                        <LoadingButton loading={isLoading1} variant="contained" className="ms-2" onClick={sendOTP}>Add</LoadingButton>
                                                    </InputGroup>
                                                    }
                                                    <Modal
                                                        open={modalOpen}
                                                        onClose={() => setModalOpen(false)}
                                                        aria-labelledby="OTP Modal"
                                                        aria-describedby="OTP Modal"
                                                    >
                                                        <Box sx={style}>
                                                            
                                                            <h1>OTP Verification</h1>
                                                            <br />
                                                            <p className="text-start">The OTP code has being sent to +94{phoneNo}. Please enter the code below to verify.</p>
                                                            <MuiOtpInput value={otp} length={6} onChange={ (e) => setOTP(e)} />
                                                            <LoadingButton loading={isLoading2} onClick={ verifyOTP } color="primary" variant="contained" className="mt-3">Verify OTP</LoadingButton>
                                                            <LoadingButton loading={isLoading1} onClick={ sendOTP } color="primary" variant="contained" className="mt-3 ms-3"><Sync /> Resend</LoadingButton>
                                                            
                                                        </Box>
                                                    </Modal>
                                                </Col>
                                            </Row>
                                            <Divider sx={{borderColor:'initial'}}/>
                                            </> : ''
                                            }
                                        </List>
                                    </CardContent>
                                </Card>
                            </Col>
                            { userType == "owner"?
                            <Col className="mb-3" xs={12} md={12}>
                                <Card>
                                    <CardContent className={`${dashboardStyles.cardContent} ${dashboardStyles.compact}`}>                                        
                                        <List sx={{width:'100%'}} component="nav">
                                            <Row style={{marginTop:'20px'}}>
                                                <Col>
                                                    <p>
                                                        <b>Bank Details</b>
                                                    </p>
                                                </Col>
                                            </Row>
                                            <Row style={{marginBottom:'10px'}}>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Bank Account No.<span style={{color:'red'}}>*</span></Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="string" minLength={6} maxLength={16} pattern="^[0-9]*$" placeholder="01234565345" value={bankAccNo} onChange={ (e) => setBankAccNo(e.target.value)} required disabled={userInfo.bankAccNo ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>
                                                                Account Holder Name<span style={{color:'red'}}>*</span> 
                                                            </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="James Bond" value={bankAccName} onChange={ (e) => setBankAccName(e.target.value)} required disabled={userInfo.bankAccName ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>Bank Name<span style={{color:'red'}}>*</span></Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="BOC" value={bankName} onChange={ (e) => setBankName(e.target.value)} required disabled={userInfo.bankName ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                    <Row style={{marginTop:'10px'}}>
                                                        <Col style={{height:'100%'}} xs={12} md={4}>
                                                            <Form.Label style={{margin:0}}>
                                                                Branch Name<span style={{color:'red'}}>*</span> 
                                                            </Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8}>
                                                            <Form.Control type="text" placeholder="Gampaha Branch" value={bankBranch} onChange={ (e) => setBankBranch(e.target.value)} required disabled={userInfo.bankBranch ? true : false} style={{width:'95%'}} />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <hr />
                                            <Row style={{marginTop:'20px'}}>
                                                <Col>
                                                    <Row>
                                                        <Col style={{height:'100%'}} xs={12} md={4} lg={2}>
                                                            <Form.Label style={{margin:0}}>Phone Number<span style={{color:'red'}}>*</span></Form.Label>
                                                        </Col>
                                                        <Col style={{height:'100%'}} xs={12} md={8} ls={10}>
                                                            {userInfo.phoneNo ?
                                                                <InputGroup style={{width:'fit-content'}}>
                                                                    <InputGroup.Text style={{color:'green'}}><Check /></InputGroup.Text>
                                                                    <Form.Control type="text" placeholder="PhoneNo" value={phoneNo} required readOnly style={{width:'fit-content'}}/>
                                                                </InputGroup>
                                                            :
                                                            <InputGroup style={{width:'fit-content'}}>
                                                                <InputGroup.Text>(+94)</InputGroup.Text>
                                                                <Form.Control placeholder="715447792" type="text" maxLength={9} value={phoneNo} onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ''))}/>
                                                                <LoadingButton loading={isLoading1} variant="contained" className="ms-2" onClick={sendOTP}>Add</LoadingButton>
                                                            </InputGroup>
                                                            }
                                                            <Modal
                                                                open={modalOpen}
                                                                onClose={() => setModalOpen(false)}
                                                                aria-labelledby="OTP Modal"
                                                                aria-describedby="OTP Modal"
                                                            >
                                                                <Box sx={style}>
                                                                    
                                                                    <h1>OTP Verification</h1>
                                                                    <br />
                                                                    <p className="text-start">The OTP code has being sent to +94{phoneNo}. Please enter the code below to verify.</p>
                                                                    <MuiOtpInput value={otp} length={6} onChange={ (e) => setOTP(e)} />
                                                                    <LoadingButton loading={isLoading2} onClick={ verifyOTP } color="primary" variant="contained" className="mt-3">Verify OTP</LoadingButton>
                                                                    <LoadingButton loading={isLoading1} onClick={ sendOTP } color="primary" variant="contained" className="mt-3 ms-3"><Sync /> Resend</LoadingButton>
                                                                    
                                                                </Box>
                                                            </Modal>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </List>
                                    </CardContent>
                                </Card>
                            </Col>
                            : ''}
                        </Row>
                    </Fade>
                    <Fade in={updateUserInfo} id='updateUser'>
                        <form encType="multipart/form-data" onSubmit={ submitHandler } >
                            <Grid container spacing={5} className="mt-1">
                                <Grid item xs={4}>
                                    <Card>
                                        <CardContent style={{display:"flex", alignItems:"center", flexDirection:"column", padding:"50px 50px 30px 50px"}}>
                                            <Form.Group controlId="formFile" className="mb-0">
                                                <Form.Label className="mb-0">
                                                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        badgeContent={imagePath ?
                                                            <EditIcon sx={{bgcolor:"#e4e4e4"}} style={{borderRadius:"100%", padding:"4px", cursor:'pointer'}} color="primary" fontSize="medium" />
                                                            :
                                                            <AddIcon sx={{bgcolor:"#e4e4e4"}} style={{borderRadius:"100%", padding:"4px", cursor:'pointer'}} color="primary" fontSize="medium" />
                                                        }
                                                    >
                                                        { imagePath ? 
                                                            <Avatar alt={firstName+" "+lastName} src={imagePath} sx={{ width: 130, height: 130, cursor:'pointer' }} /> 
                                                            : 
                                                            <Typography component="div">
                                                                <Avatar alt={firstName+" "+lastName} {...StringToAvatar(firstName+" "+lastName)} style={{ width: 130, height: 130, fontSize: 50, cursor:'pointer' }} />
                                                            </Typography> 
                                                        }
                                                    </Badge>
                                                </Form.Label>
                                                <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                            </Form.Group>
                                            <br/>
                                            <Typography sx={{ fontWeight: 'bold' }}>{firstName+" "+lastName}</Typography>
                                            <Stack direction="row" spacing={2} className='mt-5'>
                                                <LoadingButton type="submit" loading={isLoading} color="warning" variant="contained" startIcon={<UpdateIcon />}>Update</LoadingButton>
                                                <Button variant="outlined" color="error" onClick={viewProfile}>Cancel</Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={8}>
                                    <Card>
                                        <CardContent style={{display:"flex", alignItems:"center", flexDirection:"column", padding:"10px 50px 30px 50px", height:'342px', overflow:'auto'}}>
                                            <List sx={{width:'100%'}} component="nav">
                                                <Form.Group controlId="fName">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>First Name</b></Form.Label>
                                                        </Col>
                                                        <Col>
                                                            <Form.Control 
                                                                type="text" 
                                                                placeholder="Enter First Name" 
                                                                value={firstName} 
                                                                required
                                                                onChange={ (e) => setFirstName(e.target.value)}
                                                            ></Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                <Form.Group controlId="lName">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>Last Name</b></Form.Label>
                                                        </Col>
                                                        <Col>
                                                            <Form.Control 
                                                                type="text" 
                                                                placeholder="Enter Last Name" 
                                                                value={lastName} 
                                                                onChange={ (e) => setLastName(e.target.value)}
                                                            ></Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                <Form.Group controlId="uName">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>Username</b></Form.Label>
                                                        </Col>
                                                        <Col>
                                                            <Form.Control 
                                                                type="text" 
                                                                placeholder="Enter Username" 
                                                                value={firstName+" "+lastName} 
                                                                required
                                                                onChange={ (e) => setDisplayName(e.target.value)}
                                                            ></Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                <Form.Group controlId="email">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>Email Address</b></Form.Label>
                                                        </Col>
                                                        <Col>
                                                            <Form.Control 
                                                                type="email" 
                                                                placeholder="Enter Email" 
                                                                value={email} 
                                                                required
                                                                disabled
                                                            ></Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                <Form.Group controlId="gender">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>Gender</b></Form.Label>
                                                        </Col>
                                                        <Col style={{display:'inline-flex', justifyContent:'space-around'}}>
                                                            <Form.Check
                                                                type='radio'
                                                                id={`Male`}
                                                                label={`Male`}
                                                                name='gender'
                                                                checked={gender=="Male"? true : false}
                                                                onChange={(e) => setGender(e.target.id)}
                                                            />
                                                            <Form.Check
                                                                type='radio'
                                                                id={`Female`}
                                                                label={`Female`}
                                                                name='gender'
                                                                checked={gender=="Female"? true : false}
                                                                onChange={(e) => setGender(e.target.id)}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                {accType === 'google'? <></> : <>
                                                <Form.Group controlId="pwd">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>New Password</b></Form.Label>
                                                        </Col>
                                                        <Col>
                                                            <Form.Control 
                                                                type="password" 
                                                                placeholder="Enter New Password" 
                                                                onChange={ (e) => setPassword(e.target.value)}
                                                            ></Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                <Form.Group controlId="cPwd">
                                                    <Row className='py-3'>
                                                        <Col>
                                                            <Form.Label><b>Confirm Password</b></Form.Label>
                                                        </Col>
                                                        <Col>
                                                            <Form.Control 
                                                                type="password" 
                                                                placeholder="Enter Password"
                                                                onChange={ (e) => setConfirmPassword(e.target.value)}
                                                            ></Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Divider sx={{borderColor:'initial'}}/>
                                                    </>}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent style={{display:"flex", alignItems:"center", flexDirection:"column", padding:"10px 50px 30px 50px"}}>
                                            <List sx={{width:'100%'}} component="nav">
                                                <Row style={{marginTop:'20px'}}>
                                                    <Col>
                                                        <p>
                                                            <b>Bank Details</b>
                                                        </p>
                                                    </Col>
                                                </Row>
                                                <Row style={{marginBottom:'10px'}}>
                                                    <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                        <Row>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>Bank Account No.<span style={{color:'red'}}>*</span></Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Form.Control type="string" minLength={6} maxLength={16} pattern="^[0-9]*$" placeholder="01234565345" value={bankAccNo} onChange={ (e) => setBankAccNo(e.target.value)} required style={{width:'95%'}} />
                                                            </Col>
                                                        </Row>
                                                        <Row style={{marginTop:'10px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>
                                                                    Account Holder Name<span style={{color:'red'}}>*</span> 
                                                                </Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Form.Control type="text" placeholder="James Bond" value={bankAccName} onChange={ (e) => setBankAccName(e.target.value)} required style={{width:'95%'}} />
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col xs={12} md={6} style={{marginBottom:'10px',paddingRight: '20px'}}>
                                                        <Row>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>Bank Name<span style={{color:'red'}}>*</span></Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Form.Control type="text" placeholder="BOC" value={bankName} onChange={ (e) => setBankName(e.target.value)} required style={{width:'95%'}} />
                                                            </Col>
                                                        </Row>
                                                        <Row style={{marginTop:'10px'}}>
                                                            <Col style={{height:'100%'}} xs={12} md={4}>
                                                                <Form.Label style={{margin:0}}>
                                                                    Branch Name<span style={{color:'red'}}>*</span> 
                                                                </Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8}>
                                                                <Form.Control type="text" placeholder="Gampaha Branch" value={bankBranch} onChange={ (e) => setBankBranch(e.target.value)} required style={{width:'95%'}} />
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <hr />
                                                <Row style={{marginTop:'20px'}}>
                                                    <Col>
                                                        <Row>
                                                            <Col style={{height:'100%'}} xs={12} md={4} lg={2}>
                                                                <Form.Label style={{margin:0}}>Phone Number<span style={{color:'red'}}>*</span></Form.Label>
                                                            </Col>
                                                            <Col style={{height:'100%'}} xs={12} md={8} ls={10}>
                                                                {phoneNo==userInfo.phoneNo ?
                                                                    <InputGroup style={{width:'fit-content'}}>
                                                                        <InputGroup.Text style={{color:'green'}}><Check /></InputGroup.Text>
                                                                        <Form.Control type="text" placeholder="PhoneNo" value={phoneNo} required readOnly style={{width:'fit-content'}}/><IconButton onClick={() => setPhoneNo('')}><Close /></IconButton>
                                                                    </InputGroup>
                                                                :
                                                                <InputGroup style={{width:'fit-content'}}>
                                                                    <InputGroup.Text>(+94)</InputGroup.Text>
                                                                    <Form.Control placeholder="715447792" type="text" maxLength={9} value={phoneNo} onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ''))}/>
                                                                    <LoadingButton loading={isLoading1} variant="contained" className="ms-2" onClick={sendOTP}>Add</LoadingButton>
                                                                </InputGroup>
                                                                }
                                                                <Modal
                                                                    open={modalOpen}
                                                                    onClose={() => setModalOpen(false)}
                                                                    aria-labelledby="OTP Modal"
                                                                    aria-describedby="OTP Modal"
                                                                >
                                                                    <Box sx={style}>
                                                                        
                                                                        <h1>OTP Verification</h1>
                                                                        <br />
                                                                        <p className="text-start">The OTP code has being sent to +94{phoneNo}. Please enter the code below to verify.</p>
                                                                        <MuiOtpInput value={otp} length={6} onChange={ (e) => setOTP(e)} />
                                                                        <LoadingButton loading={isLoading2} onClick={ verifyOTP } color="primary" variant="contained" className="mt-3">Verify OTP</LoadingButton>
                                                                        <LoadingButton loading={isLoading1} onClick={ sendOTP } color="primary" variant="contained" className="mt-3 ms-3"><Sync /> Resend</LoadingButton>
                                                                        
                                                                    </Box>
                                                                </Modal>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </form>
                    </Fade>
                </Container>
            </div>
        </> 
    );
};

export default ProfilePage;