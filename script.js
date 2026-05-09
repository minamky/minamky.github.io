

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
	projects: 0,
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
	const resolvedSectionId = sectionId || 'projects';
	if (carouselState[resolvedSectionId] === undefined) {
		carouselState[resolvedSectionId] = 0;
	}

	const items = getCarouselItems(resolvedSectionId);
	const totalItems = items.length;
	if (!totalItems) return;

	// Wrap both directions: first <- left and last -> right
	carouselState[resolvedSectionId] = (carouselState[resolvedSectionId] + direction + totalItems) % totalItems;
	updateActiveItem(resolvedSectionId);
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

function initSpotifyNowPlaying() {
	const root = document.getElementById('spotify-now-playing');
	if (!root) return;

	const endpoint = root.dataset.spotifyEndpoint || '/api/spotify';
	const pollMs = Math.max(15000, Number(root.dataset.pollMs) || 30000);

	const statusEl = root.querySelector('[data-spotify-status]');
	const linkEl = root.querySelector('[data-spotify-link]');
	const artEl = root.querySelector('[data-spotify-art]');
	const titleEl = root.querySelector('[data-spotify-title]');
	const artistEl = root.querySelector('[data-spotify-artist]');
	const idleEl = root.querySelector('[data-spotify-idle]');

	function showPlaying(data) {
		root.classList.remove('spotify-now-playing--error');
		root.classList.toggle('spotify-now-playing--playing', Boolean(data.isPlaying));
		idleEl.hidden = true;

		if (!data.isPlaying) {
			statusEl.textContent = 'Spotify';
			linkEl.hidden = true;
			linkEl.removeAttribute('href');
			artEl.hidden = true;
			artEl.removeAttribute('src');
			titleEl.textContent = '';
			artistEl.textContent = '';
			idleEl.hidden = false;
			return;
		}

		statusEl.textContent = 'Now playing';
		titleEl.textContent = data.title || '';
		artistEl.textContent = data.artist || '';

		if (data.albumImageUrl) {
			artEl.src = data.albumImageUrl;
			artEl.alt = data.title ? `Album art for ${data.title}` : '';
			artEl.hidden = false;
		} else {
			artEl.hidden = true;
			artEl.removeAttribute('src');
		}

		if (data.songUrl) {
			linkEl.href = data.songUrl;
			linkEl.hidden = false;
			linkEl.setAttribute('rel', 'noopener noreferrer');
			linkEl.setAttribute('target', '_blank');
		} else {
			linkEl.hidden = true;
			linkEl.removeAttribute('href');
		}
	}

	function showError(message) {
		root.classList.add('spotify-now-playing--error');
		root.classList.remove('spotify-now-playing--playing');
		statusEl.textContent = message;
		linkEl.hidden = true;
		idleEl.hidden = true;
		artEl.hidden = true;
		titleEl.textContent = '';
		artistEl.textContent = '';
	}

	async function fetchNowPlaying() {
		try {
			const res = await fetch(endpoint, { credentials: 'omit' });
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				if (data.error === 'missing_env') {
					showError('Spotify preview needs server setup');
				} else {
					showError('Could not reach Spotify');
				}
				return;
			}

			showPlaying(data);
		} catch {
			showError('Could not reach Spotify');
		}
	}

	fetchNowPlaying();
	setInterval(fetchNowPlaying, pollMs);
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
	initSpotifyNowPlaying();

	// Initialize each carousel independently
	updateActiveItem('projects');
	updateActiveItem('sets');
	updateActiveItem('songs');

	const projectsCarousel = document.querySelector('#projects .projects-carousel');
	const setsCarousel = document.querySelector('#sets .projects-carousel');
	const songsCarousel = document.querySelector('#songs .projects-carousel');

	if (projectsCarousel) {
		projectsCarousel.addEventListener('click', function(event) {
			handlePreviewClick(event, 'projects');
		});
	}

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
	} else {
		document.body.classList.remove('dark-mode');
	}
	
	// Toggle and persist theme across pages
	if (darkModeToggle) {
		darkModeToggle.addEventListener('click', function() {
			document.body.classList.toggle('dark-mode');
			
			// Save preference to localStorage
			if (document.body.classList.contains('dark-mode')) {
				localStorage.setItem('themeMode', 'dark');
			} else {
				localStorage.setItem('themeMode', 'normal');
			}
		});
	}
});