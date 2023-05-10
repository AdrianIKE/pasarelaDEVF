import modelosInit from '../models/init-models.js'
import {sequelize} from '../database/database.js'
import { tokenize, detokenize} from '../utilities/tokenization.js'
let modelos = modelosInit(sequelize)

//Tokenizar -> Intarcambiar numero por token
export const tokenizeCard = async (req,res) =>{
    let {card_holder,card_number,expiration_date,card_type} = req.body;
    let response;

    try {
        response = await modelos.cards.create({
            card_holder,
            card_number: tokenize(card_number), //<---- En claro -> AES256
            expiration_date: tokenize(expiration_date), //<---- En claro -> AES256 sha256
            card_type
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({"error": error});
    }

    res.status(200).json(response);
}