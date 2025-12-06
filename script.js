let camera = document.getElementById("camera");
let moldura = document.getElementById("moldura");
let canvas = document.getElementById("canvas");

let facing = "user";   // frontal
let gravando = false;
let recorder;
let chunks = [];

async function iniciarCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: facing }
  });

  camera.srcObject = stream;
}

document.getElementById("trocar").onclick = () => {
  facing = facing === "user" ? "environment" : "user";
  iniciarCamera();
};

document.getElementById("foto").onclick = () => {
  tirarFoto();
};

document.getElementById("videoBtn").onclick = () => {
  if (!gravando) iniciarVideo();
  else pararVideo();
};

function ajustarCanvas() {
  canvas.width = moldura.naturalWidth;
  canvas.height = moldura.naturalHeight;
}

moldura.onload = ajustarCanvas;

function tirarFoto() {
  ajustarCanvas();
  let ctx = canvas.getContext("2d");

  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);

  let link = document.createElement("a");
  link.download = "foto.png";
  link.href = canvas.toDataURL();
  link.click();
}

async function iniciarVideo() {
  gravando = true;
  document.getElementById("videoBtn").innerHTML = "⏹";

  ajustarCanvas();
  let ctx = canvas.getContext("2d");

  const stream = canvas.captureStream(30);
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = baixarVideo;

  recorder.start();

  gravarQuadros(ctx);
}

function gravarQuadros(ctx) {
  if (!gravando) return;

  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);

  requestAnimationFrame(() => gravarQuadros(ctx));
}

function pararVideo() {
  gravando = false;
  recorder.stop();
  document.getElementById("videoBtn").innerHTML = "🎥";
}

function baixarVideo() {
  let blob = new Blob(chunks, { type: "video/mp4" });
  chunks = [];

  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.href = url;
  link.download = "video.mp4";
  link.click();
}
  
iniciarCamera();
