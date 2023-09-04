import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import store from './store';
import { Provider } from 'react-redux';
 
import App from './App.jsx';
import HomePage from './pages/homePage.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import VerifyEmailPage from './pages/verifyEmailPage.jsx';
import ProfilePage from './pages/profilePage.jsx';
import GenerateOtpPage from './pages/generateOtpPage.jsx';
import OwnerBoardingPage from './pages/ownerBoardingPage.jsx';
import RegisterBoardingPage from './pages/registerBoardingPage.jsx';
import OwnerIngredientPage from './pages/OwnerIngredientPage';
import AddIngredientPage from './pages/addIngredientPage';
import ResetPasswordPage from './pages/resetPasswordPage.jsx';
import OccupantAllTicketsPage from './pages/occupantAllTicketsPage.jsx';
import CreateTicketPage from './pages/createTicketPage.jsx';
import PrivateRoute from './components/privateRoute';
import AdminRoute from './components/adminRoute';
import OwnerRoute from './components/ownerRoute';
import OccupantRoute from './components/occupantRoute';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={ <App /> }>
      
      {/* Public Routes */}
      <Route index={ true } path='/' element={ <HomePage /> } />
      <Route path='/login' element={ <LoginPage /> } />
      <Route path='/register' element={ <RegisterPage /> } />
      <Route path='/register/:tokenHeader/:tokenPayload/:tokenSecret' element={ <VerifyEmailPage /> } />
      <Route path='/generateotp' element={ <GenerateOtpPage /> } />
      <Route path='/resetpassword' element={ <ResetPasswordPage /> } />

      {/* Private Routes */}
      <Route path='' element={ <PrivateRoute /> }>
        <Route path='/profile' element={ <ProfilePage /> } />
        

        {/* Admin Routes */}
        <Route path='' element={ <AdminRoute /> }>

        </Route>

        {/* Owner Routes */}
        <Route path='' element={ <OwnerRoute /> }>
          <Route path='/owner/boarding' element={ <OwnerBoardingPage /> } />
          <Route path='/owner/boarding/add' element={ <RegisterBoardingPage /> } />

          <Route path='/owner/ingredient' element={ <OwnerIngredientPage /> } />
          <Route path='/owner/ingredient/add' element={ <AddIngredientPage /> } />
        </Route>

        {/* Occupant Routes */}
        <Route path='' element={ <OccupantRoute /> }>
          <Route path='/occupant/ticket' element={<OccupantAllTicketsPage />} />
          <Route path='/occupant/ticket/create' element={<CreateTicketPage />} />
          
        </Route>
      </Route>

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store = {store}>
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={ router } />
      </GoogleOAuthProvider>
    </React.StrictMode>
  </Provider>,
)
