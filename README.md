# STREAM VIDEO

This server is useful in this hard time of quarantine period. Using this server, stream all your entertainment content over your LAN so that others can enjoy without using internet or copying the file over their device, while maintaining a social distance.

It has features like:

-   Impressive and Responsive UI.
-   Join or Create Room, or watch personlly.
-   Synchronised Video Playback in the room across all members.
-   Controls of the video will be controled by the Leader (one who created the room by default).
-   Real-time messaging in the Room so everyone can share their thoughts.

---

## Project Setup

Follow below steps in **order** to setup project:

1. Install `ffmpeg` for your respective OS.
2. Run `npm i` to install node packages.
3. Setup `dotenv` file (information given below).
4. Use `npm start` to start the server.
5. (Optional) Edit `stream.cmd`.

---

## _.env_ Setup

You need to add `.env` (dotenv) file to `/backend` folder, variables you need to setup:

```
ROOT=path/to/your/content
TN=${ROOT}\tn
JSON_PATH=${ROOT}\json
JSON_FILE=${ROOT}\json\details.json
SORT=0/1

FRONTEND=../frontend

SECRET_KEY=string_for_encryption
```

Here you need to change `ROOT` and `SECRET_KEY` variables and specify a value or `SORT`. <br>

> What is `SECRET_KEY`?<br>
> For the key, when you pass a string, it's treated as a passphrase and used to derive an actual key and IV. Or you can pass a WordArray that represents the actual key. If you pass the actual key, you must also pass the actual IV.

> What are the `SORT` ?<br>
> These are the sorting methods are for those files which are being updated or added, or if the `json` is being created for the first time, how they are being sorted. `sorting` methods are:<br><br>
> 0 => Added on the top, showing the **most recent** files on the **top**.<br>
> 1 => Add the file **alphabetical** in order.<br>

---

## _stream.cmd_

Edit `stream.cmd` and add the root path of the project, ie path to `package.json`. Edit the following line:

```
cd /d "path/to/project/root"
```

This files allows the user to start the server from **Command Prompt** and change the sorting technique for the newly added data. Following are the ways to pass **arguments** to the file:

1. Nothing, this will open the file in **current** directory like:

```
path/to/your/content> stream
```

2. Pass the **path** or **sorting** method as an argument like:

```
some/random/directory> stream "path/to/your/content"

OR

some/random/directory> stream 0/1
```

3. Pass the **path** and **sorting** method both like:

```
some/random/directory> stream "path/to/your/content" 0/1
```

This way, user don't have to hard code `ROOT` in `.env` file

_**PS**: NEVER LEARN BATCH_

---

## NOTE

1. To generate thumbnails for **video** files, create a folder `tn` inside `ROOT` directory.
2. This app supports multiple extensions, currently this code only has some extensions but you can add more extensions in array `supportedExt` in file `/backend/script/script.js :: line 18`.
3. To use `stream.cmd` as a **Command Prompt** command, add the **Project** directory to the `PATH` variables.

</br>

**STAY HOME, STAY SAFE** </br>
**_HAPPY QUARANTINE_**
