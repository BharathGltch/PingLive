import envConfig from "./config.js";


const localVideo=document.getElementById("localVideo");
const remoteVideo=document.getElementById("remoteVideo");

 const signallingServer=new WebSocket("ws://"+envConfig.API_URL);

let localStream;
let peerConnection;

const config={
    iceServers:[
        {
            urls:"stun:stun.l.google.com:19302"
        }
    ]
}


navigator.mediaDevices.enumerateDevices().then(async (devices)=>{
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
        await getMedia({video:videoAvailable,audio:audioAvailable});
})


signallingServer.onopen=()=>{
    console.log("Connected to signalling server");
}

signallingServer.onmessage =(message)=>{
     const data=JSON.parse(message.data);

     switch(data.type){
        case "offer":
            handleOffer(data.offer);
            break;
        case "answer":
            handleAnswer(data.answer);
            break;
        case "candidate":
            handleNewIceCandidate(data.candidate);
            break;
     }
}


const createPeerConnection = ()=>{
        peerConnection=new RTCPeerConnection(config);

        localStream.getTracks().forEach((track)=>peerConnection.addTrack(track,localStream));

        peerConnection.ontrack((event)=>{
                remoteVideo.srcObject=event.streams[0];
        })

        peerConnection.onicecandidate((event)=>{
            if(event.candidate){
                signallingServer.message(JSON.stringify({
                    type:"candidate",
                    candidate:event.candidate
                }
                ))
            }
        })
}

const handleOffer=(offer)=>{
    createPeerConnection();

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    .then(()=>{
        return peerConnection.createAnswer();
    })
    .then((answer)=>{
        return peerConnection.setLocalDescription(answer);
    })
    .then(()=>{
            signallingServer.send(JSON.stringify({
                type:"answer",
                answer:peerConnection.localDescription
            }));
    })
    .catch((ex)=>{
        console.log("Error while handling the offer ", ex);
    });

    
}

const handleAnswer= (answer)=>{
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    .catch((err)=>console.log("Error while handling the answer"));
}


const handleNewIceCandidate = (candidate)=>{
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error)=>{
                console.log("Error handling new Icecandidate ",error);
        });
}

const createOffer=async ()=>{
    try{
    createPeerConnection();

        const offer= await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signallingServer.send(JSON.stringify({
            type:"offer",
            sdp:peerConnection.localDescription
        }))
    }catch(ex){
        console.log("Error creating offer ",ex);
    }
}


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
        console.log("there is an Audio track");
    }
})
.catch((error)=>{
    console.log("Error accessing meda devices. ",error);
})
}

document.getElementById("startCall").addEventListener("click",()=>{
    createOffer();
})