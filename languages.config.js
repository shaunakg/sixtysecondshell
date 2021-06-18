
// Language definition config file
// Each entry in `langs` is a dict with:
//      name: human readable name presented to user. Preferably with no spaces.
//      script: bash script located relative to server.js that contains launch instructions for the language's REPL
//      description: human readable description, can include HTML.
//      image: URL to image, relative to site. If you want it hosted on the frontend, contact me.

const langs = [

    {
        name: "Python3",
        script: "./langs/python",
        description: "Python is a high-level language that is great for beginner users. Recommended, as you can probably do the most in 60 seconds out of any other.",
        image: "images/langs/python.png",
        noshell: false

    },

    {
        name: "Bash",
        script: "./langs/bash",
        description: "Bash is the default shell on most Linux systems. This is good if you want to explore, but not that great for general programming.",
        image: "images/langs/bash.png",
        noshell: false
    },

    {
        name: "Ruby",
        script: "./langs/ruby",
        description: "[Wikipedia] Ruby is an interpreted, high-level, general-purpose programming language.",
        image: "images/langs/ruby.png",
        noshell: false
    },

    {
        name: "Node.JS",
        script: "./langs/node",
        description: "Node.JS is a popular language for writing web servers and programs. Note: We have temporarily disabled internet access on our containers, and you may not be able to access some modules.",
        image: "images/langs/node.png",
        noshell: false
    },

    {
        name: "Java",
        script: "./langs/java",
        description: "[Wikipedia] Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.",
        image: "images/langs/java.png",
        noshell: false
    },

    {
        name: "MySQL",
        script: "./langs/mysql",
        description: "MySQL is the world's most popular open source database. You'll be connected to the public ensembl.org database of the human genome.",
        image: "images/langs/mysql.png",
        noshell: false
    },

    {
        name: "PHP",
        script: "./langs/php",
        description: "PHP is a programming language primarily used for web development.",
        image: "images/langs/php.png",
        noshell: false
    },

    {
        name: "Perl",
        script: "./langs/perl",
        description: "Perl is a high-level, general-purpose, interpreted, dynamic programming language.",
        image: "images/langs/perl.png",
        noshell: false
    },

    {
        name: "Shakespeare Programming Language",
        script: "./langs/esolangs/spl",
        description: "The Shakespeare Programming Language is an esolang that allows you to write programs like Shakespearean plays.",
        image: "images/langs/spl.jpg",
        noshell: true
    }

]

module.exports = langs;