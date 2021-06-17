
// Language definition config file
// Each entry in `langs` is a dict with:
//      name: human readable name presented to user. Preferably with no spaces.
//      script: bash script located relative to server.js that contains launch instructions for the language's REPL
//      description: human readable description, can include HTML.

const langs = [

    {
        name: "Python3",
        script: "./langs/python",
        description: "Python is a high-level language that is great for beginner users. Recommended, as you can probably do the most in 60 seconds out of any other."
    },

    {
        name: "Bash",
        script: "./langs/bash",
        description: "Bash is the default shell on most Linux systems. This is good if you want to explore, but not that great for general programming."
    }

]

module.exports = langs;