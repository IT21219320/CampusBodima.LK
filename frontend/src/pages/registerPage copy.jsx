import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Image, Button, Row, Col } from 'react-bootstrap';
import { Divider } from "@mui/material";
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleLoginMutation, useRegisterMutation } from '../slices/usersApiSlice';
import { setUserInfo } from "../slices/authSlice";
import { ImageToBase64 } from "../utils/ImageToBase64";
import LoadingButton from '@mui/lab/LoadingButton';
import jwt_decode from "jwt-decode";
import FormContainer from '../components/formContainer';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [imagePath, setImagePath] = useState('./images/addProfile.png');
    const [image, setImage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    const googleLoginSuccess = async (res) => {

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
    

    const login = useGoogleLogin({
      onSuccess: googleLoginSuccess,
      onFailure: googleLoginFail
    });

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(image);
        if(password !== confirmPassword){
            toast.error('Passwords do not match');
        }
        else{
            try {
                const res = await register({ email, displayName, image, firstName, lastName, password }).unwrap();
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
        <FormContainer>
            <h1>Sign Up</h1>

            <form encType="multipart/form-data" onSubmit={ submitHandler } >

                <Form.Group controlId="formFile" className="mb-0 text-center">
                    <Form.Label className="mb-0"><Image src={imagePath} width={200} height={200} roundedCircle style={{cursor: 'pointer'}} /></Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={previewImage} hidden/>
                </Form.Group>

                <Row>
                    <Col xs={12} md={6}>
                        <Form.Group className="my-2" controlId="fName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter First Name" 
                                value={firstName} 
                                required
                                onChange={ (e) => setFirstName(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group className="my-2" controlId="lName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter Last Name" 
                                value={lastName} 
                                onChange={ (e) => setLastName(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="my-2" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control 
                        type="email" 
                        placeholder="Enter Email" 
                        value={email} 
                        required
                        onChange={ (e) => setEmail(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group className="my-2" controlId="displayName">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter Username" 
                        value={displayName} 
                        required
                        onChange={ (e) => setDisplayName(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Row>
                    <Col xs={12} md={6}>
                        <Form.Group className="my-2" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Enter Password" 
                                value={password} 
                                required
                                onChange={ (e) => setPassword(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                    <Form.Group className="my-2" controlId="cPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Enter Password"
                                value={confirmPassword} 
                                required
                                onChange={ (e) => setConfirmPassword(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <LoadingButton type="submit" loading={isLoading} color="primary" variant="contained" className="mt-3">Sign Up</LoadingButton>
                
                <Row className='py-3'>
                    <Col>
                        Already have an account? <Link to='/login' style={{textDecoration:"none"}}>Login</Link>
                    </Col>
                </Row>

                <Divider>OR</Divider>

                <Row>
                    <Col className="mt-3 d-flex justify-content-center">
                            <Button onClick={() => login()}>
                                Sign up as 
                            </Button>
                    </Col>
                    <Col className="mt-3 d-flex justify-content-center">
                            <Button onClick={() => login()}>
                                Sign up as Boarding Owner
                            </Button>
                    </Col>
                </Row>

            </form>
        </FormContainer>
    )
};

export default RegisterPage;