TypistBot
=========

A bot that types very fast on typist sites.
- [keyhero](https://www.keyhero.com)
- [10fastfingers](https://10fastfingers.com/typing-test/english)

## Running the bot
Requires Chrome to be installed on your computer. Run:
```
npm install
npm start
```

## Configuration
Configure the bot in `bot.config.json`.
- `username` - The username to login with
- `password` - The password to login with
- `numberOfRuns` - How many tests to do before closing
- `targetWpm` - If the test website has a live WPM counter, the bot will try to stay below this WPM.
- `slowdownChance` - The probability (between 0 and 1) that the bot will add a random slowdown to any keystroke.
- `slowdownRange` - The maximum slowdown in ms. The actual slowdown will be a random number between 0 and `slowdownRange`.
- `errorChance` - The probability (between 0 and 1) that the bot will deliberately make an error and correct it.
