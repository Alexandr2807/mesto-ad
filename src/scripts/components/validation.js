// Валидация формы
function showInputError(formElement, inputElement, errorMessage, config) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  
  if (errorElement) {
    inputElement.classList.add(config.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
  }
}

function hideInputError(formElement, inputElement, config) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  
  if (errorElement) {
    inputElement.classList.remove(config.inputErrorClass);
    errorElement.textContent = '';
    errorElement.classList.remove(config.errorClass);
  }
}

function checkInputValidity(formElement, inputElement, config) {
  const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
  
  // Проверяем если поле пустое (обязательное)
  if (inputElement.hasAttribute('required') && !inputElement.value.trim()) {
    showInputError(formElement, inputElement, 'Это поле обязательно для заполнения', config);
    return false;
  }
  
  // Проверка минимальной длины
  if (inputElement.hasAttribute('minlength')) {
    const minLength = parseInt(inputElement.getAttribute('minlength'));
    if (inputElement.value.length < minLength && inputElement.value.length > 0) {
      showInputError(formElement, inputElement, `Минимальная длина: ${minLength} символа`, config);
      return false;
    }
  }
  
  // Проверка максимальной длины
  if (inputElement.hasAttribute('maxlength')) {
    const maxLength = parseInt(inputElement.getAttribute('maxlength'));
    if (inputElement.value.length > maxLength) {
      showInputError(formElement, inputElement, `Максимальная длина: ${maxLength} символов`, config);
      return false;
    }
  }
  
  // Проверка для URL полей
  if (inputElement.type === 'url' && inputElement.value.trim() !== '') {
    try {
      new URL(inputElement.value);
    } catch (_) {
      showInputError(formElement, inputElement, 'Введите корректный URL', config);
      return false;
    }
  }
  
  // Кастомная проверка для имени (регулярное выражение)
  if ((inputElement.classList.contains('popup__input_type_name') || 
       inputElement.classList.contains('popup__input_type_card-name')) &&
      inputElement.value.trim() !== '') {
    
    if (!nameRegex.test(inputElement.value)) {
      const errorMessage = inputElement.getAttribute('data-error-message') || 
                          'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы';
      showInputError(formElement, inputElement, errorMessage, config);
      return false;
    }
  }
  
  // Все проверки пройдены
  hideInputError(formElement, inputElement, config);
  return true;
}

function hasInvalidInput(inputList, formElement, config) {
  return inputList.some((inputElement) => {
    return !checkInputValidity(formElement, inputElement, config, false);
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
  if (hasInvalidInput(inputList, formElement, config)) {
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
  
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, formElement, config);
    });
    
    // Также проверяем при потере фокуса
    inputElement.addEventListener('blur', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, formElement, config);
    });
  });
}

function clearValidation(formElement, config) {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
  });
  
  disableSubmitButton(buttonElement, config);
}

function enableValidation(config) {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  
  formList.forEach((formElement) => {
    // Отключаем браузерную валидацию
    formElement.setAttribute('novalidate', true);
    
    // Добавляем обработчик submit
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });
    
    setEventListeners(formElement, config);
  });
}

export { enableValidation, clearValidation };