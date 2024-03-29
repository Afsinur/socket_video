const socket = io("/");

let sendFile = document.querySelector("#sendFile");
//
let dataType_;
let cngNM;
let typeOnline;

let fileREALname;
let REALFILE_ = [];
let prevFile = [];
let gb = 0;
let dOWnLOADsPEED = 1000000 / 1; //50000 bytes = 50 kb

sendFile.addEventListener("change", (e) => {
  const file_AR = e.target.files;

  Array.from(file_AR).forEach((file_, i) => {
    document.querySelector("#sentData").innerHTML = `Preparing..`;

    const regex = /\p{Extended_Pictographic}/u;
    let cngName_ = file_.name;

    Array.from(file_.name).forEach((tx) => {
      //
      if (regex.test(tx)) {
        cngName_ = cngName_.replace(new RegExp(tx, "g"), " ");
      }
    });

    fileREALname = cngName_;
    dataType_ = file_.type;

    const commonF = () => {
      const FR = new FileReader();

      FR.onload = async (ev) => {
        let reslt_ = ev.currentTarget.result;
        let reslt_LN = reslt_.byteLength;
        let slicePer = dOWnLOADsPEED;
        let slicePerCount = reslt_LN / slicePer;
        let sentAlready = 0;
        let out_ = 0;
        REALFILE_ = [];

        for (let index = 0; index < slicePerCount + 1; index++) {
          let strt_ = index * slicePer;
          let end_ = strt_ + slicePer;
          let slicedData = reslt_.slice(strt_, end_);

          if (strt_ < reslt_LN) {
            REALFILE_.push(slicedData);
          } else {
            if (out_ < 1) {
              out_++;
              console.log(REALFILE_.length);

              sentAlready = (0 * 100) / REALFILE_.length;

              document.querySelector(
                "#sentData"
              ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;

              socket.emit("blob", {
                slicedData: REALFILE_[0],
                sentAlready,
                index: 0,
              });
            }
          }
        }

        if (gb < 1) {
          gb++;

          socket.on("fileRECV", (index) => {
            sentAlready = (index * 100) / REALFILE_.length;

            if (sentAlready === 100) {
              socket.emit("blob", {
                sentAlready,
                index,
                fileNM_: fileREALname,
                dataType_,
              });

              e.target.value = "";
              REALFILE_ = [];

              document.querySelector(
                "#sentData"
              ).innerHTML = `Sent Data: ${sentAlready}%`;
            } else if (sentAlready < 100) {
              document.querySelector(
                "#sentData"
              ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;

              socket.emit("blob", {
                slicedData: REALFILE_[index],
                sentAlready,
                index,
              });
            }
          });
        }
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
  if (slicedData !== undefined) {
    prevFile.push(slicedData);
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
      type: dataType_,
    });

    prevFile = [];

    let a_ = document.createElement("a");
    a_.href = `${URL.createObjectURL(blb)}`;
    a_.style.display = `none`;
    if (fileNM_ !== undefined) {
      a_.download = fileNM_;
    } else {
      a_.download = "online data";
    }
    a_.click();
    document.body.appendChild(a_);
    a_.remove();
  }
});

//room
socket.on("joined", (data) => {
  console.log(1, "joined", data);
});

//http://localhost:1000/streamvideo
