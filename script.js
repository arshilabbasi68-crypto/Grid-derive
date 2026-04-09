const yearNode = document.getElementById("year");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const studyCards = document.querySelectorAll(".project-study");

studyCards.forEach((card) => {
  const toggle = card.querySelector(".study-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isActive = card.classList.toggle("active");
    toggle.setAttribute("aria-expanded", String(isActive));
  });
});

// Paste your deployed Google Apps Script Web App URL here.
const FORM_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbz0wh7Q_NnvujjH_dBlSBBl0jk6-vTKuVnSAlBwHDK7a0HxfWALTAOxFgO8bV5dtu4p7Q/exec";

const consultationForm = document.getElementById("consultation-form");
const formMessage = document.getElementById("form-message");
const thankyouModal = document.getElementById("thankyou-modal");
const thankyouClose = document.getElementById("thankyou-close");

function openThankyouModal() {
  if (!thankyouModal) return;
  thankyouModal.classList.add("open");
  thankyouModal.setAttribute("aria-hidden", "false");
}

function closeThankyouModal() {
  if (!thankyouModal) return;
  thankyouModal.classList.remove("open");
  thankyouModal.setAttribute("aria-hidden", "true");
}

if (thankyouClose) {
  thankyouClose.addEventListener("click", closeThankyouModal);
}

if (thankyouModal) {
  thankyouModal.addEventListener("click", (event) => {
    if (event.target === thankyouModal) {
      closeThankyouModal();
    }
  });
}

if (consultationForm && formMessage) {
  consultationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = consultationForm.querySelector('button[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) return;

    // Basic honeypot spam protection.
    const honeypot = consultationForm.querySelector('input[name="website"]');
    if (honeypot instanceof HTMLInputElement && honeypot.value.trim() !== "") {
      return;
    }

    if (FORM_WEBHOOK_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
      formMessage.textContent =
        "Setup pending: add your Apps Script URL in script.js to activate submissions.";
      formMessage.dataset.state = "error";
      return;
    }

    const formData = new FormData(consultationForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      businessName: String(formData.get("businessName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      source: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    submitButton.disabled = true;
    formMessage.textContent = "Sending...";
    formMessage.dataset.state = "loading";

    try {
      const isLocalFile = window.location.protocol === "file:";
      const response = await fetch(FORM_WEBHOOK_URL, {
        method: "POST",
        // Apps Script + file:// previews can fail CORS checks.
        // no-cors sends the request without blocking the browser.
        mode: isLocalFile ? "no-cors" : "cors",
        body: JSON.stringify(payload),
      });

      if (!isLocalFile && !response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      consultationForm.reset();
      formMessage.textContent = "Thanks! We received your inquiry.";
      formMessage.dataset.state = "success";
      openThankyouModal();
    } catch (error) {
      formMessage.textContent =
        "Could not submit right now. Please try again in a minute.";
      formMessage.dataset.state = "error";
    } finally {
      submitButton.disabled = false;
    }
  });
}
