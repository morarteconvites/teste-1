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

// Função principal para iniciar a câmera
async function iniciarCamera() {
  try {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: usandoFrontal ? { exact: "user" } : { exact: "environment" },
        width: { ideal: 2160 },
        height: { ideal: 3840 },
        aspectRatio: 9 / 16
      },
      audio: true
    });

    video.srcObject = stream;

    const [track] = stream.getVideoTracks();
    const capabilities = track.getCapabilities();

    // Evita zoom automático na frontal
    if (capabilities.zoom) {
      track.applyConstraints({
        advanced: [{ zoom: capabilities.zoom.min }]
      });
    }

  } catch (e) {
    console.error("Erro ao iniciar câmera:", e);
    alert("Não foi possível acessar a câmera. Verifique permissões.");
  }
}

// iniciar a câmera quando abrir o site
iniciarCamera();

// Trocar entre frontal e traseira
trocarBtn.onclick = async () => {
  usandoFrontal = !usandoFrontal;
  await iniciarCamera();
};

// FOTO
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

// VÍDEO
videoBtn.onclick = () => {
  if (!gravando) {
    iniciarGravacao();
  } else {
    pararGravacao();
  }
};

function iniciarGravacao() {
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

function pararGravacao() {
  gravando = false;
  videoBtn.textContent = "🎥";
  mediaRecorder.stop();
}
