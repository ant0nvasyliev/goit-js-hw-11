import axios from 'axios';
import * as Notiflix from 'notiflix';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';
let lightbox = null;

async function searchImages(query, page = 1, perPage = 40) {
  const apiKey = '38243534-5c7cfe447b5c7a0fae0b6f146';
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(apiUrl);
    const { data } = response;

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      if (page === 1) {
        clearGallery();
        hideLoadMoreBtn();
        lightbox = new SimpleLightbox('.gallery a');
      }

      renderImages(data.hits);

      const totalHits = data.totalHits || 0;
      if (page * perPage < totalHits) {
        showLoadMoreBtn();
      } else {
        hideLoadMoreBtn();
      }
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

function renderImages(images) {
  const galleryFragment = document.createDocumentFragment();

  images.forEach(image => {
    const photoCard = createPhotoCard(image);
    galleryFragment.appendChild(photoCard);
  });

  gallery.appendChild(galleryFragment);

  lightbox.refresh();
}

function createPhotoCard(image) {
  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  const linkElement = document.createElement('a');
  linkElement.href = image.largeImageURL;

  const imageElement = document.createElement('img');
  imageElement.src = image.webformatURL;
  imageElement.alt = image.tags;
  imageElement.loading = 'lazy';

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('info');

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  infoContainer.appendChild(likes);
  infoContainer.appendChild(views);
  infoContainer.appendChild(comments);
  infoContainer.appendChild(downloads);

  linkElement.appendChild(imageElement);
  photoCard.appendChild(linkElement);
  photoCard.appendChild(infoContainer);

  return photoCard;
}

function createInfoItem(label, value) {
  const infoItem = document.createElement('p');
  infoItem.classList.add('info-item');
  infoItem.innerHTML = `<b>${label}:</b> ${value}`;
  return infoItem;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery !== '') {
    currentPage = 1;
    currentQuery = searchQuery;

    searchImages(searchQuery, currentPage);
    hideLoadMoreBtn();
  }
});

loadMoreBtn.addEventListener('click', () => {
  currentPage += 1;
  searchImages(currentQuery, currentPage);
});
