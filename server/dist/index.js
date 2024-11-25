"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const port = process.env.PORT;
//Write HTTP routes here
app.get("/hello", (_req, res) => {
    res.json({ "message": "Hello" });
});
const server = app.listen(port, () => {
    console.log("Listening on Port ", port);
});
//Write your WebSocket Server here
const wss = new ws_1.WebSocketServer({ server });
const clients = new Map();
wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        console.log("Message Recieved");
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
                client.send(message);
            }
        });
    });
});
