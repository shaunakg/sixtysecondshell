// 
// Sixty Seconds of Python
// Under MIT Licence
// 

const process = require("process");
const express = require("express");
const ws = require("express-ws");
const pty = require("node-pty");

const app = express();
app.use(express.static("public/"))

app.use(require('cors')({
  origin: "https://sixtysecondsofpython.srg.id.au"
}))

const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

let ips = [];

const supported_commands = {

  python: "./langs/python",
  bash: "./langs/bash"

};

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

ws(app);

app.get("/meta/languages", (req, res) => res.json(Object.keys(supported_commands)));

app.ws("/ws/:language", (ws, req) => {

  let language = req.params.language || "python";

  if (!Object.keys(supported_commands).includes(language)) {
    ws.send(`\nUnsupported language "${language}". Try one of: ${languages.join(", ")}.\n`)
    return ws.close();
  }

  let command = supported_commands[language];
  console.log("Recieved request to launch TTY with command", command)

  const ip = req.headers['x-forwarded-for'];
  console.log(ip)

  if (countOccurrences(ips, ip) > 5) {
    term.kill();
    ws.send(`\nTo prevent abuse of this service, we are limiting your IP address to ensure SSOP is available for everyone. This block will be lifted in around ten to fifteen minutes. [IP-LIMIT-${ip}]\n`);
    return ws.close();
  } else {
    ips.push(ip)
  }

  console.log("Launching...")
	const term = pty.spawn(command, [], { name: "xterm-color" });

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
