const express = require('express');
const speakeasy = require('speakeasy');
const uuid = require('uuid');
const QRCode = require('qrcode');
const {JsonDB } = require('node-json-db');
const { Config }= require('node-json-db/dist/lib/JsonDBConfig');
const app = express();

// init json db
const db = new JsonDB(new Config('authDB', true, false, '/'));

//Generate QR code for new User.
app.post('/api/register',async (req, res)=> {
    try{
        const id = uuid.v4();
        const path = `/user/${id}`;
        const secret = speakeasy.generateSecret(32, false, true, "hoangtienhoa");

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        await db.push(path, { id, secret,
            qrCode,
            two_factor_secret: secret.base32,
            two_factor_enabled: false});

        return res.send(`<h3>TEMP SECRET:  ${secret.base32}</h3> <h3> userID: ${id} </h3> <img src=${qrCode}> `);
    }catch(error) {
        console.log(error);
        res.status(500).json({
            message: 'Error generating secret'
        });
    }
})
// verify QR code from register working and update two_factor_enabled flag
app.post('/api/verify',async(req, res)=> {
    const { token, userId } = req.query;
    console.log(`Verify API. Token: ${token}, userId: ${userId}`);
    try {
        const path = `/user/${userId}`;
        // get use with the id from the path
        const user = await db.getData(path);
        console.log(user);
        // verifying the token
        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token
        });

        if(verified){
            // change temp_secret in our db to secret(permanent)
            user.two_factor_enabled = true;
            await db.push(path, user);
            res.json({
                verified: true
            });
        }else {
            res.json({
                verified: false
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error verifying and finding user",
        });
    }
})

// validate user
app.post("/api/validate", async(req, res) => {
    const { token, userId } = req.query;

    try {
        const path = `/user/${userId}`;
        // get use with the id from the path
        const user = await db.getData(path);

        // verifying the token
        const tokenValidate = speakeasy.totp.verify({
            secret:user.two_factor_secret,
            encoding: "base32",
            token,
            window: 1
        });

        if (tokenValidate) {
            res.json({
                validated: true,
            });
        } else {
            res.json({
                validated: false,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error validating and finding user",
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server listening on ${PORT}`));