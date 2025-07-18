import express from "express";
import cors from 'cors';
import path from 'path';
import routes from "./routes";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ---- cors configuration
const allowedOrigins = [
  'http://localhost:5173', // client's webpage
  'https://posse.org', // another clinet example
  'http://localhost:3000', // self - iframe on client's webpage
];
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));


// ---- http connections
// Serve public javascript and iframe for client to embed the form assistant 
app.use(express.static(path.join(__dirname, 'public')));

// api routes
app.use("/api", routes);


// ---- WebSocket connections
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws: any) => {
  ws.on('message', (message: any) => {
  console.log('websocket message recieved');
    // reply to client (for demo, with same data)
    ws.send(message.toString());
  });
  ws.on('close', () => {
    console.log('websocket client disconnected.');
  });
});


// ------ start the server
app.listen(3000, () => {
  console.log(`Server is running on port ${port}`);
});