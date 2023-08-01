import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import store from './store';
import { Provider } from 'react-redux';
 
import App from './App.jsx';
import HomePage from './pages/homePage.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import ProfilePage from './pages/profilePage.jsx';
import GenerateOtpPage from './pages/generateOtpPage.jsx';
import ResetPasswordPage from './pages/resetPasswordPage.jsx';
import PrivateRoute from './components/privateRoute';
import AdminRoute from './components/adminRoute';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={ <App /> }>
      
      {/* Public Routes */}
      <Route index={ true } path='/' element={ <HomePage /> } />
      <Route path='/login' element={ <LoginPage /> } />
      <Route path='/register' element={ <RegisterPage /> } />
      <Route path='/generateotp' element={ <GenerateOtpPage /> } />
      <Route path='/resetpassword' element={ <ResetPasswordPage /> } />

      {/* Private Routes */}
      <Route path='' element={ <PrivateRoute /> }>
        <Route path='/profile' element={ <ProfilePage /> } />

        {/* Admin Routes */}
        <Route path='' element={ <AdminRoute /> }>
          <Route path='/dashboard' element={ <ProfilePage /> } />
        </Route>
      </Route>

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store = {store}>
    <React.StrictMode>
      <RouterProvider router={ router } />
    </React.StrictMode>
  </Provider>,
)
