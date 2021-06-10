const process = require("process");

const express = require("express");
const ws = require("express-ws");
const pty = require("node-pty");

const app = express();

ws(app);

app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));
app.ws("/ws", (ws) => {

	const term = pty.spawn("python3", [], { name: "xterm-color" });

	term.on("data", (data) => {

		try {
			ws.send(data);
		} catch (err) {
			ws.send(err)
		}

	});

	ws.on("message", (data) => {	

		console.log(data);
		term.write(data);

	});

	// ws.onopen(() => {

	// 	console.log("Connect")
	// 	ws.send("\nYour sixty seconds starts now.\n");

	// });

	setTimeout(() => {

		ws.send("\n:) Your sixty seconds has expired. See you next time!\n")
		ws.close([0])
		term.kill()

	}, 60 * 1e3); // session timeout

});

app.listen(parseInt(process.env.PORT || 80), "0.0.0.0");
