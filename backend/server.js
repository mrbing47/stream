const path = require("path");
const fs = require("fs");

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);

const morgan = require("morgan");
const utils = require("./script/utils.js");
const session = require("express-session")({
	secret: process.env.SECRET_KEY,
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 15,
	},
});
const socketSession = require("express-socket.io-session");
const cookieParser = require("cookie-parser");
const uniqid = require("uniqid");

const frontend = path.join(__dirname, process.env.FRONTEND);

var Rooms = [];

function getCookies(strCookies) {
	var cookies = strCookies.split(";");

	var result = {};

	for (var i of cookies) {
		var cookie = i.trim().split("=");
		var cookieValue = "";
		for (var j in cookie) {
			if (j != 0) cookieValue += cookie[j] + "=";
		}

		result[decodeURIComponent(cookie[0])] = cookieValue.slice(0, -1).trim();
	}

	return result;
}

app.set("view engine", "ejs");
app.set("views", path.join(frontend, "/html"));

app.use(morgan("short"));

app.use((req, res, next) => {
	//res.set("Cache-Control", "public, max-age= 60 * 10");
	next();
});

app.use(session);

app.use("/file", (req, res, next) => {
	const cookies = getCookies(req.headers.cookie);

	if (cookies.video) {
		const video = JSON.parse(cookies.video);
		req.video = video;
	}
	next();
});

app.use(cookieParser());
app.use(express.static(frontend));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var videoDetails = undefined;

app.get("/", (req, res) => {
	var roomid = "";
	if (req.query.roomid) {
		roomid = req.query.roomid;
	}
	res.render("index", { roomid });
});

app.post("/login", (req, res) => {
	const userid = uniqid();

	console.log(req.session.username);

	if (req.body.usertype) {
		if (req.body.usertype === "member") {
			const roomIx = Rooms.findIndex((value) => value.id === req.body.room);
			if (roomIx > -1) {
				const newUser = {
					name: req.body.username,
					type: "member",
					id: userid,
					roomid: req.body.room,
				};
				Rooms[roomIx].users.push(newUser);

				req.session.userid = userid;
				req.session.username = req.body.username;
				req.session.usertype = req.body.usertype;
				req.session.roomid = req.body.room;
				req.session.insideRoom = false;

				res.cookie("userid", userid);
				res.cookie("username", req.body.username);

				res.json({
					src: "/room/" + req.body.room,
				});
			} else {
				res.json({
					err: "Invalid Room Id.",
				});
			}
		} else {
			const roomid = uniqid();
			const newUser = {
				name: req.body.username,
				type: "leader",
				id: userid,
				roomid: req.body.room,
			};
			var room = {
				title: req.body.room,
				id: roomid,
				viewers: 0,
				users: [],
			};

			room.users.push(newUser);
			Rooms.push(room);

			console.log(room);

			req.session.userid = userid;
			req.session.username = req.body.username;
			req.session.usertype = req.body.usertype;
			req.session.roomid = roomid;
			req.session.insideRoom = false;

			res.cookie("userid", userid);
			res.cookie("username", req.body.username);

			res.json({
				src: "/folder",
			});
		}
	} else res.send("Invalid Access!!!");
});

app.get("/room/:id", (req, res) => {
	console.log(req.get("host"));

	const roomIx = Rooms.findIndex((value) => value.id === req.params.id);

	if (roomIx == -1) {
		res.send("Invalid Room Id!!!");
		return;
	}

	if (
		!req.session.roomid ||
		req.session.roomid !== req.params.id ||
		!Rooms[roomIx].users.some((value) => value.id === req.session.userid)
	) {
		console.log("if\n\n\n\n");
		res.redirect("/?roomid=" + req.params.id);
		return;
	} else {
		console.log("else\n\n\n\n");
		const response = {
			room: {
				title: Rooms[roomIx].title,
				id: Rooms[roomIx].id,
				viewers: Rooms[roomIx].viewers,
			},
			video: {
				...Rooms[roomIx].video,
				src: Rooms[roomIx].video.src,
			},
			usertype: req.session.usertype,
		};
		req.session.insideRoom = true;
		res.render("room", response);
	}
});

