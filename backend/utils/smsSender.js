var transactionId;
var token;

const generateTransactionId = () => {
    const timestamp = Date.now(); // Get the current timestamp in milliseconds
    const randomValue = Math.floor(Math.random() * 1000); // Add randomness
    const uniqueId = `${timestamp}${randomValue}`;
    transactionId = uniqueId;
};

const getSmsToken = (numbers, message) => {
    fetch('https://e-sms.dialog.lk/api/v1/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'antpixelcore',
            password: 'Pixelcore@1133',
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        token = data.token;
        console.log("token:"+token);
        sendSMS(numbers, message);
    })
    .catch((err) => {
        console.log(err.data?.message || err.error);
    });
}

const sendSMS = (numbers, message) => {
  
  console.log(numbers);
    if(token){
        generateTransactionId();
        console.log(transactionId);
        fetch('https://e-sms.dialog.lk/api/v1/sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token
            },
            body: JSON.stringify({
                "msisdn": [numbers],
                "sourceAddress": 'Pixelcore',
                "message": message,
                "transaction_id": transactionId,
               }
            ),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            if(err.errCode == 100){
                getSmsToken(numbers, message);
            }
            console.log(err.data?.message || err.error);
        });
    }
    else{
        getSmsToken(numbers, message);
    }
}

export {sendSMS};

