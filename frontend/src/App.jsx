import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <>
      <ToastContainer />
      <Container className='mw-100 py-0 px-0' style={{position:'fixed', height:'100vh'}}>
        <Outlet />
      </Container>
    </>
  );
};

export default App;