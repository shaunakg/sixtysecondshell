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
  origin: "https://sixtysecondshell.srg.id.au"
}));

const rateLimit = require("express-rate-limit");

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// apply to all requests
app.use(limiter);

let ips = [];

const languages = require("./languages.config");
const language_names = languages.map(x => x.name);

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

ws(app);

app.get("/", (req, res) => res.redirect("https://sixtysecondshell.srg.id.au/", 301))

app.get("/meta/languages", (req, res) => {

  return res.json(
    languages.map(x => ({
      ...x,
      script: null
    }))
  );

});

app.ws("/ws/:language", (ws, req) => {

  let language = req.params.language || "Python3";
  let timeout;

  if (!language_names.includes(language)) {
    ws.send(`\nUnsupported language "${language}". Try one of: ${language_names.join(", ")}.\n`)
    return ws.close();
  }

  let command = languages.filter(x => x.name === language)[0] ? languages.filter(x => x.name === language)[0].script : languages[0].script;

  console.log("Recieved request to launch TTY with command", command)

  const ip = req.headers['x-forwarded-for'];
  console.log(ip)

  if (countOccurrences(ips, ip) > 5) {

    term.kill();
    ws.send(`\nTo prevent abuse of this service, we are limiting your IP address to ensure SSOP is available for everyone. This block will be lifted in around ten to fifteen minutes. [IP-LIMIT-${ip}]\n`);
    ws.send("__TERMEXIT");
    clearTimeout(timeout);
    return ws.close();

  } else {

    ips.push(ip);

  }

  console.log("Launching...")
	const term = pty.spawn(command, [], { name: "xterm-color" });

	term.on("data", (data) => {

		try {
			ws.send(data);
		} catch (err) {
      console.error(err)
		}

	});

  term.on("exit", (data) => {

    try {
      ws.send("\n\nTerminal has exited. Your session has ended.")
      ws.send("__TERMEXIT");
      clearTimeout(timeout);
      return ws.close();
    } catch (err) { console.error(err) }

  })

	ws.on("message", (data) => {	

		return term.write(data);

	});

	timeout = setTimeout(() => {

    try {
      ws.send("\n:) Your sixty seconds has expired. See you next time!\n")
      ws.send("__TERMEXIT");
      term.kill()
      return ws.close();
    } catch (e) {
      return console.warn("Unable to close websocket to " + ip + " after timeout, probably closed the page.")
    }

	}, 60 * 1e3); // session timeout

});

app.listen(parseInt(process.env.PORT || 80), "0.0.0.0");
