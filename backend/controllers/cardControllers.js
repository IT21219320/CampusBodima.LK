import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import cardDetails from "../models/cardDetailsModel.js";
import crypto from "crypto";

// Encryption settings
const algorithm = 'aes-256-cbc'; // Advanced Encryption Standard (AES) with a 256-bit key in Cipher Block Chaining (CBC) mode
const encryptionKey = 'b415b7abc3f436dfc36b66593a6fecd45d2df775b2548f362e8d6b7b1b5789c7'; // Replace with your secret key (must be 32 bytes for AES-256)
const iv = 'fa755257c212abaeae4a55c3c6dbbc95'; // Initialization Vector (IV), 16 bytes for AES-256

// Encryption function
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey,'hex'), Buffer.from(iv,'hex'));
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
  };
}

// Decrypt function
function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey,'hex'), Buffer.from(iv,'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

const addCard = expressAsyncHandler(async (req, res) => {
  const { userInfo_id, cardNumber, exDate, cvv } = req.body;

  const hashCardNumberFisrt = encrypt(cardNumber);

  const user = await User.findById(userInfo_id);

  const cardExist = await cardDetails.findOne({cardNumber:hashCardNumberFisrt})

  if(cardExist){
    res.status(200).json({ message: "Card exist" });
  }
  else{
    const hashCardNumber = encrypt(cardNumber);
    const cardNumberString = (hashCardNumber);

    const hashCvv = encrypt(cvv);
    const cvvString = (hashCvv);

    const response = await cardDetails.create({
      occupant: user,
      cardNumber: cardNumberString,
      expireDate: exDate,
      cvv: cvvString,
    });
    if (response) {
      res.status(200).json({ message: "card successfully added" });
    }
  }
  
});

const getCardById = expressAsyncHandler(async (req, res) => {
  const userInfo_id = req.body;

  const user_cards = await cardDetails.find({ occupant: userInfo_id.userInfo_id });

  if (user_cards.length === 0) {
    res.status(404).json({ message: "No card details found for this user" });
    return;
  }
  const userCards = []
  for(const user_card of user_cards){
    const cardNumberObject = user_card.cardNumber;
    const cvvObject = user_card.cvv;
    const decryptedCardNumber = decrypt(cardNumberObject.encryptedData);
    const decryptedCvv = decrypt(cvvObject.encryptedData);

    userCards.push({
      id:user_card._id,
      cardNumber : decryptedCardNumber,
      exNumber : user_card.expireDate,
      cvv : decryptedCvv
    })
  }

  res.status(200).json(userCards);
});

const updateCard = expressAsyncHandler(async (req, res) => {
  const { cardNumberF, expireDate, cvvF, cNo } = req.body;

  const hashCardNumberFisrt = encrypt(cNo);

  //const user = await User.findById(userInfo_id);

  const cardNumber = encrypt(cardNumberF);
  const cvv = encrypt(cvvF);

  const cardExist = await cardDetails.findOneAndUpdate({cardNumber:hashCardNumberFisrt},{cardNumber,expireDate,cvv})

  if(cardExist){
    res.status(200).json({ message: "card successfully updated" });
  }
  else{
    res.status(200).json({ message: "Failed" });
  }
  
});

const deleteCard = expressAsyncHandler(async (req, res) => {
 
  const { cNo } = req.body;
  
  const cardExist = await cardDetails.findByIdAndDelete(cNo)

  if(cardExist){
    res.status(200).json({ message: "card successfully deleted" });
  }
  else{
    res.status(200).json({ message: "Failed to delete" });
  }
  
});


export { addCard, getCardById, updateCard, deleteCard };
