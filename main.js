const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bot = require('./bot.js')

const afkBot = new bot.AfkBot()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    socket.emit("botStatus", {"status": getBotStatus()})
})

io.on('botStart', (socket) => {
    afkBot.disconnect()
})

io.on('botStop', (socket) => {
    afkBot.connect()
})

afkBot.events.on('connected', () => {
    io.emit('botStatus', {'status': 'online'})
})

afkBot.events.on('disconnected', () => {
    io.emit('botStatus', {'status': 'offline'})
})

afkBot.events.on('message', (message) => {
    io.emit('message', {'content': message})
})

http.listen(3000, () => {
    console.log('listening on *:3000');
})

function getBotStatus() {
    if (afkBot.connected)
        return "online"
    return "offline"
}

function checkToken(token) {
    return token === process.env.TOKEN
}
