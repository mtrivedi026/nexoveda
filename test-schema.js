const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');

const ENCRYPTION_KEY = 'nexoveda_super_secret_aes_key_32b'; 
const AES_KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
const IV_LENGTH = 16;

function encryptText(text) {
  if (!text) return text;
  if (text.startsWith('ENC:')) return text; 
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(AES_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return 'ENC:' + iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    return text;
  }
}

function decryptText(text) {
  if (!text || !text.startsWith('ENC:')) return text;
  try {
    const textParts = text.substring(4).split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(AES_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return text; 
  }
}

const MessageSchema1 = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const MessageSchema2 = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  text: { type: String, required: true, get: decryptText, set: encryptText },
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

const M1 = mongoose.model('M1', MessageSchema1);
const M2 = mongoose.model('M2', MessageSchema2);

const id = new mongoose.Types.ObjectId();
const doc1 = new M1({ conversation: id, text: 'hello' });
const doc2 = new M2({ conversation: id, text: 'hello' });

console.log("M1 toJSON:", JSON.stringify(doc1));
console.log("M2 toJSON:", JSON.stringify(doc2));
