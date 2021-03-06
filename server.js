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
      args: null, // Remove sensitive keys
      packages: x.packages ? true : false
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

    ws.send("\rSixtySecondShell Host Runtime Error: [Bad Request] Shell-less exec ID could not be validated - try again.\n\n")
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

      ws.send("\r\n Shell-less process has exited. Your session has ended.")
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

      ws.send("\r\n Sorry, your process is taking too long. While we allow more than 60 seconds for shell-less processes, yours has exceeded the maximum time limit and will be killed.\r\n")
      ws.send("To prevent this in the future, try using more efficient code or check for bugs beforehand. Thanks!")
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

        ws.send("\r\nInteractive terminal process exited with an error, please reload the page to try again.\r\n")
        return ws.close();

      }

      let exit_json = {};

      try {

        exit_json = JSON.parse(exit_data[2]);

      } catch (e) {

        ws.send("\r\nInteractive terminal process exited normally, but we could not parse the language selected. Please contact support.");
        return ws.close(); 

      }

      ws.send("__ISHELL_EVNT|LANG_CHOSEN|" + encodeURIComponent(exit_json.name));
      ws.close();

    } else { return ws.send(data) }

	});

  iterm.on("exit", (data) => {

    try {

      ws.send("\r\nInteractive terminal process exited. Did you press CTRL+C? Reload the page to try again.");
      return ws.close();

    } catch (err) { console.error(err); }

  })

	ws.on("message", (data) => {	return iterm.write(data);	});

  setTimeout(() => {

    try {
      ws.send("\r\nThe interactive terminal process has been killed due to session timeout. Reload the page to try again.")
      ws.close();
      return iterm.kill()
    } catch (e) {
      console.log("Terminal timed out after WS disconnect.");
      return iterm.kill();
    }
    
  }, 180 * 1e3);


})

app.ws("/ws/:language", (ws, req) => {

  // This endpoint sets up the websocket connected to the running Docker container of the language that was requested.

  let language = req.params.language || "Python3";
  let timeout;

  if (!language_names.includes(language)) {
    ws.send(`\r\nUnsupported language "${language}". Try one of: ${language_names.join(", ")}. Note: check if your language has a shell before trying.\n`)
    return ws.close();
  }

  let langobject = languages.filter(x => x.name === language)[0] ? languages.filter(x => x.name === language)[0] : languages[0];

  if (langobject.noshell) {

    ws.send(`\r\nCritical: language ${language} does not support a shell - go through GUI at https://sixtysecondshell.srg.id.au to upload code and run using ${language} interpreter.\n\r`);
    ws.send("Session is now terminating.");
    ws.send("__TERMEXIT");

    return ws.close();
    
  }

  let command = langobject.script;

  console.log("Recieved request to launch TTY with command", command, "and args", langobject.args)

  const ip = req.headers['x-forwarded-for'];
  console.log(ip)

  if (countOccurrences(ips, ip) > 5) {

    ws.send(`\r\nTo prevent abuse of this service, we are limiting your IP address to ensure SSOP is available for everyone. This block will be lifted in around ten to fifteen minutes. [IP-LIMIT-${ip}]\r\n`);
    ws.send("__TERMEXIT");
    clearTimeout(timeout);
    return ws.close();

  } else {

    ips.push(ip);

  }

  ws.send("Launching your " + langobject.name + " container. As a reminder, you've got sixty seconds to do whatever you want, starting now.\r\n\n");
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

      ws.send("\r\n\nTerminal has exited. Your session has ended.")
      ws.send("__TERMEXIT");
      clearTimeout(timeout);

      return ws.close();

    } catch (err) { console.error(err) }

  })

	ws.on("message", (data) => {	

    if (data.startsWith("__CLIENT_EVENT|")) {

      console.log("Received client event", data);

      // Handle client events

      event_params = data.split("|");
      event_params.shift();

      if (event_params[0] == "PACKAGE") {

        // Handle package install requests
        console.log("Received package install request", event_params);

        // Event should be in format: [ "PACKAGE", <package action>, <base64 encoded package name?> ]
        // Note: package installation is insecure, but all code runs inside the container so it's not a big problem.
        // A user can only impact themselves by injecting code into the command.

        if (!langobject.packages) {
          return ws.send("\r\n" + langobject.name + " does not support packages. Want package support? Email us at hello@srg.id.au.\r\n");
        }

        if (event_params[1] == "add") {

          // Decode Base64 encoded event_params[2]
          let package_name = Buffer.from(event_params[2], "base64").toString();

          ws.send("\r\nInstalling " + package_name + "...\r\n");

          return term.write(
            langobject.packages.add.replace("{{NAME}}", package_name) + "\r\n"
          );

        } else if (event_params[1] == "remove") {

          // Decode Base64 encoded event_params[2]
          let package_name = Buffer.from(event_params[2], "base64").toString();

          ws.send("\r\nRemoving " + package_name + "...\r\n");

          return term.write(
            langobject.packages.remove.replace("{{NAME}}", package_name) + "\r\n"
          );

        } else if (event_params[1] == "list") {

          ws.send("\r\nListing installed packages...\r\n");

          return term.write(
            langobject.packages.list + "\r\n"
          );

        }

      }

    }

		return term.write(data);

	});

	timeout = setTimeout(() => {

    try {
      ws.send("\r\n:) Your sixty seconds has expired. See you next time!\r\n")
      ws.send("__TERMEXIT");
      term.kill()
      return ws.close();
    } catch (e) {
      return console.warn("Unable to close websocket to " + ip + " after timeout, probably closed the page.")
    }

	}, 60 * 1e3); // session timeout

});

app.listen(parseInt(process.env.PORT || 80), "0.0.0.0");
