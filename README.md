# skillrack-captcha-solver
## Captcha solver for skillrack.

Use GreaseMonkey/TamperMonkey to run the script.

> ⚠️ **Please disable the script if you are attending a test as it might lead to unintended effects.**


> ⚠️ **Attempting to navigate the page while the captcha solver is running may lead to unintended effects. If it gets stuck in a loop, closing and opening the tabs will fix it.**

---

### Optional username parsing

**You don't need to do this unless you have a username containing '+' and numbers together.**

The script handles most of the username checking by itself except when the username might contain special symbols which might mimic the captcha. You can fix this by replacing the `USERNAME` variable on the top of the script to match your username from the captcha image.

For example, if the captcha is: 
```
abcd123+21@xyz

420+69=
```

change the first line (by visiting the greasemonkey/tampermonkey dashboard) as 
```js
const USERNAME = "abcd123+21@xyz";
```
and save the script.