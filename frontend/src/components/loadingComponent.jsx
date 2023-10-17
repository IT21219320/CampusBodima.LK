import { Image } from 'react-bootstrap';
import {PropagateLoader} from 'react-spinners'

const Loading = () => {

    return (
        <div style={{width:'100%',height:'100vh',display: 'flex',alignItems: 'center',justifyContent: 'center',flexDirection:'column'}}>
            <Image src="/logo2.png" width={150} style={{cursor: 'pointer', marginTop:'20px', marginBottom:'20px'}}/>
            <PropagateLoader color="#1565c0" style={{display:'inherit', position:'relative', left:'-10px'}}/>
        </div>
    );

};

export default Loading;
