import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import {registerMail} from '../utils/mailer.js'

// @desc    Check if user exists and send registeration mail
// route    POST /api/users
// @access  Public
const sendRegisterMail = asyncHandler(async (req, res) => {
    const {
        email, 
        image, 
        firstName, 
        lastName, 
        password,
        userType,
        gender 
    } = req.body;

    var userExists = await User.findOne({ email, userType });

    if(userExists){
        res.status(400);
        throw new Error('User Already Exists');
    }

    const user = ({
        email, 
        image, 
        firstName, 
        lastName, 
        password,
        userType,
        gender 
    });

    var token = jwt.sign({ user }, process.env.JWT_SECRET, { 
        expiresIn: '30d' 
    });

    token = `${token.split('.')[0]}/${token.split('.')[1]}/${token.split('.')[2]}`;

    if(token){
        const message = `<p><b>Hello ${user.firstName},</b><br><br> 
                            Welcome to CampusBodima! Start setting up your account by verifying your email address. Click this secure link:<br><br>
                            <a href="http://${process.env.DOMAIN}/register/${token}">Verify your email</a><br><br>
                            Thank you for choosing CampusBodima!<br><br>
                            Best wishes,<br>
                            The CampusBodima Team</p>`
        
        registerMail(email,message,"Activate Your Account");
        res.status(201).json({ message: "Email Verification Sent!"});
    }
    else{
        res.status(400);
        throw new Error('Email not found');
    }

    

});

// @desc    Register a new user
// route    GET /api/users/
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    console.log(jwt.decode(req.query.token));
    const {
        email, 
        image, 
        firstName, 
        lastName, 
        password,
        userType,
        gender 
    } = jwt.decode(req.query.token).user;


    var userExists = await User.findOne({ email, userType });

    if(userExists){
        res.status(400);
        throw new Error('User Already Exists');
    }

    const user = await User.create({
        email, 
        image, 
        firstName, 
        lastName, 
        password,
        userType,
        gender,
        phoneNo: "" 
    });

    if(user){
        res.status(201).json({
            email: user.email,  
            image: user.image, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            userType: user.userType,
            gender: user.gender,
            accType: user.accType
        });
    }else{
        res.status(400);
        throw new Error('Invalid User Data');
    }

});


// @desc    Auth user & set token
// route    POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { userType, email, password } = req.body;

    const user = await User.findOne({ email, userType });

    if(user && (await user.matchPasswords(password))){

        if(user.accType != 'normal'){
            res.status(401);
            throw new Error('Invalid Credentials');
        }

        generateToken(res, user.email);
        res.status(200).json({
            email: user.email,  
            image: user.image, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            userType: user.userType,
            phoneNo: user.phoneNo,
            gender: user.gender,
            accType: user.accType
        });
    }else{
        res.status(401);
        throw new Error('User Not Found!');
    }

    // res.status(200).json({ message: 'auth user' });
});


// @desc    Auth user & set token
// route    POST /api/users/googleAuth
// @access  Public
const googleAuthUser = asyncHandler(async (req, res) => {
    const profile = req.body;

    let user = await User.findOne({ email: profile.email, userType: profile.userType });

    if(user){
        if(user.accType == 'normal'){
            res.status(400);
            throw new Error('User Already Exists! Please login using your password');
        }
        generateToken(res, user.email);
        res.status(200).json({
            email: user.email,  
            image: user.image, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            userType: user.userType,
            phoneNo: user.phoneNo,
            gender: user.gender,
            accType: user.accType
        });
    }
    else{
        user = await User.create({
            email: profile.email,  
            image: profile.image, 
            firstName: profile.firstName, 
            lastName: profile.lastName, 
            userType: profile.userType,
            phoneNo: profile.phoneNo,
            gender: profile.gender,
            accType: 'google',
            password: process.env.GOOGLE_SECRET
        })
        
        if(user){
            generateToken(res, user.email);
            res.status(200).json({
                email: user.email,  
                image: user.image, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                userType: user.userType,
                phoneNo: user.phoneNo,
                gender: user.gender,
                accType: user.accType
            });
        }
        else{
            res.status(400);
            throw new Error('Oops, somthing went wrong!');
        }
    }
    
});


// @desc    Logout user
// route    POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly:true,
        expires: new Date(0)
    })
    
    res.status(200).json({ message: 'Logged out' });
});


// @desc    Get user profile
// route    GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        email: req.user.email, 
        image: req.user.image, 
        firstName: req.user.firstName, 
        lastName: req.user.lastName, 
        accType: req.user.accType, 
        password: req.user.password, 
        userType: req.user.userType,
        phoneNo: req.user.phoneNo,
        gender: req.user.gender
    };  
    res.status(200).json(user);
});


// @desc    Update user profile
// route    PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email, userType: req.body.userType});

    if(user){
        user.image = req.body.image || user.image;
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phoneNo = req.body.phoneNo || user.phoneNo;
        user.gender = req.body.gender || user.gender;

        if(req.body.password && req.body.accType == 'normal'){
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            email: updatedUser.email, 
            image: updatedUser.image, 
            firstName: updatedUser.firstName, 
            lastName: updatedUser.lastName, 
            accType: updatedUser.accType, 
            userType: updatedUser.userType,
            phoneNo: updatedUser.phoneNo,
            gender: updatedUser.gender
        });
    }else{
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Generate OTP
// route    POST /api/users/generateOTP
// @access  Public
const generateOTP = asyncHandler(async (req, res) => {
    const { email, userType } = req.body;

    const user = await User.findOne({ email, accType:"normal", userType });
    if(user){
        req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});
        
        const message = `<p>Hello ${user.firstName},<br> Your OTP is: <b>${req.app.locals.OTP}</b></p>`

        registerMail(email, message,"Your OTP");
        res.status(201).json({ message: "OTP Sent"});
    }
    else{
        res.status(400);
        throw new Error('Email not found');
    }

});


// @desc    Verify OTP
// route    POST /api/users/verifyOTP
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    if(parseInt(req.app.locals.OTP) === parseInt(otp)){
        
        res.status(201).json({ code: req.app.locals.OTP })
    }
    else{
        req.app.locals.OTP = null;
        res.status(400);
        throw new Error("Invalid OTP");
    }

});


// @desc    Reset Password
// route    POST /api/users/resetPassword
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, userType, newPassword } = req.body;

    const user = await User.findOne({ email: email, userType: userType });

    if(user){
        user.password = newPassword;
        const updatedUser = await user.save();

        res.status(201).json({ message: "Password Reset Successful!"});
    }
    else{
        res.status(400);
        throw new Error('Opps...Something went wrong!');
    }

    

});



export { 
    authUser,
    googleAuthUser,
    sendRegisterMail,
    registerUser, 
    logoutUser,
    getUserProfile,
    updateUserProfile,
    generateOTP,
    verifyOTP,
    resetPassword 
};