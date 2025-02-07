import app from '../app'
import {createServer} from "http";
import {Server} from "socket.io";
import handleConnection from "../socket";

const PORT = Number(process.env.PORT || "8000");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://127.0.0.1:3000', // Allow only this origin
        methods: [ "GET", "HEAD", "PUT", "PATCH", "POST", "DELETE" ], // Allow these HTTP methods
        credentials: true, // Allow cookies to be sent
    }
});


io.on('connection', (socket) => {
    handleConnection(socket);
});

httpServer.listen(PORT, () => {
    console.log(`Listening on port http://127.0.0.1:${PORT}`);
});


export default io;
