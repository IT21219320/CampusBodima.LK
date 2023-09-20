import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import cardDetails from "../models/cardDetailsModel.js";
import crypto from "crypto";


// Encryption settings
const algorithm = 'aes-256-cbc'; // Advanced Encryption Standard (AES) with a 256-bit key in Cipher Block Chaining (CBC) mode
const encryptionKey =  crypto.randomBytes(32);// Replace with your secret key (must be 32 bytes for AES-256)
const iv = crypto.randomBytes(16); // Initialization Vector (IV), 16 bytes for AES-256

// Data to be encrypted
const originalData = 'This is the secret data';

// Encryption function
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
}

// Decrypt function
function decrypt(encryptedData, iv) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}


const addCard = expressAsyncHandler(async(req,res) =>{

    const {userInfo_id, cardNumber, exDate, cvv} = req.body;
  
    const user = await User.findById(userInfo_id);

    const hashCardNumber = encrypt(cardNumber);
    const cardNumberString = JSON.stringify(hashCardNumber);
    const hashCvv = encrypt(cvv);
    const cvvString = JSON.stringify(hashCvv);
    
    console.log(hashCardNumber)
    const response = await cardDetails.create({
        occupant : user,
        cardNumber : cardNumberString,
        expireDate : exDate,
        cvv : cvvString
    })
    if(response){
      res.status(200).json({ message: "card successfully added" });
    }
    
  });
  const getCardById = expressAsyncHandler(async(req,res) =>{

    const userInfo_id = req.body;
    
    const user_cards = await cardDetails.find({occupant:userInfo_id.userInfo_id});

    const user_card = user_cards[0];
    
    const cardNumberObject = JSON.parse(user_card.cardNumber);
    const cvvObject = JSON.parse(user_card.cvv);
    
    console.log(cardNumberObject.encryptedData);
    console.log(cardNumberObject.iv)
    // Decrypt the card number
    const decryptedCardNumber = decrypt(cardNumberObject.encryptedData, cardNumberObject.iv);

    console.log('Decrypted Card Number:', decryptedCardNumber);

    res.status(200).json({ cardNumber: decryptedCardNumber });

    //const decryptData = decrypt(user_cards.cardNumber, user_cards.cardNumber.iv);
    //console.log(decryptData);
    //if(user_cards){
      //res.status(200).json({ user_cards });
    //}
    
  });

  export {addCard, getCardById};