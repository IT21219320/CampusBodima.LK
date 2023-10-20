import Carousel from 'react-bootstrap/Carousel';
import React, { useEffect, useState } from "react";
import { useGetFeedbackByBoardingIdMutation  } from "../slices/feedbackApiSlice";
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Table,Card } from 'react-bootstrap';
import { Breadcrumbs, Typography, Paper, InputBase, IconButton, Box, FormControl, InputLabel, Select, MenuItem, TablePagination, CircularProgress, Button, Rating,Avatar, } from '@mui/material';
import {StringToAvatar} from '../utils/StringToAvatar.js';



const FeedbackBoarding = ({ boardingId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const { userInfo } = useSelector((state) => state.auth);
  const [getFeedbackByBoardingId, { isLoading }] = useGetFeedbackByBoardingIdMutation();
  

  const loadFeedbackData = async () => {
    try {
      const res = await getFeedbackByBoardingId({ boardingId }).unwrap();
      setFeedbacks(res.feedback);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);



  const carouselItemStyle = {
    borderRadius: '10px',
    border: '3px solid gold',
    width: '100%',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '50px',
  };
  
  const descriptionStyle = {
    fontSize: "28px",
    color: "#000000",   
  };
  
  const ratingStyle = {
    marginTop: "10px"
  };

  return (
    <div style={{ margin: "20px", display:'flex', alignItems:'center', justifyContent:'center'}}>
      {feedbacks.length > 0 ? (
          <Carousel data-bs-theme="dark" interval={3000} style={{width:'75%'}}>
          {feedbacks.map((feedback, index) => (
            <Carousel.Item>
              <div style={carouselItemStyle}>
                <div style={ratingStyle}>
                  <Rating name="read-only" value={parseInt(feedback.rating)} readOnly />
                </div>
                <div style={descriptionStyle}>
                  <p style={{textAlign:'center'}}>"{feedback.description}"</p>
                  <p>{feedback.senderId?.firstName+" "+feedback.senderId?.lastName}</p>
                </div>
              </div>
            </Carousel.Item>
          ))}

          </Carousel>
          
      ) : (
        <div>No feedback available</div>
      )}
    </div>
  );
};

export default FeedbackBoarding;


