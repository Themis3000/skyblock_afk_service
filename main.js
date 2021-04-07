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

    socket.on('botStart', (msg) => {
        afkBot.connect()
    })

    socket.on('botStop', (msg) => {
        afkBot.disconnect()
    })

    socket.on('sendMsg', (msg) => {
        afkBot.sendMsg(msg["content"])
    })
})

afkBot.events.on('statusUpdate', (status) => {
    io.emit('botStatus', {'status': status})
})

afkBot.events.on('message', (message) => {
    io.emit('message', {'content': message})
})

http.listen(80, () => {
    console.log('listening on *:80');
})

function getBotStatus() {
    if (afkBot.connected)
        return "online"
    return "offline"
}
