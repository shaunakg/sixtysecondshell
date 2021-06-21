// 
// Sixty Seconds of Python
// Under MIT Licence
// 

const process = require("process");
const express = require("express");
const ws = require("express-ws");
const pty = require("node-pty");

const fs = require("fs");
const {v4, validate} = require("uuid");

const app = express();
let noshell_execs = {};

app.use(require('cors')({
  origin: "https://sixtysecondshell.srg.id.au"
}));

app.use(require('body-parser').json())

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
      script: null,
      args: null
    }))
  );

});

app.post("/exec_noshell", (req, res) => {

  console.log("== No-shell code upload request ==");

  if (!req.body.language || !language_names.includes(req.body.language)) {

    return res.status(400).json({
      message: "The language selected is invalid."
    });

  }

  if (!req.body.code) {

    return res.status(400).json({
      message: "No code is present."
    });

  }

  if (req.body.code.length > 4000) {

    return res.status(400).json({
      message: "Code is too long, please shorten and try again."
    })

  }

  const fileId = v4();
  const fileName = fileId + ".60secondshell.code";

  console.log(`Saving to ${"./__code_store/" + fileName}`)

  fs.writeFileSync("./__code_store/" + fileName, req.body.code);
  noshell_execs[fileId] = {
    fileName: fileName,
    language: languages.filter(l => l.name === req.body.language)[0]
  }

  console.dir({
    success: true,
    id: fileId
  })

  return res.json({
    success: true,
    id: fileId
  });

});

app.get("/__healthcheck", async (req, res) => {
  
  console.log("ELB health check.")

  const exec = require('child_process').exec;
  exec("docker ps -aq | wc -l", (error, stdout, stderr) => {

    if (error || stderr) {
      console.error("Health check failed with error", error || stderr);
      return res.end(stderr || error);
    }

    return res.end(stdout);
    
  });
  
})

app.ws("/ws/_exec/:uuid", (ws, req) => {

  console.log("== No-shell execution request ==")
  console.log(req.params.uuid)

  if (!validate(req.params.uuid)) {

    ws.send("SixtySecondShell Host Runtime Error: [Bad Request] Shell-less exec ID could not be validated - try again.\n\n")
    ws.send("__TERMEXIT");
    
    return ws.close();

  }

  if (!noshell_execs[req.params.uuid]) {

    ws.send("SixtySecondShell Host Runtime Error: [Not Found] Shell-less exec ID does not exist.\n\n");
    ws.send("__TERMEXIT");

    return ws.close();

  }

  const exec = noshell_execs[req.params.uuid];
  console.log(exec);

  console.log("Launching with args", [ exec.fileName, ...(exec.language.args || []) ])

  const term = pty.spawn(exec.language.script, [ exec.fileName, ...(exec.language.args || []), req.params.uuid ], { name: "xterm-color" });

	term.on("data", (data) => {

		try {
			ws.send(data);
		} catch (err) {
      term.kill()
      console.error(err);
		}

	});

  term.on("exit", (data) => {

    try {

      ws.send("\n\n Shell-less process has exited. Your session has ended.")
      ws.send("__TERMEXIT");
      clearTimeout(timeout);

      fs.unlinkSync("./__code_store/" + exec.fileName);

      return ws.close();

    } catch (err) { console.error(err) }

  })

	ws.on("message", (data) => {
    
		return term.write(data);

	});

	timeout = setTimeout(() => {

    try {

      ws.send("\n\n Sorry, your process is taking too long. While we allow more than 60 seconds for shell-less processes, yours has exceeded the maximum time limit and will be killed.")
      ws.send("To prevent this in the furture, try using more efficient code or check for bugs beforehand. Thanks!")
      ws.send("__TERMEXIT");

      fs.unlinkSync("./__code_store/" + exec.fileName);

      term.kill();
      return ws.close();

    } catch (e) {

      term.kill();
      fs.unlinkSync("./__code_store/" + exec.fileName);

      return console.warn("Unable to close websocket after timeout, probably closed the page.");

    }

	}, 180 * 1e3); // session timeout

})

app.ws("/ws/:language", (ws, req) => {

  let language = req.params.language || "Python3";
  let timeout;

  if (!language_names.includes(language)) {
    ws.send(`\nUnsupported language "${language}". Try one of: ${language_names.join(", ")}.\n`)
    return ws.close();
  }

  let langobject = languages.filter(x => x.name === language)[0] ? languages.filter(x => x.name === language)[0] : languages[0];
  let command = langobject.script;

  console.log("Recieved request to launch TTY with command", command, "and args", langobject.args)

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
	const term = pty.spawn(command, langobject.args || [], { name: "xterm-color" });

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
