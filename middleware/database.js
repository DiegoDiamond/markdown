import { MongoClient } from 'mongodb'
import nextConnect from 'next-connect'

// параметры для использования новой версии Mongo, т.к. старый конструктор устарел
const client = new MongoClient(
    'mongodb+srv://diegomongo:diegomongo@diegocluster.m5g0h.mongodb.net/dns?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
)

async function database(req, res, next) {
    if (!client.isConnected()) await client.connect()

    req.dbClient = client
    req.db = client.db('dns')

    return next()
}

const middleware = nextConnect()

middleware.use(database)

export default middleware
