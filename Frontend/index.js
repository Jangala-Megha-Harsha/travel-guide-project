// --- Constants ---
const VOICES = {
  English: { Male: "Matthew", Female: "Alicia" },
  Hindi: { Male: "Aman", Female: "Namrita" },
  Tamil: { Male: "Murali", Female: "Iniya" },
  Telugu: { Male: "Zion", Female: "Josie" }
};

const LOCALES = {
  English: "en-US",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN"
};


// --- State ---
const state = {
  place: '',
  image: '',
  length: 'Summary',
  voice: 'Male'
};

// --- DOM Elements ---
const cardsContainer = document.querySelector('.cards');
const experiencePanel = document.getElementById('experience');
const previewTitle = document.getElementById('previewTitle');
const audioSection = document.getElementById('audioSection');
const audioPlayer = document.getElementById('audioPlayer');
const transcriptText = document.getElementById('scriptText');
const generateButton = document.getElementById('generateBtn');
const audioStatus = document.getElementById('audioStatus');
const languageSelect = document.getElementById('selectLanguage');
const closeButton = document.getElementById('closeExperience');
const searchPreviewCard = document.getElementById('searchPreviewCard');
const searchPreviewImage = document.getElementById('searchPreviewImage');
const searchPreviewTitle = document.getElementById('searchPreviewTitle');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchBtn');
const clearSearchButton = document.getElementById('clearSearch');
const stateFilter = document.getElementById('stateFilter');
const categoryFilter = document.getElementById('categoryFilter');
const favoritesToggle = document.getElementById('favoritesToggle');
const randomDestinationButton = document.getElementById('randomDestination');
const resultCount = document.getElementById('resultCount');
const featureToolbar = document.querySelector('.feature-toolbar');
const themeToggle = document.getElementById('themeToggle');
const visitTiming = document.getElementById('visitTiming');
const nearbyAttractions = document.getElementById('nearbyAttractions');
const shareDestinationButton = document.getElementById('shareDestination');
const copyDescriptionButton = document.getElementById('copyDescription');
const backToTopButton = document.getElementById('backToTop');
const transcriptToggle = document.getElementById('transcriptToggle');
const transcriptContent = document.getElementById('transcriptContent');
const transcriptArrow = document.getElementById('transcriptArrow');

