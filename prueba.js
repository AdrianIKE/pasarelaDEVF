import CryptoJS from 'crypto-js';
var llave = "2e35f242a46d67eeb74aabc37d5e5d05";
var mensaje = "4111111111111111";

var encrypted = CryptoJS.AES.encrypt(mensaje, llave, {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
}).toString();



//var resa = CryptoJs.AES256()
console.log(encrypted);

var decrypted = CryptoJS.AES.decrypt(ciphertext, llave, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
});
  
var decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);
  
console.log(decryptedMessage);
