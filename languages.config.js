
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
    },

    {
        name: "Ruby",
        script: "./langs/ruby",
        description: "[Wikipedia] Ruby is an interpreted, high-level, general-purpose programming language."
    },

    {
        name: "Node.JS",
        script: "./langs/node",
        description: "Node.JS is a popular language for writing web servers and programs. Note: We have temporarily disabled internet access on our containers, and you may not be able to access some modules."
    },

    {
        name: "Java",
        script: "./langs/java",
        description: "[Wikipedia] Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible."
    },

    {
        name: "MySQL",
        script: "./langs/mysql",
        description: "MySQL is the world's most popular open source database. You can't actually run database commands here, but try playing around with it!"
    }

]

module.exports = langs;