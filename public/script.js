
// 
// Sixty Seconds of Python
// Under MIT Licence
// 

let isTerminalOn = false;
let timeLeft = 1;
let totalTime = 60;
let interval = null;
let terminal = document.getElementById("terminal");

let messages = [];

let timer = document.getElementById("timer");
let button = document.getElementById("start-btn");

function start() {

  if (isTerminalOn) {
    return;
  }

  isTerminalOn = true;
  terminal.innerHTML = ""; // Clear if run twice.
  button.style.display = "none";

  timer.classList.remove("flashing");
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
  const socket = new WebSocket(
    `${document.location.protocol === "http:" ? "ws" : "wss"}://${
      document.location.host
    }/ws`
  );

  const websocketAddon = new AttachAddon.AttachAddon(socket);
  const resizeAddon = new FitAddon.FitAddon();

  term.loadAddon(websocketAddon);
  term.loadAddon(resizeAddon);

  term.open(terminal);

  resizeAddon.fit();
  window.addEventListener("resize", () => resizeAddon.fit());

}