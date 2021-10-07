const socket = io("/");

let sendFile = document.querySelector("#sendFile");
//
let dataType_;
let cngNM;
let typeOnline;

let fileREALname;
let prevFile = [];
let gb = 0;
let dOWnLOADsPEED = 1000000 / 4; //50000 bytes = 50 kb

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
        let index = 0;

        if (index < slicePerCount + 1) {
          let strt_ = index * slicePer;
          let end_ = strt_ + slicePer;
          let slicedData = reslt_.slice(strt_, end_);

          sentAlready = (index * 100) / Math.floor(slicePerCount + 1);

          document.querySelector(
            "#sentData"
          ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;

          socket.emit("blob", {
            slicedData,
            sentAlready,
            index,
          });
        }

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

                console.log(slicedData);

                socket.emit("blob", {
                  slicedData,
                  sentAlready,
                  index,
                });
              } else {
                console.log(slicedData);

                if (sentAlready === 100) {
                  socket.emit("blob", {
                    sentAlready,
                    index,
                    fileNM_: fileREALname,
                    dataType_,
                  });

                  e.target.value = "";

                  document.querySelector(
                    "#sentData"
                  ).innerHTML = `Sent Data: ${sentAlready}%`;
                } else if (sentAlready < 100) {
                  socket.emit("blob", { sentAlready, index });

                  document.querySelector(
                    "#sentData"
                  ).innerHTML = `Sent Data: ${sentAlready.toFixed(2)}%`;
                }
              }
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
