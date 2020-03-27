# STREAM VIDEO

This server is useful in this hard time of quarantine period. Using this server, stream all your entertainment content over your LAN so that others can enjoy without using internet or copying the file over their device, while maintaining a social distance.

---

## Project Setup

Follow below steps in **order** to setup project:

1. Run `npm i` to install node packages.
2. Setup `dotenv` file (information given below).
3. Use `npm start` to start the server.

---

## _.env_ Setup

You need to add **_.env_** (dotenv) file to `/backend` folder, variables you need to setup:

```
ROOT=path/to/your/content
TN=${ROOT}\tn
JSON_PATH=${ROOT}\json
JSON_FILE=${ROOT}\json\details.json

FRONTEND=../frontend

SECRET_KEY=string_for_encryption
```

Here you need to change `ROOT` and `SECRET_KEY` variables. </br>

> What is `SECRET_KEY`?</br>
> For the key, when you pass a string, it's treated as a passphrase and used to derive an actual key and IV. Or you can pass a WordArray that represents the actual key. If you pass the actual key, you must also pass the actual IV.

---

## NOTE

1. To generate thumbnails for **video** files, create a folder`tn` inside `ROOT` directory.
2. This app supports multiple extensions for all type of files, currently this code only has some extensions but you can add more extensions in array `supportedExt` in file `/backend/script/script.js :: line 18`.

</br>

**STAY HOME, STAY SAFE** </br>
**_HAPPY QUARANTINE_**
