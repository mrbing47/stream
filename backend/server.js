const path = require("path");
const fs = require("fs");

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);
const session = require("express-session");

const morgan = require("morgan");
const script = require("./script/script.js");

const frontend = path.join(__dirname, process.env.FRONTEND);

var Rooms = [
	{
		title: "hello world",
		id: "abcd",
		viewers: 5,
		video: {
			title: "WOW",
			src: "/sample2.mp4",
			size: "501MB",
			time: "10:51",
		},
		users: [
			{
				name: "QWE47Y",
				id: "1234",
			},
		],
	},
];

app.set("view engine", "ejs");
app.set("views", path.join(frontend, "/html"));

app.use(morgan("short"));

app.use((req, res, next) => {
	//res.set("Cache-Control", "public, max-age=600");
	next();
});

app.use(session({ secret: process.env.SECRET_KEY, resave: true, saveUninitialized: true }));
app.use(express.static(frontend));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var videoDetails = undefined;

app.get("/", (req, res) => {
	res.render("index");
});

app.post("/login", (req, res) => {
	if (Rooms.some((value) => value.id === req.body.roomid)) {
		console.log("here");
		res.json({
			src: "/room/id/" + req.body.roomid,
		});
	} else {
		res.json({
			err: "Invalid Room Id.",
		});
	}
});

app.get("/room/id/:id", (req, res) => {
	const roomObj = Rooms.find((value) => value.id === req.params.id);

	if (!roomObj) {
		res.send("Invalid Room Id!!!");
		return;
	}

	res.render("room", {
		room: {
			title: roomObj.title,
			id: roomObj.id,
			viewers: roomObj.viewers,
		},
		video: roomObj.video,
	});
});

app.get("/file", (req, res) => {
	if (!req.query.path || !req.query.folder) {
		res.send("All Query Parameters are required!!!");
		return;
	}

	const decryptPath = script.decryptPath(req.query.path).trim();
	console.log("query-path =>", decryptPath);

	const fileParts = req.query.folder.split(".");
	console.log(fileParts);
	const fileTitle = [...fileParts.slice(0, -1)].join(".");
	const fileExt = fileParts.slice(-1)[0];

	const pathReq = path.join(decryptPath, fileTitle).trim();

	const result = script.iterateDir(videoDetails, pathReq, fileExt);

	if (result == 404) {
		res.status(404).send("Wrong Video!!!");
		return;
	}

	const pathArr = pathReq.split("\\").length == 1 ? pathReq.split("/") : pathReq.split("\\");
	pathArr.shift();
	let finalPath = path.join(...pathArr);

	const filePath = path.join(process.env.ROOT, finalPath + "." + fileExt);

	var fileSize;

	try {
		fileSize = fs.statSync(filePath).size;
	} catch (err) {
		res.send("Wrong path or file name!!!");
		return;
	}
	const range = req.headers.range;

	if (range) {
		const parts = range.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

		if (start >= fileSize) {
			res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
			return;
		}

		const chunksize = end - start + 1;
		const file = fs.createReadStream(filePath, { start, end });
		const head = {
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4",
		};

		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			"Content-Length": fileSize,
			"Content-Type": "video/mp4",
		};
		res.writeHead(200, head);
		fs.createReadStream(filePath).pipe(res);
	}
});

app.get("/tn/:tn", (req, res) => {
	fs.readdir(process.env.TN, (err, data) => {
		if (err) {
			res.status(500).send(err);
			return;
		}

		if (data.includes(req.params.tn)) res.sendFile(path.join(process.env.TN, "/" + req.params.tn));
		else res.status(404).send("INCORRECT id");
	});
});

app.get("/folder", (req, res) => {
	if (!req.query.path && !req.query.folder) {
		const encryptPath = script.encryptPath("root");

		if (videoDetails) res.render("files", { data: videoDetails, path: encryptPath });
		else res.status(500).send("INTERNAL ERROR!!!");
		return;
	}
	if (!req.query.path || !req.query.folder) {
		res.send("All Query Parameters are required!!!");
		return;
	}

	const decryptPath = script.decryptPath(req.query.path);
	const pathReq = path.join(decryptPath, req.query.folder).trim();

	const result = script.iterateDir(videoDetails, pathReq);

	if (result == 404 || Object.prototype.toString.call(result) != "[object Array]") {
		res.status(404).send("Wrong Path!!!");
		return;
	}

	const encryptPath = script.encryptPath(pathReq);
	res.render("index", { data: result, path: encryptPath });
});

io.on("connection", (socket) => {
	socket.on("create-room", (prevRoom, currRoomName, leaderName, ack) => {});
	socket.on("join-room", (prevRoom, currRoom, username, ack) => {});
	socket.on("user-join", (prevRoom, currRoom, username) => {});
	socket.on("user-leave", (currRoom, username) => {});
	socket.on("new-msg", (msg) => {
		console.log(msg);
	});
});

const PORT = process.env.PORT || 4769;

const updateAndListen = async function () {
	try {
		videoDetails = await script.updateDetails();
	} catch (err) {
		console.log(err);
	}
	console.log("Listening to PORT => " + PORT);
};

http.listen(PORT, updateAndListen);
