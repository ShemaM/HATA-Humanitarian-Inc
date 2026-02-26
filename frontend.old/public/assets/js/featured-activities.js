(function () {
  const root = document.getElementById("featured-activities");
  if (!root) return;

  const carousel = root.querySelector("[data-hata-carousel]");
  const viewport = root.querySelector("[data-carousel-viewport]");
  const status = root.querySelector("[data-featured-status]");

  if (!viewport) return;

  const placeholders = [
    {
      type: "Podcast",
      title: "Podcasts",
      description: "Featured podcast episodes will be displayed here as cards.",
      href: "/podcasts",
      isUpcoming: true,
    },
    {
      type: "Webinar",
      title: "Webinars",
      description: "Upcoming webinars will be displayed here as cards.",
      href: "/contact",
      isUpcoming: true,
    },
    {
      type: "Program Event",
      title: "Program events",
      description: "Workshops and community events will be displayed here as cards.",
      href: "/#programs",
      isUpcoming: true,
    },
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function badge(item) {
    if (item.isUpcoming) return '<span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-hata-blue">Upcoming</span>';
    return '<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Latest</span>';
  }

  function renderSlide(item) {
    const href = item.href || "#";
    const type = escapeHtml(item.type || "Activity");
    const title = escapeHtml(item.title || "");
    const where = escapeHtml(item.where || "");
    const date = escapeHtml(item.date || "");
    const description = escapeHtml(item.description || "");

    return `
      <div class="min-w-full snap-start" data-carousel-slide data-featured-slide>
        <div class="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-semibold text-hata-red">${type}</p>
            ${badge(item)}
          </div>
          <h3 class="mt-3 text-xl font-bold text-hata-blue">
            <a class="focus:outline-none" href="${href}">
              <span class="absolute inset-0 rounded-2xl" aria-hidden="true"></span>
              ${title}
            </a>
          </h3>
          <p class="mt-2 text-sm text-gray-600">${description}</p>
          <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            ${date ? `<span class="inline-flex items-center gap-2"><i class="fa-regular fa-calendar"></i><span>${date}</span></span>` : ""}
            ${where ? `<span class="inline-flex items-center gap-2"><i class="fa-solid fa-location-dot"></i><span>${where}</span></span>` : ""}
          </div>
          <p class="mt-5 text-sm font-semibold text-hata-blue underline decoration-transparent underline-offset-4 transition group-hover:decoration-hata-red">
            Learn more
          </p>
        </div>
      </div>
    `;
  }

  function clearDynamicSlides() {
    viewport.querySelectorAll("[data-featured-slide]").forEach((el) => el.remove());
  }

  function removeLoadingPlaceholder() {
    const loading = viewport.querySelector("[data-featured-slide-placeholder]");
    if (loading) loading.remove();
  }

  function refreshCarousel() {
    if (window.HATA && typeof window.HATA.refreshCarousel === "function") {
      window.HATA.refreshCarousel(carousel);
    }
  }

  function showPlaceholders() {
    clearDynamicSlides();
    removeLoadingPlaceholder();
    viewport.insertAdjacentHTML("beforeend", placeholders.map(renderSlide).join(""));
    if (status) status.textContent = "Featured events will be displayed here as cards.";
    refreshCarousel();
  }

  async function load() {
    if (status) status.textContent = "Loading featured events...";
    try {
      const res = await fetch("/api/featured-activities", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      if (!items.length) {
        showPlaceholders();
        return;
      }

      clearDynamicSlides();
      removeLoadingPlaceholder();
      viewport.insertAdjacentHTML("beforeend", items.slice(0, 3).map(renderSlide).join(""));
      if (status) status.textContent = "";
      refreshCarousel();
    } catch {
      setTimeout(showPlaceholders, 0);
      if (status) status.textContent = "Featured events will be displayed here as cards.";
    }
  }

  load();
})();
