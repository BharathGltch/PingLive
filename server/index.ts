import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {WebSocketServer} from "ws";

dotenv.config();


const app=express();

app.use(cors());
app.use(express.json());
const port=process.env.PORT as string;

//Write HTTP routes here

const server= app.listen(port,()=>{
    console.log("Listening on Port ",port );
})

//Write your WebSocket Server here

const wss=new WebSocketServer({server});


const clients=new Map<string,WebSocket>();

wss.on("connection",(ws)=>{
        ws.on("message",(message)=>{
        console.log("Message Recieved");
        wss.clients.forEach((client)=>{
            if(client !== ws && client.readyState===1){
                client.send(message);
            }
        })
        })
})
