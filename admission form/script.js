const categorySelect = document.querySelector("#categorySelect");
const reservedCategoryNameField = document.querySelector("#reservedCategoryNameField");
const reservedCategoryCertificateField = document.querySelector("#reservedCategoryCertificateField");
const transportAreaField = document.querySelector("#transportAreaField");
const transportInputs = document.querySelectorAll('input[name="transportation"]');
const qualificationRows = document.querySelector("#qualificationRows");
const qualificationRowTemplate = document.querySelector("#qualificationRowTemplate");
const addQualificationRowButton = document.querySelector("#addQualificationRow");
const studentDetailsForm = document.querySelector("#studentDetailsForm");
const paymentProofForm = document.querySelector("#paymentProofForm");
const studentStatus = document.querySelector("#studentStatus");
const paymentStatus = document.querySelector("#paymentStatus");

function getFieldLabel(wrapper, input) {
  if (wrapper?.dataset.fieldLabel) {
    return wrapper.dataset.fieldLabel;
  }

  if (input?.name) {
    return input.name.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
  }

  return "This field";
}

function getFieldWrapper(input) {
  return input.closest(".field, .choice-field, .consent-card");
}

function getErrorNode(wrapper) {
  return wrapper?.querySelector(".field-error") || null;
}

function setWrapperState(wrapper, state) {
  if (!wrapper) {
    return;
  }

  wrapper.classList.remove("is-valid", "is-invalid");

  if (state) {
    wrapper.classList.add(state);
  }
}

function setFieldError(wrapper, message = "") {
  const errorNode = getErrorNode(wrapper);
  if (errorNode) {
    errorNode.textContent = message;
  }
}

function validateFileInput(input) {
  if (!input.files || input.files.length === 0) {
    input.setCustomValidity("");
    return true;
  }

  const [file] = input.files;
  const maxSize = Number(input.dataset.maxSize || 0);

  if (maxSize && file.size > maxSize) {
    input.setCustomValidity("Selected file exceeds the allowed size of 2 MB.");
    return false;
  }

  input.setCustomValidity("");
  return true;
}

function validateSingleInput(input) {
  const wrapper = getFieldWrapper(input);
  const label = getFieldLabel(wrapper, input);

  if (input.type === "file") {
    validateFileInput(input);
  }

  if (!input.checkValidity()) {
    let message = `${label} is required.`;

    if (input.validity.valueMissing) {
      message = `${label} is required.`;
    } else if (input.validity.typeMismatch && input.type === "email") {
      message = "Please enter a valid email address.";
    } else if (input.validity.patternMismatch && input.name === "dateOfBirth") {
      message = "Use the Date of Birth format dd/mm/yyyy.";
    } else if (input.validity.patternMismatch && input.name === "dateOfPayment") {
      message = "Use the Date of Payment format dd-mm-yyyy.";
    } else if (input.validationMessage) {
      message = input.validationMessage;
    }

    setWrapperState(wrapper, "is-invalid");
    setFieldError(wrapper, message);
    return false;
  }

  setWrapperState(wrapper, input.required || input.value ? "is-valid" : "");
  setFieldError(wrapper, "");
  return true;
}

function validateRadioGroup(name, form) {
  const inputs = form.querySelectorAll(`input[name="${name}"]`);
  const wrapper = inputs[0]?.closest(".choice-field");
  const label = getFieldLabel(wrapper, inputs[0]);
  const isChecked = Array.from(inputs).some((input) => input.checked);

  inputs.forEach((input) => {
    input.setCustomValidity(isChecked ? "" : `${label} is required.`);
  });

  if (!isChecked) {
    setWrapperState(wrapper, "is-invalid");
    setFieldError(wrapper, `${label} is required.`);
    return false;
  }

  setWrapperState(wrapper, "is-valid");
  setFieldError(wrapper, "");
  return true;
}

function validateConsent(form) {
  const consent = form.querySelector('input[name="consent"]');

  if (!consent) {
    return true;
  }

  const wrapper = consent.closest(".consent-card");

  if (!consent.checked) {
    consent.setCustomValidity("Consent is required.");
    setWrapperState(wrapper, "is-invalid");
    setFieldError(wrapper, "You must accept the declaration before submitting.");
    return false;
  }

  consent.setCustomValidity("");
  setWrapperState(wrapper, "is-valid");
  setFieldError(wrapper, "");
  return true;
}

