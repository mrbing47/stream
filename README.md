## STREAM VIDEO

---

This server is useful in this hard time of quarantine period. Using this server, stream all your entertainment content over your LAN so that others over that LAN can enjoy without using internet or copying the file over your device.

---

You need to add .env (dotenv) file to `/backend` folder, variables you need to setup:

```
ROOT=path/to/your/content
TN=${ROOT}\tn
JSON_PATH=${ROOT}\json
JSON_FILE=${ROOT}\json\details.json

FRONTEND=../frontend

SECRET_KEY=string_for_encryption
```

This app
