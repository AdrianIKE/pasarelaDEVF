import modelosInit from '../models/init-models.js'
import {sequelize} from '../database/database.js'
import { tokenize, detokenize} from '../utilities/tokenization.js'
import { getExchange } from '../utilities/external.apis.js';
import { Op } from 'sequelize';
import cron from "node-cron"
import luhn from 'luhn';
import rn from 'random-number'
let modelos = modelosInit(sequelize)
let version = "1.0.0";
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

export const payCard = async (req,res) =>{
    let token_id = req.body.token_id;
    let currency = req.body.currency;
    let response;
    let token;
    let expiration;
    let present = Date.now()
    let exchange_rate = await getExchange(currency);
    
    try {
        response = await modelos.tokens.findByPk(token_id);
        token = response.dataValues.token.toString();
        expiration = Date.parse(response.dataValues.expired_at.toString())

        if(expiration < present){
            res.status(500).json({"error": "Tu token a expirado"});
            return;
        }

        
        response = await modelos.orders.create({
            amount: req.body.amount,
            currency,
            exchange_rate,
            expedition_date: Date.now(),
            geolocation:  req.body.geolocation,
            version,
            bank_transmitter : req.body.bank_transmitter,
            bank_receptor: req.body.bank_receptor,
            concept: req.body.concept,
            charges: req.body.charges,
            recurrency: req.body.recurrency,
            token_id,
            client_id: req.body.client_id,
            paymenthm_id: req.body.paymenthm_id,
            status_id: 3
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({"error": error});
    }
    
    res.status(200).json(response);
}

const getRandom = (max) => {
    return Math.floor(Math.random() * max) +1;
}

cron.schedule('*/1 * * * *', async () => {
    let response;
    
    try {
        response = await modelos.orders.findAll({
            where:{
                [Op.and]:[
                    {status_id:3},
                    {[Op.or]:[{tries:null},{tries:false}]}
                ]
            }});
    } catch (error) {
        console.log(error)
    }
    response.forEach((data) => {
        var options = {
            min:  1,
            max:  2,
            integer: true
        }
        let pago = rn(options)
        if(data.tries=== null && pago !== 1){
            data.tries = false;
            data.save();
        }else if(data.tries === false && pago !== 1){
            data.tries = true;
            data.status_id = 2;
            data.save();
        }else if(pago === 1){
            data.tries = true;
            data.status_id= pago;
            data.save();
        }
    });
});