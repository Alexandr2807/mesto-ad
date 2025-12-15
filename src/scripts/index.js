import { initialCards } from "./cards.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileTitle.textContent = profileTitleInput.value;
  profileDescription.textContent = profileDescriptionInput.value;
  closeModalWindow(profileFormModalWindow);
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
  closeModalWindow(avatarFormModalWindow);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  placesWrap.prepend(
    createCardElement(
      {
        name: cardNameInput.value,
        link: cardLinkInput.value,
      },
      {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: deleteCard,
      }
    )
  );

  closeModalWindow(cardFormModalWindow);
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

document.addEventListener('DOMContentLoaded', function() {
  // Находим формы на странице
  const forms = document.querySelectorAll('.popup__form');
  
  // для валидации профиля
  const editForm = document.forms['edit-profile'];
  const nameInput = document.getElementById('user-name');
  const descriptionInput = document.getElementById('user-description');
  const submitEditButton = editForm.querySelector('.popup__button');
  const nameError  = document.getElementById('user-name-error');
  const descError = document.getElementById('user-description-error');
  
  // для валидации создания места
  const newPlaceForm = document.forms['new-place'];
  const placeName = document.getElementById('place-name');
  const placeLink = document.getElementById('place-link');
  const makeNewPlaceButton = newPlaceForm.querySelector('.popup__button');
  const placeNameError = document.getElementById('place-name-error');
  const placeLinkError = document.getElementById('place-link-error');

  // для валидации автара
  const newAvatarForm = document.forms['edit-avatar'];
  const avatarLink = document.getElementById('user-avatar');
  const newAvatarButton = newAvatarForm.querySelector('.popup__button');
  const avatarLinkError = document.getElementById('user-avatar-error');

  function validateAvatarForm() {
    let isAvatarLinkValid = true;

    const avatarLinkValue = avatarLink.value.trim();

    avatarLinkError.textContent = '';
    avatarLinkError.classList.remove('popup__error_visible');

    if (avatarLinkValue === '') {
      placeLinkError.textContent = 'Это поле обязательно для заполнения';
      placeLinkError.classList.add('popup__error_visible');
      isAvatarLinkValid = false;
    } else if (!isValidUrl(avatarLinkValue)) {
      placeLinkError.textContent = 'Введите корректную ссылку';
      placeLinkError.classList.add('popup__error_visible');
      isAvatarLinkValid = false;
    }

    newAvatarButton.disabled = !isAvatarLinkValid;
    newAvatarButton.classList.toggle('popup__button_disabled', !isAvatarLinkValid);
    
    return isAvatarLinkValid;
  }
  
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
  
  const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
  
  function validateProfileForm() {
    let isNameValid = true;
    let isDescValid = true;

    // валидация имени
    const nameValue = nameInput.value.trim();
    
    // сбрасываем ошибку
    nameError.textContent = '';
    nameError.classList.remove('popup__error_visible');
    
    // проверка имени
    if (nameValue === '') {
      nameError.textContent = 'Это поле обязательно для заполнения';
      nameError.classList.add('popup__error_visible');
      isNameValid = false;
    } else if (nameValue.length < 2) {
      nameError.textContent = 'Минимальная длина 2 символа';
      nameError.classList.add('popup__error_visible');
      isNameValid = false;
    } else if (nameValue.length > 40) {
      nameError.textContent = 'Максимальная длина 40 символов';
      nameError.classList.add('popup__error_visible');
      isNameValid = false;
    } else if (!nameRegex.test(nameValue)) {
      // кастомное сообщение из data-error-message
      const customMessage = nameInput.getAttribute('data-error-message');
      nameError.classList.add('popup__error_visible');
      nameError.textContent = customMessage || 
        'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы';
      isNameValid = false;
    }
    
    // валидация описания
    const descValue = descriptionInput.value.trim();
    
    // сбрасываем ошибку
    descError.textContent = '';
    descError.classList.remove('popup__error_visible');
    
    // проверка описания
    if (descValue === '') {
      descError.textContent = 'Это поле обязательно для заполнения';
      descError.classList.add('popup__error_visible');
      isDescValid = false;
    } else if (descValue.length < 2) {
      descError.textContent = 'Минимальная длина 2 символа';
      descError.classList.add('popup__error_visible');
      isDescValid = false;
    } else if (descValue.length > 200) {
      descError.textContent = 'Максимальная длина 200 символов';
      descError.classList.add('popup__error_visible');
      isDescValid = false;
    }
    
    // общая валидность
    const isProfileFormValid = isNameValid && isDescValid;
    
    // кнопку редактируем
    submitEditButton.disabled = !isFormValid;
    submitEditButton.classList.toggle('popup__button_disabled', !isFormValid);
    
    return isProfileFormValid;
  }

  function validatePlaceForm() {
    let isPlaceNameValid = true;
    let isPlaceLinkValid = true;

    const placeNameText = placeName.value.trim();

    placeNameError.textContent = '';
    placeNameError.classList.remove('popup__error_visible');

    if (placeNameText === '') {
      placeNameError.textContent = 'Это поле обязательно для заполнения';
      placeNameError.classList.add('popup__error_visible');
      isPlaceNameValid = false;
    } else if (placeNameText.length < 2) {
      placeNameError.textContent = 'Минимальная длина 2 символа';
      placeNameError.classList.add('popup__error_visible');
      isPlaceNameValid = false;
    } else if (placeNameText.length > 30) {
      placeNameError.textContent = 'Максимальная длина 30 символов';
      placeNameError.classList.add('popup__error_visible');
      isPlaceNameValid = false;
    } else if (!nameRegex.test(placeNameText)) {
      const customMessagePlace = placeName.getAttribute('data-error-message');
      placeNameError.classList.add('popup__error_visible');
      placeNameError.textContent = customMessagePlace || 
        'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы';
      isPlaceNameValid = false;
    }

    const placeLinkText = placeLink.value.trim();

    placeLinkError.textContent = '';
    placeLinkError.classList.remove('popup__error_visible');

    if (placeLinkText === '') {
      placeLinkError.textContent = 'Это поле обязательно для заполнения';
      placeLinkError.classList.add('popup__error_visible');
      isPlaceLinkValid = false;
    } else if (!isValidUrl(placeLinkText)) {
      placeLinkError.textContent = 'Введите корректную ссылку';
      placeLinkError.classList.add('popup__error_visible');
      isPlaceLinkValid = false;
    }

    const isPlaceValid = isPlaceNameValid && isPlaceLinkValid;

    makeNewPlaceButton.disabled = !isPlaceValid;
    makeNewPlaceButton.classList.toggle('popup__button_disabled', !isPlaceValid);

    return isPlaceValid;
  } 

  forms.forEach(form => {
    // отключаем браузерную валидацию
    form.setAttribute('novalidate', true);
    
    const submitButton = form.querySelector('.popup__button');
    
    if (submitButton) {
      submitButton.classList.add('popup__button_disabled');
      submitButton.disabled = true;
    }
  });

  nameInput.addEventListener('input', validateProfileForm);
  descriptionInput.addEventListener('input', validateProfileForm);

  placeName.addEventListener('input', validatePlaceForm);
  placeLink.addEventListener('input', validatePlaceForm);

  avatarLink.addEventListener('input', validateAvatarForm);

  validateProfileForm();
  validatePlaceForm();
  validateAvatarForm();
});

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});



// отображение карточек
initialCards.forEach((data) => {
  placesWrap.append(
    createCardElement(data, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
    })
  );
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});