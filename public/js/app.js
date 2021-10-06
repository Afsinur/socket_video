const socket = io("/");
let camera_button = document.querySelector("#start-camera");
let stop_camera = document.querySelector("#stop-camera");
let video = document.querySelector("#video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#download-video");

let camera_stream = null;
let media_recorder = null;
let dataType_ = null;
let typeOnline;
let totalArrBuff = [];
let prevFile = [];
let dOWnLOADsPEED = 1000000;

camera_button.addEventListener("click", async function () {
  stop_camera.removeAttribute("disabled");

  camera_stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  video.srcObject = camera_stream;
  start_button.removeAttribute("disabled");
});

start_button.addEventListener("click", function () {
  totalArrBuff = [];
  // set MIME type of recording as video/webm
  media_recorder = new MediaRecorder(camera_stream, {
    mimeType: "video/webm",
  });

  // event : new recorded video blob available
  media_recorder.addEventListener("dataavailable", function (e) {
    //socket.emit("blob", e.data);
    totalArrBuff.push(e.data);

    if (e.data.type === "video/x-matroska;codecs=avc1,opus") {
      dataType_ = "video/mp4";
    } else {
      dataType_ = e.data.type;
    }
  });

  // start recording with each recorded blob having 1 second video
  let recordAfterSecond = 500;
  media_recorder.start(recordAfterSecond);

  start_button.setAttribute("disabled", "disabled");
  stop_button.removeAttribute("disabled");
});

stop_button.addEventListener("click", function () {
  socket.emit("blobStop");

  media_recorder.stop();

  start_button.removeAttribute("disabled");
  stop_button.setAttribute("disabled", "disabled");
});

stop_camera.addEventListener("click", () => {
  start_button.setAttribute("disabled", "disabled");
  stop_camera.setAttribute("disabled", "disabled");
  stop_button.setAttribute("disabled", "disabled");

  let stream = video.srcObject;
  let tracks = stream.getTracks();

  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];
    track.stop();
  }
  video.srcObject = null;
});

socket.on("blobStop", () => {
  (async () => {
    document.querySelector("#sentData").innerHTML = ``;

    let buffer = await new Blob(totalArrBuff, {
      type: dataType_,
    }).arrayBuffer();

    /*let video_local = URL.createObjectURL(buffer);
    console.log(video_local);*/

    //
    let reslt_ = buffer;
    let reslt_LN = reslt_.byteLength;
    let slicePer = dOWnLOADsPEED;
    let slicePerCount = reslt_LN / slicePer;
    let sentAlready = 0;

    //document.querySelector(
    //  `div.${classNM} span`
    //).style.transform = `translateX(-${100 - sentAlready}%)`;

    for (let index = 0; index < slicePerCount + 1; index++) {
      let strt_ = index * slicePer;
      let end_ = strt_ + slicePer;
      let slicedData = reslt_.slice(strt_, end_);

      sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

      if (strt_ < reslt_LN) {
        socket.emit("blob", { slicedData, dataType_, sentAlready });
      } else {
        socket.emit("blob", { sentAlready });
      }
    }
  })();
});

socket.on("blob", ({ slicedData, dataType_, sentAlready }) => {
  if (slicedData !== undefined || dataType_ !== undefined) {
    prevFile.push(slicedData);
    typeOnline = dataType_;
  }

  document.querySelector(
    "#sentData"
  ).innerHTML = `Recived Data: ${sentAlready.toFixed(2)}%`;

  if (sentAlready === 100) {
    document.querySelector(
      "#sentData"
    ).innerHTML = `Recived Data: ${sentAlready}%`;

    let blb = new Blob(prevFile, {
      type: typeOnline,
    });

    let a_ = document.createElement("a");
    a_.href = `${URL.createObjectURL(blb)}`;
    a_.style.display = `none`;
    a_.download = "online data";
    a_.click();
    document.body.appendChild(a_);
    a_.remove();
  }
});
//http://localhost:1000/streamvideo
