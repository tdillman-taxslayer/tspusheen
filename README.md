# TS Pusheen
![alt text](https://res.cloudinary.com/ds1iicth1/image/upload/v1549478129/Artboard.png)

A delightfully easy to use Push Project Management system.  

### Problem

Managing multiple Push Notification services is difficult.  Choosing which one is even harder.  With TSPusheen, you can choose your platform.  Currently only Firebase is supported at the moment, but we have plans to support more platforms. 

## Get Started

The project is designed to be ran as a self contained Push Service API.  You may integrate this within your own server by calling its API endpoints.  It's recommended to run this project in its own server instance(s) and its own dedicated database. Currently only MongoDB is supported. 

### Step 1: Create Firebase Console Application

Follow the Firebase Setup process.  You will need to create an Admin API Server JSON file.  Contained within this file is some useful properties. 

```json
{
  "type": "service_account",
  "project_id": "fir-2-ae62e",
  "private_key_id": "fee95cb9ece550688aecae19d46054f744f09d6c",
  "private_key": "---SHHHH ITS A SECRET----",
  "client_email": "firebase-adminsdk-h5dqn@fir-2-ae62e.iam.gserviceaccount.com",
  "client_id": "105696775641805181711",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-h5dqn%40fir-2-ae62e.iam.gserviceaccount.com"
}

```

The contents of this file will be used to register your application. 

### Step 2: Application Registration

Post with the following endpoint and body content. 

`POST - /api/<version>/applications`

Body Content
```
{
	"name":"Demo 1",
	"provider":"firebase",
	"provider_credentials": <json file you gathered previously>,
  "database_url":"https://fir-2-ae62e.firebaseio.com"
}
```

Example Response
```
{
    "application": {
        "_id": "5c5b0b25bdc3670017a40498",
        "name": "Demo 2",
        "provider": "firebase",
        "provider_credentials": <encrypted_value>,
        "database_url": <encrypted_value>,
        "client_key": "88d51ca43cc8437b54f43df91cd293b2b2f2985c",
        "secret_key": <encrypted_value>,
        "__v": 0
    },
    "secret": "2af1ce027cad61f87b1cd3f4eb0ec8b60314272f"
}
```

Upon creating an application, the caller will have one opportunity to "remember" the `secret`.  The `secret` value is how the application authenticates with the server.  Think of it like a really awesome password that you didn't have to generate yourself. 

If you loose this key, your system administrator can reset and regenerate a new key that you can use to authenticat with your application. 

`provider_credentials` and `database_url` are the JSON and Firebase generated datbase URL.  **All Fields are required**

## Step 3 - Registering Devices

Using your platform specific FCM SDK, get an FCM Device Token.

This token will be used to register with the application. 

The `client_key` is obtained and generated whenever an application has been registered.  This is a **public** key.  You can safely distribute this key.  The only purpose it serves is to identify which application the device belongs too.  A device can be registered to multiple applications however each client side application is unique. 

`POST /api/<version>/devices/register`

Header Content
```
client_application_key : <client_key>
```

Body Content
```
{
	"client_key":<key obtained from generating application>,
	"userId":<user_generated_user_id>,
	"device_token":<fcm_token>,
	"device_type":<android|ios|web>
}
```
