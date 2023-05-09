import CryptoJS from "crypto-js";

const aes_key = "2e35f242a46d67eeb74aabc37d5e5d05";

export const tokenize = (data) =>{
    return CryptoJS.AES.encrypt(data,aes_key,{
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
}

export const detokenize = (data) =>{
    return CryptoJS.AES.decrypt(data, aes_key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
}