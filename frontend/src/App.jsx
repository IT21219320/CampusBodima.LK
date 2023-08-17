import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const App = () => {

  const handleScroll = (e) => {
    if (e.target.classList.contains("on-scrollbar") === false) {
        e.target.classList.add("on-scrollbar");
        setTimeout(() => {
          e.target.classList.remove("on-scrollbar");
        }, 1000);
    }
  }

  window.addEventListener('scroll', handleScroll, true);

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