const searchForm = document.querySelector('.search-form');
const galleryContainer = document.querySelector('.gallery');
const searchQueryInput = document.getElementById('search-bar');
const paginationContainer = document.getElementById('pagination-container');
const paginationButtons = document.getElementById('pagination-numbers');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

let currentPage = 1;
let currentQuery = '';
let totalPages = 0;
let isFirstSearch = true;
let lightbox = null;

searchForm.addEventListener('submit', async event => {
  event.preventDefault();

  const searchQuery = searchQueryInput.value.trim();

  if (searchQuery === '') {
    showToast('warning', 'Будь ласка, заповніть поле пошуку');
    clearGallery();
    hidePagination();
    return;
  }

  if (searchQuery === currentQuery) {
    showToast('warning', 'Введіть новий запит для пошуку');
    return;
  }

  currentQuery = searchQuery;
  currentPage = 1;
  isFirstSearch = true;

  apiService.setQuery(searchQuery);
  apiService.resetPage();

  await fetchGallery(currentPage);
});

prevButton.addEventListener('click', async () => {
  if (currentPage > 1) {
    await setCurrentPage(currentPage - 1);
  }
});

nextButton.addEventListener('click', async () => {
  if (currentPage < totalPages) {
    await setCurrentPage(currentPage + 1);
  }
});

async function fetchGallery(page) {
  try {
    apiService.setPage(page);
    const result = await apiService.fetchGallery();
    const { hits, totalHits } = result;

    if (!hits || hits.length === 0) {
      showToast(
        'error',
        'Вибачте, немає зображень, які відповідають вашому пошуковому запиту.'
      );
      clearGallery();
      hidePagination();
      return;
    }

    totalPages = Math.ceil(totalHits / apiService.perPage);

    if (isFirstSearch) {
      showToast('success', `Ура! Ми знайшли ${totalHits} зображень.`);
      createPagination(totalPages);
      isFirstSearch = false;
    }

    clearGallery();
    renderGallery(hits);
    handlePageButtonsStatus();
    handleActivePageNumber();

    if (currentPage >= totalPages) {
      showToast('info', 'Ви досягли кінця результатів пошуку.');
    }
  } catch (error) {
    console.error('Error fetching gallery:', error);
    showToast('error', 'Сталася помилка під час завантаження зображень.');
  }
}

function renderGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
          <a href="${largeImageURL}">
            <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              <span class="info__span">${likes}</span>
            </p>
            <p class="info-item">
              <b>Views</b>
              <span class="info__span">${views}</span>
            </p>
            <p class="info-item">
              <b>Comments</b>
              <span class="info__span">${comments}</span>
            </p>
            <p class="info-item">
              <b>Downloads</b>
              <span class="info__span">${downloads}</span>
            </p>
          </div>
        </div>
      `
    )
    .join('');

  galleryContainer.innerHTML = markup;

  if (!lightbox) {
    lightbox = new SimpleLightbox('.photo-card a', {
      captions: true,
      captionsData: 'alt',
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
}

function createPagination(pageCount) {
  paginationButtons.innerHTML = '';

  for (let i = 1; i <= pageCount; i += 1) {
    const pageNumber = document.createElement('button');
    pageNumber.className = 'pagination-number';
    pageNumber.textContent = i;

    pageNumber.addEventListener('click', async () => {
      await setCurrentPage(i);
    });

    paginationButtons.appendChild(pageNumber);
  }

  if (pageCount > 1) {
    paginationContainer.classList.remove('is-hidden');
  } else {
    paginationContainer.classList.add('is-hidden');
  }
}

async function setCurrentPage(page) {
  currentPage = page;
  await fetchGallery(currentPage);
  scrollToTop();
}

function clearGallery() {
  galleryContainer.innerHTML = '';
}

function hidePagination() {
  paginationContainer.classList.add('is-hidden');
  paginationButtons.innerHTML = '';
}

function disableButton(button) {
  button.classList.add('disabled');
  button.disabled = true;
}

function enableButton(button) {
  button.classList.remove('disabled');
  button.disabled = false;
}

function handlePageButtonsStatus() {
  if (currentPage === 1) {
    disableButton(prevButton);
  } else {
    enableButton(prevButton);
  }

  if (currentPage === totalPages || totalPages === 0) {
    disableButton(nextButton);
  } else {
    enableButton(nextButton);
  }
}

function handleActivePageNumber() {
  document.querySelectorAll('.pagination-number').forEach((button, index) => {
    button.classList.remove('active');
    if (index + 1 === currentPage) {
      button.classList.add('active');
    }
  });
}

function showToast(type, message) {
  iziToast[type]({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    message,
    position: 'topRight',
    timeout: 2500,
    closeOnEscape: true,
    closeOnClick: true,
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}