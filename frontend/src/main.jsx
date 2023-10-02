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
import SearchPage from './pages/searchPage.jsx';
import ViewBoarding from './pages/viewBoarding.jsx'

import OwnerBoardingPage from './pages/ownerBoardingPage.jsx';
import RegisterBoardingPage from './pages/registerBoardingPage.jsx';
import EditBoardingPage from './pages/editBoardingPage.jsx';
import OwnerBoardingRoomPage from './pages/ownerBoardingRoomPage.jsx';
import AddBoardingRoomPage from './pages/addBoardingRoomPage.jsx';
import EditBoardingRoomPage from './pages/editBoardingRoomPage.jsx';
import OwnerBoardingOccupants from './pages/ownerBoardingOccupants.jsx';
import AdminVerifyBoardingPage from './pages/adminVerifyBoardingPage.jsx';

import OwnerIngredientPage from './pages/OwnerIngredientPage.jsx';
import AddIngredientPage from './pages/addIngredientPage.jsx';
import UpdateIngredientPage from './pages/updateIngredientPage.jsx';

import OccupantTicketsPage from './pages/occupantTicketsPage.jsx';
import OwnerTicketsPage from './pages/ownerTicketsPage.jsx';
import OccupantTicketThreadPage from './pages/occupantTicketThreadPage.jsx'
import CreateTicketPage from './pages/createTicketPage.jsx';
import UpdateMainTicketPage from './pages/occupantUpdateMainTicketPage.jsx';
import OwnerTicketThreadPage from './pages/ownerTicketThreadPage.jsx';

import AddUtilitiesPage from './pages/addUtilityPage.jsx';
import AllUtilitiesPage from './pages/allUtilitiesPage.jsx';
import UpdateUtilitiesPage from './pages/updateUtilityPage';

import CreateFeedback from './pages/createFeedbackPage.jsx';
import OccupantFeedback from './pages/occupantFeedbackPage.jsx';
import UpdateFeedbackpage from './pages/updateFeedbackPage.jsx';
import AllFeedbacks from './pages/allFeedbackPage.jsx';

import OccupantPaymentDash from './pages/occupantPaymentsDashboard.jsx';
import MakeInitialPaymentPage from './pages/makeInitialPaymentPage.jsx';
import OwnerPaymentDash from './pages/ownerPaymentsDashboard.jsx';
import MakeMonthlyPaymentPage from './pages/makeMonthlyPaymentPage.jsx'

import ReserveHostelPage from './pages/reserveHostelPage.jsx';
import ReserveAnnexPage from './pages/reserveAnnexPage.jsx';
import ConfirmReservationPage from './pages/confirmReservationPage.jsx';
import MyReservationPage from './pages/myReservationPage.jsx';
import OwnerAllReservarions from './pages/ownerAllReservationsPage.jsx';

import Orders from './pages/Orders.jsx';
import OrderPage from './pages/OrderPage.jsx';
import UpdateOrder from './pages/UpdateOrder.jsx';

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
      <Route path='/search' element={ <SearchPage /> } />
      <Route path='/search/boardings/:boardingId' element={ <ViewBoarding /> } />

      {/* Private Routes */}
      <Route path='' element={ <PrivateRoute /> }>
        <Route path='/profile' element={ <ProfilePage /> } />
        

        {/* Admin Routes */}
        <Route path='' element={ <AdminRoute /> }>
          <Route path='/admin/boardings' element={ <AdminVerifyBoardingPage /> } />
          <Route path='/admin/feedbacks' element={ <AllFeedbacks /> } />
        </Route>

        {/* Owner Routes */}
        <Route path='' element={ <OwnerRoute /> }>
          <Route path='/owner/boardings' element={ <OwnerBoardingPage /> } />
          <Route path='/owner/boardings/add' element={ <RegisterBoardingPage /> } />
          <Route path='/owner/boardings/:boardingId/occupants' element={ <OwnerBoardingOccupants /> } />
          <Route path='/owner/boardings/:boardingId/rooms' element={ <OwnerBoardingRoomPage /> } />
          <Route path='/owner/boardings/:boardingId/edit' element={ <EditBoardingPage /> } />
          <Route path='/owner/boardings/:boardingId/:boardingName/rooms/:roomNo/add' element={ <AddBoardingRoomPage /> } />
          <Route path='/owner/boardings/:boardingId/:boardingName/rooms/:roomId/edit' element={ <EditBoardingRoomPage /> } />
          <Route path='/owner/boardings/:boardingId/:boardingName/rooms/:roomId/occupants' element={ <EditBoardingRoomPage /> } />

          <Route path='/owner/reservations/' element={<OwnerAllReservarions />} />

          <Route path='/owner/payment/' element={<OwnerPaymentDash />} />

          <Route path='/owner/ingredient' element={ <OwnerIngredientPage /> } />
          <Route path='/owner/ingredient/add' element={ <AddIngredientPage /> } />
          <Route path='/owner/ingredient/update/:boardingId/:ingredientId' element={ <UpdateIngredientPage /> } />
          
          <Route path='/owner/order/' element={<OrderPage />} />

          <Route path='/owner/ticket' element={<OwnerTicketsPage />} />
          <Route path='/owner/ticket/:ticketId' element={<OwnerTicketThreadPage />} />

          <Route path='/owner/utility/' element={<AllUtilitiesPage />} />
          <Route path='/owner/utility/update/:boardingId/:utilityType/:utilityId' element={<UpdateUtilitiesPage />} />
          <Route path='/owner/utility/add' element={<AddUtilitiesPage />} />
        </Route>

        {/* Occupant Routes */}
        <Route path='' element={ <OccupantRoute /> }>
          <Route path='/occupant/ticket' element={<OccupantTicketsPage />} />
          <Route path='/occupant/ticket/:ticketId' element={<OccupantTicketThreadPage />} />
          <Route path='/occupant/ticket/create' element={<CreateTicketPage />} />
          <Route path='/occupant/ticket/update/:ticketId' element={<UpdateMainTicketPage />} />

          <Route path='/occupant/order/' element={<Orders />} />
          <Route path='/occupant/order/orderList/updateOrder/:oId' element={<UpdateOrder />} />

          <Route path='/occupant/payment/' element={<OccupantPaymentDash />} />
          <Route path='/occupant/makePayment/:bId' element={<MakeInitialPaymentPage />} />
          <Route path='/occupant/makeMonthlyPayment/:bId/:amount' element={<MakeMonthlyPaymentPage />} />

          <Route path='/occupant/reservations/reserve/:bId/:rId' element={<ReserveHostelPage />} />
          <Route path='/occupant/reservations/reserve/:bId/' element={<ReserveAnnexPage />} />
          <Route path='/occupant/reservations/confirm/' element={<ConfirmReservationPage />} />
          <Route path='/occupant/boarding' element={<MyReservationPage />} />
          <Route path='/occupant/boarding/join/:tokenHeader/:tokenPayload/:tokenSecret' element={ <VerifyEmailPage /> } />
          
          <Route path='/occupant/feedback' element={<OccupantFeedback />} />
          <Route path='/occupant/feedback/create' element={<CreateFeedback />} />
          <Route path='/occupant/feedback/update/:feedbackId' element={<UpdateFeedbackpage />} />
          
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