function validateForm(form) {
  let isValid = true;

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    if (
      input.type === "radio" ||
      input.type === "checkbox" ||
      input.closest(".is-hidden")
    ) {
      return;
    }

    if (!validateSingleInput(input)) {
      isValid = false;
    }
  });

  const radioNames = new Set();
  form.querySelectorAll('input[type="radio"]').forEach((input) => {
    radioNames.add(input.name);
  });

  radioNames.forEach((name) => {
    if (!validateRadioGroup(name, form)) {
      isValid = false;
    }
  });

  if (!validateConsent(form)) {
    isValid = false;
  }

  return isValid;
}

function clearHiddenFieldState(field) {
  const input = field?.querySelector("input");
  if (!input) {
    return;
  }

  input.value = "";
  input.setCustomValidity("");
  setWrapperState(field, "");
  setFieldError(field, "");
}

function toggleField(field, shouldShow) {
  if (!field) {
    return;
  }

  field.classList.toggle("is-hidden", !shouldShow);

  const input = field.querySelector("input");
  if (!input) {
    return;
  }

  if (shouldShow) {
    input.setAttribute("required", "required");
  } else {
    input.removeAttribute("required");
    clearHiddenFieldState(field);
  }
}

function setConditionalVisibility() {
  const isReservedCategory = categorySelect && categorySelect.value === "Any other reserved category";
  const transportSelection = document.querySelector('input[name="transportation"]:checked');
  const requiresTransportArea = transportSelection && transportSelection.value === "Yes";

  toggleField(reservedCategoryNameField, isReservedCategory);
  toggleField(reservedCategoryCertificateField, isReservedCategory);
  toggleField(transportAreaField, requiresTransportArea);
}

function addQualificationRow() {
  if (!qualificationRows || !qualificationRowTemplate) {
    return;
  }

  const row = qualificationRowTemplate.content.firstElementChild.cloneNode(true);
  qualificationRows.appendChild(row);
  updateRemoveButtons();
}

function updateRemoveButtons() {
  const rows = qualificationRows ? qualificationRows.querySelectorAll("tr") : [];

  rows.forEach((row, index) => {
    const removeButton = row.querySelector("[data-remove-row]");
    if (!removeButton) {
      return;
    }

    removeButton.disabled = rows.length === 1;
    removeButton.style.opacity = rows.length === 1 ? "0.45" : "1";
    removeButton.setAttribute("aria-label", `Remove qualification row ${index + 1}`);
  });
}

function showStatus(target, message, isError = false) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.style.color = isError ? "#b53434" : "#246646";
}

function focusFirstError(form) {
  const invalidNode = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
  invalidNode?.focus();
}

function attachLiveValidation(form) {
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    if (input.type === "radio") {
      input.addEventListener("change", () => validateRadioGroup(input.name, form));
      return;
    }

    if (input.type === "checkbox") {
      input.addEventListener("change", () => validateConsent(form));
      return;
    }

    const validate = () => {
      if (input.closest(".is-hidden")) {
        return;
      }

      validateSingleInput(input);
    };

    input.addEventListener("blur", validate);
    input.addEventListener("input", validate);
    input.addEventListener("change", validate);
  });
}

function handlePrototypeSubmit(form, statusNode, successMessage) {
  attachLiveValidation(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formIsValid = validateForm(form);

    if (!formIsValid) {
      focusFirstError(form);
      showStatus(statusNode, "Please review the highlighted fields and correct the errors before submitting.", true);
      return;
    }

    showStatus(statusNode, successMessage);
  });
}

if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    setConditionalVisibility();
    validateSingleInput(categorySelect);
  });
}

transportInputs.forEach((input) => {
  input.addEventListener("change", () => {
    setConditionalVisibility();
    validateRadioGroup("transportation", studentDetailsForm);
  });
});

if (addQualificationRowButton) {
  addQualificationRowButton.addEventListener("click", addQualificationRow);
}

if (qualificationRows) {
  qualificationRows.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("[data-remove-row]")) {
      return;
    }

    const row = target.closest("tr");
    if (!row || qualificationRows.children.length === 1) {
      return;
    }

    row.remove();
    updateRemoveButtons();
  });
}

addQualificationRow();
setConditionalVisibility();

if (studentDetailsForm) {
  handlePrototypeSubmit(
    studentDetailsForm,
    studentStatus,
    "Student details validated successfully. Step 2 is to submit fees using the official AVJAIN bank account details, then proceed with the payment proof section below."
  );
}

if (paymentProofForm) {
  handlePrototypeSubmit(
    paymentProofForm,
    paymentStatus,
    "Receipt details validated successfully. The redesigned payment proof step is ready for final submission flow integration."
  );
}
