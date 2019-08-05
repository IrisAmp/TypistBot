import * as Webdriver from 'selenium-webdriver';
const {
  Key,
  until,
  By,
} = Webdriver;

const config = require('../bot.config.json');
const {
  username,
  password,
  numberOfRuns,
  targetWpm,
  errorChance,
  slowdownChance,
} = config;

async function delay(t: number) {
  return await new Promise((r) => setTimeout(r, t));
}

async function sendSingleKeyAndDelay(input: Webdriver.WebElement, wpmElement: null | Webdriver.WebElement, key: string | number, wait?: number) {
  await input.sendKeys(key);
  if (wpmElement !== null && wait === undefined) {
    wait = 100;
    const t0 = (new Date()).getTime();
    const wpm = parseFloat(await wpmElement.getText());
    if (wpm < targetWpm) {
      wait -= (targetWpm - wpm) + ((new Date()).getTime() - t0);
    }
  }
  if (Math.random() < slowdownChance) {
    wait += (Math.random() * 150);
  }
  await delay(wait);
}

async function sendEntireQuote(input: Webdriver.WebElement, wpmElement: Webdriver.WebElement, quote: string, allowErrors = true) {
  const originalQuote = quote;
  while (quote.length) {
    let nextKey = quote.charAt(0);
    if (allowErrors && nextKey !== " " && quote.length > 5 && Math.random() < errorChance) {
      const errorPart = " " + quote.slice(0, Math.floor(1 + (Math.random() * 3)));
      await sendEntireQuote(input, wpmElement, errorPart, false);
      await delay(150);
      for (let i = 0; i < errorPart.length + 1; i++) {
        await sendSingleKeyAndDelay(input, wpmElement, Key.BACK_SPACE);
      }
      const inputValue = await input.getAttribute("value");
      quote = originalQuote.slice(inputValue.length);
      nextKey = quote.charAt(0);
    }
    await sendSingleKeyAndDelay(input, wpmElement, nextKey);
    quote = quote.slice(1);
  }
}

async function doRuns(n: number) {
  while (n-- > 0) {
    await driver.findElement(By.css('.start-button')).click();
    const element = await driver.findElement(By.css('.quote-current'));
    await driver.wait(until.elementTextMatches(element, /./));
    const texts = await Promise.all([
      driver.findElement(By.css('.quote-current')).getText(),
      driver.findElement(By.css('.quote-right')).getText()
    ]);
    let quote = texts.join(' ');
    const elements = await Promise.all([
      driver.findElement(By.css('input.user-input-text')),
      driver.findElement(By.css('[data-reactid=".0.1.1.1.0"]'))
    ]);
    await delay(1000 + (Math.random() * 2000));
    await sendEntireQuote(elements[0], elements[1], quote);
    const resultText = await driver.findElement(By.css('[data-reactid=".0.1.1.1.0"]')).getText();
    console.log(`Run completed (${resultText}WPM)`);
    await delay(1000 + (Math.random() * 2000));
  }
}

async function doAllRuns() {
  await doRuns(numberOfRuns);
}

require('chromedriver');
let driver = (new Webdriver.Builder()).forBrowser('chrome').build();

async function keyHero() {
  if (username && password) {
    await driver.get('https://www.keyhero.com/logincreate/');
    await Promise.all([
      driver.findElement(By.css('input#id_usernamelogin')).sendKeys(username),
      driver.findElement(By.css('input#id_password')).sendKeys(password),
    ]);
    await driver.findElement(By.css('[value="Login"]')).click();
    await driver.wait(until.titleContains(username));
  }
  await driver.get('https://www.keyhero.com/free-typing-test/');
  await driver.wait(until.titleContains('Check'));
  await delay(15000);
  await doAllRuns();
  await delay(15000);
  driver.close();
}

async function tenFastFingers() {
  await driver.get('https://10fastfingers.com/typing-test/english');
  await delay(5000);
  const words = await driver.findElement(By.css('div#words'));
  const input = await driver.findElement(By.css('input#inputfield'));

  let wordnr = 0;
  let go = true;
  while (go) {
    try {
      const nextword = await words.findElement(By.css(`[wordnr="${wordnr}"]`)).getText();
      await sendEntireQuote(input, null, nextword + " ", false);
    } catch (ignored) {
      go = false;
    }
    wordnr++;
    go = await words.isDisplayed();
  }
  await delay(15000);
  driver.close();
}

keyHero();
tenFastFingers();
