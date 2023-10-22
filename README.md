# skillrack-captcha-solver
## Captcha solver for skillrack.

Use GreaseMonkey/TamperMonkey to run the script.

> ⚠️ **Please disable the script if you are attending the test as it might lead to unintended effects.**


> ⚠️ **Attempting to navigate the page while the captcha solver is running may lead to unintended effects. If it gets stuck in a loop, closing and opening the tabs will fix it.**

---

### Optional username parsing

**You don't need to do this unless you see a warning asking you to do so.**

The script handles most of the username checking by itself, but if it fails to do so and gives an alert instead, replace the `USERNAME` variable on the top of the script from the string the alert gives.

For example, if the alert says 
```
STRING RECOGNISED: bch12xyz232@abcd 123+456=
```

change the first line as 
```js
const USERNAME = "bch12xyz232@abcd";
```
and save the script.