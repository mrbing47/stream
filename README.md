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
4. Edit
    - (LINUX / MAC) `terminal/bash/stream`
    - (WINDOWS) `terminal/cmd/stream.cmd`.

---

## _.env_ Setup

You need to rename _`sample.env`_ to _`.env`_ located in `ROOT/backend/` folder. You need to modify `SECRET_KEY` to prevent tampering of session cookie.

```dotenv
SECRET_KEY=a secret string for session
```

---

## CLI

This project comes with a custom build CLI menu to help users setup the project configuration at ease.

## **Setup**

Edit following shell files based on OS.

-   LINUX / MAC) `terminal/bash/stream`.
-   (WINDOWS) `terminal/cmd/stream.cmd`.

and add the root path of the project, i.e., path to `index.js`. Edit the following line:

(LINUX / MAC)

```bash
node "/path/to/project/index.js" $*
```

(WINDOWS)

```ps
node "/path/to/project/index.js" %*
```

This files allows the user to start the server any place on any directory using **Terminal** or **Command Prompt**.

After completing the steps mentioned above, you will be able to configure the root directory of the media and pass _kwargs and args_ from cli itself.

## **Usage**

_**TODO**_

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
-   [x] Add param for `tn`.
-   [x] Re-write `getFile()`.
-   [x] Fix videos inside a folder in search.
-   [x] Accept params in js except batch.
-   [ ] Modulate routes in separate files.

---

## NOTE

1. For now, there is no way to escape `&` in search query. `(NEED FIX)`.
