import refs from '../js/refs';
import { movieService } from './movie-service';
import templeteCard from './card-templete';
import { localStorageKeys } from './localStorage';
import { activateHeadersBtn, checkQuantityStorage } from './myLibraryBtns';

import { renderCollection } from './render-movies';

export const pagination = refs.paginationList;
export const root = refs.paginationWrapper;

export function renderPagination(totalPages, currentPage) {
  let liItem = '';
  let beforePages = currentPage - 2;
  let nextPages = currentPage + 2;
  let currentLiItem;
  if (totalPages <= 1) removePagination();
  else showPagination();

  if (currentPage > 1) {
    liItem += `<li>
    <button class="pagination__button" data-page="${currentPage - 1}"><</button>
  </li>`;
  }

  if (currentPage > 3) {
    liItem += `<li>
    <button class="pagination__button pagination__button--js" data-page="1">1</button>
  </li>`;
  }

  if (currentPage > 4) {
    liItem += `<li class="pagination__dots">...</li>`;
  }

  for (
    let buttonsQuantity = beforePages;
    buttonsQuantity <= nextPages;
    buttonsQuantity++
  ) {
    if (buttonsQuantity <= 0) {
      continue;
    }

    if (buttonsQuantity > totalPages) {
      break;
    }

    if (buttonsQuantity === currentPage) {
      currentLiItem = 'pagination__button--current';
    } else {
      currentLiItem = '';
    }
    liItem += `<li>
    <button class="pagination__button ${currentLiItem} pagination__button--js" data-page="${buttonsQuantity}">${buttonsQuantity}</button>
  </li>`;
  }

  if (currentPage < totalPages - 3) {
    liItem += `<li class="pagination__dots">...</li>`;
  }

  if (currentPage < totalPages - 2) {
    liItem += `<li>
    <button class="pagination__button pagination__button--js" data-page="${totalPages}">${totalPages}</button>
  </li>`;
  }

  if (currentPage < totalPages) {
    liItem += `<li>
    <button class="pagination__button" data-page="${
      currentPage + 1
    }">></i></button>
  </li>`;
  }
  pagination.innerHTML = liItem;

  pagination.addEventListener('click', onPaginationBtnClick);
}

export async function onPaginationBtnClick(event) {
  const pageInUse = document.querySelector('.side-nav__link--current').dataset
    .id;
  const filterPageinUse = document.querySelector(
    '.movies-filter__button--current'
  ).dataset.id;

  if (!event.target.dataset.page) return;
  const page = +event.target.dataset.page;
  refs.moviesCard.innerHTML = '';

  if (pageInUse === 'home' && filterPageinUse === 'popular') {
    const data = await movieService.getSearchQuery(movieService.query, page);
    renderPagination(movieService.totalPage, page);
    renderCollection(data.results);
  } else if (pageInUse === 'home' && filterPageinUse === 'rating') {
    const data = await movieService.getTopRated(page);
    renderPagination(movieService.totalPage, page);
    renderCollection(data.results);
  } else if (pageInUse === 'home' && filterPageinUse === 'future') {
    const data = await movieService.getUpcoming(page);
    renderPagination(movieService.totalPage, page);
    renderCollection(data.results);
  } else if (pageInUse === 'library') {
    const activeBtn = document.querySelector('.library__button--active');
    const value =
      activeBtn.dataset.id === 'watchedBtn'
        ? localStorageKeys.watchedFilm
        : localStorageKeys.filmInQueue;

    const localData = JSON.parse(localStorage.getItem(value));

    if (checkQuantityStorage(localData)) {
      removePagination();
      return;
    }
    const totalPages = Math.ceil(localData.length / 20);
    renderPagination(totalPages, page);
    // if (localData.length === 0) {
    // }
    let arrToRender = localData.slice((page - 1) * 20, page * 20);
    if (arrToRender.length === 0) {
      arrToRender = localData.slice((page - 2) * 20, (page - 1) * 20);
    }
    renderCollection(arrToRender);
    // refs.moviesCard.innerHTML = arrToRender
    //   .map(data => templeteCard(data))
    //   .join('');
  }
}

export function removePagination() {
  pagination.innerHTML = '';
  root.classList.add('visually-hidden');
  pagination.classList.add('visually-hidden');
}

export function showPagination() {
  root.classList.remove('visually-hidden');
  pagination.classList.remove('visually-hidden');
}

//                                Show home page

export async function fetchPopularMovies() {
  refs.moviesCard.innerHTML = '';
  let data = await movieService.getSearchQuery(
    movieService.query,
    movieService.page
  );

  if (data.total_pages === 1) {
    pagination.innerHTML = '';
    return;
  }

  renderCollection(data.results);

  renderPagination(movieService.totalPage, movieService.page);
}
