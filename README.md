# Welcome to Sixty Seconds Of Python

## What is this?
- This is a small server that gives you 60 seconds of various shells to try out.
- Each shell is run using `docker run` on a lightweight image, and is destroyed after use.

## Where is the front end?
**The below information is outdated, frontend is located in `public/` until migration completes**
- The front-end is located [here](https://github.com/shaunakg/sixty-seconds-of-python-frontend).
- The server does not serve the front end because people who run shells on the server would then be able to inject arbitrary code into the front end, which is undesireable. It's fine if they do it on the server because Heroku will wipe it in a few minutes.

## How do I add languages?
It's pretty simple:
1. Fork this repo, you can pull request later.
2. Make a new entry in `languages.config.js`
  - Include a human-readable name that does not contain special characters
  - Include the path of your script (see next step), and call it something readable
  - Provide an honest and informative description. Wikipedia is OK.
3. Make a build script in `langs/`. Make sure that at the end of your script, there will be a terminal running to the language of your choice. This will be passed to the user. Note that any debug output in the script will also be displayed, docker output is OK but if you don't want it, create a child script and run it while piping stdout and stderr to null.
  - Make sure your `docker run` includes the option `-ti`, for **i**nteractive **t**ty
  - Sometimes there is a Docker image available for your language. This is preferred, for example: `docker run -it --network none node node` will run the NodeJS CLI from the Node image in the Docker Hub.
  - If not, you can use Alpine Linux to run the REPL. In this case, you can make your own folder and Dockerfile, then build the image and run it.
  - Note that we are currently disabling network for all images. This is done with `--network none`. This will stay in place until a work around is found to prevent access of EC2 metadata. If you know one, feel free to pull request.
  - Note that the pseudoterminal probably will break if you try and display some time of GUI. Repl.it supports this, but we don't as yet.
5. As stated in step 2, put a reference to your script in `languages.config.js`
6. Make a descriptive pull request and double check that you've followed the steps above.

### The most important 30 lines of code for this project are from @raxod502's [python-in-a-box](https://github.com/raxod502/python-in-a-box).
