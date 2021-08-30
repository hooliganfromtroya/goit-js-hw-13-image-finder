import { fetchImages, PER_PAGE } from './api-service';
import * as basicLightbox from 'basiclightbox';
import {error} from '@pnotify/core'
import cardTemplate from './partials/card';
import './sass/main.scss';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadWrapper: document.querySelector('.load'),
  loadButton: document.querySelector('.load button'),
  autoloading: document.querySelector('.autoloading'),
};

let currentPage = 1;
let currentQuery = '';
let currentImages = [];

const handleLoadMore = () => {
  currentPage += 1;
  getImages();
};

const observerOptions = {
  rootMargin: '-240px',
  delay: 300,
};

const observer = new IntersectionObserver(entries => {
  const [event] = entries;
  const { isIntersecting, target } = event;
  if (isIntersecting) {
    handleLoadMore();
    observer.unobserve(target);
  }
}, observerOptions);

const observe = () => {
  const elements = refs.gallery;
  const lastItem = elements.children[elements.children.length - 1];
  observer.observe(lastItem);
};

const scrollToElement = () => {
  const elements = refs.gallery.querySelectorAll('.photo-card');
  const to = PER_PAGE * (currentPage - 1);
  elements[to].scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const handleAutoloading = event => {
  const elements = refs.gallery;
  const lastItem = elements.children[elements.children.length - 1];
  if (elements.children.length) {
    if (event.target.checked) {
      observer.observe(lastItem);
    } else {
      renderLoadButton(elements.children);
      observer.unobserve(lastItem);
    }
  }
};

const handleImageClick = event => {
  if (currentImages.length) {
    if (event.target.nodeName === 'IMG') {
      const urlToLargeImage = event.target.dataset.large;
      const lightbox = basicLightbox.create(`
        <img src="${urlToLargeImage}" alt="" />
      `);
      lightbox.show();
    }
  }
};

const renderImages = images => {
  refs.gallery.innerHTML = images.map(cardTemplate).join('');
  if (refs.autoloading.checked) {
    observe();
  }
  if (currentPage > 1 && !refs.autoloading.checked) {
    scrollToElement();
  }
};

function renderLoadButton(images) {
  if (refs.autoloading.checked) {
    refs.loadWrapper.classList.remove('visible');
    return;
  }
  if (images.length) {
    refs.loadWrapper.classList.add('visible');
  } else {
    refs.loadWrapper.classList.remove('visible');
  }
}

function getImages() {
  if (currentQuery.length) {
    fetchImages({ page: currentPage, q: currentQuery }).then(response => {
      const { hits: images } = response;
      if (!currentImages.length && !images.length ) {
        error({
            text: 'Enter the correct text!'
        })
        return;
      }
      currentImages.push(...images);
      renderLoadButton(images);
      renderImages(currentImages);
    
    });
  }
}

const resetData = () => {
  currentImages = [];
  currentPage = 1;
};

const submitHandler = event => {
  event.preventDefault();
  resetData();
  const { target } = event;
  const [input] = target;
  currentQuery = input.value;
  getImages();
};

refs.form.addEventListener('submit', submitHandler);
refs.loadButton.addEventListener('click', handleLoadMore);
refs.gallery.addEventListener('click', handleImageClick);
refs.autoloading.addEventListener('change', handleAutoloading);
