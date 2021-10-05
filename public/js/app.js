const socket = io("/");
let camera_button = document.querySelector("#start-camera");
let stop_camera = document.querySelector("#stop-camera");
let video = document.querySelector("#video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#download-video");

let camera_stream = null;
let media_recorder = null;
let totalArrBuff = [];

camera_button.addEventListener("click", async function () {
  start_button.removeAttribute("disabled");
  stop_camera.removeAttribute("disabled");
  camera_stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  video.srcObject = camera_stream;
});

start_button.addEventListener("click", function () {
  totalArrBuff = [];
  // set MIME type of recording as video/webm
  media_recorder = new MediaRecorder(camera_stream, {
    mimeType: "video/webm",
  });

  // event : new recorded video blob available
  media_recorder.addEventListener("dataavailable", function (e) {
    socket.emit("blob", e.data);
  });

  // start recording with each recorded blob having 1 second video
  let recordAfterSecond = 2000;
  media_recorder.start(recordAfterSecond);

  start_button.setAttribute("disabled", "disabled");
  stop_button.removeAttribute("disabled");
});

stop_button.addEventListener("click", function () {
  media_recorder.stop();
  start_button.removeAttribute("disabled");
  stop_button.setAttribute("disabled", "disabled");

  //
  socket.emit("blobStop");
});

stop_camera.addEventListener("click", () => {
  start_button.setAttribute("disabled", "disabled");
  stop_camera.setAttribute("disabled", "disabled");
  stop_button.setAttribute("disabled", "disabled");

  var stream = video.srcObject;
  var tracks = stream.getTracks();

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    track.stop();
  }
  video.srcObject = null;
});

socket.on("blob", (data) => {
  totalArrBuff.push(data);
});

socket.on("blobStop", () => {
  let video_local = URL.createObjectURL(
    new Blob(totalArrBuff, { type: "video/webm" })
  );

  let a_ = document.createElement("a");
  a_.href = `${video_local}`;
  a_.style.display = `none`;
  a_.download = "video record";
  a_.click();
  document.body.appendChild(a_);
  a_.remove();
});

//http://localhost:1000/streamvideo
