import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Container, Row, Col, Image } from 'react-bootstrap';
import { Divider, TextField, Box, InputAdornment, IconButton, Button } from "@mui/material";
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useGoogleLoginMutation } from '../slices/usersApiSlice';
import { setUserInfo } from "../slices/authSlice";
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import LoadingButton from '@mui/lab/LoadingButton';
import styles from '../styles/loginStyles.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();
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
                displayName: data.name, 
                image: data.picture, 
                firstName: data.given_name, 
                lastName: data.family_name,
                userType: "owner"
            }

            try {
                const googleRes = await googleLogin({...userInfo}).unwrap();
                dispatch(setUserInfo({...googleRes}));            
                toast.success('Login Successful');
                navigate('/');
            } catch (err) {
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
                displayName: data.name, 
                image: data.picture, 
                firstName: data.given_name, 
                lastName: data.family_name,
                userType: "occupant"
            }

            try {
                const googleRes = await googleLogin({...userInfo}).unwrap();
                dispatch(setUserInfo({...googleRes}));            
                toast.success('Login Successful');
                navigate('/');
            } catch (err) {
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
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setUserInfo({...res}));            
            toast.success('Login Successful');
            navigate('/');
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
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
                            <h1>Sign In</h1>
                            <h6>or <Link to='/register' style={{textDecoration:"none"}}>create an account</Link></h6>

                            <Form onSubmit={ submitHandler }>
                                <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-3">
                                    <Person sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                    <TextField 
                                        type="email" 
                                        value={email} 
                                        label="Email Address" 
                                        size="small" 
                                        onChange={ (e) => setEmail(e.target.value)} 
                                        className={styles.inputBox}
                                        variant="standard" 
                                        required
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'flex-end' }} className="my-3">
                                    <Lock sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
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
                                            ),
                                        }}
                                        required
                                    />
                                </Box>

                                <LoadingButton type="submit" loading={isLoading} color="primary" variant="contained" className="mt-3">Sign In</LoadingButton>
                                
                                <Row className='py-3'>
                                    <Col>
                                        <Link to='/generateotp' style={{textDecoration:"none"}}>Forgot Password?</Link>
                                    </Col>
                                </Row>
                                <Divider>OR</Divider>  
                                <p className="text-center mt-2">Login With Google</p>                          
                                <Row>
                                    <Col className="d-flex justify-content-center">
                                        <Button className={styles.googleButton} onClick={() => ownerLogin()}>
                                            <Image src="./images/Google_Logo.svg" width={20} style={{marginRight:"10px"}}/>
                                            Boaring Owner
                                        </Button>
                                    </Col>
                                    <Col className="d-flex justify-content-center">
                                        <Button className={styles.googleButton} onClick={() => occupantLogin()}>
                                            <Image src="./images/Google_Logo.svg" width={20} style={{marginRight:"10px"}}/>
                                            Occupant
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
};

export default LoginPage;