function carouselMarkup(place, fallbackImage) {
  const images = window.CAROUSEL_IMAGES?.[place] || [fallbackImage, fallbackImage, fallbackImage];
  const id = `carousel-${place.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return `
    <div class="place-carousel" id="${id}" data-carousel data-index="0" role="region" aria-label="${place} image gallery" tabindex="0">
      ${images.map((image, index) => `
        <div class="place-carousel-slide${index === 0 ? ' active' : ''}">
          <img src="${image}" alt="${place} view ${index + 1}">
        </div>
      `).join('')}
      <button class="place-carousel-control prev" type="button" data-carousel-action="prev" aria-label="Previous image">‹</button>
      <button class="place-carousel-control next" type="button" data-carousel-action="next" aria-label="Next image">›</button>
      <div class="place-carousel-toolbar">
        <div class="place-carousel-indicators">
          ${images.map((_, index) => `<button class="place-carousel-indicator${index === 0 ? ' active' : ''}" type="button" data-carousel-slide="${index}" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="Image ${index + 1}"></button>`).join('')}
        </div>
        <span class="carousel-counter">1 / ${images.length}</span>
        <button class="place-carousel-play" type="button" data-carousel-action="pause" aria-label="Pause slideshow">Ⅱ</button>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function renderTranscript(text) {
  const escapedText = escapeHtml(text.trim());
  return escapedText
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^###\s+(.+)$/gm, '<strong class="transcript-heading">$1</strong>')
    .replace(/^- (.+)$/gm, '<span class="transcript-bullet">$1</span>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

additionalDestinations.forEach(([place, region, category, image]) => {
  searchPreviewCard.insertAdjacentHTML('beforebegin', `
    <div class="place-card bg-white rounded-[2rem] overflow-hidden border border-gray-100 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:border-orange-100 group relative lg:[&.active]:w-[480px] lg:[&.active]:max-w-none"
      data-place="${place}" data-image="${image}">
      <div class="overflow-hidden h-[200px] relative">
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
        <img src="${image}" alt="${place}"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
        <div class="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-gray-800 shadow-sm">${region}</div>
      </div>
      <div class="p-6">
        <span class="text-[11px] text-[#ff8a1f] font-bold uppercase tracking-widest">${category}</span>
        <h3 class="mt-2 mb-1 text-xl font-['Playfair_Display',_serif] font-bold text-gray-900 group-hover:text-[#ff8a1f] transition-colors">${place}</h3>
        <p class="text-sm text-gray-500 line-clamp-2 leading-relaxed">Discover the history, culture, and local highlights of ${place} with your AI audio guide.</p>
      </div>
    </div>
  `);
});

const favoritePlaces = new Set(JSON.parse(localStorage.getItem('favoritePlaces') || '[]'));
const allCards = document.querySelectorAll('.place-card:not(.search-preview-card)');

const regionToState = {
  Agra: 'Uttar Pradesh',
  'New Delhi': 'Delhi',
  Mumbai: 'Maharashtra',
  Jaipur: 'Rajasthan',
  Amritsar: 'Punjab',
  Mysore: 'Karnataka',
  'Amaravati, Andhra Pradesh': 'Andhra Pradesh',
  Delhi: 'Delhi',
  'Hyderabad, Telangana': 'Telangana',
  'Warangal, Telangana': 'Telangana',
  'Tirupati, Andhra Pradesh': 'Andhra Pradesh',
  'Visakhapatnam, Andhra Pradesh': 'Andhra Pradesh',
  'Anantapur, Andhra Pradesh': 'Andhra Pradesh',
  'Yadadri, Telangana': 'Telangana',
  'Nalgonda, Telangana': 'Telangana',
  'Adilabad, Telangana': 'Telangana',
  'Vikarabad, Telangana': 'Telangana',
  'Kurnool, Andhra Pradesh': 'Andhra Pradesh',
  'Godavari, Andhra Pradesh': 'Andhra Pradesh',
  'Bhadrachalam, Telangana': 'Telangana',
  'New Delhi': 'Delhi',
  Karnataka: 'Karnataka',
  Ladakh: 'Ladakh',
  Uttarakhand: 'Uttarakhand',
  'Himachal Pradesh': 'Himachal Pradesh',
  'West Bengal': 'West Bengal',
  'Mumbai, Maharashtra': 'Maharashtra',
  Lakshadweep: 'Lakshadweep',
  Bihar: 'Bihar',
  'Tamil Nadu': 'Tamil Nadu',
  Odisha: 'Odisha',
  Madurai: 'Tamil Nadu',
  Kerala: 'Kerala',
  Gujarat: 'Gujarat',
  Assam: 'Assam',
  Sikkim: 'Sikkim',
  'Andaman and Nicobar': 'Andaman and Nicobar Islands',
  'Madhya Pradesh': 'Madhya Pradesh',
  Udaipur: 'Rajasthan',
  'Aurangabad': 'Maharashtra',
  Varanasi: 'Uttar Pradesh',
  'West Bengal': 'West Bengal',
  Goa: 'Goa'
};

function normalizeCategory(category) {
  const value = category.toLowerCase();
  if (value.includes('temple') || value.includes('spiritual') || value.includes('buddhist') || value.includes('pilgrimage')) return 'Temples and Spirituality';
  if (value.includes('fort') || value.includes('heritage') || value.includes('historical') || value.includes('world wonder')) return 'History and Heritage';
  if (value.includes('hill') || value.includes('mountain')) return 'Hill Stations and Mountains';
  if (value.includes('wildlife')) return 'Wildlife';
  if (value.includes('coastal') || value.includes('island') || value.includes('beach')) return 'Beaches and Islands';
  if (value.includes('nature') || value.includes('lake') || value.includes('river') || value.includes('natural')) return 'Nature and Waterfalls';
  if (value.includes('adventure')) return 'Adventure';
  if (value.includes('royal')) return 'Palaces and Royalty';
  if (value.includes('family')) return 'Family Attractions';
  if (value.includes('monument') || value.includes('architecture') || value.includes('city')) return 'Monuments and Architecture';
  return 'Other Attractions';
}

allCards.forEach(card => {
  const region = card.querySelector('.absolute.top-4')?.textContent.trim() || '';
  const rawCategory = card.querySelector('span')?.textContent.trim() || '';
  card.dataset.state = regionToState[region] || region;
  card.dataset.category = normalizeCategory(rawCategory);
  card.tabIndex = 0;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-label', `Open ${card.dataset.place}`);
  const button = document.createElement('button');
  button.className = 'favorite-button';
  button.type = 'button';
  button.dataset.favorite = card.dataset.place;
  button.setAttribute('aria-label', `Favorite ${card.dataset.place}`);
  button.textContent = favoritePlaces.has(card.dataset.place) ? '♥' : '♡';
  button.classList.toggle('active', favoritePlaces.has(card.dataset.place));
  button.setAttribute('aria-pressed', String(favoritePlaces.has(card.dataset.place)));
  card.appendChild(button);
});

const uniqueValues = attribute => [...new Set([...allCards].map(card => card.dataset[attribute]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
uniqueValues('state').forEach(value => stateFilter.insertAdjacentHTML('beforeend', `<option value="${value}">${value}</option>`));
uniqueValues('category').forEach(value => categoryFilter.insertAdjacentHTML('beforeend', `<option value="${value}">${value}</option>`));

function setCarouselSlide(carousel, index) {
  const slides = carousel.querySelectorAll('.place-carousel-slide');
  const indicators = carousel.querySelectorAll('.place-carousel-indicator');
  const nextIndex = (index + slides.length) % slides.length;
  carousel.dataset.index = nextIndex;
  slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === nextIndex));
  indicators.forEach((indicator, indicatorIndex) => {
    const active = indicatorIndex === nextIndex;
    indicator.classList.toggle('active', active);
    indicator.setAttribute('aria-current', String(active));
  });
  const counter = carousel.querySelector('.carousel-counter');
  if (counter) counter.textContent = `${nextIndex + 1} / ${slides.length}`;
}

function advanceCarousel(carousel, direction = 1) {
  setCarouselSlide(carousel, Number(carousel.dataset.index || 0) + direction);
}

function setCardCarousel(card, enabled) {
  const imageArea = card.querySelector(':scope > div:first-child');
  if (!imageArea) return;

  const currentCarousel = imageArea.querySelector('[data-carousel]');
  if (enabled && !currentCarousel) {
    const image = imageArea.querySelector(':scope > img');
    if (image) {
      image.replaceWith(document.createRange().createContextualFragment(
        carouselMarkup(card.dataset.place, card.dataset.image)
      ));
      startCarousel(imageArea.querySelector('[data-carousel]'));
    }
  } else if (!enabled && currentCarousel) {
    clearInterval(currentCarousel.carouselTimer);
    const image = document.createElement('img');
    image.src = card.dataset.image;
    image.alt = card.dataset.place;
    image.className = 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-110';
    currentCarousel.replaceWith(image);
  }
}

function startCarousel(carousel) {
  carousel.carouselTimer = setInterval(() => advanceCarousel(carousel), 4000);
}

cardsContainer.addEventListener('click', event => {
  const actionElement = event.target.closest('[data-carousel-action], [data-carousel-slide]');
  if (!actionElement) return;
  event.stopPropagation();
  const carousel = actionElement.closest('[data-carousel]');
  if (actionElement.dataset.carouselSlide !== undefined) {
    setCarouselSlide(carousel, Number(actionElement.dataset.carouselSlide));
    return;
  }
  const action = actionElement.dataset.carouselAction;
  if (action === 'prev') advanceCarousel(carousel, -1);
  if (action === 'next') advanceCarousel(carousel);
  if (action === 'pause') {
    const isPaused = actionElement.dataset.paused === 'true';
    if (isPaused) {
      carousel.carouselTimer = setInterval(() => advanceCarousel(carousel), 4000);
      actionElement.textContent = 'Ⅱ';
      actionElement.setAttribute('aria-label', 'Pause slideshow');
      actionElement.dataset.paused = 'false';
    } else {
      clearInterval(carousel.carouselTimer);
      actionElement.textContent = '▶';
      actionElement.setAttribute('aria-label', 'Play slideshow');
      actionElement.dataset.paused = 'true';
    }
  }
});

searchPreviewCard.insertAdjacentHTML('beforebegin', `
  <div id="searchMessage" class="hidden">
    <strong>No destinations found</strong>
    <span>Try a place, city, state, or attraction.</span>
    <button type="button" id="resetFilters">Clear filters</button>
  </div>
`);
const searchMessage = document.getElementById('searchMessage');
const resetFiltersButton = document.getElementById('resetFilters');

function searchDestinations() {
  const query = searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll('.place-card:not(.search-preview-card)');
  const selectedState = stateFilter.value.toLowerCase();
  const selectedCategory = categoryFilter.value.toLowerCase();
  const favoritesOnly = favoritesToggle.dataset.active === 'true';
  let matches = 0;

  cards.forEach(card => {
    const searchableText = [
      card.dataset.place,
      card.textContent
    ].join(' ').toLowerCase();
    const isMatch = (!query || searchableText.includes(query))
      && (!selectedState || card.dataset.state.toLowerCase() === selectedState)
      && (!selectedCategory || card.dataset.category.toLowerCase() === selectedCategory)
      && (!favoritesOnly || favoritePlaces.has(card.dataset.place));
    card.classList.toggle('hidden', !isMatch);
    if (isMatch) matches += 1;
  });

  searchMessage.classList.toggle('hidden', matches > 0);
  searchMessage.setAttribute('aria-hidden', String(matches > 0));
  cardsContainer.classList.toggle('search-row', matches > 0 && matches <= 3);
  resultCount.textContent = `${matches} destination${matches === 1 ? '' : 's'} found`;
  clearSearchButton.classList.toggle('hidden', !searchInput.value);
}

// --- Functions ---

function selectDestination(place, image, clickedCard = null, updateUrl = true) {
  state.place = place;
  state.image = image;
  featureToolbar?.classList.add('destination-open');
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (updateUrl) {
    const placeUrl = new URL(window.location.href);
    placeUrl.searchParams.set('place', place);
    window.history.pushState({ place }, '', placeUrl);
  }
  document.querySelectorAll('.place-card:not(.search-preview-card)').forEach(card => {
    card.classList.remove('active');
    setCardCarousel(card, false);
  });

  // Update UI content
  previewTitle.textContent = place;
  const selectedCard = clickedCard || [...allCards].find(card => card.dataset.place === place);
  const category = selectedCard?.dataset.category || 'Destination';
  visitTiming.textContent = `Best time to visit: ${category.toLowerCase().includes('hill') ? 'October to May' : 'October to March'}`;
  const nearby = [...allCards]
    .filter(card => card !== selectedCard && card.dataset.state === selectedCard?.dataset.state)
    .slice(0, 3)
    .map(card => card.dataset.place);
  nearbyAttractions.textContent = nearby.length
    ? `Nearby attractions: ${nearby.join(', ')}`
    : 'Nearby attractions: Explore more places across India.';
  cardsContainer.classList.add('faded');

  // Reset previous states
  searchPreviewCard.classList.add('hidden');

  // Handle Card Visibility
  if (clickedCard) {
    clickedCard.classList.add('active');
    setCardCarousel(clickedCard, true);
  } else {
    // If it's a search result, show the preview card
    searchPreviewImage.src = image;
    searchPreviewTitle.textContent = place;
    searchPreviewCard.classList.remove('hidden');
    searchPreviewCard.classList.add('active');
  }

  // Reset Audio Panel
  audioSection.classList.add('hidden');
  audioPlayer.src = '';
  transcriptText.textContent = '';
  generateButton.textContent = 'Generate Audio Guide';
  generateButton.disabled = false;

  // Show Panel with animation
  experiencePanel.classList.remove('hidden');
  setTimeout(() => {
    experiencePanel.classList.add('visible');
  }, 10);
}

function deselectDestination(updateUrl = true) {
  experiencePanel.classList.remove('visible');
  if (updateUrl) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('place');
    window.history.pushState({}, '', cleanUrl);
  }

  // Wait for animation to finish before hiding
  setTimeout(() => {
    experiencePanel.classList.add('hidden');
    featureToolbar?.classList.remove('destination-open');
    cardsContainer.classList.remove('faded');
    searchPreviewCard.classList.add('hidden');
    document.querySelectorAll('.place-card:not(.search-preview-card)').forEach(card => {
      card.classList.remove('active');
      setCardCarousel(card, false);
    });
  }, 300);
}

function openRandomDestination() {
  const visibleCards = [...allCards].filter(card => !card.classList.contains('hidden'));
  const cards = visibleCards.length ? visibleCards : [...allCards];
  const card = cards[Math.floor(Math.random() * cards.length)];
  selectDestination(card.dataset.place, card.dataset.image, card);
}

// --- Event Listeners ---

// Close Button
closeButton.addEventListener('click', deselectDestination);

// Card Clicks
document.querySelectorAll('.place-card:not(.search-preview-card)').forEach(card => {
  card.addEventListener('click', event => {
    if (event.target.closest('[data-carousel-action], [data-carousel-slide], .favorite-button')) return;
    selectDestination(card.dataset.place, card.dataset.image, card);
  });
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectDestination(card.dataset.place, card.dataset.image, card);
  });
});

searchButton.addEventListener('click', searchDestinations);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') searchDestinations();
});
searchInput.addEventListener('input', searchDestinations);
clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  searchDestinations();
  searchInput.focus();
});
stateFilter.addEventListener('change', searchDestinations);
categoryFilter.addEventListener('change', searchDestinations);
favoritesToggle.addEventListener('click', () => {
  const active = favoritesToggle.dataset.active === 'true';
  favoritesToggle.dataset.active = String(!active);
  favoritesToggle.textContent = active ? '♥ Favorites' : '♥ Showing Favorites';
  searchDestinations();
});

