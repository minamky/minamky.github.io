

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

// Carousel functionality (independent state for each section)
const carouselState = {
	sets: 0,
	songs: 0
};

function getCarouselItems(sectionId) {
	const section = document.getElementById(sectionId);
	if (!section) return [];
	return section.querySelectorAll('.project-image-wrapper');
}

function updateActiveItem(sectionId) {
	const items = getCarouselItems(sectionId);
	const totalItems = items.length;
	if (!totalItems) return;

	const currentIndex = carouselState[sectionId] || 0;

	items.forEach((item, index) => {
		item.classList.remove('active', 'prev', 'next');

		if (index === currentIndex) {
			item.classList.add('active');
		} else if (index === (currentIndex - 1 + totalItems) % totalItems) {
			item.classList.add('prev');
		} else if (index === (currentIndex + 1) % totalItems) {
			item.classList.add('next');
		}
	});
}

function moveCarousel(direction, sectionId) {
	const items = getCarouselItems(sectionId);
	const totalItems = items.length;
	if (!totalItems) return;

	// Wrap both directions: first <- left and last -> right
	carouselState[sectionId] = (carouselState[sectionId] + direction + totalItems) % totalItems;
	updateActiveItem(sectionId);
}

function handlePreviewClick(event, sectionId) {
	const wrapper = event.target.closest('.project-image-wrapper');
	if (!wrapper) return;

	if (wrapper.classList.contains('prev')) {
		event.preventDefault();
		event.stopPropagation();
		moveCarousel(-1, sectionId);
	} else if (wrapper.classList.contains('next')) {
		event.preventDefault();
		event.stopPropagation();
		moveCarousel(1, sectionId);
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

	// Initialize each carousel independently
	updateActiveItem('sets');
	updateActiveItem('songs');

	const setsCarousel = document.querySelector('#sets .projects-carousel');
	const songsCarousel = document.querySelector('#songs .projects-carousel');

	if (setsCarousel) {
		setsCarousel.addEventListener('click', function(event) {
			handlePreviewClick(event, 'sets');
		});
	}

	if (songsCarousel) {
		songsCarousel.addEventListener('click', function(event) {
			handlePreviewClick(event, 'songs');
		});
	}
	
	// Theme mode functionality (normal → dark → fun)
	const darkModeToggle = document.getElementById('dark-mode-toggle');
	
	// Check for saved theme preference
	const savedTheme = localStorage.getItem('themeMode') || 'normal';
	if (savedTheme === 'dark') {
		document.body.classList.add('dark-mode');
	} else if (savedTheme === 'fun') {
		document.body.classList.add('fun-mode');
	}
	
	// Cycle through themes: normal → dark → fun → normal
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