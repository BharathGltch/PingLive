const localVideo=document.getElementById("localVideo");
const remoteVideo=document.getElementById("remoteVideo");

// const SignallingServer=new WebSocket("ws://localhost:3000");

let localStream;
let peerConnection;

const config={
    iceServers:[
        {
            urls:"stun:stun.l.google.com:19302"
        }
    ]
}


navigator.mediaDevices.enumerateDevices().then((devices)=>{
        let audioAvailable=false;
        let videoAvailable=false;
        devices.forEach((device)=>{
            if(device.kind=="audioinput"){
                audioAvailable=true;
            }
            if(device.kind=="videoinput"){
                videoAvailable=true;
            }
        })
        getMedia({video:videoAvailable,audio:audioAvailable});
})




const getMedia = async (constraints)=>{ 
    if(constraints.videoAvailable==false && constraints.audioAvailable==false){
        alert("No video or audio devices found");
        return;
    }       
navigator.mediaDevices.getUserMedia(constraints)
.then((stream)=>{   
    localStream=stream;
    localVideo.srcObject=stream;

    console.log("Stream is ",stream);   

    let audioTracks=stream.getAudioTracks();
    if(audioTracks.length>0){
        audioTracks[0].enabled=true;
        console.log("there is an Aduio track");
    }
})
.catch((error)=>{
    console.log("Error accessing meda devices. ",error);
})
}