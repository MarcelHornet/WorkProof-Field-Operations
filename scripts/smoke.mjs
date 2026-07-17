import { chromium } from 'file:///C:/Users/marce/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
const response = await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })
const result = {
  status: response?.status(),
  title: await page.title(),
  loginVisible: await page.locator('#login-view').isVisible(),
  identifierVisible: await page.locator('#login-identifier').isVisible(),
  errors,
}
await page.screenshot({ path: 'workproof-v4-login.png', fullPage: true })
console.log(JSON.stringify(result, null, 2))
await browser.close()
