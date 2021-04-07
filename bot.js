const mineflayer = require('mineflayer')
const EventEmitter = require('events')

class AfkBot {
    constructor() {
        this.island = process.env.ISLAND
        this.adminAccounts = process.env.ADMINS.split(", ")
        this.events = new EventEmitter
        this.connect()
    }

    createBot() {
        this.bot = mineflayer.createBot({
            host: 'skyblock.net',
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })

        this.bot.once("spawn", () => {
            this.connected = true
            this.events.emit("statusUpdate", this.status)

            this.bot.chatAddPattern(/^\[(?:\[[^\]]*\] )?([^ :]*) -> me?] (.*)$/, "skyWhisper")

            //Goes to island
            this.bot.chat(`/visit ${this.island}`)

            //Auto sells inventory 1min
            this.sellLoop = setInterval(() => {
                this.bot.chat("/sell all")
            }, 1000 * 61)
        })

        this.bot.on('skyWhisper', (username, message) => {
            const args = message.split(' ')
            const command = args[0].toLowerCase()
            const isAdmin = this.checkAdmin(username)

            if (isAdmin && command === 'payme') {
                console.log(`paying ${username} $${args[1]}`)
                this.bot.chat(`/pay ${username} ${args[1]}`)
            } else if (isAdmin && command === 'tpaccept') {
                this.bot.chat('/tpaccept')
            }
        })

        this.bot.on("messagestr", (message) => {
            this.events.emit("message", message)
        })

        this.bot.once('end', () => {
            this.connected = false
            this.events.emit("statusUpdate", this.status)
            if (this.reconnect)
                setTimeout(this.createBot, 1000*60*15)
        })
    }

    disconnect() {
        this.reconnect = false
        clearInterval(this.sellLoop)
        this.bot.quit()
    }

    connect() {
        this.reconnect = true
        this.createBot()
    }

    sendMsg(message) {
        this.bot.chat(message)
    }

    get status() {
        if (this.connected)
            return "online"
        if (this.reconnect)
            return "offline, will be auto reconnecting soon"
        return "offline"
    }

    checkAdmin(username) {
        this.adminAccounts.includes(username)
    }
}

exports.AfkBot = AfkBot