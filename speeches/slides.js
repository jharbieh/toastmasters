(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevBtn = document.querySelector("[data-action='prev']");
  const nextBtn = document.querySelector("[data-action='next']");
  const progressBar = document.querySelector(".progress[role='progressbar']");
  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");

  if (!slides.length) {
    return;
  }

  const maxIndex = slides.length - 1;
  let index = getIndexFromHash();

  function getIndexFromHash() {
    const hash = window.location.hash.replace("#slide-", "");
    const value = Number.parseInt(hash, 10);
    if (Number.isNaN(value)) {
      return 0;
    }
    return Math.min(Math.max(value - 1, 0), maxIndex);
  }

  function goTo(nextIndex) {
    index = Math.min(Math.max(nextIndex, 0), maxIndex);

    slides.forEach((slide, idx) => {
      const isActive = idx === index;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    if (prevBtn) {
      prevBtn.disabled = index === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = index === maxIndex;
    }

    const progress = ((index + 1) / slides.length) * 100;
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    if (progressBar) {
      progressBar.setAttribute("aria-valuemax", String(slides.length));
      progressBar.setAttribute("aria-valuenow", String(index + 1));
    }
    if (progressText) {
      progressText.textContent = `Slide ${index + 1}/${slides.length}`;
    }

    window.location.hash = `slide-${index + 1}`;
  }

  function onKeydown(event) {
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) {
      event.preventDefault();
      goTo(index + 1);
      return;
    }

    if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => goTo(index - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => goTo(index + 1));
  }

  window.addEventListener("keydown", onKeydown);
  window.addEventListener("hashchange", () => goTo(getIndexFromHash()));

  goTo(index);
})();
