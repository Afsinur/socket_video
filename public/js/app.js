const socket = io("/");
let camera_button = document.querySelector("#start-camera");
let stop_camera = document.querySelector("#stop-camera");
let video = document.querySelector("#video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#download-video");
let sendFile = document.querySelector("#sendFile");
//
let camera_stream = null;
let media_recorder = null;
let dataType_ = null;
let cngNM;
let typeOnline;
let totalArrBuff = [];
let prevFile = [];
let gb = 0;
let interval__ = 5000;
let dOWnLOADsPEED = 1000000; //50000 bytes = 50 kb

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

sendFile.addEventListener("change", (e) => {
  const file_AR = e.target.files;

  Array.from(file_AR).forEach((file_, i) => {
    document.querySelector("#sentData").innerHTML = `Prepareing..`;

    const regex = /\p{Extended_Pictographic}/u;
    let cngName_ = file_.name;

    Array.from(file_.name).forEach((tx) => {
      //
      if (regex.test(tx)) {
        cngName_ = cngName_.replace(new RegExp(tx, "g"), " ");
      }
    });

    const commonF = () => {
      const FR = new FileReader();

      FR.onload = async (ev) => {
        let reslt_ = ev.currentTarget.result;
        let reslt_LN = reslt_.byteLength;
        let slicePer = dOWnLOADsPEED;
        let slicePerCount = reslt_LN / slicePer;
        let sentAlready = 0;
        let index = 0;

        //let setIntVL_ = setInterval(() => {
        if (index < slicePerCount + 1) {
          let strt_ = index * slicePer;
          let end_ = strt_ + slicePer;
          let slicedData = reslt_.slice(strt_, end_);

          sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

          if (strt_ < reslt_LN) {
            document.querySelector(
              "#sentData"
            ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;

            socket.emit("blob", {
              slicedData,
              dataType_: file_.type,
              sentAlready,
              fileNM_: cngName_,
              index,
            });
          } else {
            socket.emit("blob", { sentAlready, index });

            if (sentAlready === 100) {
              e.target.value = "";

              document.querySelector(
                "#sentData"
              ).innerHTML = `Sent Data: ${sentAlready}%`;

              clearInterval(setIntVL_);
            } else {
              document.querySelector(
                "#sentData"
              ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;
            }
          }

          index++;
        }
        //}, interval__);

        if (gb < 1) {
          gb++;

          socket.on("fileRECV", (index) => {
            if (index < slicePerCount + 1) {
              let strt_ = index * slicePer;
              let end_ = strt_ + slicePer;
              let slicedData = reslt_.slice(strt_, end_);

              sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

              if (strt_ < reslt_LN) {
                document.querySelector(
                  "#sentData"
                ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;

                socket.emit("blob", {
                  slicedData,
                  dataType_: file_.type,
                  sentAlready,
                  fileNM_: cngName_,
                  index,
                });
              } else {
                socket.emit("blob", { sentAlready, index });

                if (sentAlready === 100) {
                  e.target.value = "";

                  document.querySelector(
                    "#sentData"
                  ).innerHTML = `Sent Data: ${sentAlready}%`;
                } else {
                  document.querySelector(
                    "#sentData"
                  ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;
                }
              }
            }
          });
        }

        /*for (let index = 0; index < slicePerCount + 1; index++) {
          let strt_ = index * slicePer;
          let end_ = strt_ + slicePer;
          let slicedData = reslt_.slice(strt_, end_);

          sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

          if (strt_ < reslt_LN) {
            document.querySelector(
              "#sentData"
            ).innerHTML = `${sentAlready.toFixed(2)}%`;

            socket.emit("blob", {
              slicedData,
              dataType_: file_.type,
              sentAlready,
              fileNM_: cngName_,
            });
          } else {
            socket.emit("blob", { sentAlready });

            if (sentAlready === 100) {
              e.target.value = "";

              document.querySelector("#sentData").innerHTML = `${sentAlready}%`;
            } else {
              document.querySelector(
                "#sentData"
              ).innerHTML = `${sentAlready.toFixed(2)}%`;
            }
          }
        }*/
      };

      FR.readAsArrayBuffer(file_);
    };

    commonF();
  });
});

document.querySelector("#join-room-button").addEventListener("click", () => {
  if (document.querySelector("#join-room-input").value !== "") {
    document.querySelector("#app").style.display = "block";
    document.querySelector("#joinP").style.display = "none";

    socket.emit("join-room", {
      data: document.querySelector("#join-room-input").value,
    });
  } else {
    alert("Room ID required!");
  }
});

//sockets
socket.on("blob", ({ slicedData, dataType_, sentAlready, fileNM_, index }) => {
  if (slicedData !== undefined || dataType_ !== undefined) {
    cngNM = fileNM_;

    prevFile.push(slicedData);
    typeOnline = dataType_;
  }

  index++;
  socket.emit("fileRECV", index);

  document.querySelector(
    "#recvData"
  ).innerHTML = `Recived Data: ${sentAlready.toFixed(2)}%`;

  if (sentAlready === 100) {
    document.querySelector(
      "#recvData"
    ).innerHTML = `Recived Data: ${sentAlready}%`;

    let blb = new Blob(prevFile, {
      type: typeOnline,
    });

    prevFile = [];

    let a_ = document.createElement("a");
    a_.href = `${URL.createObjectURL(blb)}`;
    a_.style.display = `none`;
    if (cngNM !== undefined) {
      a_.download = cngNM;
    } else {
      a_.download = "online data";
    }
    a_.click();
    document.body.appendChild(a_);
    a_.remove();

    
    cngNM = undefined;
  }
});

socket.on("blobStop", () => {
  (async () => {
    document.querySelector("#sentData").innerHTML = ``;

    let buffer = await new Blob(totalArrBuff, {
      type: dataType_,
    }).arrayBuffer();

    //
    let reslt_ = buffer;
    let reslt_LN = reslt_.byteLength;
    let slicePer = dOWnLOADsPEED;
    let slicePerCount = reslt_LN / slicePer;
    let sentAlready = 0;

    /*for (let index = 0; index < slicePerCount + 1; index++) {
      let strt_ = index * slicePer;
      let end_ = strt_ + slicePer;
      let slicedData = reslt_.slice(strt_, end_);

      sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

      if (strt_ < reslt_LN) {
        socket.emit("blob", { slicedData, dataType_, sentAlready });
      } else {
        socket.emit("blob", { sentAlready });
      }
    }*/

    let index = 0;

    let setIntVL_ = setInterval(() => {
      if (index < slicePerCount + 1) {
        let strt_ = index * slicePer;
        let end_ = strt_ + slicePer;
        let slicedData = reslt_.slice(strt_, end_);

        sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

        if (strt_ < reslt_LN) {
          document.querySelector(
            "#sentData"
          ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;

          socket.emit("blob", { slicedData, dataType_, sentAlready });
        } else {
          socket.emit("blob", { sentAlready });

          if (sentAlready === 100) {
            document.querySelector(
              "#sentData"
            ).innerHTML = `Sent Data: ${sentAlready}%`;

            clearInterval(setIntVL_);
          } else {
            document.querySelector(
              "#sentData"
            ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;
          }
        }

        index++;
      }
    }, interval__);
  })();
});
//room
socket.on("joined", (data) => {
  console.log(1, "joined", data);

  document.querySelector("#join-room-input").style.background = `#00ffaa`;
});

//http://localhost:1000/streamvideo
