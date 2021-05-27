const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server)


let users = []
const messages = {
    general: [],
    random: [],
    jokes: [],
    javascript: []
}


io.on('connection', socket => {
    socket.on("join server", (username) => {
        console.log("joined server")
        const user = {
            username,
            id: socket.id
        }
        users.push(user)
        io.emit("new user", users)
    })

    socket.on("join room", (roomName, cb) => {
        console.log("joined room")
        socket.join(roomName)
        cb(messages[roomName])
    })

    socket.on("send message", ({content, to, sender, chatName, isChannel}) => {
        
        console.log("send message")
        if(isChannel){
            const payload = {
                content,
                chatName,
                sender,
            }
            socket.to(to).emit("new message", payload)
        } else{
            const payload = {
                content,
                chatName: sender,
                sender,
            }
            socket.to(to).emit("new message", payload)
        }
        if(messages[chatName]){
            messages[chatName].push({
                sender,
                content
            })
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnected")
        users = users.filter(u => u.id !== socket.id)
        io.emit("new user", users)
    })
})

server.listen(1337, () => console.log('listening on 1337'))