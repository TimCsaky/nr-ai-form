import express, { Request, Response } from "express";
const cors = require('cors')
const path = require('path');
import { errorHandler } from './middleware/errorHandler';
import config from './config/config';
import routes from "./routes";

const app = express();

// ---- cors configuration
// client script.js and iframe chat.html
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://posse.org'];
const corsOptions = {
  origin: function (origin: any, callback: any) {

    console.log(origin);

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
// app.use(cors());


// ---- http connections

// Serve public frontend scripts for client to embed the form assistant 
app.use(express.static(path.join(__dirname, 'public')));

// api routes
app.use("/api", routes);



// ------ start the server

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
app.use(errorHandler);


// ---- WebSocket connections

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws: any) => {
  console.log('A new client connected.');
  ws.on('message', (message: any) => {
    console.log('Received message :', message);
    // reply to client (for demo, with same data)
    ws.send(message.toString());
  });
  ws.on('close', () => {
    console.log('A client disconnected.');
  });
});
