import Header from '../components/header';
import { Container, Row, Col, Form, Toast } from 'react-bootstrap';
import Button from '@mui/material/Button';
import homeStyles from '../styles/homePageStyles.module.css'


const navigate = {

}
const HomePage = () => {
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
                    <div style={{height:'600px',width: "100%",position: 'absolute'}}>
                        <Col className={homeStyles.homeWelcText}>
                            <h1>Welcome to <span style={{ fontFamily: 'Papyrus' }}>CampusBodima.LK</span></h1>
                            <p style={{fontFamily:'Lucida Console', fontSize:'font-size: larger'}}>Find your Second home with easy steps</p>
                            <Button variant="outlined" size='large' className={homeStyles.getStartBtn} onClick={navigate}>Get start</Button>
                        </Col>
                    </div>
                    <div  className={homeStyles.servicesDiv}>

                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;