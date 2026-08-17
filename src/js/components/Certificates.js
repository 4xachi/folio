import gsap from "gsap";

export default class Certificates {
  constructor(scrollInstance) {
    this.scroll = scrollInstance;
    this.section = document.querySelector(".home__certificates");
    if (!this.section) return;

    this.langButtons = this.section.querySelectorAll("[data-filter-lang]");
    this.typeButtons = this.section.querySelectorAll("[data-filter-type]");
    this.viewButtons = this.section.querySelectorAll("[data-view-mode]");
    this.searchInput = this.section.querySelector(".cert__search-input");
    this.clearSearchBtn = this.section.querySelector(".cert__search-clear");
    this.gridContainer = this.section.querySelector(".cert__grid");
    this.groupedContainer = this.section.querySelector(".cert__grouped-container");
    this.emptyState = this.section.querySelector(".cert__empty");
    this.counterElement = this.section.querySelector(".cert__counter-number");

    this.allCards = Array.from(this.section.querySelectorAll(".cert__card"));

    this.activeLang = "all";
    this.activeType = "all";
    this.activeView = "grid"; // 'grid' | 'grouped'
    this.searchQuery = "";

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Language filter pills
    this.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-filter-lang");
        if (this.activeLang === lang) return;
        this.activeLang = lang;

        this.langButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        this.render();
      });
    });

    // Type filter pills
    this.typeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-filter-type");
        if (this.activeType === type) return;
        this.activeType = type;

        this.typeButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        this.render();
      });
    });

    // View mode toggle buttons (Grid vs Grouped)
    this.viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-view-mode");
        if (this.activeView === mode) return;
        this.activeView = mode;

        this.viewButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        this.render();
      });
    });

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (this.clearSearchBtn) {
          if (this.searchQuery.length > 0) {
            this.clearSearchBtn.classList.add("is-visible");
          } else {
            this.clearSearchBtn.classList.remove("is-visible");
          }
        }
        this.render();
      });
    }

    // Clear search button
    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener("click", () => {
        this.searchInput.value = "";
        this.searchQuery = "";
        this.clearSearchBtn.classList.remove("is-visible");
        this.render();
      });
    }
  }

  filterCards() {
    return this.allCards.filter((card) => {
      const cardLang = card.getAttribute("data-language") || "";
      const cardType = card.getAttribute("data-type") || "";
      const cardTitle = (card.getAttribute("data-title") || "").toLowerCase();
      const cardId = (card.getAttribute("data-id") || "").toLowerCase();

      // Check Language match
      const matchesLang =
        this.activeLang === "all" || cardLang === this.activeLang;

      // Check Type match
      const matchesType =
        this.activeType === "all" || cardType === this.activeType;

      // Check Search match
      const matchesSearch =
        !this.searchQuery ||
        cardTitle.includes(this.searchQuery) ||
        cardLang.toLowerCase().includes(this.searchQuery) ||
        cardType.toLowerCase().includes(this.searchQuery) ||
        cardId.includes(this.searchQuery);

      return matchesLang && matchesType && matchesSearch;
    });
  }

  render() {
    const visibleCards = this.filterCards();

    // Update Counter
    if (this.counterElement) {
      this.counterElement.textContent = visibleCards.length;
    }

    // Handle Empty State
    if (visibleCards.length === 0) {
      if (this.gridContainer) this.gridContainer.style.display = "none";
      if (this.groupedContainer) this.groupedContainer.style.display = "none";
      if (this.emptyState) this.emptyState.style.display = "flex";

      if (this.scroll && typeof this.scroll.update === "function") {
        this.scroll.update();
      }
      return;
    }

    if (this.emptyState) this.emptyState.style.display = "none";

    if (this.activeView === "grid") {
      this.renderGridView(visibleCards);
    } else {
      this.renderGroupedView(visibleCards);
    }

    // Update Locomotive Scroll height
    setTimeout(() => {
      if (this.scroll && typeof this.scroll.update === "function") {
        this.scroll.update();
      }
    }, 100);
  }

  renderGridView(visibleCards) {
    if (this.groupedContainer) this.groupedContainer.style.display = "none";
    if (!this.gridContainer) return;

    this.gridContainer.style.display = "grid";
    this.gridContainer.innerHTML = "";

    visibleCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.style.opacity = "0";
      clone.style.transform = "translateY(20px)";
      this.gridContainer.appendChild(clone);
    });

    const newCards = this.gridContainer.querySelectorAll(".cert__card");
    gsap.to(newCards, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    });
  }

  renderGroupedView(visibleCards) {
    if (this.gridContainer) this.gridContainer.style.display = "none";
    if (!this.groupedContainer) return;

    this.groupedContainer.style.display = "flex";
    this.groupedContainer.innerHTML = "";

    // Group cards by Language
    const groups = {};
    visibleCards.forEach((card) => {
      const lang = card.getAttribute("data-language-name") || "Other";
      if (!groups[lang]) {
        groups[lang] = [];
      }
      groups[lang].push(card);
    });

    // Render each group
    Object.keys(groups).forEach((langName) => {
      const cardsInGroup = groups[langName];
      const section = document.createElement("div");
      section.className = "cert__group-section";

      const header = document.createElement("div");
      header.className = "cert__group-header";
      header.innerHTML = `
        <div class="cert__group-title-wrap">
          <span class="cert__group-indicator" data-lang-indicator="${langName.toLowerCase()}"></span>
          <h3 class="cert__group-title">${langName}</h3>
        </div>
        <span class="cert__group-badge">${cardsInGroup.length} ${cardsInGroup.length === 1 ? "Credential" : "Credentials"}</span>
      `;

      const grid = document.createElement("div");
      grid.className = "cert__grid";

      cardsInGroup.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.style.opacity = "0";
        clone.style.transform = "translateY(20px)";
        grid.appendChild(clone);
      });

      section.appendChild(header);
      section.appendChild(grid);
      this.groupedContainer.appendChild(section);
    });

    const newCards = this.groupedContainer.querySelectorAll(".cert__card");
    gsap.to(newCards, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: "power2.out",
    });
  }
}
