import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Container, Row, Col, Image } from 'react-bootstrap';
import { Divider, TextField, Box, InputAdornment, IconButton, Button, Radio, RadioGroup , FormControlLabel , FormControl, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LinearProgress, Typography, Stack } from '@mui/joy';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleLoginMutation, useRegisterMutation } from '../slices/usersApiSlice';
import { setUserInfo } from "../slices/authSlice";
import { ImageToBase64 } from "../utils/ImageToBase64";
import LoadingButton from '@mui/lab/LoadingButton';
import styles from '../styles/loginStyles.module.css';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [imagePath, setImagePath] = useState('./images/addProfile.png');
    const [image, setImage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [userType, setUserType] = useState('occupant');
    const [gender, setGender] = useState('Male');
    const [phoneNo, setPhoneNo] = useState('');
    const [isGoogleLoadingOccupant, setIsGoogleLoadingOccupant] = useState(false);
    const [isGoogleLoadingOwner, setIsGoogleLoadingOwner] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [register, {isLoading}] = useRegisterMutation();
    const [googleLogin] = useGoogleLoginMutation();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if(userInfo){
            navigate('/');
        }
    }, [navigate, userInfo]);

    const ownerGoogleLoginSuccess = async (res) => {

        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${res.access_token}`,
            },
        })
        .then(response => response.json())
        .then(async(data) => {

            const userInfo = {
                email: data.email, 
                image: data.picture, 
                firstName: data.given_name, 
                lastName: data.family_name,
                userType: "owner"
            }

            try {
                setIsGoogleLoadingOwner(true);
                const googleRes = await googleLogin({...userInfo}).unwrap();
                dispatch(setUserInfo({...googleRes}));            
                toast.success('Login Successful');
                navigate('/');
            } catch (err) {
                setIsGoogleLoadingOwner(false);
                toast.error(err.data?.message || err.error);
            }

        })
        .catch(error => {
            toast.error("Error fetching user profile:", error);
        });
        
    }

    const occupantGoogleLoginSuccess = async (res) => {

        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${res.access_token}`,
            },
        })
        .then(response => response.json())
        .then(async(data) => {

            const userInfo = {
                email: data.email,
                image: data.picture, 
                firstName: data.given_name, 
                lastName: data.family_name,
                userType: "occupant"
            }

            try {
                setIsGoogleLoadingOccupant(true);
                const googleRes = await googleLogin({...userInfo}).unwrap();
                dispatch(setUserInfo({...googleRes}));            
                toast.success('Login Successful');
                navigate('/');
            } catch (err) {
                setIsGoogleLoadingOccupant(false);
                toast.error(err.data?.message || err.error);
            }

        })
        .catch(error => {
            toast.error("Error fetching user profile:", error);
        });
        
    }

    const googleLoginFail = () => {
        toast.error('Login Failed');
    }
    
    const ownerLogin = useGoogleLogin({
      onSuccess: ownerGoogleLoginSuccess,
      onFailure: googleLoginFail
    });
    
    const occupantLogin = useGoogleLogin({
      onSuccess: occupantGoogleLoginSuccess,
      onFailure: googleLoginFail
    });

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(image);
        if(password !== confirmPassword){
            toast.error('Passwords do not match');
        }
        else if(password.length < 8){
            toast.error('Password is too short');
        }
        else{
            try {
                const res = await register({ email, image, firstName, lastName, password, userType, phoneNo, gender }).unwrap();
                toast.success('Register Successful');
                navigate('/login');
            } catch (err) {
                toast.error(err.data?.message || err.error);
            }
        }
    }

    const previewImage = async(e) => {
        setImagePath(URL.createObjectURL(e.target.files[0]));

        const data = await ImageToBase64(e.target.files[0]);

        setImage(data);

        console.log(image);
    }

    return (
        <>        
            <div className={styles.trapezoid}></div>
            <div className={styles.mainDiv}>
                <Container className={styles.loginContainer}>
                    <Row className='justify-content-md-center'>
                        <Col xs={12} md={6} className="d-flex flex-column">
                            <Row>
                                <Link to='/' style={{textDecoration:"none"}} className={styles.logo}><Image src="./logo2.png" width={150} style={{cursor: 'pointer', marginTop:'20px'}}/></Link>
                            </Row> 
                            <Row style={{height:'100%'}}>   
                                <div className={styles.loginImage}>
                                    <Image src="./images/hostel.png" style={{width:'100%'}}/>
                                </div>
                            </Row>
                        </Col>
                        <Col xs={12} md={6} className='p-5'>
                            <h1>Sign Up</h1>

                            <form encType="multipart/form-data" onSubmit={ submitHandler } >

                                <Form.Group controlId="formFile" className="mb-0 text-center">
                                    <Form.Label className="mb-0"><Image src={imagePath} width={200} height={200} roundedCircle style={{cursor: 'pointer'}} /></Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                                </Form.Group>

                                <Row className="mt-3">
                                    <ToggleButtonGroup
                                        value={userType}
                                        exclusive
                                        onChange={ (e) => setUserType(e.target.value) }
                                        aria-label="User Type"
                                        fullWidth
                                    >
                                        <ToggleButton value="occupant" aria-label="User Type Occupant">
                                            Occupant
                                        </ToggleButton>
                                        <ToggleButton value="owner" aria-label="User Type Boarding Owner">
                                            Boarding Owner
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Row>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-2">
                                            <TextField 
                                                type='text'
                                                value={firstName} 
                                                label="First Name" 
                                                size="small" 
                                                onChange={ (e) => setFirstName(e.target.value) } 
                                                className={styles.inputBox} 
                                                variant="standard" 
                                                required
                                            />
                                        </Box>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-2">
                                            <TextField 
                                                type='text'
                                                value={lastName} 
                                                label="Last Name" 
                                                size="small" 
                                                onChange={ (e) => setLastName(e.target.value) } 
                                                className={styles.inputBox} 
                                                variant="standard" 
                                            />
                                        </Box>
                                    </Col>
                                </Row>

                                <Row>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-2">
                                        <TextField 
                                            type='email'
                                            value={email} 
                                            label="Email Address" 
                                            size="small" 
                                            onChange={ (e) => setEmail(e.target.value) } 
                                            className={styles.inputBox} 
                                            variant="standard" 
                                            required
                                        />
                                    </Box>
                                </Row>

                                <Row className="ms-1">
                                    <FormControl className="mt-3">
                                        <RadioGroup row aria-labelledby="user-type" name="user-type" value={gender} onChange={ (e) => setGender(e.target.value) } >
                                            <FormControlLabel value="Male" control={<Radio />} label="Male" />
                                            <FormControlLabel value="Female" control={<Radio />} label="Female" />
                                        </RadioGroup>
                                    </FormControl>
                                </Row>

                                <Row>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-2">
                                        <TextField 
                                            type="tel"
                                            value={phoneNo} 
                                            label="Mobile No" 
                                            size="small" 
                                            onChange={ (e) => setPhoneNo(e.target.value) } 
                                            className={styles.inputBox} 
                                            variant="standard" 
                                            required
                                            inputProps={{ 
                                                inputMode: 'numeric', 
                                                pattern: '[0-9]*' ,
                                                maxLength: 10,
                                                minLength: 10
                                            }}
                                        />
                                    </Box>
                                </Row>

                                <Row>
                                    <Col xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-2">
                                            <TextField 
                                                type={showPassword ? 'text' : 'password'}
                                                value={password} 
                                                label="Password" 
                                                size="small" 
                                                onChange={ (e) => setPassword(e.target.value) } 
                                                className={styles.inputBox} 
                                                variant="standard" 
                                                InputProps={{
                                                    endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            onMouseDown={handleMouseDownPassword}
                                                            >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                    )
                                                }}
                                                required
                                            />
                                        </Box>
                                        <Stack spacing={0.5} sx={{ '--hue': Math.min(password.length * 10, 120) }} >
                                            <LinearProgress
                                                determinate
                                                size="sm"
                                                value={Math.min((password.length * 100) / 10, 100)}
                                                sx={{
                                                bgcolor: 'background.level3',
                                                color: 'hsl(var(--hue) 80% 40%)',
                                                }}
                                            />
                                            <Typography level="body-xs" sx={{ alignSelf: 'flex-end', color: 'hsl(var(--hue) 80% 30%)' }}>
                                                {password.length < 3 && 'Very weak'}
                                                {password.length >= 3 && password.length < 8 && 'Weak'}
                                                {password.length >= 8 && password.length < 10 && 'Strong'}
                                                {password.length >= 10 && 'Very strong'}
                                            </Typography>
                                        </Stack>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-2">
                                            <TextField 
                                                type={showPassword ? 'text' : 'password'}
                                                value={confirmPassword} 
                                                label="Confirm Password" 
                                                size="small" 
                                                onChange={ (e) => setConfirmPassword(e.target.value) } 
                                                className={styles.inputBox} 
                                                variant="standard" 
                                                InputProps={{
                                                    endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            onMouseDown={handleMouseDownPassword}
                                                            >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                    ),
                                                }}
                                                required
                                            />
                                        </Box>
                                    </Col>
                                </Row>

                                <LoadingButton type="submit" loading={isLoading} color="primary" variant="contained" className="mt-3">Sign Up</LoadingButton>
                                
                                <Row className='py-3'>
                                    <Col>
                                        Already have an account? <Link to='/login' style={{textDecoration:"none"}}>Login</Link>
                                    </Col>
                                </Row>

                                <Divider>OR</Divider>  

                                <p className="text-center mt-2">Login With Google</p>   

                                <Row>
                                    <Col className="d-flex justify-content-center">
                                        <LoadingButton 
                                            loading={isGoogleLoadingOwner} 
                                            className={styles.googleButton} 
                                            onClick={() => ownerLogin()} 
                                            startIcon={ isGoogleLoadingOwner ? <></> : <Image src="./images/Google_Logo.svg" width={20} style={{marginRight:"10px"}}/> }
                                            sx={{color:"black"}}
                                        >
                                            Boading Owner
                                        </LoadingButton>
                                    </Col>
                                    <Col className="d-flex justify-content-center">
                                        <LoadingButton 
                                            loading={isGoogleLoadingOccupant} 
                                            className={styles.googleButton} 
                                            onClick={() => occupantLogin()}
                                            startIcon={ isGoogleLoadingOccupant ? <></> : <Image src="./images/Google_Logo.svg" width={20} style={{marginRight:"10px"}}/> }
                                            sx={{color:"black"}}
                                        >
                                            Occupant
                                        </LoadingButton>
                                    </Col>
                                </Row>
                            </form>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
};

export default RegisterPage;