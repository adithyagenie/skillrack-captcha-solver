//
// Copyright © 2023 adithyagenie
//
// SPDX-License-Identifier: AGPL-3.0-or-later
//

// ==UserScript==
// @name         Skillrack Captcha Solver
// @namespace    https://github.com/adithyagenie/skillrack-captcha-solver
// @version      0.5
// @description  Solves math captcha in SkillRack using Tesseract.js
// @author       adithyagenie
// @license      AGPL-3.0-or-later
// @include      https://www.skillrack.com/faces/candidate/codeprogram.xhtml
// @include      https://www.skillrack.com/faces/candidate/tutorprogram.xhtml
// @include      https://www.skillrack.com/faces/candidate/codeprogramgroup.xhtml
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5.0.2/dist/tesseract.min.js
// ==/UserScript==

const USERNAME = "";

(function () {
	"use strict";

	// Clear all sessionstorage data if going back out of solve.
	if (
		window.location.href ==
		"https://www.skillrack.com/faces/candidate/codeprogramgroup.xhtml"
	) {
		if (sessionStorage.getItem("Solvebtnid"))
			sessionStorage.removeItem("Solvebtnid");
		if (sessionStorage.getItem("captchaFail"))
			sessionStorage.removeItem("captchaFail");
	}

	function onClick(event) {
		// Get solve button click
		if (
			event.target.tagName === "SPAN" &&
			event.target.parentNode.tagName === "BUTTON"
		) {
			if (event.target.textContent === "Solve") {
				// Store button id of problem solve button.
				sessionStorage.setItem(
					"Solvebtnid",
					event.target.parentNode.id
				);
			}
		}
	}
	document.addEventListener("click", onClick, false);

	// Wait for window to load
	window.addEventListener("load", function () {
		// Detect if last captcha attempt was a fail to re-nav back
		if (sessionStorage.getItem("captchaFail")) {
			console.log(
				"Detected captcha fail. Attempting to open last open page."
			);
			// Reset captcha state
			sessionStorage.removeItem("captchaFail");
			// Get old button id
			const old = sessionStorage.getItem("Solvebtnid");
			if (old) {
				const oldbutt = document.getElementById(old);
				if (oldbutt) oldbutt.click();
			}
			return;
		}

		console.log("Checking for captchas");
		// Get the captcha
		// Different image ids for tutorial and track websites
		let image;
		if (
			window.location.href ==
			"https://www.skillrack.com/faces/candidate/codeprogram.xhtml"
		)
			image = document.getElementById("j_id_6x");
		else if (
			window.location.href ==
			"https://www.skillrack.com/faces/candidate/tutorprogram.xhtml"
		)
			image = document.getElementById("j_id_5o");

		const textbox = document.getElementById("capval");
		const button = document.getElementById("proceedbtn");
		if (image == null) {
			console.log("Captcha not found.");
			return;
		}

		// Check if past captcha submission was a failure
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
				sessionStorage.setItem("captchaFail", "true");
				console.log("Detected failed attempt at solving captcha");
				const back = document.getElementById("j_id_5s");
				back.click();
				return;
			}
		}
		// Get time for logging
		const time = new Date().getTime();

		// Clear captcha state
		if (sessionStorage.getItem("captchaFail")) {
			sessionStorage.removeItem("captchaFail");
		}

		// Invert colours for better ocr
		function invertColors(image) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			ctx.globalCompositeOperation = "difference";
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			return canvas.toDataURL();
		}
		
		// Remove username from captcha
		/**
         * 
         * @param {string} text 
         * @returns 
         */
		function removeText(text) {
		    text = text.replace(USERNAME, "");
		    let i = text.length - 1;
		    
		    i = text.lastIndexOf("+")
		    if (i == -1) {
		        console.error("Error parsing username.");
		        return;
		    }
		    i--;
		    
		    for (i; i >= 0; i--) {
		        if (!("1234567890".includes(text[i]))) {
		            return text.slice(i + 1);
		        }
		    }
		    console.error("Error parsing username.");
		    return;
		}


		// Parse OCR result and solve the problem
		function getNums(text) {
			const a = text.replace(" ", "").replace("=", "").split("+");
			return parseInt(a[0]) + parseInt(a[1]);
		}

		const invertedimg = invertColors(image);
		console.log(`Converting image: ${new Date().getTime() - time} ms.`);
		// Image Processing with Tesseract.js
		Tesseract.recognize(invertedimg, "eng", {
			whitelist: "1234567890+=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@ ",
			psm: 7,
		})
			.then(({ data: { text } }) => {
				console.log(`OCR: ${new Date().getTime() - time} ms.`);
				// Solve the Math Problem
				try {
				    const mathprob = removeText(text);
					const result = getNums(mathprob);
					if (isNaN(result)) {
					    alert(`Unable to solve math captcha... Check the readme file on https://github.com/adithyagenie/skillrack-captcha-solver for instructions on optional username parsing.\n\nSTRING RECOGNISED: ${text}`)
                        return;
                    }
					console.log(
						"Found math captcha. Auto-filling answer: ",
						result
					);
					textbox.value = result;

					// Click the submit button
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
