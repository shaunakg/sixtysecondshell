# Welcome to Sixty Seconds Of Python
***This is a deriviative work based on @raxod502's [python-in-a-box](https://github.com/raxod502/python-in-a-box), packaged with the same open-source license.***

## What is this?
- This is a small server that gives you 60 seconds of various shells to try out.
- It's not a complex project and it's based off python-in-a-box which is only around 20 LOC, so it doesn't have isolation between clients.
- It is designed to run on PaaS infrastructure like Heroku and not a VPC or individual server, and it relies on getting wiped regularly.
- That being said, pull requests to implement isolation for clients would be appriciated.

## Where is the front end?
- The front-end is located [here](https://github.com/shaunakg/sixty-seconds-of-python-frontend).
- The server does not serve the front end because people who run shells on the server would then be able to inject arbitrary code into the front end, which is undesireable. It's fine if they do it on the server because Heroku will wipe it in a few minutes.



### Original README from [python-in-a-box](https://github.com/raxod502/python-in-a-box) (note that code statistics are now obviously outdated)

Try it online: <https://python-in-a-box.herokuapp.com/>

This is an interactive online Python REPL, implemented in JavaScript
using

* **thirteen** lines of [code on the frontend](https://github.com/raxod502/python-in-a-box/blob/master/index.html#L32-L48)
* **seventeen** lines of [code on the backend](https://github.com/raxod502/python-in-a-box/blob/master/server.js#L1-L23)

and based on the open-source libraries

* [Express](https://expressjs.com/)
* [node-pty](https://github.com/microsoft/node-pty)
* [Xterm.js](https://xtermjs.org/)

Read the blog post, [How Replit used legal threats to kill my open-source project](https://intuitiveexplanations.com/tech/replit/).
