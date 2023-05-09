import { tokenize,detokenize } from "../utilities/tokenization.js";

export const tokenizeCard = (req,res) =>{
    let {card_holder,card_number,expiration_date,card_type} = req.body;
    
    let card_token = tokenize(card_number);
    let token_date = tokenize(expiration_date);
    
    res.status(200).json({"card_token":card_token,"token_date":token_date})

}