import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {Row, Col} from "react-bootstrap";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const PaymentForm = () =>{


    return(
        <>
            <div>
                <h3>Enter payment details</h3>
                <TextField id="outlined-basic" label="Outlined" variant="outlined" />

            </div>
        </>
    )
}

export default PaymentForm;