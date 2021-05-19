import { useRouter } from 'next/router'
import nextConnect from 'next-connect'
import middleware from '../../middleware/database'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
    const { api } = req.query
    console.log(`request...start...${api}`)
    try {
        switch (api) {
            case 'getAll': {
                const doc = await req.db
                    .collection('products')
                    .find({}, { projection: { _id: 0 } })
                    .toArray()
                console.log(`request...${api}...completed`)
                return res.json(doc)
            }
            case 'getLinks': {
                const doc = await req.db
                    .collection('products')
                    .find({}, { projection: { _id: 0, link: 1 } })
                    .toArray()
                // не хочет через map
                console.log(`request...${api}...completed`)
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
                console.log(`request...${api}...completed`)
                return res.json(doc)
            }
            default:
                console.log(`request...${api}...completed`)
                return res.json({})
        }
    } catch (error) {
        console.log(`request...${api}...error`)
        return res.status(400).json({ error: error })
    }
})

handler.post(async (req, res) => {
    const { api } = req.query

    console.log(`request...${api}...start`)

    try {
        const data = JSON.parse(req.body)

        switch (api) {
            case 'insertOne': {
                await req.db.collection('products').insertOne(data)
                console.log(`request...${api}...completed`)
                return res.status(200).json({ message: 'insert one is completed' })
            }
            case 'deleteOne': {
                await req.db.collection('products').deleteOne(data)
                console.log(`request...${api}...completed`)
                return res.status(200).json({ message: 'delete one is completed' })
            }
            case 'updateOne': {
                await req.db.collection('products').updateOne(data[0], { $set: data[1] })
                console.log(`request...${api}...completed`)
                return res.status(200).json({ message: 'update one is completed' })
            }
            case 'deleteMany': {
                await req.db.collection('products').deleteMany({})
                console.log(`request...${api}...completed`)
                return res.status(200).json({ message: 'delete many is completed' })
            }
            default:
                console.log(`request...${api}...completed`)
                return res.status(200).json({})
        }
    } catch (error) {
        console.log(`request...${api}...error`)
        return res.status(400).json({ error: error })
    }
})

export default handler
