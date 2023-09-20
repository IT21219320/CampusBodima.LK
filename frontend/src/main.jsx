import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoadScript } from '@react-google-maps/api';

import store from './store';
import { Provider } from 'react-redux';
 
import App from './App.jsx';


import HomePage from './pages/homePage.jsx';

import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import VerifyEmailPage from './pages/verifyEmailPage.jsx';
import ProfilePage from './pages/profilePage.jsx';
import GenerateOtpPage from './pages/generateOtpPage.jsx';
import ResetPasswordPage from './pages/resetPasswordPage.jsx';

import OwnerBoardingPage from './pages/ownerBoardingPage.jsx';
import RegisterBoardingPage from './pages/registerBoardingPage.jsx';
import EditBoardingPage from './pages/editBoardingPage.jsx';
import OwnerBoardingRoomPage from './pages/ownerBoardingRoomPage.jsx';
import AddBoardingRoomPage from './pages/addBoardingRoomPage.jsx';

import OwnerIngredientPage from './pages/OwnerIngredientPage';
import AddIngredientPage from './pages/addIngredientPage';
import UpdateIngredientPage from './pages/updateIngredientPage';

import OccupantTicketsPage from './pages/occupantTicketsPage.jsx';
import CreateTicketPage from './pages/createTicketPage.jsx';

import AddUtilitiesPage from './pages/addUtilityPage.jsx';

import CreateFeedback from './pages/createFeedbackPage';

import MakeInitialPaymentPage from './pages/makeInitialPaymentPage';

import OrderList from './pages/OrderList.jsx'


import PrivateRoute from './components/privateRoute';
import AdminRoute from './components/adminRoute';
import OwnerRoute from './components/ownerRoute';
import OccupantRoute from './components/occupantRoute';

import Spinner from 'react-bootstrap/Spinner';
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
          <Route path='/owner/boardings' element={ <OwnerBoardingPage /> } />
          <Route path='/owner/boardings/add' element={ <RegisterBoardingPage /> } />
          <Route path='/owner/boardings/:boardingId/rooms' element={ <OwnerBoardingRoomPage /> } />
          <Route path='/owner/boardings/:boardingId/edit' element={ <EditBoardingPage /> } />
          <Route path='/owner/boardings/:boardingId/:boardingName/rooms/add' element={ <AddBoardingRoomPage /> } />

          <Route path='/owner/ingredient' element={ <OwnerIngredientPage /> } />
          <Route path='/owner/ingredient/add' element={ <AddIngredientPage /> } />
          <Route path='/owner/ingredient/update' element={ <UpdateIngredientPage /> } />

          <Route path='/owner/utility/add' element={<AddUtilitiesPage />} />
        </Route>

        {/* Occupant Routes */}
        <Route path='' element={ <OccupantRoute /> }>
          <Route path='/occupant/ticket' element={<OccupantTicketsPage />} />
          <Route path='/occupant/ticket/create' element={<CreateTicketPage />} />

          <Route path='/occupant/order/' element={<OrderList />} />

          <Route path='/occupant/makePayment/' element={<MakeInitialPaymentPage />} />

          <Route path='/occupant/feedback/create' element={<CreateFeedback />} />
        </Route>
      </Route>

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store = {store}>
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} loadingElement={<div></div>}>
          <RouterProvider router={ router } />
        </LoadScript>
      </GoogleOAuthProvider>
    </React.StrictMode>
  </Provider>,
)
