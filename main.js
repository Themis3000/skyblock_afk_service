const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bot = require('./bot.js')
const basicAuth = require('express-basic-auth')

const afkBot = new bot.AfkBot()

app.use(basicAuth({
    users: { admin: process.env.WEBPASSWORD },
    challenge: true
}))

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

http.listen(process.env.PORT || 3000, () => {
    console.log('Web server started!');
})

function getBotStatus() {
    if (afkBot.connected)
        return "online"
    return "offline"
}
