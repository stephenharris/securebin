import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Buffer } from 'buffer';
import { uuid } from 'uuidv4';

var AWS = require('aws-sdk');

@Injectable()
export class SecretsService {
    
    private ddb;
    private s3;

    private algorithm = 'aes256';

    constructor() {
        this.ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
        this.s3 = new AWS.S3();
    }

    public async storeSecret(data) {

        const key = randomBytes(32);
        const hexKey = key.toString('hex');
        
        const iv = randomBytes(16); 
        const hexIv = iv.toString('hex');
        
        const secretUuid = uuid();

        const encrypted = this.encrypt(data.secret, key, iv);

        await this.store(secretUuid, encrypted, hexIv, data.expires, this.algorithm, data.fileUpload);

        let response = {
            "uuid": secretUuid,
            "key": hexKey,
            "url": `https://securebin.c7e.uk/${secretUuid}/${hexKey}`,
            "expires": data.expires,
            "expiresISO": (new Date(data.expires*1000)).toISOString(),
        }; 
        
        if (data.fileUpload) {
            const signedUrl = await this.s3.getSignedUrl('putObject', {
                Bucket: 'securebin-filestorage',
                Key: `uploads/${secretUuid}/${data.fileUpload}`,
                Expires: 60*60,
            });
    
            (response as any).signedUrl = signedUrl;
        }

        return response;
    }

    public async retrieveSecret(secretUuid, key) {
        var params = {
            TableName: "Secrets",
            Key: {
                "uuid": secretUuid
            }
        };
        
        let results = await this.ddb.get(params).promise();

        if(!results.Item) {
            console.log(`Request for secret ${secretUuid} not found`);
            throw new Error("Secret not found");
        }

        await this.ddb.delete(params).promise();

        if(results.Item.expires <= Math.floor(Date.now() / 1000) ) {
            console.log(`Request for secret ${secretUuid} expired`);
            throw new Error("Secret expired");
        }

        try {
            const deciphered = this.decrypt(results.Item.encryptedSecret, Buffer.from(key, 'hex'), Buffer.from(results.Item.iv, 'hex'));
            let signedUrl = null;
            if (results.Item.file) {
                signedUrl = await this.s3.getSignedUrl('getObject', {
                    Bucket: 'securebin-filestorage',
                    Key: `uploads/${results.Item.uuid}/${results.Item.file}`,
                    Expires: 60 * 60,
                });
            }

            return {
                "secret": deciphered,
                "file": signedUrl
            };
        } catch (error) {

            console.log(`Decryption for secret ${secretUuid} failed: ` + error.message);
            throw new Error("Decryption failed");
        }
    }


    private encrypt(secret, key, iv) {
        var cipher = createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    private decrypt(encryptedSecret, key, iv){
        var decipher = createDecipheriv(this.algorithm, key, iv);
        var deciphered = decipher.update(encryptedSecret, 'hex', 'utf8');
        deciphered += decipher.final('utf8');
        return deciphered;
    }

    private store(uuid, encryptedSecretHex, ivHex: string, expires: number, algorithm: string, fileName: string): Promise<any> {
        var params = {
            TableName: "Secrets",
            Item: {
                "uuid": uuid,
                "iv": ivHex,
                "encryptedSecret": encryptedSecretHex,
                "expires": expires,
                "alg": algorithm,
                "file": fileName
            }
        };
        return this.ddb.put(params).promise();
    }

}
