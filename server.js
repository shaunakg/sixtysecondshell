// 
// Sixty Seconds of Python
// Under MIT Licence
// 

const process = require("process");
const express = require("express");
const ws = require("express-ws");
const pty = require("node-pty");

// Initialize module at 100 requests per 10 seconds:
var rateLimit = require('ws-rate-limit')(100, '10s')

const app = express();
let ips = [];

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

ws(app);

app.use(express.static("public/"))

app.ws("/ws", (ws, req) => {

  const ip = req.headers['x-forwarded-for'];
  console.log(ip)

  if (countOccurrences(ips, ip) > 5) {
    term.kill();
    ws.send(`\nTo prevent abuse of this service, we are limiting your IP address to ensure SSOP is available for everyone. This block will be lifted in around ten to fifteen minutes. [IP-LIMIT-${ip}]\n`);
    return ws.close();
  } else {
    ips.push(ip)
  }

	const term = pty.spawn("python3", [], { name: "xterm-color" });

	term.on("data", (data) => {

		try {
			ws.send(data);
		} catch (err) {
      console.error(err)
			ws.send(err)
		}

	});

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
