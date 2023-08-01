import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Divider } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useGoogleLoginMutation } from '../slices/usersApiSlice';
import { setUserInfo } from "../slices/authSlice";
import { toast } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import LoadingButton from '@mui/lab/LoadingButton';
import jwt_decode from "jwt-decode";
import FormContainer from '../components/formContainer';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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

    const googleLoginSuccess = async (res) => {
        const decoded = jwt_decode(res.credential);
        console.log(decoded);
        const userInfo = {
            email: decoded.email, 
            displayName: decoded.name, 
            image: decoded.picture, 
            firstName: decoded.given_name, 
            lastName: decoded.family_name,
        }
        try {
            const googleRes = await googleLogin({...userInfo}).unwrap();
            dispatch(setUserInfo({...googleRes}));            
            toast.success('Login Successful');
            navigate('/');
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }

    const googleLoginFail = () => {
        toast.error('Login Failed');
    }

    return (
        <FormContainer>
            <h1>Sign In</h1>
            <h6>or <Link to='/register' style={{textDecoration:"none"}}>create an account</Link></h6>

            <Form onSubmit={ submitHandler }>
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

                <LoadingButton type="submit" loading={isLoading} color="primary" variant="contained" className="mt-3">Sign In</LoadingButton>
                
                <Row className='py-3'>
                    <Col>
                        <Link to='/generateotp' style={{textDecoration:"none"}}>Forgot Password?</Link>
                    </Col>
                </Row>
                <Divider>OR</Divider>
                <Row>
                    <Col className="mt-3 d-flex justify-content-center">
                        <GoogleOAuthProvider clientId="459902468078-o8jtn6mq2mjk54odsodkdf2rqo8hjrbo.apps.googleusercontent.com">
                            <GoogleLogin
                                onSuccess={ googleLoginSuccess }
                                onError={ googleLoginFail }
                            />
                        </GoogleOAuthProvider>
                    </Col>
                </Row>
            </Form>
        </FormContainer>
    )
};

export default LoginPage;