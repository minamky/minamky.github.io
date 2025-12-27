

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
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;

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

function handleSwipe() {
	const swipeThreshold = 50; // Minimum distance for a swipe
	const difference = touchStartX - touchEndX;
	
	if (Math.abs(difference) > swipeThreshold) {
		if (difference > 0) {
			// Swiped left - go to next
			moveCarousel(1);
		} else {
			// Swiped right - go to previous
			moveCarousel(-1);
		}
	}
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
	updateActiveItem();
	
	const carousel = document.querySelector('.projects-carousel');
	
	if (carousel) {
		// Touch events for mobile
		carousel.addEventListener('touchstart', function(e) {
			touchStartX = e.changedTouches[0].screenX;
			isDragging = true;
		}, { passive: true });
		
		carousel.addEventListener('touchend', function(e) {
			touchEndX = e.changedTouches[0].screenX;
			if (isDragging) {
				handleSwipe();
				isDragging = false;
			}
		}, { passive: true });
		
		// Mouse events for desktop
		carousel.addEventListener('mousedown', function(e) {
			touchStartX = e.screenX;
			isDragging = true;
			carousel.style.cursor = 'grabbing';
		});
		
		carousel.addEventListener('mousemove', function(e) {
			if (isDragging) {
				e.preventDefault();
			}
		});
		
		carousel.addEventListener('mouseup', function(e) {
			if (isDragging) {
				touchEndX = e.screenX;
				handleSwipe();
				isDragging = false;
				carousel.style.cursor = 'grab';
			}
		});
		
		carousel.addEventListener('mouseleave', function() {
			if (isDragging) {
				isDragging = false;
				carousel.style.cursor = 'grab';
			}
		});
		
		// Set initial cursor
		carousel.style.cursor = 'grab';
	}
});