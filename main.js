var portAddrs1 = [20, 21];
var portAddrs2 = [23, 24];
var onoffs = document.getElementById("onoffs");
onoffs = 1;
var move = document.getElementById("move");
var rest = document.getElementById("rest");
var movetime = 2800;
var resttime = 5000;
move.innerHTML = movetime;
rest.innerHTML = resttime;

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function func1() {
  const ledView = document.getElementById("ledView");
  const gpioAccess = await navigator.requestGPIOAccess();
  const ledPort = gpioAccess.ports.get(26);
  await ledPort.export("out");
  var ports1 = [];
  var ports2 = [];

  for (var i = 0; i < 2; i++) {
    ports1[i] = gpioAccess.ports.get(portAddrs1[i]);
    ports2[i] = gpioAccess.ports.get(portAddrs2[i]);
    await ports1[i].export("out");
    await ports2[i].export("out");
  }
  for (var i = 0; i < 2; i++) {
    ports1[i].write(0);
    ports2[i].write(0);
  }

  async function light(lit) {
    const color = lit ? "red" : "black";
    ledView.style.backgroundColor = color;
  }

  await light(true);
  await fwd(ports1);
  await rev(ports2);
  await sleep(movetime);
  await free(ports1);
  await free(ports2);
  await sleep(500);
  await rev(ports2);
  await rev(ports1);
  await sleep(2000);
  await free(ports1);
  await free(ports2);
  await light(false);
}

async function free(ports) {
  ports[0].write(0);
  ports[1].write(0);
}

async function fwd(ports) {
  ports[0].write(1);
  ports[1].write(0);
}

async function rev(ports) {
  ports[0].write(0);
  ports[1].write(1);
}

async function main() {
  var dist = document.getElementById("dist");
  var i2cAccess = await navigator.requestI2CAccess();
  var port = i2cAccess.ports.get(1);
  var vl = new VL53L0X(port, 0x29);
  await vl.init();

  for (;;) {
    var distance = await vl.getRange();
    dist.innerHTML = distance;
    if (200 >= distance && onoffs == 0) {
      func1();
      await sleep(resttime + movetime + 4000);
    }
  }
}

main();
