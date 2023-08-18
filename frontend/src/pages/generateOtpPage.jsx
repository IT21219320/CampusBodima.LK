import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGenerateOTPMutation, useVerifyOTPMutation } from '../slices/usersApiSlice';
import { createResetSession } from "../slices/authSlice";
import { toast } from 'react-toastify';
import { TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { MuiOtpInput } from 'mui-one-time-password-input'
import { Form, Row, Image } from 'react-bootstrap';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";

const GenerateOtpPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [userType, setUserType] = useState('occupant');
    
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
            const res = await generateOTP({ email, userType }).unwrap();
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
            dispatch(createResetSession({session: true, email: email, userType: userType}));  
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
                <Link to='/' style={{textDecoration:"none"}} ><Image src="./logo2.png" width={150} style={{cursor: 'pointer', marginTop:'20px', marginBottom:'20px'}}/></Link>
                <h1>Forgot Password</h1>
                <br />
                <p className="text-start">Enter the email address associated with your account and we'll send you an OTP code to reset your password</p>
                
                <Row className="my-3">
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

                <TextField type="email" id="email" label="Email" variant="outlined" defaultValue={email} style={{minWidth:"100%"}} onChange={ (e) => setEmail(e.target.value)} required/>
                <LoadingButton loading={isLoading} type="submit" color="primary" variant="contained" className="mt-3">Generate OTP</LoadingButton>
            </Form>
            <Form onSubmit={ otpSubmitHandler } className="text-center d-none" id="otpForm">
                <Link to='/' style={{textDecoration:"none"}} ><Image src="./logo2.png" width={150} style={{cursor: 'pointer', marginTop:'20px', marginBottom:'20px'}}/></Link>
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