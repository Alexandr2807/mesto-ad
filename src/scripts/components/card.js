export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  // Заполняем данные
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  // Обновляем счётчик лайков (если элемент есть)
  if (likeCountElement) {
    likeCountElement.textContent = data.likes.length;
  }

  // Устанавливаем состояние лайка
  if (data.likes.some(like => like._id === currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Скрываем кнопку удаления, если карточка не моя
  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  }

  // Обработчики событий
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({ name: data.name, link: data.link });
    });
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
      onLikeIcon(data._id, isCurrentlyLiked, likeButton, likeCountElement);
    });
  }

  if (onDeleteCard && deleteButton) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  if (onInfoClick && infoButton) {
    infoButton.addEventListener("click", () => {
      onInfoClick(data._id);
    });
  }

  return cardElement;
};