//
// Copyright © 2023 adithyagenie
//
// SPDX-License-Identifier: AGPL-3.0-or-later
//

// ==UserScript==
// @name         Math Problem Solver
// @namespace    https://github.com/adithyagenie/skillrack-captcha-solver
// @version      0.4
// @description  Solves math captcha in SkillRack using Tesseract.js
// @author       adithyagenie
// @include      https://www.skillrack.com/faces/candidate/codeprogram.xhtml
// @include      https://www.skillrack.com/faces/candidate/tutorprogram.xhtml
// @include      https://www.skillrack.com/faces/candidate/codeprogramgroup.xhtml
// @require https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js
// ==/UserScript==

(function () {
	"use strict";

	if (
		window.location.href ==
		"https://www.skillrack.com/faces/candidate/codeprogramgroup.xhtml"
	) {
		if (localStorage.getItem("Solvebtnid"))
			localStorage.removeItem("Solvebtnid");
		if (localStorage.getItem("captchaFail"))
			localStorage.removeItem("captchaFail");
	}
	function onClick(event) {
		// Check if the clicked element is a button
		if (
			event.target.tagName === "SPAN" &&
			event.target.parentNode.tagName === "BUTTON"
		) {
			// If so, log the button text
			if (event.target.textContent === "Solve") {
				localStorage.setItem("Solvebtnid", event.target.parentNode.id);
			}
		}
	}
	document.addEventListener("click", onClick, false);

	// Wait for window to load
	window.addEventListener("load", function () {
		if (localStorage.getItem("captchaFail")) {
			console.log(
				"Detected captcha fail. Attempting to open last open page"
			);
			localStorage.removeItem("captchaFail");
			const old = localStorage.getItem("Solvebtnid");
			if (old) {
				const oldbutt = document.getElementById(old);
				if (oldbutt) oldbutt.click();
			}
			return;
		}

		console.log("Checking for captchas");
		// Step 1: Get the Image
		let image;
		if (
			window.location.href ==
			"https://www.skillrack.com/faces/candidate/codeprogram.xhtml"
		)
			image = document.getElementById("j_id_6s");
		else if (
			window.location.href ==
			"https://www.skillrack.com/faces/candidate/tutorprogram.xhtml"
		)
			image = document.getElementById("j_id_5j");

		const textbox = document.getElementById("capval");
		const button = document.getElementById("proceedbtn");
		if (image == null) {
			console.log("Captcha not found.");
			return;
		}

		const errors = document.getElementsByClassName("ui-growl-item");
		if (errors.length > 0) {
			if (errors[0].textContent.includes("Incorrect Captcha")) {
				if (
					window.location.href ==
					"https://www.skillrack.com/faces/candidate/tutorprogram.xhtml"
				) {
					alert("Unable to solve captcha :(");
					return;
				}
				localStorage.setItem("captchaFail", "true");
				console.log("Detected failed attempt at solving captcha");
				const back = document.getElementById("j_id_5r");
				back.click();
				return;
			}
		}
		const time = new Date().getTime();
		if (localStorage.getItem("captchaFail")) {
			localStorage.removeItem("captchaFail");
		}

		// Invert colours for better ocr
		function invertColors(image) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			// Set canvas dimensions to match the image
			canvas.width = image.width;
			canvas.height = image.height;

			// Draw the image onto the canvas
			ctx.drawImage(image, 0, 0);

			// Invert colors using globalCompositeOperation
			ctx.globalCompositeOperation = "difference";
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			return canvas.toDataURL();
		}

		function getNums(text) {
			const a = text.replace(" ", "").replace("=", "").split("+");
			return parseInt(a[0]) + parseInt(a[1]);
		}

		const invertedimg = invertColors(image);
		console.log(`Converting image: ${new Date().getTime() - time} ms.`);
		// Step 2: Image Processing with Tesseract.js
		Tesseract.recognize(invertedimg, "eng", {
			whitelist: "1234567890+=",
			psm: 7,
		})
			.then(({ data: { text } }) => {
				console.log(`OCR: ${new Date().getTime() - time} ms.`);
				// Step 3: Solve the Math Problem
				try {
					const result = getNums(text);
					console.log(
						"Found math captcha. Auto-filling answer: ",
						result
					);
					textbox.value = result;
					button.click();
					console.log(`Took ${new Date().getTime() - time} ms.`);
				} catch (e) {
					console.error(e);
				}
				return;
			})
			.catch((error) => {
				console.error("Error processing captcha:", error);
			});
	});
})();