app.get("/file", (req, res) => {
	if (!req.query.path || !req.query.folder) {
		res.send("All Query Parameters are required!!!");
		return;
	}

	const decryptPath = utils.decryptPath(req.query.path).trim();
	console.log("query-path =>", decryptPath);

	const fileParts = req.query.folder.split(".");
	const fileTitle = [...fileParts.slice(0, -1)].join(".");
	const fileExt = fileParts.slice(-1)[0];

	const pathReq = path.join(decryptPath, fileTitle).trim();

	const result = utils.iterateDir(videoDetails, pathReq, fileExt);

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

	if (req.session.usertype === "leader" && !req.cookies.hasOwnProperty("watchmode")) {
		const roomIx = Rooms.findIndex((value) => value.id === req.session.roomid);

		if (
			roomIx != -1 &&
			Rooms[roomIx].users.some((value) => value.id === req.session.userid) &&
			req.cookies.video &&
			!req.session.insideRoom
		) {
			const video = JSON.parse(req.cookies.video);
			video.src = req.url;
			Rooms[roomIx].video = video;
			res.redirect("/room/" + req.session.roomid);
			return;
		}
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

app.get("/folder", (req, res) => {
	if (!req.query.path && !req.query.folder) {
		const encryptPath = utils.encryptPath("root");

		if (videoDetails) {
			var sorted = [...videoDetails];

			if (req.query.sort) {
				if (req.query.sort === "latest") sorted = sorted.sort((a, b) => b.birthtime - a.birthtime);
				if (req.query.sort === "oldest") sorted = sorted.sort((a, b) => a.birthtime - b.birthtime);
			}

			res.render("files", { data: sorted, path: encryptPath });
		} else res.status(500).send("INTERNAL ERROR!!!");
		return;
	}
	if (!req.query.path || !req.query.folder) {
		res.send("All Query Parameters are required!!!");
		return;
	}

	const decryptPath = utils.decryptPath(req.query.path);
	const pathReq = path.join(decryptPath, req.query.folder).trim();

	var result = utils.iterateDir(videoDetails, pathReq);

	if (result == 404 || Object.prototype.toString.call(result) != "[object Array]") {
		res.status(404).send("Wrong Path!!!");
		return;
	}

	if (req.query.sort) {
		if (req.query.sort === "latest") result = result.sort((a, b) => b.birthtime - a.birthtime);
		if (req.query.sort === "oldest") result = result.sort((a, b) => a.birthtime - b.birthtime);
	}

	const encryptPath = utils.encryptPath(pathReq);
	res.render("files", { data: result, path: encryptPath });
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

io.use(socketSession(session));

io.on("connection", (socket) => {
	const roomid = socket.handshake.session.roomid;
	const roomObj = Rooms.find((value) => value.id === roomid);
	const uid = socket.handshake.session.userid;
	const username = socket.handshake.session.username;
	var usertype = socket.handshake.session.usertype;

	if (!roomObj) {
		socket.disconnect();
	}

	socket.on("user-join", () => {
		socket.join(roomid);

		socket.to(roomid).broadcast.emit("user-join", username);

		const leaderId = roomObj.users[0].id;
		socket.to(roomid).broadcast.emit("time-req", uid, leaderId);

		roomObj.viewers++;
	});

	socket.on("time-res", (isPaused, currentTime, uid) => {
		socket.to(roomid).broadcast.emit("time-res", isPaused, currentTime, uid);
	});

	socket.on("message", (msg) => {
		socket.to(roomid).broadcast.emit("message", username, msg);
	});
	socket.on("play", () => {
		if (usertype === "leader") {
			socket.to(roomid).broadcast.emit("play");
		}
	});
	socket.on("pause", () => {
		if (usertype === "leader") {
			socket.to(roomid).broadcast.emit("pause");
		}
	});
	socket.on("seek", (time) => {
		if (usertype === "leader") {
			socket.to(roomid).broadcast.emit("seek", time);
		}
	});

	socket.on("leader-confirm", () => {
		usertype = "leader";
	});
	socket.on("disconnect", () => {
		console.log("disconnect\n\n");

		socket.leave(roomid);
		const userRoomIx = roomObj.users.findIndex((value) => value.id === uid);
		if (usertype === "leader" && roomObj.users.length > 1) {
			roomObj.users[userRoomIx + 1].type = "leader";
			const newLeaderName = roomObj.users[userRoomIx + 1].name;
			const newLeaderId = roomObj.users[userRoomIx + 1].id;

			socket.to(roomid).broadcast.emit("new-leader", newLeaderName, newLeaderId);
		}
		if (roomObj.viewers == 1) {
			const roomIx = Rooms.findIndex((value) => value.id === roomObj.id);
			Rooms.splice(roomIx, 1);
		} else {
			roomObj.users.splice(userRoomIx, 1);
			roomObj.viewers--;
		}
		socket.to(roomid).broadcast.emit("user-leave", username);
		socket.handshake.session.insideRoom = socket.handshake.session.username = socket.handshake.session.usertype = socket.handshake.session.roomid = socket.handshake.session.userid = undefined;
		socket.handshake.session.save();
	});
});

const PORT = process.env.PORT || 4769;

const updateAndListen = async function () {
	try {
		videoDetails = await utils.updateDetails();
		console.log("\nListening to PORT => " + PORT);

		const IPs = utils.getIP();
		console.log(`\nUse these IPs to connect over with PORT ${PORT} :`);
		for (let i in IPs) {
			console.log(i, "=>", IPs[i]);
		}

		utils.openBrowser();
		console.log("\n\n\n");
	} catch (err) {
		console.log(err);
		process.exit();
	}
};

http.listen(PORT, updateAndListen);
