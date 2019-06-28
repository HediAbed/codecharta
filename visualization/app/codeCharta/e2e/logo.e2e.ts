import { CC_URL, delay, puppeteer } from "../../puppeteer.helper"
import { LogoPageObject } from "./logo.po"
import { Browser, Page } from "puppeteer"

jest.setTimeout(10000)

describe("CodeCharta logo", () => {
	let browser: Browser
	let page: Page
	let logo: LogoPageObject

	beforeAll(async () => {
		browser = await puppeteer.launch({ headless: true })
	})

	afterAll(async () => {
		await browser.close()
	})

	beforeEach(async () => {
		page = await browser.newPage()
		logo = new LogoPageObject(page)

		await page.goto(CC_URL)
		await delay(1000)
	})

	it("should have correct version", async () => {
		expect(await logo.getVersion()).toBe(require("../../../package.json").version)
	})

	it("should have correct link", async () => {
		expect(await logo.getLink()).toContain("maibornwolff.de")
	})

	it("should have correct image as logo", async () => {
		const src = await logo.getImageSrc()
		const viewSource = await page.goto(src)
		expect(await viewSource.buffer()).toMatchSnapshot()
	})
})
