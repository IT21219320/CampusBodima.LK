import Header from '../components/header';
import { Container, Row, Col, Form, Toast } from 'react-bootstrap';
import homeStyles from '../styles/homePageStyles.module.css'
const HomePage = () => {
    return (
        <>
            <div style={{width:'100%'}}>
                <Header />
                <div style={{minHeight:'100vh', height:'200vh'}}>
                    <div className={homeStyles.homeBackDiv}>
                        <img src={'homePageBackground.jpg'} width={"100%"} height={'600px'}/>
                    </div>
                    <div style={{backgroundColor:'black', opacity:'50%'}}>

                    </div>
                    <Col >
                        <h1>Welcome</h1>
                    </Col>
                </div>
            </div>
        </>
    );
}

export default HomePage;