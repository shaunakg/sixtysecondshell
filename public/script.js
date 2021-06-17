
// 
// Sixty Seconds of Python
// Under MIT Licence
// 

// THIS ASSUMES A LOCAL SERVER ON /, CHECK https://sixtysecondsofpython.srg.id.au/ FOR REAL SITE

const usp = new URLSearchParams(window.location.search);

// Specify custom API with ?useAPI=https://my-api-host.com
const apiHost = usp.get("useAPI") || window.location.hostname

let isTerminalOn = false;
let timeLeft = 1;
let totalTime = 60;
let interval = null;
let terminal = document.getElementById("terminal");

let messages = [];

let timer = document.getElementById("timer");
let button = document.getElementById("start-btn");

const current_language = usp.get('lang') || usp.get('language') || 'python';

const languages = document.getElementById("languages");
const lang = document.getElementById("lang");

lang.innerText = current_language;
fetch(window.location.protocol + "//" + apiHost + "/meta/languages").then(r => r.json()).then(j => {

  const names = j.map( l => l.name );

  j.forEach(lang => {

    langLink = document.createElement("a");
    langLink.innerText = lang.name;
    langLink.href = `?language=${l}&useAPI=${apiHost}`;
    langLink.title = lang.description;

    languages.appendChild(langLink);
    
  });

  if (!names.includes(current_language)) {

    document.getElementById("error").style.display="block";
    document.getElementById("error").innerText = `Your chosen language, "${current_language}", is not supported. Please pick another from the menu above.`;

    button.style.display = "none";
    isTerminalOn = true;
    timer.style.width = "100%";
    isTerminalOn = false;

    timer.classList.add("flashing");
    timer.style.backgroundColor = "red";

    return;

  }

}).catch(error => {
  languages.innerHTML = "<span style='color:red'>[error]</span>";
})

function start() {

  if (isTerminalOn) {
    return;
  }

  isTerminalOn = true;
  terminal.innerHTML = ""; // Clear if run twice.
  button.style.display = "none";

  timer.classList.remove("flashing");
  document.getElementById("error").style.display="none";
  timer.style.width = "100%";
  timeLeft = 1;

  interval = setInterval(() => {

    if (timeLeft < 0) {
      clearInterval(interval);
      timer.style.width = "100%";
      timer.classList.add("flashing");
      button.style.display = "inline-block";
      isTerminalOn = false;
    }

    timer.style.width = (timeLeft * 100) + "%";
    timeLeft -= 1/totalTime;

  }, 1000);

  const term = new Terminal();
  let socket;

  try {
    socket = new WebSocket(
      `${document.location.protocol === "http:" ? "ws" : "wss"}://${
        apiHost
      }/ws/${current_language}`
    );
  } catch (e) {

    document.getElementById("error").style.display="block";
    clearInterval(interval);
    timer.style.width = "100%";
    button.style.display = "inline-block";
    isTerminalOn = false;

    timer.classList.add("flashing");
    timer.style.backgroundColor = "red";

    return;

  }

  socket.onerror = () => {

    document.getElementById("error").style.display="block";
    clearInterval(interval);
    timer.style.width = "100%";
    button.style.display = "inline-block";
    isTerminalOn = false;

    timer.classList.add("flashing");
    timer.style.backgroundColor = "red";

    return;

  }

  socket.onopen = () => {
    const websocketAddon = new AttachAddon.AttachAddon(socket);
    const resizeAddon = new FitAddon.FitAddon();

    term.loadAddon(websocketAddon);
    term.loadAddon(resizeAddon);

    term.open(terminal);

    resizeAddon.fit();
    window.addEventListener("resize", () => resizeAddon.fit());
  }

}