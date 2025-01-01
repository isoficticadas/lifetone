document.addEventListener("DOMContentLoaded", function () {
  // Mostrar el popup al hacer clic en el botón .feedback
  const feedbackButton = document.querySelector(".feedback");
  const popupWindow = document.querySelector(".popup-window");
  const closePopupButton = document.querySelector(".close-popup");
  if (feedbackButton && popupWindow) {
    feedbackButton.addEventListener("click", () => {
      popupWindow.style.display = "block";
    });
  }
  // Cerrar el popup al hacer clic en .close-popup
  if (closePopupButton && popupWindow) {
    closePopupButton.addEventListener("click", () => {
      popupWindow.style.display = "none";
    });
  } // Cerrar popup con tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popupWindow.classList.contains("active")) {
      closePopupHandler();
    }
  });
  feedbackButton.forEach((button) => {
    button.addEventListener("click", () => {
      if (popupWindow) {
        popupWindow.style.display = "block";
      }
    });
  });
  closePopupButton.forEach((button) => {
    button.addEventListener("click", () => {
      if (popupWindow) {
        popupWindow.style.display = "none";
      }
    });
  });
  function validateForm(form) {
    const nameInput = form.querySelector('input[name="name"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    const namePattern = /^[A-Za-z\s]+$/;
    const phonePattern = /^\+593\d{9}$/;
    if (!nameInput.value.trim() || !namePattern.test(nameInput.value.trim())) {
      alert(
        "Por favor, ingrese un nombre válido. Solo se permiten letras y espacios."
      );
      nameInput.focus();
      return false;
    }
    if (!phonePattern.test(phoneInput.value.trim())) {
      alert(
        "Por favor, ingrese un número de teléfono válido. Ejemplo: +593933543342"
      );
      phoneInput.focus();
      return false;
    }
    return true;
  }
  function handleFormSubmit(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateForm(form)) {
        return;
      }
      const name = form.querySelector('input[name="name"]').value.trim();
      const phone = form.querySelector('input[name="phone"]').value.trim();
      fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      }).catch((error) => {
        console.error(error);
        alert("Error al enviar los datos. Por favor, inténtelo de nuevo.");
      });
    });
  }
  handleFormSubmit("dataForm");
  handleFormSubmit("dataForm2");
  handleFormSubmit("dataForm3");
});
