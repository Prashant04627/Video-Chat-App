const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("connected", socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(room).emit("user:room", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(to);
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
  socket.on("call:accepted" , ({to ,answer}) =>{
    io.to(to).emit("call:accepted" , { from:socket.id , answer})
  });

socket.on("reconnect:needed" , ({to , offer})=>{
    io.to(to).emit("reconnect:needed" , {from:socket.id , offer})
});
socket.on("nego:done", ({to , answer}) => {
    io.to(to).emit("nego:done" , { from:socket.id , answer})

} )

});
