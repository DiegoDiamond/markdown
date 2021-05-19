const TelegramApi = require('node-telegram-bot-api')
const token = '590958212:AAEqsjxMhHlDAweeOZ4wpGoI7wm_JeyYO3A'
const bot = new TelegramApi(token, { polling: false })
export default async (req, res) => {
    try {
        const { userID, message } = JSON.parse(req.body)
        bot.sendMessage(userID, message)
        return res.status(200).json({ status: 'SUCCESS: message sent' })
    } catch {
        return res.status(200).json({ status: 'ERROR: message not sent' })
    }

    // if (bot.isPolling()) await bot.stopPolling()
    // await bot.startPolling()
}
