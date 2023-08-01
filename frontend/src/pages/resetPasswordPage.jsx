import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useResetPasswordMutation } from '../slices/usersApiSlice';
import { destroyResetSession } from "../slices/authSlice";
import { toast } from 'react-toastify';
import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Form } from 'react-bootstrap';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    
    const { userInfo } = useSelector((state) => state.auth);
    const { resetSession } = useSelector((state) => state.auth);

    useEffect(() => {
        if(userInfo || (!resetSession)){
            navigate('/generateotp');
        }
        else{
            setEmail(resetSession.email);
        }
    }, [navigate, userInfo, resetSession]);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const SubmitHandler = async (e) => {
        e.preventDefault();

        if(newPassword != '' ){
            if(newPassword === confirmPassword){
                try {
                    const res = await resetPassword({ email, newPassword }).unwrap();
                    dispatch(destroyResetSession());
                    toast.success('Password Reset Successful!');
                    navigate('/login');
                } catch (err) {
                    toast.error(err.data?.message || err.error);
                }
            }
            else{
                toast.error("Passwords Do Not Match!");
            }
        }
        else{
            toast.error("Password Cannot Be Empty!")
        }
    }

    return (
        <FormContainer>
            <Form onSubmit={ SubmitHandler } className="text-center" id="emailForm">
                <h1>Reset Password</h1>
                <br />
                <p className="text-start">Enter your new password for {email} below.</p>
                <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">New Password</InputLabel>
                    <OutlinedInput
                        value={newPassword}
                        id="outlined-adornment-password"
                        onChange={ (e) => setNewPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                        }
                        label="New Password"
                    />
                </FormControl>
                <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                    <OutlinedInput
                        value={confirmPassword}
                        id="outlined-adornment-password"
                        onChange={ (e) => setConfirmPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                        }
                        label="Confirm Password"
                    />
                </FormControl>
                <LoadingButton loading={isLoading} type="submit" color="primary" variant="contained" className="mt-3">Reset Password</LoadingButton>
            </Form>
        </FormContainer>
    );
}

export default ResetPasswordPage;