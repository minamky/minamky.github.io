

//selecting html elements
let nameElement = document.querySelector('#name');
let emailElement = document.querySelector('#email');
let messageElement = document.querySelector("#message");

let submitButton = document.querySelector('#submit-button');
submitButton.addEventListener('click', function(e) {
	e.preventDefault();

	let nameValue = nameElement.value;
	let emailValue = emailElement.value;
	let messageValue = messageElement.value;

	if(emailValue.includes('@')){
		console.log('Name: ', nameValue);
		console.log('Email: ', emailValue);
		console.log('Message: ', messageValue)
		alert('thank you for your message!');
		document.forms['contact-form'].reset()
	} else {
		alert(emailValue + " is an invalid email address, please try again!")
	}
});

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// Carousel functionality
let currentIndex = 0;

function updateActiveItem() {
	const items = document.querySelectorAll('.project-image-wrapper');
	const totalItems = items.length;
	
	items.forEach((item, index) => {
		// Remove all state classes
		item.classList.remove('active', 'prev', 'next');
		
		// Add appropriate class based on position
		if (index === currentIndex) {
			item.classList.add('active');
		} else if (index === (currentIndex - 1 + totalItems) % totalItems) {
			item.classList.add('prev');
		} else if (index === (currentIndex + 1) % totalItems) {
			item.classList.add('next');
		}
	});
}

function moveCarousel(direction) {
	const items = document.querySelectorAll('.project-image-wrapper');
	const totalItems = items.length;
	
	// Update index using modulo for wrapping
	currentIndex = (currentIndex + direction + totalItems) % totalItems;
	
	// Update active class
	updateActiveItem();
}

function handlePreviewClick(event) {
	const wrapper = event.target.closest('.project-image-wrapper');
	if (!wrapper) return;

	if (wrapper.classList.contains('prev')) {
		event.preventDefault();
		event.stopPropagation();
		moveCarousel(-1);
	} else if (wrapper.classList.contains('next')) {
		event.preventDefault();
		event.stopPropagation();
		moveCarousel(1);
	}
}

function initHeroTyping() {
	const nameElement = document.getElementById('my-name');
	const titleElement = document.getElementById('my-title');

	const nameText = (nameElement?.dataset?.fullName || nameElement?.textContent || '').trim();
	const titleText = (titleElement?.dataset?.fullTitle || titleElement?.textContent || '').trim();

	const storageKey = 'heroTypingComplete';
	let hasTyped = false;
	try {
		hasTyped = sessionStorage.getItem(storageKey) === '1';
	} catch (error) {
		hasTyped = false;
	}

	if (hasTyped) {
		if (nameElement) {
			nameElement.textContent = nameText;
			nameElement.classList.remove('typing-caret');
		}
		if (titleElement) {
			titleElement.textContent = titleText;
			titleElement.classList.remove('typing-caret');
			titleElement.style.visibility = 'visible';
		}
		return;
	}

	// Hide the title element initially
	if (titleElement) {
		titleElement.style.visibility = 'hidden';
	}

	const typeText = (element, text, done, speed = 130) => {
		if (!element || !text) {
			done();
			return;
		}

		element.textContent = '';
		element.classList.add('typing-caret');
		
		// Show the element when we start typing
		if (element.style.visibility === 'hidden') {
			element.style.visibility = 'visible';
		}

		let index = 0;
		const typingInterval = setInterval(() => {
			element.textContent += text[index++];

			if (index >= text.length) {
				clearInterval(typingInterval);
				element.classList.remove('typing-caret');
				done();
			}
		}, speed);
	};

	typeText(nameElement, nameText, () => {
		typeText(
			titleElement,
			titleText,
			() => {
				try {
					sessionStorage.setItem(storageKey, '1');
				} catch (error) {
					// ignore
				}
			},
			90
		);
	}, 130);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
	initHeroTyping();
	updateActiveItem();
	
	const carousel = document.querySelector('.projects-carousel');
	
	if (carousel) {
		carousel.addEventListener('click', handlePreviewClick);
	}
	
	// Dark mode functionality
	const darkModeToggle = document.getElementById('dark-mode-toggle');
	
	// Check for saved dark mode preference
	if (localStorage.getItem('darkMode') === 'enabled') {
		document.body.classList.add('dark-mode');
	}
	
	// Toggle dark mode
	if (darkModeToggle) {
		darkModeToggle.addEventListener('click', function() {
			document.body.classList.toggle('dark-mode');
			
			// Save preference to localStorage
			if (document.body.classList.contains('dark-mode')) {
				localStorage.setItem('darkMode', 'enabled');
			} else {
				localStorage.setItem('darkMode', 'disabled');
			}
		});
	}
});