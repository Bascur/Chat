//Require Modules
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


//Inits
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Static folder

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatBot';


//Run when a client connects

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Show the user that connect
        socket.emit('message', formatMessage(botName, 'Welcome to the Chat!'));
        //Show when user connect to the rest
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Send Users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });


    //Listen for msg
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    //Show when disconnect 
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
        };
        //Send Users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });
});

//Sv UpPOR
const PORT = process.env.T || 3000;
server.listen(PORT, () => console.log('Server running on port: ' + PORT));