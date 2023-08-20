import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useVerifyEmailMutation } from '../slices/usersApiSlice';
import { Image } from 'react-bootstrap';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";

const VerifyEmailPage = () => {

    const navigate = useNavigate();
    const param = useParams();
    
    const header = param.tokenHeader;
    const payload = param.tokenPayload;
    const secret = param.tokenSecret;

    const token = `${header}.${payload}.${secret}`; 

    const [verifyEmail ,{ isLoading }] = useVerifyEmailMutation();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        // Redirect if user is already logged in
        if (userInfo) {
            navigate('/');
        }
        
    }, [navigate, userInfo]);
    
    const performVerification = async () => {
        try {
            await verifyEmail({ token }).unwrap();
            toast.success('Email Verified!');
            navigate('/login');
        } catch (err) {
            toast.error(err.data?.message || err.error);
            navigate('/register');
        }
    }

    return (
        <FormContainer>
            <Link to='/' style={{textDecoration:"none", textAlign:"center"}} ><Image src="/logo2.png" width={150} style={{cursor: 'pointer', marginTop:'20px', marginBottom:'20px'}}/></Link>
            <LoadingButton 
                loading={isLoading} 
                onClick={() => performVerification()}
                variant="contained"
            >
                Verify Your Account
            </LoadingButton>
        </FormContainer>
    );

};

export default VerifyEmailPage;
