# 2FA_Authentication_NodeJS
A login feature using Two Factor Authentication.
Using Speakeasy for generating one time password - OTP.
Using Google Authenticator to show OTP.

# Run
    npm i
    npm start

# General Two-Factor Step
````
1: Generate a secret
2: Show a QR code for the user to scan in
3: Authenticate the token for the first time
4: Validation for next times.
````

# Detail Two-Factor Step
````
1: Register new user + generate QR code
    POST:  http://localhost:3000/api/register
2: Open Authenticator Application and scan QR code as a response from Step1.
3: Verify QR code working
    POST http://localhost:3000/api/verify?token=069110&userId=961d8430-9daf-4196-a647-3c9f5aa55894
    Param:
        token: get from authenticator application
        userId: get from response from step1
4: Validate user everytime user login
    POST: http://localhost:3000/api/validate?token=017619&userId=961d8430-9daf-4196-a647-3c9f5aa55894
````

# Ref
    https://www.npmjs.com/package/speakeasy
