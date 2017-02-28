import * as Webdriver from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
const until = Webdriver.until;
const By = Webdriver.By;
const Promise = Webdriver.promise.Promise;

const config = require('../bot.config.json');

const botUsername = config.username;
const botPassword = config.password;
const numberOfRuns = config.numberOfRuns;

function sendQuote(input: Webdriver.WebElement, wpmElement: Webdriver.WebElement, quote: string, doneCb: Function) {
    if (!quote.length) {
        doneCb();
    } else {
        let t0 = (new Date()).getTime();
        input.sendKeys(quote.charAt(0)).then(() => {
            return wpmElement.getText();
        }).then((text => {
            let wpm = parseFloat(text);
            let wait = 60;
            if (wpm < 200) {
                wait -= (200 - wpm) + ((new Date()).getTime() - t0);
            }
            setTimeout(() => { sendQuote(input, wpmElement, quote.slice(1), doneCb); }, wait);
        }));;
    }
}

function doRuns(n: number, doneCb: Function) {
    if (n > 0) {
        driver.findElement(By.css('.start-button')).click()
            .then(() => {
                return driver.findElement(By.css('.quote-current'));
            }).then((element) => {
                return driver.wait(until.elementTextMatches(element, /./));
            }).then(() => {
                return Webdriver.promise.all([
                    driver.findElement(By.css('.quote-current')).getText(),
                    driver.findElement(By.css('.quote-right')).getText()
                ]);
            }).then(texts => {
                let quote = texts.join(' ');
                return new Promise((resolve) => {
                    Webdriver.promise.all([
                        driver.findElement(By.css('input.user-input-text')),
                        driver.findElement(By.css('[data-reactid=".0.1.1.1.0"]'))
                    ]).then((elements) => {
                        sendQuote(elements[0], elements[1], quote, resolve);
                    });
                });
            }).then(() => {
                return new Promise((r) => { setTimeout(r, 1000) });
            }).then(() => {
                driver.findElement(By.css('[data-reactid=".0.1.1.1.0"]')).getText().then(text => {
                    console.log(`Run ${numberOfRuns - n + 1} completed (${text}WPM)`);
                });
                doRuns(n - 1, doneCb);
            });
    } else {
        doneCb();
    }

}

function doAllRuns() {
    return new Promise((resolve) => {
        doRuns(numberOfRuns, resolve);
    });
}

require('chromedriver');
let driver = (new Webdriver.Builder()).forBrowser('chrome').build();

// driver.get('https://www.keyhero.com/free-typing-test/').then(() => {
driver.get('https://www.keyhero.com/logincreate/').then(() => {
    return Webdriver.promise.all([
        driver.findElement(By.css('input#id_usernamelogin')).sendKeys(botUsername),
        driver.findElement(By.css('input#id_password')).sendKeys(botPassword)
    ]);
}).then(() => {
    return driver.findElement(By.css('[value="Login"]')).click();
}).then(() => {
    return driver.wait(until.titleContains(botUsername));
}).then(() => {
    return driver.get('https://www.keyhero.com/free-typing-test/');
}).then(() => {
    // ^^^^^
    return driver.wait(until.titleContains('Check'));
}).then(() => {
    return doAllRuns();
}).then(() => {
    return new Promise((resolve) => {
        setTimeout(resolve, 5000);
    });
}).then(() => {
    driver.close();
}).catch((reason) => {
    console.error(`Couldn't do the test!`, reason);
});