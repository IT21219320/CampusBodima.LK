import Header from '../components/header';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Toast } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import homeStyles from '../styles/homePageStyles.module.css'



const HomePage = () => {

    const scrollToAnimHeader = () => {
        const animHeaderElement = document.getElementById('animHeader');
        if (animHeaderElement) {
            animHeaderElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('animHeader').classList.add(homeStyles.animH1);
        }, 1);
    }, []);

    return (
        <>
            <div style={{ width: '100%' }}>
                <Header />
                <div style={{ minHeight: '100vh', height: '200vh' }}>
                    <div className={homeStyles.homeBackDiv}>
                        <img src={'homePageBackground.jpg'} width={"100%"} height={'600px'} />
                    </div>
                    <div className={homeStyles.homeDarkDiv}>

                    </div>
                    <div style={{ height: '600px', width: "100%", position: 'absolute' }}>
                        <Col className={homeStyles.homeWelcText}>
                            <h1>Welcome to <span style={{ fontFamily: 'Papyrus' }}>CampusBodima.LK</span></h1>
                            <p style={{ fontFamily: 'Lucida Console', fontSize: 'font-size: larger' }}>Find your Second home with easy steps</p>
                            <Button variant="outlined" size='large' className={homeStyles.getStartBtn} onClick={scrollToAnimHeader}>Get start</Button>
                        </Col>
                    </div>
                    <div className={homeStyles.servicesDiv}  id="animHeader">
                        <center style={{ marginTop: '2%' }}>
                            <Row style={{ margin: '5%' }}>
                                <h1 className={homeStyles.h1}>What we do for you</h1>
                            </Row>
                            <Row style={{ padding: '0px 8%' }}>
                                <Col>
                                    <div className={homeStyles.doDivs}>
                                        <div className={homeStyles.doDivsimgDiv}>
                                            <img src={'paymentIco.png'} width={'70%'} height={'100%'} />
                                        </div>
                                        <div>
                                            <p className={homeStyles.doDivP}>Easy payments</p>
                                            <p>Payment portal is easy to use and all transactions </p>
                                        </div>
                                    </div>
                                </Col>
                                <Col>
                                    <div className={homeStyles.doDivs}>
                                        <div className={homeStyles.doDivsimgDiv}>
                                            <img src={'postIco.jpg'} width={'70%'} height={'100%'} />
                                        </div>
                                        <div>
                                            <p className={homeStyles.doDivP}>Post boardings</p>
                                            <p>Post your boarding to collect borders easily </p>
                                        </div>
                                    </div>
                                </Col>

                                <Col>
                                    <Link to={'/search'} style={{textDecoration:'none'}}>
                                        <div className={homeStyles.doDivs}>
                                            <div className={homeStyles.doDivsimgDiv}>
                                                <img src={'findBoading.svg'} width={'100%'} height={'100%'} />
                                            </div>
                                            <div>
                                                <p className={homeStyles.doDivP}>Find boardings</p>
                                                <p style={{color:'black'}}>Find boardings as your second home with calm in one place </p>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>

                                <Col>
                                    <div className={homeStyles.doDivs}>
                                        <div className={homeStyles.doDivsimgDiv}>
                                            <img src={'findBoading.svg'} width={'100%'} height={'100%'} />
                                        </div>
                                        <div>
                                            <p className={homeStyles.doDivP}>Manage Boarding</p>
                                            <p >Manage boarding is very smooth with the system functionalities </p>
                                        </div>
                                    </div>
                                </Col>

                            </Row>
                        </center>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;