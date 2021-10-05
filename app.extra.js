let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#download-video");

let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];
let lastBlob = null;

camera_button.addEventListener("click", async function () {
  camera_stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = camera_stream;
});

start_button.addEventListener("click", function () {
  // set MIME type of recording as video/webm
  media_recorder = new MediaRecorder(camera_stream, {
    mimeType: "video/webm",
  });

  // event : new recorded video blob available
  media_recorder.addEventListener("dataavailable", function (e) {
    console.log(e.data);

    /*var reader = new FileReader();
          reader.readAsArrayBuffer(e.data);
          reader.onloadend = (event) => {
            // The contents of the BLOB are in reader.result:
            //console.log(reader.result);
            lastBlob = reader.result;
          };*/

    blobs_recorded.push(e.data);
    //lastBlob = e.data;
  });

  // event : recording stopped & all blobs sent
  /*media_recorder.addEventListener("stop", function () {
          // create local object URL from the recorded video blobs
          let video_local = URL.createObjectURL(
            new Blob(blobs_recorded, { type: "video/webm" })
          );
          download_link.href = video_local;
        });*/

  // start recording with each recorded blob having 1 second video
  let recordAfterSecond = 0;
  media_recorder.start(recordAfterSecond);
});

stop_button.addEventListener("click", function () {
  media_recorder.stop();
  clearInterval(inter__);
});

//

let inter__ = setInterval(() => {
  console.log("setinterval");
  if (blobs_recorded.length !== 0) {
    let video_local = URL.createObjectURL(
      new Blob(blobs_recorded, { type: "video/webm" })
    );
    console.log(video_local);

    let vd_ = document.createElement("video");
    vd_.src = video_local;
    vd_.style.width = "320px";
    vd_.style.height = "240px";
    vd_.setAttribute("controls", "controls");
    document.body.appendChild(vd_);
  }
}, 2000);
