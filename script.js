const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fotoBtn = document.getElementById("foto");
const trocarBtn = document.getElementById("trocar");
const videoBtn = document.getElementById("videoBtn");
const moldura = document.getElementById("moldura");

let stream;
let usandoFrontal = false;
let gravando = false;
let mediaRecorder;
let chunks = [];

// Iniciar câmera
async function iniciarCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: usandoFrontal ? "user" : "environment",
      width: { ideal: 1080 },
      height: { ideal: 1920 }
    },
    audio: true
  });

  video.srcObject = stream;
}
iniciarCamera();

// Trocar câmera
trocarBtn.onclick = () => {
  usandoFrontal = !usandoFrontal;
  iniciarCamera();
};

// Foto
fotoBtn.onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);

  const foto = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = foto;
  a.download = "foto.png";
  a.click();
};

// Vídeo
videoBtn.onclick = () => {
  if (!gravando) {
    startVideo();
  } else {
    stopVideo();
  }
};

function startVideo() {
  chunks = [];
  gravando = true;
  videoBtn.textContent = "⏹";

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/mp4" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "video.mp4";
    a.click();
  };

  mediaRecorder.start();
}

function stopVideo() {
  gravando = false;
  videoBtn.textContent = "🎥";
  mediaRecorder.stop();
}
