// 
// Sixty Seconds of Python
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

const languages = require("./languages.config.json");
const { exit } = require("process");
const language_names = languages.map(x => x.name);

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

ws(app);

// Redirect visits to index to our site
app.get("/", (req, res) => res.redirect("https://sixtysecondshell.srg.id.au/", 301))

// Languages endpoint
app.get("/meta/languages", (req, res) => {

  return res.json(
    languages.map(x => ({
      ...x,
      script: null, // Remove sensitive keys
      args: null // Remove sensitive keys
    }))
  );

});

// Shell-less code upload endpoint
app.post("/exec_noshell", (req, res) => {

  console.log("== No-shell code upload request ==");

  // Code must include a language that is valid.
  if (!req.body.language || !language_names.includes(req.body.language)) {

    return res.status(400).json({
      message: "The language selected is invalid."
    });

  }

  // Code request must include code.
  if (!req.body.code) {

    return res.status(400).json({
      message: "No code is present."
    });

  }

  // Less than 4000 characters to save space.
  // 4000 is much more than most can type in 60 seconds so it should be sufficient.
  if (req.body.code.length > 4000) {

    return res.status(400).json({
      message: "Code is too long, please shorten and try again."
    })

  }

  // Create a file ID with a version 4 UUID
  const fileId = v4();

  // Create the file name with an extension
  const fileName = fileId + ".60secondshell.code"; 
  console.log(`Saving to ${"./__code_store/" + fileName}`)

  // Save it to our code storage directory.
  // Note that this directory is mounted to the container by the script build-and-start.sh
  // It links to /home/ec2-user/sixtysecondshell/__code_store on the host machine.

  fs.writeFileSync("./__code_store/" + fileName, req.body.code);

  // Keep the information in memory. 
  noshell_execs[fileId] = {
    fileName: fileName,
    language: languages.filter(l => l.name === req.body.language)[0]
  }

  console.dir({
    success: true,
    id: fileId
  });

  // Return the file ID to the client.
  return res.json({
    success: true,
    id: fileId
  });

});

app.get("/__healthcheck", async (req, res) => {

  // Health check for Elastic Load Balancer
  // Returns number of running containers
  
  console.log("ELB health check.");

  const exec = require('child_process').exec;

  // Get number of running containers
  exec("docker ps -aq | wc -l", (error, stdout, stderr) => {

    if (error || stderr) {
      console.error("Health check failed with error", error || stderr);
      return res.end(stderr || error);
    }

    return res.end(stdout);
    
  });
  
})

app.ws("/ws/_exec/:uuid", (ws, req) => {

  // Actually execute a shell-less execution request.

  console.log("== No-shell execution request ==")
  console.log(req.params.uuid);

  // The UUID should be valid.
  if (!validate(req.params.uuid)) {

    ws.send("SixtySecondShell Host Runtime Error: [Bad Request] Shell-less exec ID could not be validated - try again.\n\n")
    ws.send("__TERMEXIT");
    
    return ws.close();

  }

  // The UUID should be in memory.
  if (!noshell_execs[req.params.uuid]) {

    ws.send("SixtySecondShell Host Runtime Error: [Not Found] Shell-less exec ID does not exist.\n\n");
    ws.send("__TERMEXIT");

    return ws.close();

  }

  const exec = noshell_execs[req.params.uuid];
  console.log(exec);
  
  console.log("Launching with args", [ exec.fileName, ...(exec.language.args || []) ])

  // Launch the script, with the file name as the first argument.
  // The script should mount the __code_store directory on to the container with docker run -v xxx
  const term = pty.spawn("sh", [exec.language.script, exec.fileName, ...(exec.language.args || []), req.params.uuid ], { name: "xterm-color" });

  //
  // Standard code to send terminal output to the user, and send user input to the terminal
  //

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
      
      // Delete stored code when done
      fs.unlinkSync("./__code_store/" + exec.fileName);

      return ws.close();

    } catch (err) { console.error(err) }

  })

	ws.on("message", (data) => {
    
		return term.write(data);

	});


  // Keep a code timeout of 180 seconds, prevents infinite looping.
  // TODO: check if shorter timeout is viable.

	timeout = setTimeout(() => {

    try {

      ws.send("\n\n Sorry, your process is taking too long. While we allow more than 60 seconds for shell-less processes, yours has exceeded the maximum time limit and will be killed.")
      ws.send("To prevent this in the furture, try using more efficient code or check for bugs beforehand. Thanks!")
      ws.send("__TERMEXIT");

      // Delete stored code when done
      fs.unlinkSync("./__code_store/" + exec.fileName);

      term.kill();
      return ws.close();

    } catch (e) {

      term.kill();
      fs.unlinkSync("./__code_store/" + exec.fileName);

      return console.warn("Unable to close websocket after timeout, probably closed the page.");

    }

	}, 180 * 1e3); // session timeout

});

app.ws("/ws/_interactive_terminal", (ws, req) => {


  const iterm = pty.spawn("python3", ["./langs/_interactive_terminal.py"], { name: "xterm-color" });

  //
  // Standard code to send terminal output to the user, and send user input to the terminal
  //

	iterm.on("data", (data) => {

    if (data.includes("__ITERM_EXIT")) {
      
      iterm.kill();

      const exit_data = data.split("|");

      if (exit_data[1] != "SUCCESS") {

        ws.send("\nInteractive terminal process exited with an error, please reload the page to try again.\n")
        return ws.close();

      }

      let exit_json = {};

      try {

        exit_json = JSON.parse(exit_data[2]);

      } catch (e) {

        ws.send("\nInteractive terminal process exited normally, but we could not parse the language selected. Please contact support.");
        return ws.close(); 

      }

      ws.send("__ISHELL_EVNT|LANG_CHOSEN|" + encodeURIComponent(exit_json.name));
      ws.close();

    } else { return ws.send(data) }

	});

  iterm.on("exit", (data) => {

    try {

      ws.send("\n\nInteractive terminal process exited. Did you press CTRL+C? Reload the page to try again.");
      return ws.close();

    } catch (err) { console.error(err); }

  })

	ws.on("message", (data) => {	return iterm.write(data);	});

  setTimeout(() => {

    try {
      ws.send("\n\nThe interactive terminal process has been killed due to session timeout. Reload the page to try again.")
      ws.close();
      return term.kill()
    } catch (e) {
      console.log("Terminal timed out after WS disconnect.");
      return term.kill();
    }
    
  }, 180 * 1e3);


})

app.ws("/ws/:language", (ws, req) => {

  // This endpoint sets up the websocket connected to the running Docker container of the language that was requested.

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

    ws.send(`\nTo prevent abuse of this service, we are limiting your IP address to ensure SSOP is available for everyone. This block will be lifted in around ten to fifteen minutes. [IP-LIMIT-${ip}]\n`);
    ws.send("__TERMEXIT");
    clearTimeout(timeout);
    return ws.close();

  } else {

    ips.push(ip);

  }

  ws.send("Launching your " + langobject.name + " container. As a reminder, you've got sixty seconds to do whatever you want, starting now.\n\n");
	const term = pty.spawn("sh", [command, ...(langobject.args || [])], { name: "xterm-color" });

  //
  // Standard code to send terminal output to the user, and send user input to the terminal
  //

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
