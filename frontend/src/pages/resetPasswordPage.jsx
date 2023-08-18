import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useResetPasswordMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LinearProgress, Typography, Stack } from '@mui/joy';
import { Form, Image } from 'react-bootstrap';
import LoadingButton from '@mui/lab/LoadingButton';
import FormContainer from "../components/formContainer";

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    
    const { userInfo } = useSelector((state) => state.auth);
    const { resetSession } = useSelector((state) => state.auth);

    useEffect(() => {
        if(userInfo){
            navigate('/');
        }
        else if(!resetSession){
            navigate('/generateotp');
        }
        else{
            setEmail(resetSession.email);
            setUserType(resetSession.userType);
        }
    }, [navigate, userInfo, resetSession]);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const SubmitHandler = async (e) => {
        e.preventDefault();

        if(newPassword != ''){
            if(newPassword.length >= 8){
                if(newPassword === confirmPassword){
                    try {
                        const res = await resetPassword({ email, userType, newPassword }).unwrap();
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
                toast.error("Password is too short")
            }
        }
        else{
            toast.error("Password Cannot Be Empty!")
        }
    }

    return (
        <FormContainer>
            <Form onSubmit={ SubmitHandler } className="text-center" id="emailForm">
                <Link to='/' style={{textDecoration:"none"}} ><Image src="./logo2.png" width={150} style={{cursor: 'pointer', marginTop:'20px', marginBottom:'20px'}}/></Link>
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
                    <Stack spacing={0.5} sx={{ '--hue': Math.min(newPassword.length * 10, 120), marginTop: "10px" }} >
                        <LinearProgress
                            determinate
                            size="sm"
                            value={Math.min((newPassword.length * 100) / 10, 100)}
                            sx={{
                            bgcolor: 'background.level3',
                            color: 'hsl(var(--hue) 80% 40%)',
                            }}
                        />
                        <Typography level="body-xs" sx={{ alignSelf: 'flex-end', color: 'hsl(var(--hue) 80% 30%)' }}>
                            {newPassword.length < 3 && 'Very weak'}
                            {newPassword.length >= 3 && newPassword.length < 8 && 'Weak'}
                            {newPassword.length >= 8 && newPassword.length < 10 && 'Strong'}
                            {newPassword.length >= 10 && 'Very strong'}
                        </Typography>
                    </Stack>
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