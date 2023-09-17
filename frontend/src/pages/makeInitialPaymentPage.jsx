import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const makeInitialPaymentPage = () =>{
    return (
        <>
            <Stepper>
                <Step>
                    <StepLabel>Payment</StepLabel>
                </Step>
            </Stepper>
        </>
    )
}


export default makeInitialPaymentPage;