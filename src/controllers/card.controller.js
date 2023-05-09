import { tokenize,detokenize } from "../utilities/tokenization.js";
import modelosInit from '../models/init-models.js'
import { sequelize } from '../database/database.js'
let modelos = modelosInit(sequelize)
export const tokenizeCard = async (req,res) =>{
    let {card_holder,card_number,expiration_date,card_type} = req.body;
    let response;
    var date = new Date(); // Now
    date.setDate(date.getDate() + 30);  
    let sqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
    let card_token = tokenize(card_number);
    let token_date = tokenize(expiration_date);
    try {
        response = await modelos.cards.create({
            card_holder,
            card_number: card_token,
            expiration_date:token_date,
            card_type
        });

        response = await modelos.tokens.create({
            token:card_token,
            creado: Date.now(),
            expired_at : sqlDate,
            card_id:response.id_card,
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({"error": error});
    }
    res.status(200).json(response)

}