import nextConnect from 'next-connect'
import middleware from '../../middleware/database'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
    const { api } = req.query
    try {
        switch (api) {
            case 'getAll': {
                const doc = await req.db
                    .collection('products')
                    .find({}, { projection: { _id: 0 } })
                    .toArray()
                return res.json(doc)
            }
            case 'getLinks': {
                const doc = await req.db
                    .collection('products')
                    .find({}, { projection: { _id: 0, link: 1 } })
                    .toArray()
                return res.json(
                    doc.map((item) => {
                        return item.link
                    })
                )
            }
            case 'getUsers': {
                const doc = await req.db
                    .collection('users')
                    .find({}, { projection: { _id: 0 } })
                    .toArray()
                return res.json(doc)
            }
            default:
                return res.json({})
        }
    } catch (error) {
        console.log('error API: ', api)
        return res.status(400).json({ error: error })
    }
})

handler.post(async (req, res) => {
    const { api } = req.query

    try {
        const data = JSON.parse(req.body)
        switch (api) {
            case 'insertOne': {
                await req.db.collection('products').insertOne(data)
                break
            }
            case 'deleteOne': {
                await req.db.collection('products').deleteOne(data)
                break
            }
            case 'updateOne': {
                await req.db.collection('products').updateOne(data[0], { $set: data[1] })
                break
            }
            case 'deleteMany': {
                await req.db.collection('products').deleteMany({})
                break
            }
            default:
                break
        }
    } catch (error) {
        console.log('error API: ', api)
    } finally {
        return res.status(200).json({ message: `${api} is completed` })
    }
})

export default handler
