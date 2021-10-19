const socket = io("/");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

//To paly the video---------------------------
const myvideo = document.createElement("video");
myvideo.classList.add("livevideo");
const videoGrid = document.getElementById("video-grid");
//myvideo.muted = true;
const connectToNewuser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log("hw");
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove()
  })
};

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true }) //It will return a promise
  .then((localMediaStream) => {
    addVideoStream(myvideo, localMediaStream);
    myVideoStream = localMediaStream;
    //To answer
    socket.on("user-connected", (userId, name) => {
      //connectToNewuser(userId, localMediaStream);
      setTimeout(connectToNewuser,3000,userId,localMediaStream);
      if (name) append(`${name} joined the meet`, "center");
    });
  });
peer.on("call", (call) => {
  call.answer(myVideoStream);
  console.log("hello");
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
});

function addVideoStream(myvideo, localMediaStream) {
  myvideo.srcObject = localMediaStream;
  myvideo.addEventListener("loadedmetadata", () => {
    myvideo.muted = true;
    myvideo.play();
    myvideo.muted = false;
    myvideo.play();
  });
  videoGrid.append(myvideo);
}
/*------------------------------------------------------------ */

name = prompt("Enter your name to join->");
peer.on("open", (id) => {
  socket.emit("user-joined", ROOM_ID, id, name);
});


/*------------------------Adding chatting features-----------------------------------*/

function append(msg, position) {
  const newdiv = document.createElement("div");
  newdiv.classList.add("message");
  newdiv.innerText = msg;
  newdiv.classList.add(position);

  msgcontainer = document.getElementsByClassName("main__chat_window");
  msgcontainer[0].appendChild(newdiv);
}

let text = document.querySelector("input");
window.addEventListener("keydown", (e) => {
  if (e.which == 13 && text.value.length !== 0) {
    msg = text.value;
    append(`You :${msg}`, "right");
    socket.emit("send", msg);
    text.value = "";
  }
});

socket.on("receive", (data) => {
  append(`${data.name}: ${data.message}`, "left");
});

socket.on("leave", (data) => {
  if (data) append(`${data} leave the chat`, "center");
});

/* --------------------- For Mute and stop the video ------------------- */
function muted() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setunmutebutton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setmutebutton();
  }
}
function setunmutebutton() {
  let html = `<i class="unmute fas fa-microphone-alt-slash"></i>
  <span>Unmute</span>`;

  document.querySelector(".main__mute_button").innerHTML = html;
}

function setmutebutton() {
  let html = `<i class="fas fa-microphone-alt"></i>
  <span>Mute</span>`;

  document.querySelector(".main__mute_button").innerHTML = html;
}

function playStop() {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    stopvideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    playvideo();
  }
}

function stopvideo() {
  let html = `<i class="stop fas fa-video-slash"></i>
  <span>Play Video</span>`;

  document.querySelector(".main__video_button").innerHTML = html;
}

function playvideo() {
  let html = `<i class="fas fa-video"></i>
  <span>Stop Video</span>`;

  document.querySelector(".main__video_button").innerHTML = html;
}
