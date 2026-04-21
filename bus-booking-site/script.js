const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });
}

const bookingForm = document.querySelector("#bookingForm");
const bookingSummary = document.querySelector("#bookingSummary");

if (bookingForm && bookingSummary) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const route = document.querySelector("#route").value;
    const date = document.querySelector("#date").value;
    const seats = document.querySelector("#seats").value;

    bookingSummary.innerHTML = `
      <p><strong>Passenger:</strong> ${name || "Not provided"}</p>
      <p><strong>Route:</strong> ${route || "Not selected"}</p>
      <p><strong>Date:</strong> ${date || "Not selected"}</p>
      <p><strong>Seats:</strong> ${seats}</p>
      <ul>
        <li>Estimated fare will depend on route and seat type.</li>
        <li>Please arrive at the boarding point 15 minutes early.</li>
      </ul>
    `;
  });
}
