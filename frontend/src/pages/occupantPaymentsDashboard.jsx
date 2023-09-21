import { useEffect, useState } from "react"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sideBar';
import dashboardStyles from '../styles/dashboardStyles.module.css';
import { Container, Row, Col, Table} from 'react-bootstrap';


const OccupantPaymentDash = () =>{
    return (
        <>
        <Sidebar />
        </>
    )
}

export default OccupantPaymentDash