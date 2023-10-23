import Header from '../components/header';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Toast } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import CountUp from "react-countup";
import homeStyles from '../styles/homePageStyles.module.css'
import { Card, CardContent, IconButton } from '@mui/material';
import { BsChevronDoubleDown } from 'react-icons/bs';



const HomePage = () => {

    const [show, setShow] = useState(false);
    const [hostelCount, setHostelCount] = useState(0);
    const [annexCount, setAnnexCount] = useState(0);
    const [userCount, setUserCount] = useState(0);

    const navigate = useNavigate();

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
                setAnnexCount(538)
                setHostelCount(329)
                setUserCount(1987)
            }
        }, 10);
    };

    useEffect(() => {
        document.getElementById("main").addEventListener("scroll", handleScroll);
        setTimeout(() => {
            setShow(true)
            setAnnexCount(538)
            setHostelCount(329)
            setUserCount(1987)
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
                            <Button onClick={() => navigate('/owner/boardings/add')} variant='contained' color='info' className={homeStyles.welcBtns} style={{clipPath:'polygon(95% 0%, 80% 100%, 0% 100%, 0% 0%)', padding:'15px'}}>List Boardings&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Button>
                            <Button onClick={() => navigate('/search')} variant='contained' color='warning' className={homeStyles.welcBtns} style={{clipPath:'polygon(100% 0%, 100% 100%, 5% 100%, 20% 0%)', marginLeft:'-45px', padding:'15px'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Find Boardings</Button>
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
                        <IconButton style={{top:'550px', left:'50%'}} color='warning' onClick={scrollToAnimHeader}><BsChevronDoubleDown /></IconButton>
                    </div>
                    <div className={homeStyles.servicesDiv}  id="animHeader">
                        <center style={{ marginTop: '2%' }}>
                            <Row style={{ margin: '5%' }}>
                                <h1 className={homeStyles.h1}>Our Services</h1>
                            </Row>
                            <Row style={{ margin: '0px 8%' }}>
                                <Col>
                                    <div className={homeStyles.doDivs}>
                                        <div className={homeStyles.doDivsimgDiv}>
                                            <img src={'images/payments.png'} width={'100%'} height={'150px'} style={{objectFit:'cover'}} />
                                        </div>
                                        <div>
                                            <p className={homeStyles.doDivP}>Easy payments</p>
                                            <p style={{textAlign:'left', lineHeight:'28px', color:'black'}}>The payment portal is effortlessly user-friendly, ensuring smooth and secure transactions for everyone. With its intuitive interface and simplicity, users can navigate the process seamlessly, fostering trust and satisfaction.</p>
                                        </div>
                                    </div>
                                </Col>
                                <Col>
                                    <Link to={'/owner/boardings/add'} style={{textDecoration:'none'}}>
                                        <div className={homeStyles.doDivs}>
                                            <div className={homeStyles.doDivsimgDiv}>
                                                <img src={'images/postAds.webp'} width={'100%'} height={'150px'} style={{objectFit:'cover'}} />
                                            </div>
                                            <div>
                                                <p className={homeStyles.doDivP}>Post boardings</p>
                                                <p style={{textAlign:'left', lineHeight:'28px', color:'black'}}>Effortlessly connect with prospective tenants by posting your available boarding spaces on our platform. We simplify the process, making it convenient for both landlords and tenants to find the perfect match. List your space, showcase its unique features, and welcome new occupants hassle-free.</p>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>

                                <Col>
                                    <Link to={'/search'} style={{textDecoration:'none'}}>
                                        <div className={homeStyles.doDivs}>
                                            <div className={homeStyles.doDivsimgDiv}>
                                                <img src={'images/search.jpg'} width={'100%'} height={'150px'} style={{objectFit:'cover'}} />
                                            </div>
                                            <div>
                                                <p className={homeStyles.doDivP}>Find boardings</p>
                                                <p style={{textAlign:'left', lineHeight:'28px', color:'black'}}>Discover comfortable and serene boarding options, designed to feel like your second home. Experience tranquility and convenience, all in one place. Your peaceful sanctuary awaits, making your boarding search effortless and your stay truly comforting.</p>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>

                                <Col>
                                    <Link to={'/owner/boardings'} style={{textDecoration:'none'}}>
                                        <div className={homeStyles.doDivs}>
                                            <div className={homeStyles.doDivsimgDiv}>
                                                <img src={'images/manage.png'} width={'100%'} height={'150px'} style={{objectFit:'cover'}} />
                                            </div>
                                            <div>
                                                <p className={homeStyles.doDivP}>Manage Boarding</p>
                                                <p style={{textAlign:'left', lineHeight:'28px', color:'black'}}>Effortlessly oversee your boarding arrangements with our seamless system functionalities. Managing your accommodations has never been easier – our intuitive features ensure a smooth experience.</p>
                                            </div>
                                        </div>
                                    </Link>
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