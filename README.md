![og-terminal](https://user-images.githubusercontent.com/28996247/125796870-7e9b0206-70b5-4342-9ad2-83b343088a14.png)
[x](https://dev.srg.id.au)

# Welcome to SixtySecondShell

## What is this?
- This is a small server that gives you 60 seconds of various shells to try out.
- Each shell is run using `docker run` on a lightweight image, and is destroyed after use.

## Where is the front end?
- The front-end is located [here](https://github.com/shaunakg/sixty-seconds-of-python-frontend).

## How do I add languages?
It's pretty simple:
1. Fork this repo, you can pull request later.
2. Make a new entry in `languages.config.js`
  - Include a human-readable name that does not contain special characters
  - Include the path of your script (see next step), and call it something readable
  - Provide an honest and informative description. Wikipedia is OK.
3. Make a build script in `langs/`. Make sure that at the end of your script, there will be a terminal running to the language of your choice. This will be passed to the user. Note that any debug output in the script will also be displayed, docker output is OK but if you don't want it, create a child script and run it while piping stdout and stderr to null.
  - Make sure your `docker run` includes the option `-ti`, for **i**nteractive **t**ty
  - Sometimes there is a Docker image available for your language. This is preferred, for example: `docker run -it node node` will run the NodeJS CLI from the Node image in the Docker Hub.
  - If not, you can use Alpine Linux to run the REPL. In this case, you can make your own folder and Dockerfile, then build the image and run it.
  - Note that the pseudoterminal probably will break if you try and display some type of GUI. Repl.it supports this, but we don't as yet.
  - **Note: Docker user 'esolang' provides around 200 images of various esolangs with the same setup. Since using this is much easier than creating a build script, the `_esolang_generic` script can be used. The server will pass in the filename of some uploaded code as an argument.`**
5. As stated in step 2, put a reference to your script in `languages.config.js`
6. Make a descriptive pull request and double check that you've followed the steps above.

### The most important 30 lines of code for this project are from @raxod502's [python-in-a-box](https://github.com/raxod502/python-in-a-box).