document.addEventListener('click', event => {
  const button = event.target.closest('.favorite-button');
  if (!button) return;
  const place = button.dataset.favorite;
  if (favoritePlaces.has(place)) favoritePlaces.delete(place);
  else favoritePlaces.add(place);
  localStorage.setItem('favoritePlaces', JSON.stringify([...favoritePlaces]));
  button.classList.toggle('active', favoritePlaces.has(place));
  button.textContent = favoritePlaces.has(place) ? '♥' : '♡';
  button.setAttribute('aria-pressed', String(favoritePlaces.has(place)));
  if (favoritesToggle.dataset.active === 'true') searchDestinations();
});
randomDestinationButton.addEventListener('click', openRandomDestination);
shareDestinationButton.addEventListener('click', async () => {
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set('place', state.place);
  const shareData = { title: state.place, text: `Explore ${state.place} with Travel Guide`, url: shareUrl.href };
  if (navigator.share) await navigator.share(shareData);
  else if (navigator.clipboard) await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
  else {
    audioStatus.textContent = 'Sharing is not supported in this browser.';
    return;
  }
  shareDestinationButton.textContent = 'Shared';
  setTimeout(() => { shareDestinationButton.textContent = 'Share destination'; }, 1500);
});
copyDescriptionButton.addEventListener('click', async () => {
  if (!navigator.clipboard) {
    audioStatus.textContent = 'Copying is not supported in this browser.';
    return;
  }
  await navigator.clipboard.writeText(transcriptText.innerText || transcriptText.textContent);
  copyDescriptionButton.textContent = 'Copied';
  setTimeout(() => { copyDescriptionButton.textContent = 'Copy description'; }, 1500);
});
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});
if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
window.addEventListener('scroll', () => {
  backToTopButton.style.display = window.scrollY > 500 ? 'block' : 'none';
});
backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && experiencePanel.classList.contains('visible')) {
    deselectDestination();
    return;
  }
  const carousel = document.querySelector('.place-card.active [data-carousel]');
  if (!carousel || !experiencePanel.classList.contains('visible')) return;
  if (event.key === 'ArrowLeft') advanceCarousel(carousel, -1);
  if (event.key === 'ArrowRight') advanceCarousel(carousel);
  if (event.key === 'Home') setCarouselSlide(carousel, 0);
  if (event.key === 'End') setCarouselSlide(carousel, carousel.querySelectorAll('.place-carousel-slide').length - 1);
});

