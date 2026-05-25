

//selecting html elements
let nameElement = document.querySelector('#name');
let emailElement = document.querySelector('#email');
let messageElement = document.querySelector("#message");

let submitButton = document.querySelector('#submit-button');
if (submitButton && nameElement && emailElement && messageElement) {
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
}

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

function initRavesAutoSort() {
	const ravesSection = document.getElementById('Raves');
	if (!ravesSection) return;

	const upcomingGrid = ravesSection.querySelector('[data-raves-view="upcoming"]');
	const pastGrid = ravesSection.querySelector('[data-raves-view="past"]');
	if (!upcomingGrid || !pastGrid) return;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const datedCards = Array.from(ravesSection.querySelectorAll('[data-date]'));

	const upcoming = [];
	const past = [];

	datedCards.forEach((card) => {
		const eventDate = new Date(`${card.dataset.date}T00:00:00`);
		if (Number.isNaN(eventDate.getTime())) return;

		if (eventDate < today) {
			card.classList.add('rave-card--past');
			const dayEl = card.querySelector('.rave-card__day');
			if (dayEl) dayEl.textContent = String(eventDate.getFullYear());
			past.push({ card, eventDate });
		} else {
			card.classList.remove('rave-card--past');
			upcoming.push({ card, eventDate });
		}
	});

	// Soonest first for upcoming, most recent first for past
	upcoming.sort((a, b) => a.eventDate - b.eventDate);
	past.sort((a, b) => b.eventDate - a.eventDate);

	// appendChild also moves elements between parents
	upcoming.forEach(({ card }) => upcomingGrid.appendChild(card));
	past.forEach(({ card }) => pastGrid.appendChild(card));
}

function initRavesToggle() {
	const toggleButtons = document.querySelectorAll('#Raves .raves-toggle__btn');
	if (!toggleButtons.length) return;

	const grids = document.querySelectorAll('#Raves [data-raves-view]');
	const title = document.getElementById('raves-title');
	const subtitle = document.getElementById('raves-subtitle');

	function setView(view) {
		toggleButtons.forEach((btn) => {
			const isActive = btn.dataset.view === view;
			btn.classList.toggle('is-active', isActive);
			btn.setAttribute('aria-pressed', String(isActive));
		});

		grids.forEach((grid) => {
			grid.hidden = grid.dataset.ravesView !== view;
		});

		if (title) {
			const next = view === 'past' ? title.dataset.pastTitle : title.dataset.upcomingTitle;
			if (next) title.textContent = next;
		}
		if (subtitle) {
			const next = view === 'past' ? subtitle.dataset.pastSubtitle : subtitle.dataset.upcomingSubtitle;
			if (next) subtitle.textContent = next;
		}
	}

	toggleButtons.forEach((btn) => {
		btn.addEventListener('click', () => setView(btn.dataset.view));
	});
}

function initIpodToggle() {
	const toggle = document.getElementById('ipod-toggle');
	const image = document.getElementById('ipod-toggle-image');
	if (!toggle || !image) return;

	const GREY_SRC = 'images/music/Grey.png';
	const WHITE_SRC = 'images/music/White.png';

	const isDarkMode = document.body.classList.contains('dark-mode');
	image.src = isDarkMode ? WHITE_SRC : GREY_SRC;

	const swapImage = () => {
		const usingWhite = image.src.includes('/White.png');
		image.src = usingWhite ? GREY_SRC : WHITE_SRC;
	};

	toggle.addEventListener('click', swapImage);
	toggle.addEventListener('keydown', function(event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			swapImage();
		}
	});
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

	function hideBanner() {
		root.hidden = true;
		root.setAttribute('aria-hidden', 'true');
		root.classList.remove('spotify-now-playing--error', 'spotify-now-playing--playing');
		statusEl.textContent = 'Now playing';
		linkEl.hidden = true;
		linkEl.removeAttribute('href');
		artEl.hidden = true;
		artEl.removeAttribute('src');
		titleEl.textContent = '';
		artistEl.textContent = '';
	}

	function showPlayingTrack(data) {
		root.hidden = false;
		root.setAttribute('aria-hidden', 'false');
		root.classList.remove('spotify-now-playing--error');
		root.classList.add('spotify-now-playing--playing');

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

	async function fetchNowPlaying() {
		try {
			const res = await fetch(endpoint, { credentials: 'omit' });
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				hideBanner();
				return;
			}

			if (!data.isPlaying) {
				hideBanner();
				return;
			}

			showPlayingTrack(data);
		} catch {
			hideBanner();
		}
	}

	fetchNowPlaying();
	setInterval(fetchNowPlaying, pollMs);
}

