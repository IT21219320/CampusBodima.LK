import Header from '../components/header';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Toast } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import CountUp from "react-countup";
import homeStyles from '../styles/homePageStyles.module.css'
import { Card, CardContent } from '@mui/material';



const HomePage = () => {

    const [show, setShow] = useState(false);
    const [hostelCount, setHostelCount] = useState(0);
    const [annexCount, setAnnexCount] = useState(0);
    const [userCount, setUserCount] = useState(0);

    const scrollToAnimHeader = () => {
        const animHeaderElement = document.getElementById('animHeader');
        if (animHeaderElement) {
            animHeaderElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    let timeout;
    const handleScroll = () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            if (document.getElementById("main").scrollTop > 500) {
                setShow(false);
                setAnnexCount(0)
                setHostelCount(0)
                setUserCount(0)
            } else {
                setShow(true);
                setAnnexCount(500)
                setHostelCount(300)
                setUserCount(1000)
            }
        }, 10);
    };

    useEffect(() => {
        document.getElementById("main").addEventListener("scroll", handleScroll);
        setTimeout(() => {
            setShow(true)
            setAnnexCount(500)
            setHostelCount(300)
            setUserCount(1000)
        }, 1);
    }, []);

    return (
        <>
            <div style={{ width: '100%' }}>
                <Header />
                <div style={{ minHeight: '100vh', height: '200vh' }}>
                    <div className={homeStyles.homeBackDiv}>
                        <img src={'images/homeBackground2.png'} width={"100%"} />
                        <img src={'images/hostel.png'} width={"50%"} style={{position: 'absolute', right: 0, top: '110px'}} />
                    </div>
                    <div style={{ height: '600px', width: "100%", position: 'absolute' }}>
                        <Col className={homeStyles.homeWelcText} style={{transition:'all 0.5s ease-in', ...(show? {opacity:1} : {opacity:0})}}>
                            <h1>Discover the Perfect Boarding<br />Tailored to Your Preferences<br /><span style={{ fontFamily: 'Papyrus', display:'block', marginTop:'25px' }}>CampusBodima.LK</span></h1>
                            <Button variant="outlined" size='large' color='info' className={homeStyles.getStartBtn} onClick={scrollToAnimHeader}>Get start</Button>
                        </Col>
                        <Card style={{position:'absolute', top: '450px', marginLeft:'5%', width:'500px', background:'#e3f2ff'}}>
                            <CardContent style={{display:'flex', padding:'16px'}}>
                                <Row style={{width:'100%'}}>
                                    <Col style={{textAlign:'center'}}>
                                        <h1><CountUp duration={1} className="counter" end={hostelCount} /></h1>
                                        Hostels
                                    </Col>
                                    <Col style={{textAlign:'center'}}>
                                        <h1><CountUp duration={1} className="counter" end={annexCount} /></h1>
                                        Annexes
                                    </Col>
                                    <Col style={{textAlign:'center'}}>
                                        <h1><CountUp duration={1} className="counter" end={userCount} /></h1>
                                        Users
                                    </Col>
                                </Row>
                            </CardContent>
                        </Card>
                    </div>
                    <div className={homeStyles.servicesDiv}  id="animHeader">
                        <center style={{ marginTop: '2%' }}>
                            <Row style={{ margin: '5%' }}>
                                <h1 className={homeStyles.h1}>What we do for you</h1>
                            </Row>
                            <Row style={{ margin: '0px 8%' }}>
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