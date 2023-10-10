import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useVerifyEmailMutation } from '../slices/usersApiSlice';
import { Image } from 'react-bootstrap';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";
import { useOccupantJoinMutation } from "../slices/boardingsApiSlice";

const VerifyOccupantEmailPage = () => {

    const navigate = useNavigate();
    const param = useParams();
    
    const header = param.tokenHeader;
    const payload = param.tokenPayload;
    const secret = param.tokenSecret;

    const token = `${header}.${payload}.${secret}`; 

    const [occupantVerifyEmail ,{ isLoading }] = useOccupantJoinMutation();
    const { userInfo } = useSelector((state) => state.auth);

    const performVerification = async () => {
        try {
            await occupantVerifyEmail({ userId:userInfo._id,token }).unwrap();
            toast.success('Reservation Successfull!');
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
        navigate('/occupant/boarding');
    }

    return (
        <FormContainer>
            <div style={{textDecoration:"none", textAlign:"center"}} ><Image src="/logo2.png" width={150} style={{marginTop:'20px', marginBottom:'20px'}}/></div>
            <LoadingButton 
                loading={isLoading} 
                onClick={() => performVerification()}
                variant="contained"
            >
                Join Boarding
            </LoadingButton>
        </FormContainer>
    );

};

export default VerifyOccupantEmailPage;
