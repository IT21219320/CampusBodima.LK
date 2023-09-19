import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import cardDetails from "../models/cardDetailsModel.js";
import bcrypt from "bcryptjs";


const addCard = expressAsyncHandler(async(req,res) =>{

    const {userInfo_id, cardNumber, exDate, cvv} = req.body;
  
    const user = await User.findById(userInfo_id);

    const hashCardNumber = await bcrypt.hash(cardNumber);
    const hashCvv = await bcrypt.hash(cvv);
  
    const response = await cardDetails.create({
        occupant : user,
        cardNumber : hashCardNumber,
        expireDate : exDate,
        cvv : hashCvv
    })
    if(response){
      res.status(200).json({ message: "card successfully added" });
    }
    
  });

  export {addCard};