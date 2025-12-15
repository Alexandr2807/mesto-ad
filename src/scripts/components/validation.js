// Валидация формы
function showInputError(formElement, inputElement, errorMessage, config) {
  // Находим элемент ошибки по id поля + "-error"
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  if (errorElement) {
    // Добавляем класс ошибки к полю ввода
    inputElement.classList.add(config.inputErrorClass);
    // Устанавливаем текст ошибки
    errorElement.textContent = errorMessage;
    // Делаем ошибку видимой
    errorElement.classList.add(config.errorClass);
  }
}

function hideInputError(formElement, inputElement, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  if (errorElement) {
    inputElement.classList.remove(config.inputErrorClass);
    errorElement.textContent = '';
    errorElement.classList.remove(config.errorClass);
  }
}

function checkInputValidity(formElement, inputElement, config) {
  const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
  let isValid = true;
  let errorMessage = '';
  
  // Проверяем если поле пустое (обязательное)
  if (inputElement.hasAttribute('required') && !inputElement.value.trim()) {
    errorMessage = 'Это поле обязательно для заполнения';
    isValid = false;
  }
  // Проверка минимальной длины
  else if (inputElement.hasAttribute('minlength')) {
    const minLength = parseInt(inputElement.getAttribute('minlength'));
    if (inputElement.value.length < minLength && inputElement.value.length > 0) {
      errorMessage = `Минимальная длина: ${minLength} символа`;
      isValid = false;
    }
  }
  // Проверка максимальной длины
  else if (inputElement.hasAttribute('maxlength')) {
    const maxLength = parseInt(inputElement.getAttribute('maxlength'));
    if (inputElement.value.length > maxLength) {
      errorMessage = `Максимальная длина: ${maxLength} символов`;
      isValid = false;
    }
  }
  // Проверка для URL полей
  else if ((inputElement.type === 'url' || 
           inputElement.classList.contains('popup__input_type_url') ||
           inputElement.classList.contains('popup__input_type_avatar')) && 
           inputElement.value.trim() !== '') {
    try {
      new URL(inputElement.value);
    } catch (_) {
      errorMessage = 'Введите корректный URL';
      isValid = false;
    }
  }
  // Кастомная проверка для имени (регулярное выражение)
  else if ((inputElement.classList.contains('popup__input_type_name') || 
           inputElement.classList.contains('popup__input_type_card-name')) &&
           inputElement.value.trim() !== '') {
    
    if (!nameRegex.test(inputElement.value)) {
      errorMessage = inputElement.getAttribute('data-error-message') || 
                    'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы';
      isValid = false;
    }
  }
  
  // Показываем или скрываем ошибку
  if (!isValid) {
    showInputError(formElement, inputElement, errorMessage, config);
  } else {
    hideInputError(formElement, inputElement, config);
  }
  
  return isValid;
}

function hasInvalidInput(inputList, formElement, config) {
  return inputList.some((inputElement) => {
    return !checkInputValidity(formElement, inputElement, config, true);
  });
}

function disableSubmitButton(buttonElement, config) {
  if (buttonElement) {
    buttonElement.classList.add(config.inactiveButtonClass);
    buttonElement.disabled = true;
  }
}

function enableSubmitButton(buttonElement, config) {
  if (buttonElement) {
    buttonElement.classList.remove(config.inactiveButtonClass);
    buttonElement.disabled = false;
  }
}

function toggleButtonState(inputList, buttonElement, formElement, config) {
  // Проверяем все поля
  const isFormValid = !hasInvalidInput(inputList, formElement, config);
  
  if (!isFormValid) {
    disableSubmitButton(buttonElement, config);
  } else {
    enableSubmitButton(buttonElement, config);
  }
}

// Функция для добавления атрибутов полям ввода
function setupInputAttributes(formElement) {
  const inputs = formElement.querySelectorAll('input');
  
  inputs.forEach(input => {
    // Определяем тип поля и устанавливаем соответствующие атрибуты
    if (input.classList.contains('popup__input_type_name')) {
      // Поле имени профиля
      input.setAttribute('required', 'true');
      input.setAttribute('minlength', '2');
      input.setAttribute('maxlength', '40');
      if (!input.hasAttribute('data-error-message')) {
        input.setAttribute('data-error-message', 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы');
      }
    } 
    else if (input.classList.contains('popup__input_type_description')) {
      // Поле описания профиля
      input.setAttribute('required', 'true');
      input.setAttribute('minlength', '2');
      input.setAttribute('maxlength', '200');
    }
    else if (input.classList.contains('popup__input_type_card-name')) {
      // Поле названия карточки
      input.setAttribute('required', 'true');
      input.setAttribute('minlength', '2');
      input.setAttribute('maxlength', '30');
      if (!input.hasAttribute('data-error-message')) {
        input.setAttribute('data-error-message', 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы');
      }
    }
    else if (input.type === 'url' || input.classList.contains('popup__input_type_url') || 
             input.classList.contains('popup__input_type_avatar')) {
      // Поле URL (карточки и аватара)
      input.setAttribute('required', 'true');
    }
  });
}

function setEventListeners(formElement, config) {
  // Сначала настраиваем атрибуты полям
  setupInputAttributes(formElement);
  
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  // Блокируем кнопку при инициализации
  disableSubmitButton(buttonElement, config);
  
  // Проверяем все поля при загрузке
  inputList.forEach((inputElement) => {
    checkInputValidity(formElement, inputElement, config);
  });
  toggleButtonState(inputList, buttonElement, formElement, config);
  
  // Вешаем обработчики на ввод
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, formElement, config);
    });
  });
}

function clearValidation(formElement, config) {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  // Скрываем все ошибки
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
  });
  
  // Блокируем кнопку
  disableSubmitButton(buttonElement, config);
}

function enableValidation(config) {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  
  formList.forEach((formElement) => {
    // Отключаем браузерную валидацию
    formElement.setAttribute('novalidate', true);
    
    setEventListeners(formElement, config);
  });
}

export { enableValidation, clearValidation };