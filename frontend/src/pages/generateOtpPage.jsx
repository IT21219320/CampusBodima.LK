import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGenerateOTPMutation, useVerifyOTPMutation } from '../slices/usersApiSlice';
import { createResetSession } from "../slices/authSlice";
import { toast } from 'react-toastify';
import { TextField } from '@mui/material'
import { MuiOtpInput } from 'mui-one-time-password-input'
import { Form } from 'react-bootstrap';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";

const GenerateOtpPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [generateOTP, { isLoading }] = useGenerateOTPMutation();
    const [verifyOTP, { isLoading2 }] = useVerifyOTPMutation();
    
    const { userInfo } = useSelector((state) => state.auth);
    
    useEffect(() => {
        if(userInfo){
            navigate('/');
        }
    }, [navigate, userInfo]);

    const emailSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await generateOTP({ email }).unwrap();
            toast.success('OTP Sent');
            document.getElementById('otpForm').classList.remove('d-none');
            document.getElementById('emailForm').outerHTML = '';
            console.log(res);
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }

    const otpSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await verifyOTP({ otp }).unwrap();
            console.log(email);
            dispatch(createResetSession({session: true, email: email}));  
            toast.success('OTP Verified');
            navigate('/resetpassword');
        } catch (err) {
            toast.error(err.data?.message || err.error);
            navigate('/generateotp');
        }
    }

    return (
        <FormContainer>
            <Form onSubmit={ emailSubmitHandler } className="text-center" id="emailForm">
                <h1>Forgot Password</h1>
                <br />
                <p className="text-start">Enter the email address associated with your account and we'll send you an OTP code to reset your password</p>
                <TextField type="email" id="email" label="Email" variant="outlined" defaultValue={email} style={{minWidth:"100%"}} onChange={ (e) => setEmail(e.target.value)} required/>
                <LoadingButton loading={isLoading} type="submit" color="primary" variant="contained" className="mt-3">Generate OTP</LoadingButton>
            </Form>
            <Form onSubmit={ otpSubmitHandler } className="text-center d-none" id="otpForm">
                <h1>OTP Verification</h1>
                <br />
                <p className="text-start">The OTP code has being sent to the email you have entered. Please enter the code below to verify.</p>
                <MuiOtpInput value={otp} length={6} onChange={ (e) => setOTP(e)} />
                <LoadingButton loading={isLoading2} type="submit" color="primary" variant="contained" className="mt-3">Verify OTP</LoadingButton>
            </Form>
        </FormContainer>
    );
}

export default GenerateOtpPage;