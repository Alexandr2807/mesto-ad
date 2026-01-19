import {getCardList, getUserInfo, setUserInfo, updateAvatar, addNewCard, deleteCardFromServer, changeLikeCardStatus} from './components/api.js';
import {createCardElement} from "./components/card.js";
import {openModalWindow, closeModalWindow, setCloseModalWindowEventListeners} from "./components/modal.js";
import {enableValidation, clearValidation} from "./components/validation.js";

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

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

let currentUserId = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.querySelector("#popup-info-definition-template");
  const infoItem = template.content.querySelector(".popup__info-item").cloneNode(true);
  
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  
  return infoItem;
};

const createUserPreview = (user) => {
  const template = document.querySelector("#popup-info-user-preview-template");
  const userItem = template.content.querySelector(".popup__list-item").cloneNode(true);
  
  userItem.textContent = user.name;
  userItem.title = `${user.name} (${user.about})`;
  
  return userItem;
};

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible"
};

enableValidation(validationSettings);

const handleLikeIcon = (cardId, isCurrentlyLiked, likeButton, likeCountElement) => {
  changeLikeCardStatus(cardId, isCurrentlyLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      
      if (likeCountElement) {
        likeCountElement.textContent = updatedCard.likes.length;
      }
      console.log('Лайк обновлен:', updatedCard);
    })
    .catch((err) => {
      console.log('Ошибка при изменении лайка:', err);
      likeButton.classList.toggle("card__like-button_is-active");
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  
  if (deleteButton) {
    const originalContent = deleteButton.innerHTML;
    
    deleteButton.style.opacity = '0.5';
    deleteButton.disabled = true;
    
    deleteCardFromServer(cardId)
      .then(() => {
        cardElement.remove();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        deleteButton.style.opacity = '1';
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalContent;
      });
  } else {
    deleteCardFromServer(cardId)
      .then(() => {
        cardElement.remove();
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalButtonText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalButtonText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  
  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const submitButton = evt.target.querySelector('.popup__button');
  const originalButtonText = submitButton.textContent;
  
  submitButton.textContent = 'Создание...';
  
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          currentUserId,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeIcon,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
          }
        )
      );
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
    });
};

const handleInfoClick = (cardId) => {
  cardInfoModalInfoList.innerHTML = '';
  cardInfoModalUserList.innerHTML = '';
  
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) {
        console.error('Карточка не найдена');
        return;
      }
      
      cardInfoModalTitle.textContent = cardData.name;
      
      cardInfoModalInfoList.append(
        createInfoString("ID карточки:", cardData._id)
      );
      
      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Автор:", cardData.owner.name)
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Об авторе:", cardData.owner.about)
      );
      
      cardInfoModalInfoList.append(
        createInfoString("Группа:", cardData.owner.cohort)
      );
      
      if (cardData.likes.length > 0) {
        cardInfoModalText.textContent = `Лайки (${cardData.likes.length}):`;
        
        cardData.likes.forEach(user => {
          cardInfoModalUserList.append(createUserPreview(user));
        });
      } else {
        cardInfoModalText.textContent = "Пока нет лайков";
      }
      
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при получении данных карточки:', err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
  clearValidation(profileForm, validationSettings);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
  clearValidation(avatarForm, validationSettings);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
  clearValidation(cardForm, validationSettings);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    currentUserId = userData._id;
    
    placesWrap.innerHTML = '';
    
    cards.forEach((cardData) => {
      const cardElement = createCardElement(
        cardData,
        currentUserId,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeIcon,
          onDeleteCard: handleDeleteCard,
          onInfoClick: handleInfoClick,
        }
      );
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });