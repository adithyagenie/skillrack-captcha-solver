// ==UserScript==
// @name         Math Problem Solver
// @namespace    https://github.com/adithyagenie/skillrack-captcha-solver
// @version      0.1
// @description  Solves math captcha in SkillRack using Tesseract.js
// @author       adithyagenie
// @include      https://*.skillrack.com/*
// @require https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js
// ==/UserScript==

(function () {
	// Wait for window to load
	window.addEventListener("load", function () {
		console.log("Checking for captchas");
		// Step 1: Get the Image
		const image = document.getElementById("j_id_6s");
		const textbox = document.getElementById("capval");
		const button = document.getElementById("proceedbtn");
		if (image == null) {
			console.log("Captcha not found!");
			return;
		}

		// Invert colours for better ocr
		function invertImageColors(image) {
			const canvas = document.createElement("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0, image.width, image.height);

			const imageData = ctx.getImageData(0, 0, image.width, image.height);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				data[i] = 255 - data[i]; // Red
				data[i + 1] = 255 - data[i + 1]; // Green
				data[i + 2] = 255 - data[i + 2]; // Blue
			}

			ctx.putImageData(imageData, 0, 0);
			image.src = canvas.toDataURL();
		}

		function getNums(text) {
			const a = text
				.trim()
				.split(" ")
				.join("")
				.replace("=", "")
				.split("+");
			return [a[0], a[1]];
		}

		invertImageColors(image);

		// Step 2: Image Processing with Tesseract.js
		Tesseract.recognize(image.src, "eng", { whitelist: "1234567890+=" })
			.then(({ data: { text } }) => {
				// Step 3: Extract the Math Problem
				const mathProblem = getNums(text);

				// Step 4: Solve the Math
				if (mathProblem) {
					const result =
						parseInt(mathProblem[0]) + parseInt(mathProblem[1]);
					console.log(
						"Found math captcha:",
						mathProblem,
						"=",
						result,
						"Auto-filling answer"
					);
					textbox.value = result;
					button.click();
				} else {
					console.log("No math problem found in the image text.");
				}
				return;
			})
			.catch((error) => {
				console.error("Error processing captcha:", error);
			});
	});
})();
