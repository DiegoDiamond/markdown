import React from 'react'
import styles from '../styles/Home.module.css'
import Head from 'next/head'
import axios from 'axios'
import lodash from 'lodash'
import isoFetch from 'isomorphic-unfetch'

export default function Home() {
    const [data, setData] = React.useState({})

    React.useEffect(() => {
        async function asyncRepeat(f) {
            while (true) await f()
        }

        asyncRepeat(delay)
    }, [])

    const delay = () => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                await onFetch()
                resolve()
            }, 60000)
        })
    }

    const onFetch = async () => {
        const resp = await axios.get('/api/pup')

        const DNSdata = resp.data

        const DNSdataLinks = DNSdata.map((item) => {
            return item.link
        })

        const DataBase = await getDB('getAll')

        const LinksFromDataBase = await getDB('getLinks')

        // Вставка новых товаров, которых нет в базе
        DNSdataLinks.forEach((link) => {
            if (!LinksFromDataBase.includes(link)) {
                const insertItemData = DNSdata.find((item) => item.link === link)
                sendMessage(insertItemData, 'new')
                changeDB(insertItemData, 'insert')
            }
        })

        // Проверка на цену каждого продукта из базы с тем же продуктом в DNS
        DataBase.forEach((itemDataBase) => {
            const DNSItemSame = DNSdata.find((itemDNS) => itemDNS.link === itemDataBase.link)
            if (DNSItemSame) {
                if (DNSItemSame.price !== itemDataBase.price) {
                    sendMessage(DNSItemSame, 'change', itemDataBase.price)
                    changeDB(DNSItemSame, 'update')
                }
            }
        })

        // Удаление из базы, тех продуктов, которых нет в DNS
        LinksFromDataBase.forEach((link) => {
            if (!DNSdataLinks.includes(link)) {
                const removeItemDataBase = DataBase.find((item) => item.link === link)
                sendMessage(removeItemDataBase, 'remove')
                changeDB(removeItemDataBase.link, 'delete')
            }
        })
    }

    const changeDB = async (itemData, operation) => {
        const reqBody = {
            insert: JSON.stringify(itemData),
            delete: JSON.stringify({ link: itemData }),
            update: JSON.stringify([{ link: itemData.link }, { price: itemData.price }]),
        }
        await isoFetch(`http://localhost:3000/api/${operation}One`, {
            method: 'post',
            body: reqBody[operation],
        })
    }

    // const insertDB = async (itemData) => {
    //     const res = await isoFetch(`http://localhost:3000/api/insertOne`, {
    //         method: 'post',
    //         body: JSON.stringify(itemData),
    //     })
    // }
    // const removeDB = async (itemData) => {
    //     const res = await isoFetch(`http://localhost:3000/api/deleteOne`, {
    //         method: 'post',
    //         body: JSON.stringify({ link: itemData }),
    //     })
    // }
    // const updateDB = async (itemData) => {
    //     const res = await isoFetch(`http://localhost:3000/api/updateOne`, {
    //         method: 'post',
    //         body: JSON.stringify([{ link: itemData.link }, { price: itemData.price }]),
    //     })
    // }

    const clearContent = async () => {
        await isoFetch(`http://localhost:3000/api/deleteMany`, {
            method: 'post',
            body: JSON.stringify({}),
        })
    }

    const getDB = async (req) => {
        const res = await isoFetch(`http://localhost:3000/api/${req}`, {
            method: 'get',
        })
        return await res.json()
    }

    const priceNum = (price) => {
        return Number.parseInt(price.replace(' ', ''))
    }

    const sendMessage = async (itemData, operation, oldprice) => {
        const AllUsers = await getDB('getUsers')

        const { name, reasons, link, price } = itemData

        const header = {
            new: `\u{026A1} НОВОЕ ПОСТУПЛЕНИЕ!\n`,
            change: `\u{1F525} ИЗМЕНЕНИЕ В ЛОТЕ! ТОВАР ПОДЕШЕВЕЛ!\n`,
            remove: `\u{1F6AB} ТОВАР СНЯТ С ПРОДАЖИ!\n`,
        }

        const priceChange =
            operation === 'change'
                ? ` (подешевел на ${(priceNum(oldprice) - priceNum(price)).toLocaleString()} \u{20BD})`
                : ``

        const message =
            header[operation] +
            `\u{1F4CC} Наименование: ${name}\n` +
            `${reasons
                .map((item) => {
                    return `\u{1F4CC} ${item}\n`
                })
                .join('')}` +
            `\u{1F4CC} Цена: ${price}${priceChange}\n` +
            `\u{1F4CC} Ссылка: ${link}`

        AllUsers.forEach(async ({ userID }) => {
            const res = await isoFetch(`http://localhost:3000/api/telegram/send`, {
                method: 'post',
                body: JSON.stringify({ userID, message }),
            })
            console.log(await res.json())
        })
    }

    return (
        <div className="container">
            <Head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
                />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js" />
            </Head>
            <div className="row">
                <h1>{new Date(Date.now()).toLocaleString()}</h1>
                <div className="col s2">
                    <div className="row">
                        <button className="btn col s12" onClick={onFetch}>
                            Загрузка DNS data
                        </button>
                    </div>
                    <div className="row">
                        <button className="btn col s12" onClick={clearContent}>
                            Очистить page
                        </button>
                    </div>
                </div>
                <div className="col s10">
                    {console.log(data)}
                    {!lodash.isEmpty(data) &&
                        data.map((item) => {
                            return (
                                <div className="row">
                                    <div className="card blue-grey darken-1">
                                        <div className="card-content white-text">
                                            <p key={item.name}>{item.name}</p>
                                            <p key={item.price}>{item.price}</p>
                                            {item.reasons.map((el) => {
                                                return <p key={el}>{el}</p>
                                            })}
                                            <div key={item.link} className="card-action">
                                                <a href={item.link}>Ссылка</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}
// export async function getStaticProps(context) {
//     const res = await isoFetch('http://localhost:3000/api/dbAPI')
//     const json = await res.json()
//     return {
//         props: {
//             data: json,
//         },
//     }
// }
