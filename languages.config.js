
// Language definition config file
// Each entry in `langs` is a dict with:
//      name: human readable name presented to user. Preferably with no spaces.
//      script: bash script located relative to server.js that contains launch instructions for the language's REPL
//      description: human readable description, can include HTML.
//      image: URL to image, relative to site. If you want it hosted on the frontend, contact me.
//      hello_world: A simple "hello world" program. This will be prefilled in the editor for shellless languages. If the language has a shell, this has no effect for now.
//      args: args to pass to the script. Used for the generic_esolang script to pass the name of the language.

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

    // Problem with esolang/spl image, currently inactive
    // {
    //     name: "Shakespeare Programming Language",
    //     script: "./langs/esolangs/spl",
    //     description: "The Shakespeare Programming Language is an esolang that allows you to write programs like Shakespearean plays.",
    //     image: "images/langs/spl.jpg",
    //     noshell: true
    // }

    {
        name: "Evil",
        script: "./langs/esolangs/_esolang_generic",
        description: "evil is a minimal language of the line-noise school. It was devised by Tom Wrensch in about 1999, while he was a graduate student at the University of Colorado.",
        image: "images/langs/evil.png",
        hello_world: `
zaeeeaeeew
zaeeaeeaeaw
zaeaeeaeeaew
zaeaeeaeeaew
zuueeueew
zaeeeeew
zuueueueeeew
zuueeueew
zaeeaeeaeaeew
zaeaeeaeeaew
zaeeaeeaew
zaeeeeeaw
zaeeeeeaeawuuuw`,
        args: ["evil"],
        noshell: true
    },

    {

        name: "EmojiCode",
        script: "./langs/esolangs/_esolang_generic",
        description: "Emojicode is an open-source, full-blown programming language consisting of emojis. See https://www.emojicode.org/",
        image: "images/langs/emojicode.png",
        hello_world: `🏁 🍇
    😀 🔤Hello World!🔤❗️
🍉`,
        args: ["emojicode"],
        noshell: true

    },

    {

        name: "PowerShell",
        script: "./langs/powershell",
        description: "PowerShell is a task automation and configuration management framework from Microsoft, consisting of a command-line shell and the associated scripting language.",
        image: "images/langs/powershell.png",
        noshell: false,
        hello_world: null,
        args: null

    },

    {

        name: "FetLang",
        script: "./langs/esolangs/_esolang_generic",
        description: "xxx",
        image: "images/langs/restricted.png",
        noshell: true,
        hello_world: "Make slave scream \"Hello World!\"",
        args: ["fetlang"],
        hidden: true

    },

    {
        name: "Scala",
        script: "./langs/scala",
        description: "Scala is a strong statically typed general-purpose programming language which supports both object-oriented programming and functional programming.",
        image: "images/langs/scala.png",
        noshell: false,
        hello_world: "object Hello {\n    def main(args: Array[String]) = {\n        println(\"Hello, world\")\n    }\n}",
        args: null,
        hidden: false
    },

    {
        name: "ArnoldC",
        script: "./langs/esolangs/arnoldc",
        description: "A programming language based off Arnold Schwarzenegger quotes.",
        image: "images/langs/arnoldc.jpg",
        noshell: true,
        hello_world: "IT'S SHOWTIME\nTALK TO THE HAND \"hello world\"\nYOU HAVE BEEN TERMINATED",
        args: null,
        hidden: false
    }


]

module.exports = langs;