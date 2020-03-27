# STREAM VIDEO

This server is useful in this hard time of quarantine period. Using this server, stream all your entertainment content over your LAN so that others over that LAN can enjoy without using internet or copying the file over your device.

---

## Project Setup

Follow below steps in **order** to setup project:

1. Run `npm i` to install node packages.
2. Setup `dotenv` file (information given below).
3. Use `npm start` to start the server.

---

## _.env_ Setup

You need to add _.env_ (dotenv) file to `/backend` folder, variables you need to setup:

```
ROOT=path/to/your/content
TN=${ROOT}\tn
JSON_PATH=${ROOT}\json
JSON_FILE=${ROOT}\json\details.json

FRONTEND=../frontend

SECRET_KEY=string_for_encryption
```

---

## NOTE

> This app supports multiple extensions for all type of files, currently this code only has _`.mp4`_ and _`.mkv`_ extensions but you can add more extensions in array _`supportedExt`_ in file _`/backend/script/script.js ::`_ **_`line 18`_**.

</br>

**STAY HOME, STAY SAFE** </br>
**_HAPPY QUARANTINE_**
