import modelosInit from '../models/init-models.js'
import {sequelize} from '../database/database.js'
import { tokenize, detokenize} from '../utilities/tokenization.js'
import luhn from 'luhn';
let modelos = modelosInit(sequelize)

//Tokenizar -> Intarcambiar numero por token
export const tokenizeCard = async (req,res) =>{
    let {card_holder,card_number,expiration_date,card_type} = req.body;
    
    if(!luhn.validate(card_number)){
        res.status(403).json({"error": "Tu tarjeta esta incorrecta"});
        return;
    }

    let response;
    let date = new Date();
    console.log(date);
    date.setDate(date.getDate() + 1);
    let sqlDate = date.toISOString().slice(0,19).replace('T',' '); //<--2022-05-10
    let token = tokenize(card_number+expiration_date+card_type)
    try {
        response = await modelos.cards.create({
            card_holder,
            card_number: tokenize(card_number), //<---- En claro -> AES256
            expiration_date: tokenize(expiration_date), //<---- En claro -> AES256 sha256
            card_type
        });

        response = await modelos.tokens.create({
            token,
            creado: Date.now(),
            expired_at:sqlDate,
            card_id: response.id_card
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({"error": error});
    }

    res.status(200).json(response);
}