function initSpotifyTopSongs() {
	const root = document.getElementById('spotify-top-songs');
	if (!root) return;

	const endpoint = root.dataset.spotifyTopEndpoint || '/api/spotify-top-tracks';
	const limit = Number(root.dataset.limit) || 9;
	const timeRange = root.dataset.timeRange || 'medium_term';

	function escapeHtml(value) {
		return String(value)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	function renderTracks(tracks) {
		if (!tracks.length) {
			root.innerHTML = '<p class="song-grid-empty">No top songs available right now.</p>';
			return;
		}

		const cardsHtml = tracks
			.filter((track) => track.imageUrl)
			.map((track) => {
				const title = escapeHtml(track.title || 'Spotify track');
				const artist = escapeHtml(track.artist || '');
				const href = escapeHtml(track.url || '#');
				const img = escapeHtml(track.imageUrl);
				const ariaLabel = artist ? `${title} by ${artist}` : title;
				return `
					<a class="song-grid-item" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${ariaLabel}">
						<img class="song-cover" src="${img}" alt="${ariaLabel}" loading="lazy" decoding="async"/>
						<span class="song-overlay" aria-hidden="true">
							<span class="song-overlay-title">${title}</span>
							<span class="song-overlay-artist">${artist}</span>
						</span>
					</a>
				`;
			})
			.join('');

		root.innerHTML = cardsHtml || '<p class="song-grid-empty">No top songs available right now.</p>';
	}

	async function fetchTopSongs() {
		try {
			const qs = new URLSearchParams({
				limit: String(limit),
				time_range: timeRange,
			});
			const res = await fetch(`${endpoint}?${qs.toString()}`, { credentials: 'omit' });
			const data = await res.json().catch(() => ({}));

			if (!res.ok || !Array.isArray(data.tracks)) {
				root.innerHTML = '<p class="song-grid-empty">Unable to load top songs.</p>';
				return;
			}

			renderTracks(data.tracks);
		} catch {
			root.innerHTML = '<p class="song-grid-empty">Unable to load top songs.</p>';
		}
	}

	fetchTopSongs();
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
	// Theme mode functionality
	function applyTheme(mode) {
		if (mode === 'dark') {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}
	
	// Check for saved theme preference
	const savedTheme = localStorage.getItem('themeMode') || 'normal';
	applyTheme(savedTheme);
	
	// Delegate click handling so SVG/path clicks always toggle
	document.addEventListener('click', function(event) {
		const darkModeToggle = event.target.closest('#dark-mode-toggle');
		if (!darkModeToggle) return;

		try {
			document.body.classList.toggle('dark-mode');

			// Save preference to localStorage
			if (document.body.classList.contains('dark-mode')) {
				localStorage.setItem('themeMode', 'dark');
			} else {
				localStorage.setItem('themeMode', 'normal');
			}
		} catch (error) {
			console.error('Theme toggle failed:', error);
		}
	});

	try {
		initHeroTyping();
	} catch (error) {
		console.error('initHeroTyping failed:', error);
	}

	try {
		initSpotifyNowPlaying();
	} catch (error) {
		console.error('initSpotifyNowPlaying failed:', error);
	}

	try {
		initSpotifyTopSongs();
	} catch (error) {
		console.error('initSpotifyTopSongs failed:', error);
	}

	// Initialize each carousel independently
	try {
		updateActiveItem('projects');
		updateActiveItem('sets');
		updateActiveItem('songs');
	} catch (error) {
		console.error('updateActiveItem failed:', error);
	}

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
	
	try {
		initIpodToggle();
	} catch (error) {
		console.error('initIpodToggle failed:', error);
	}

	try {
		initRavesAutoSort();
	} catch (error) {
		console.error('initRavesAutoSort failed:', error);
	}

	try {
		initRavesToggle();
	} catch (error) {
		console.error('initRavesToggle failed:', error);
	}
});