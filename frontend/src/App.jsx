import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const App = () => {

  return (
    <>
      <ToastContainer />
      <Container className='mw-100 py-0 px-0' style={{position:'fixed', minHeight:'100vh', height:'100%', overflow:'auto', display:'flex', background:'#f8f7fa'}}>
        <Outlet />
      </Container>
    </>
  );
};

export default App;