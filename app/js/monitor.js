const path = require("path");
const osu = require("node-os-utils");
const humanizeDuration = require("humanize-duration");
const moment = require("moment");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverLoad = 90;
let cpuWarning = 80;
let alertFrequency = 1;

document.querySelector(".cpu-model").innerText = cpu.model();

const cpuCall = async () => {
  const cpuUsage = (await cpu.usage()) + "%";
  document.getElementById("cpu-usage").innerHTML = cpuUsage;
  const process = document.getElementById("cpu-progress");

  process.style.width = cpuUsage;
  if (parseInt(cpuUsage) < cpuOverLoad) {
    if (parseInt(cpuUsage) < cpuWarning)
      process.style.backgroundColor = "#30c88b";
    else process.style.backgroundColor = "#cad315";
  } else {
    process.style.backgroundColor = "#f05454";
    runNotify() &&
      notifyUser({
        title: "CPU Overload",
        body: `CPU is over ${cpuUsage}%`,
        icon: path.join(__dirname, "img/icon.png"),
      }) &&
      localStorage.setItem("lastNotify", Date.now());
  }

  document.getElementById("cpu-free").innerHTML = (await cpu.free()) + "%";
  document.getElementById("sys-uptime").innerHTML = humanizeDuration(
    os.uptime() * 1000
  );
};

setInterval(() => {
  cpuCall();
}, 2000);

document.getElementById("comp-name").innerHTML = os.hostname();
document.getElementById("os").innerHTML = `${os.type()} ${os.arch()}`;

mem
  .info()
  .then(
    (info) => (document.getElementById("mem-total").innerHTML = info.totalMemMb)
  );

// function secondsToDhms(seconds) {
//   seconds = +seconds;

//   const d = Math.floor(seconds / (3600 * 24));
//   const h = Math.floor((seconds % (3600 * 24)) / 3600);
//   const m = Math.floor((seconds % 3600) / 60);
//   const s = Math.floor(seconds % 60);

//   return `${d}:${h}:${m}:${s}`;
// }

function notifyUser(options) {
  return new Notification(options.title, options);
}

function runNotify() {
  if (!localStorage.getItem("lastNotify")) {
    localStorage.setItem("lastNotify", Date.now());
    return true;
  }

  const now = moment(Date.now());
  const storedTime = moment(parseInt(localStorage.getItem("lastNotify")));
  const difference = now.diff(storedTime, "minutes");

  return difference > alertFrequency;
}
