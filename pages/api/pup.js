const puppeteer = require('puppeteer')

export default async (req, res) => {
    const browser = await puppeteer.launch({ headless: true })
    let items = []
    try {
        const page = await browser.newPage()

        page.setDefaultNavigationTimeout(0)

        await page.goto(
            `https://www.dns-shop.ru/catalog/markdown/?category=17a89aab16404e77-17a8943716404e77-17a9cc2d16404e77-17a89a0416404e77-17a89c5616404e77-17a8950d16404e77-17a8a69116404e77-17a89c2216404e77-17a8978216404e77-17a899cd16404e77-17a8a69116404e77-d38de3aa7227adb4&p=1`
        )
        console.log('request: downloading DNS data...', new Date(Date.now()).toLocaleString())

        let count = await page.evaluate(() => {
            return /(\d*)/.exec(document.getElementsByClassName('markdown-page__markdown-count')[0].innerText)[0]
        })
        console.log('DNS products: ', count)

        let i = 1

        while (count > 0) {
            await page.goto(
                `https://www.dns-shop.ru/catalog/markdown/?category=17a89aab16404e77-17a8943716404e77-17a9cc2d16404e77-17a89a0416404e77-17a89c5616404e77-17a8950d16404e77-17a8a69116404e77-17a89c2216404e77-17a8978216404e77-17a899cd16404e77-17a8a69116404e77-d38de3aa7227adb4&p=${i++}`
            )

            const itemByPage = await page.evaluate(() => {
                let items = []

                const products = document.getElementsByClassName('catalog-product')

                for (const product of products) {
                    let reasons = []
                    const name =
                        product.getElementsByClassName('catalog-product__name')[0].children[0].firstChild.textContent
                    const link = product.getElementsByClassName('catalog-product__name')[0].href
                    const price = product.getElementsByClassName('catalog-product__price-actual')[0].textContent
                    const reasonsHTML = product.getElementsByClassName('catalog-product__reason-text-block')
                    for (const reason of reasonsHTML) reasons.push(reason.textContent)

                    items.push({
                        link,
                        name,
                        price,
                        reasons,
                    })
                }

                return items
            })

            items = [...items, ...itemByPage]
            count = count - 20
        }
    } catch (error) {
        console.log('puppeteer error: ', error)
    } finally {
        browser.close()
        res.status(200).json(items)
    }
}
