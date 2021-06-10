// 
// Sixty Seconds of Python
// Under MIT Licence
// 

const process = require("process");
const express = require("express");
const ws = require("express-ws");
const pty = require("node-pty");

const app = express();
app.use(require('cors')({
  origin: "https://sixtysecondsofpython.srg.id.au"
}))

let ips = [];

const supported_commands = [
  "sh",
  "python3",
  "python",
  "python2"
];

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

ws(app);

app.get("/meta/languages", (req, res) => res.json(supported_commands));

app.ws("/ws/:language", (ws, req) => {

  let language = req.params.language || "python3";

  if (!supported_commands.includes(language)) {
    ws.send(`\nUnsupported language "${language}". Try one of: ${languages.join(", ")}.\n`)
    return ws.close();
  }

  const ip = req.headers['x-forwarded-for'];
  console.log(ip)

  if (countOccurrences(ips, ip) > 5) {
    term.kill();
    ws.send(`\nTo prevent abuse of this service, we are limiting your IP address to ensure SSOP is available for everyone. This block will be lifted in around ten to fifteen minutes. [IP-LIMIT-${ip}]\n`);
    return ws.close();
  } else {
    ips.push(ip)
  }

	const term = pty.spawn(language, [], { name: "xterm-color" });

	term.on("data", (data) => {

		try {
			ws.send(data);
		} catch (err) {
      console.error(err)
			ws.send(err)
		}

	});

  term.on("exit", (data) => {

    try {
      ws.send("\n\nTerminal has exited. Your session has ended.")
      return ws.close()
    } catch (err) {}

  })

	ws.on("message", (data) => {	

		return term.write(data);

	});

	setTimeout(() => {

    try {
      ws.send("\n:) Your sixty seconds has expired. See you next time!\n")
      term.kill()
      return ws.close()
    } catch (e) {
      return console.warn("Unable to close websocket to " + ip + " after timeout, probably closed the page.")
    }

	}, 60 * 1e3); // session timeout

});

app.listen(parseInt(process.env.PORT || 80), "0.0.0.0");