// Option Toggles (History Type)
const lengthButtons = document.querySelectorAll('[data-group="length"] button');
lengthButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    lengthButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.length = btn.dataset.value;
  });
});

// Option Toggles (Voice Gender)
const voiceButtons = document.querySelectorAll('[data-group="voice"] button');
voiceButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    voiceButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.voice = btn.dataset.value;
  });
});


// Generate Audio guide button Logic

const GENERATE_AUDIO_GUIDE_API_URL =
  `${(window.TRAVEL_GUIDE_API_URL || "http://127.0.0.1:5000").replace(/\/+$/, '')}/generate-audio-guide`;

generateButton.addEventListener('click', async () => {
  generateButton.disabled = true;
  generateButton.textContent = '⏳ Generating Audio...';
  audioStatus.textContent = 'Creating your guide and preparing the audio...';

  try {
    const selectedLanguage = languageSelect.value;
    const selectedVoice = state.voice;

    const response = await fetch(GENERATE_AUDIO_GUIDE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place: state.place,
        answerType: state.length,
        language: selectedLanguage,
        voiceId: VOICES[selectedLanguage][selectedVoice],
        locale: LOCALES[selectedLanguage]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Generation failed (HTTP ${response.status})`);
    }
    if (!data.description || !data.audioBase64) {
      throw new Error('The audio service returned an incomplete response.');
    }

    // Update UI with Result
    transcriptText.innerHTML = renderTranscript(data.description);
    audioSection.classList.remove('hidden');

    if (data.audioBase64) {
      audioPlayer.src = `data:audio/mp3;base64,${data.audioBase64}`;
      audioPlayer.load();
      audioPlayer.classList.remove('hidden');
      generateButton.textContent = 'Listen to Audio';
        audioStatus.textContent = 'Your audio guide is ready.';
    } else {
      audioPlayer.classList.add('hidden');
      generateButton.textContent = 'Audio Not Available';
      audioStatus.textContent = 'The description is ready, but audio is unavailable.';
    }

  } catch (err) {
    console.error(err);
    generateButton.textContent = 'Generate Audio Guide';
    audioStatus.textContent = err.message || 'Could not generate the guide. Please try again.';
    generateButton.disabled = false;
  }
});

audioPlayer.addEventListener('error', () => {
  audioStatus.textContent = 'The audio was generated, but your browser could not play it.';
});

// Transcript Toggle
transcriptToggle.addEventListener('click', () => {
  transcriptContent.classList.toggle('hidden');
  transcriptArrow.classList.toggle('rotate-180');
});

resetFiltersButton.addEventListener('click', () => {
  searchInput.value = '';
  stateFilter.value = '';
  categoryFilter.value = '';
  favoritesToggle.dataset.active = 'false';
  favoritesToggle.textContent = '♥ Favorites';
  searchDestinations();
});

window.addEventListener('popstate', event => {
  const placeName = new URLSearchParams(window.location.search).get('place') || event.state?.place;
  if (!placeName) {
    if (experiencePanel.classList.contains('visible')) deselectDestination(false);
    return;
  }
  const card = [...allCards].find(item => item.dataset.place.toLowerCase() === placeName.toLowerCase());
  if (card && !experiencePanel.classList.contains('visible')) {
    selectDestination(card.dataset.place, card.dataset.image, card, false);
  }
});

const initialPlace = new URLSearchParams(window.location.search).get('place');
if (initialPlace) {
  const initialCard = [...allCards].find(card => card.dataset.place.toLowerCase() === initialPlace.toLowerCase());
  if (initialCard) selectDestination(initialCard.dataset.place, initialCard.dataset.image, initialCard, false);
}
