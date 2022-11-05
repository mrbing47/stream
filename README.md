# STREAM VIDEO

This server is useful in this hard time of quarantine period. Using this server, stream all your entertainment content over your LAN so that others can enjoy without using internet or copying the file over their device, while maintaining a social distance.

It has features like:

-   Impressive and Responsive UI.
-   Join or Create Room, or watch personally.
-   Synchronised Video Playback in the room across all members.
-   Controls of the video will be controled by the Leader (one who created the room by default).
-   Real-time messaging in the Room so everyone can share their thoughts.

<br>

### Main Page

![Main Page](https://raw.githubusercontent.com/mrbing47/Stream-Video/master/assets/index.png)
<br>
<br>

### Watch Personally

![Watch Peronally](https://raw.githubusercontent.com/mrbing47/Stream-Video/master/assets/watch-personal.png)
<br>
<br>

### Room

![Room](https://raw.githubusercontent.com/mrbing47/Stream-Video/master/assets/room.png)
<br>
<br>

### Real-Time Chat and Sync Playback

![Sync Playback and Real-Time Chat](https://raw.githubusercontent.com/mrbing47/Stream-Video/master/assets/stream-video-room.gif)

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

You need to rename _`.sample-env`_ to _`.env`_ (dotenv) located in `/backend` folder. Variables you need to modify in the file:

```
ROOT=path/to/your/content
TN=${ROOT}\tn
JSON_PATH=${ROOT}\details
DATA_FILE=${JSON_PATH}\data.json
TOKENS_FILE=${JSON_PATH}\tokens.json

FRONTEND=../frontend

(OPTIONAL)IGNORE_FILES=foldernames|filenames
PORT=3000

SECRET_KEY=string_for_encryption
```

Here you need to change `ROOT` and `SECRET_KEY` variables and `IGNORE_FILES` is an optional variable and if there is none file/folder to ignore, you can simply remove variable. <br>

> What is `SECRET_KEY`? <br/>
> For the key, when you pass a string, it's treated as a passphrase and used to derive an actual key and IV. Or you can pass a WordArray that represents the actual key. If you pass the actual key, you must also pass the actual IV.

---

## _stream.cmd_

Edit `stream.cmd` and add the root path of the project, ie path to `package.json`. Edit the following line:

```batch
cd "path/to/project/root"
```

This files allows the user to start the server any place on any directory using **Command Prompt**. Following are the ways to pass **arguments** to the file:

1. Nothing, this will open the file in **current** directory with the **default** port number in _`.env`_ file or in the _`server.js`_ file:

```bash
path/to/your/content> stream
```

2.Pass the **path** as an argument like:

```bash
some/random/directory> stream "path/to/your/content"
```

3.Pass the **PORT** as an argument like:

```bash
some/random/directory> stream 1234
```

4.Pass the **path** and **PORT** both as arguments like:

```bash
some/random/directory> stream "path/to/your/content" 1234
```

This way, user don't have to hard code `ROOT` and `PORT` in _`.env`_ file

_**PS**: NEVER LEARN BATCH_

---

## Query String

I have introduced a searching algoritm which does the job **pretty well**. To give queries more power and flexibility, I have added string manipulation. You can produce multiple query strings to get result for them using just single string.

To use this functionality, you just need to use `&` in the strings. In order to produce complex strings, you can use parentheses `()`. Here are some examples below:

```javascript
"A(B(Z&X)&C)D(E&F)GH&JK" = [
    "ABZDEGH",
    "ABXDEGH",
    "ABZDFGH",
    "ABXDFGH",
    "ACDEGH",
    "ACDFGH",
    "JK"
]

"(Bubble&Merge&Insertion) Sort" = [
    "Bubble Sort",
    "Merge Sort",
    "Insertion Sort"
]
```

---

## TODO

-   [ ] Need to escape `&`.
-   [ ] Add param for `tn`.
-   [ ] Re-write `getFile()`.
-   [ ] Fix videos inside a folder in search.
-   [ ] Accept params in js except batch.
-   [ ] Modulate routes in separate files.

---

## NOTE

1. To generate thumbnails for **video** files, create a folder `tn` inside `ROOT` directory. `(NEED to provide a cmd param)`
2. This app supports multiple extensions, currently this code only has some extensions but you can add more extensions in array `supportedExt` in file `/backend/script/script.js`.
3. To ignore files and folder to be scanned by the project, there is an array `ignoreFiles` in file `/backend/script/script.js` or you can use the env variable `IGNORE_FILES`.
4. To use `stream.cmd` as a **Command Prompt** command, add the **Project** directory to the `PATH` variables.
5. For now, there is no way to escape `&` in search query. `(NEED FIX)`
6. Videos that are situated inside a folder in the root will show up in the result but will not open as you click them. `(NEED FIX)`

</br>
