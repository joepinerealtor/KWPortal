const headerClockRefs = [...document.querySelectorAll("[data-header-clock]")];
const headerDateRefs = [...document.querySelectorAll("[data-header-date]")];
const currentYear = document.getElementById("currentYear");
const scrollContainer = document.querySelector(".page-content");
const contentStrip = document.querySelector(".content-strip--sticky");
const calendarModal = document.querySelector("[data-calendar-modal]");
const calendarModalShell = calendarModal?.querySelector("[data-calendar-modal-shell]");
const calendarModalCloseButton = calendarModal?.querySelector(".calendar-modal__close");
const calendarModalTriggers = [...document.querySelectorAll("[data-calendar-modal-trigger]")];
const mobileSidebarMenus = document.querySelector(".mobile-sidebar-menus");
const mobileMenuPanels = [...document.querySelectorAll(".mobile-menu-panel")];
const sectionLinks = [...document.querySelectorAll(".section-nav-link")].filter((link) => {
  const href = link.getAttribute("href") || "";
  return href.startsWith("#");
});
const sections = sectionLinks
  .map((link) => {
    const href = link.getAttribute("href") || "";
    return document.querySelector(href);
  })
  .filter(Boolean);
const rateRefs = {
  conventional: [...document.querySelectorAll('[data-rate-value="conventional"]')],
  fha: [...document.querySelectorAll('[data-rate-value="fha"]')],
  va: [...document.querySelectorAll('[data-rate-value="va"]')],
  jumbo: [...document.querySelectorAll('[data-rate-value="jumbo"]')],
  pills: {
    conventional: [...document.querySelectorAll('[data-rate-pill="conventional"]')],
    fha: [...document.querySelectorAll('[data-rate-pill="fha"]')],
    va: [...document.querySelectorAll('[data-rate-pill="va"]')],
    jumbo: [...document.querySelectorAll('[data-rate-pill="jumbo"]')]
  },
  trends: {
    conventional: [...document.querySelectorAll('[data-rate-trend="conventional"]')],
    fha: [...document.querySelectorAll('[data-rate-trend="fha"]')],
    va: [...document.querySelectorAll('[data-rate-trend="va"]')],
    jumbo: [...document.querySelectorAll('[data-rate-trend="jumbo"]')]
  },
  dayChanges: {
    conventional: [...document.querySelectorAll('[data-rate-day-change="conventional"]')],
    fha: [...document.querySelectorAll('[data-rate-day-change="fha"]')],
    va: [...document.querySelectorAll('[data-rate-day-change="va"]')],
    jumbo: [...document.querySelectorAll('[data-rate-day-change="jumbo"]')]
  },
  dayDates: {
    conventional: [...document.querySelectorAll('[data-rate-day-date="conventional"]')],
    fha: [...document.querySelectorAll('[data-rate-day-date="fha"]')],
    va: [...document.querySelectorAll('[data-rate-day-date="va"]')],
    jumbo: [...document.querySelectorAll('[data-rate-day-date="jumbo"]')]
  },
  yearChanges: {
    conventional: [...document.querySelectorAll('[data-rate-year-change="conventional"]')],
    fha: [...document.querySelectorAll('[data-rate-year-change="fha"]')],
    va: [...document.querySelectorAll('[data-rate-year-change="va"]')],
    jumbo: [...document.querySelectorAll('[data-rate-year-change="jumbo"]')]
  },
  yearDates: {
    conventional: [...document.querySelectorAll('[data-rate-year-date="conventional"]')],
    fha: [...document.querySelectorAll('[data-rate-year-date="fha"]')],
    va: [...document.querySelectorAll('[data-rate-year-date="va"]')],
    jumbo: [...document.querySelectorAll('[data-rate-year-date="jumbo"]')]
  },
  sourceDateLabels: [...document.querySelectorAll("[data-rates-source-date]")]
};
const riMarketRefs = {
  periodLabels: [...document.querySelectorAll("[data-ri-market-period]")],
  values: {
    median: [...document.querySelectorAll('[data-ri-market-value="median"]')],
    sold: [...document.querySelectorAll('[data-ri-market-value="sold"]')],
    pending: [...document.querySelectorAll('[data-ri-market-value="pending"]')],
    inventory: [...document.querySelectorAll('[data-ri-market-value="inventory"]')]
  },
  trends: {
    median: [...document.querySelectorAll('[data-ri-market-trend="median"]')],
    sold: [...document.querySelectorAll('[data-ri-market-trend="sold"]')],
    pending: [...document.querySelectorAll('[data-ri-market-trend="pending"]')],
    inventory: [...document.querySelectorAll('[data-ri-market-trend="inventory"]')]
  }
};
const joeAvailabilityRefs = [...document.querySelectorAll("[data-joe-availability-card]")]
  .map((card) => ({
    card,
    panel: card.querySelector(".joe-availability-panel"),
    light: card.querySelector("[data-joe-availability-light]"),
    label: card.querySelector("[data-joe-availability-label]"),
    summary: card.querySelector("[data-joe-availability-summary]")
  }))
  .filter((ref) => ref.panel && ref.light && ref.label && ref.summary);
const joeAvailabilitySourceUrl = joeAvailabilityRefs[0]?.card.dataset.joeAvailabilitySrc || "";
const hasRateTargets = [
  ...rateRefs.conventional,
  ...rateRefs.fha,
  ...rateRefs.va,
  ...rateRefs.jumbo,
  ...rateRefs.trends.conventional,
  ...rateRefs.trends.fha,
  ...rateRefs.trends.va,
  ...rateRefs.trends.jumbo,
  ...rateRefs.sourceDateLabels
].length > 0;
const hasRiMarketTargets = [
  ...riMarketRefs.periodLabels,
  ...riMarketRefs.values.median,
  ...riMarketRefs.values.sold,
  ...riMarketRefs.values.pending,
  ...riMarketRefs.values.inventory,
  ...riMarketRefs.trends.median,
  ...riMarketRefs.trends.sold,
  ...riMarketRefs.trends.pending,
  ...riMarketRefs.trends.inventory
].length > 0;
const hasJoeAvailabilityTargets = joeAvailabilityRefs.length > 0 && Boolean(joeAvailabilitySourceUrl);
let scrollTicking = false;
let ratesRefreshInFlight = false;
let riMarketRefreshInFlight = false;
let joeAvailabilityRefreshInFlight = false;
let calendarModalLastTrigger = null;
let calendarModalCloseTimer = 0;
let hasLoadedCalendarModalContent = false;

const PORTAL_SECTION_SCROLL_GAP_PX = 22;
const PORTAL_SECTION_SCROLL_FALLBACK_PX = 32;
const PORTAL_ACCESS_STORAGE_KEY = "kw-leading-edge-portal.access.v1";
const PORTAL_PASSCODE_HASH = "4030C42B313A82B953D14F04A85FF9DD9739E49A97D90631B7FB3029CCA1D6E1";
const FORCE_PORTAL_LOCK = new URLSearchParams(window.location.search).has("portalLock");
const IS_PORTAL_PUBLIC_PAGE = document.body?.dataset.portalPublic === "true";
const PUBLIC_WEBSITE_URL = "https://www.kwleadingedge.com/";
const TRAINING_CALENDAR_URL = "https://agent.kwleadingedge.com/training-calendar/";
const PORTAL_ACCESS_SUPPORT_EMAIL = "mbrown715@kw.com";
const PORTAL_ACCESS_SUPPORT_SUBJECT = "Agent Portal Access Request";
const PORTAL_ACCESS_SUPPORT_BODY = [
  "Hi Matt,",
  "",
  "I am trying to access the Keller Williams Leading Edge Agent Portal, but I do not remember the office passcode.",
  "Could you please help me with access when you have a moment?",
  "",
  "Thank you,"
].join("\r\n");
const PORTAL_ACCESS_SUPPORT_MAILTO = `mailto:${PORTAL_ACCESS_SUPPORT_EMAIL}?subject=${encodeURIComponent(PORTAL_ACCESS_SUPPORT_SUBJECT)}&body=${encodeURIComponent(PORTAL_ACCESS_SUPPORT_BODY)}`;
const PORTAL_LOCK_INTRO_DURATION_MS = 420;
const PORTAL_LOCK_INTRO_BASE_DELAY_MS = 60;
const PORTAL_LOCK_INTRO_DELAY_STEP_MS = 68;
const PORTAL_UNLOCK_OVERLAY_FADE_MS = 240;
const PORTAL_UNLOCK_REVEAL_DURATION_MS = 420;
const PORTAL_UNLOCK_REVEAL_BASE_DELAY_MS = 60;
const PORTAL_UNLOCK_REVEAL_DELAY_STEP_MS = 48;
const PORTAL_UNLOCK_REVEAL_VIEWPORT_PADDING_PX = 140;
const PORTAL_UNLOCK_REVEAL_LIMIT = 10;
const RATE_STORAGE_KEY = "kw-leading-edge-portal.rates.v1";
const RATE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const RI_MARKET_STORAGE_KEY = "kw-leading-edge-portal.ri-market.v1";
const RI_MARKET_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;
const RI_MARKET_SOURCE_URL = "https://www.rirealtors.org/";
const JOE_AVAILABILITY_STORAGE_KEY = "kw-leading-edge-portal.joe-tech-status.v1";
const JOE_AVAILABILITY_REFRESH_INTERVAL_MS = 60 * 1000;
const JOE_AVAILABILITY_CACHE_BUST_WINDOW_MS = 60 * 1000;
const JOE_AVAILABILITY_DEFAULT_DURATION_MINUTES = 30;
const JOE_AVAILABILITY_FALLBACK_TIMEZONE = "America/New_York";
const JOE_AVAILABILITY_DEFAULT_WORKING_HOURS = Object.freeze([
  Object.freeze({ day: "Wednesday", start: "09:00", end: "17:00" }),
  Object.freeze({ day: "Thursday", start: "09:00", end: "17:00" }),
  Object.freeze({ day: "Friday", start: "09:00", end: "16:00" })
]);
const JOE_AVAILABILITY_WEEKDAY_INDEX = Object.freeze({
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
});
const RATE_PROGRAMS = {
  conventional: {
    label: "Conventional",
    surveyName: "30 Year Fixed",
    chartCode: "mtg-rates-thirty-year-full",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fixed"
  },
  fha: {
    label: "FHA",
    surveyName: "30 Year FHA",
    chartCode: "mtg-rates-thirty-year-fha-full",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha"
  },
  va: {
    label: "VA",
    surveyName: "30 Year VA",
    chartCode: "mtg-rates-thirty-year-va-full",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-va"
  },
  jumbo: {
    label: "Jumbo",
    surveyName: "30 Year Jumbo",
    chartCode: "mtg-rates-thirty-year-jumbo-full",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-jumbo"
  }
};

function removePortalGate() {
  cleanupPortalUnlockTransition();
  document.querySelector(".portal-lock")?.remove();
  document.body.classList.remove("portal-protected");
}

function isPortalUnlocked() {
  try {
    return window.localStorage.getItem(PORTAL_ACCESS_STORAGE_KEY) === PORTAL_PASSCODE_HASH;
  } catch {
    return false;
  }
}

function storePortalAccess() {
  try {
    window.localStorage.setItem(PORTAL_ACCESS_STORAGE_KEY, PORTAL_PASSCODE_HASH);
  } catch {
    // Ignore storage failures and keep access for this page load only.
  }
}

async function hashPasscode(value) {
  if (!window.crypto?.subtle) {
    return value;
  }

  const encoded = new TextEncoder().encode(String(value || "").trim());
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function getPortalLockIntroTargets(overlay) {
  if (!overlay) {
    return [];
  }

  return [
    overlay.querySelector(".portal-lock-directory"),
    overlay.querySelector(".portal-lock-hero"),
    overlay.querySelector(".portal-lock-access-card")
  ]
    .filter(Boolean)
    .sort((left, right) => {
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const topDifference = leftRect.top - rightRect.top;

      if (Math.abs(topDifference) > 4) {
        return topDifference;
      }

      return leftRect.left - rightRect.left;
    });
}

function cleanupPortalLockIntro(overlay, targets = null) {
  const resolvedTargets = targets ?? (overlay ? [...overlay.querySelectorAll(".portal-lock-intro-target")] : []);

  resolvedTargets.forEach((target) => {
    target.classList.remove("portal-lock-intro-target", "is-portal-lock-intro-visible");
    target.style.removeProperty("--portal-lock-intro-delay");
  });

  overlay?.classList.remove("is-intro-ready", "is-entering");
}

function preparePortalLockIntro(overlay) {
  if (!overlay || prefersReducedMotion()) {
    return [];
  }

  const targets = getPortalLockIntroTargets(overlay);
  overlay.classList.add("is-intro-ready");

  targets.forEach((target) => {
    target.classList.add("portal-lock-intro-target");
    target.style.removeProperty("--portal-lock-intro-delay");
  });

  return targets;
}

function startPortalLockIntro(overlay, targets) {
  if (!overlay || prefersReducedMotion() || !targets.length) {
    cleanupPortalLockIntro(overlay, targets);
    return;
  }

  overlay.classList.add("is-entering");

  targets.forEach((target, index) => {
    target.style.setProperty(
      "--portal-lock-intro-delay",
      `${PORTAL_LOCK_INTRO_BASE_DELAY_MS + (index * PORTAL_LOCK_INTRO_DELAY_STEP_MS)}ms`
    );
    target.classList.add("is-portal-lock-intro-visible");
  });

  const cleanupDelay = PORTAL_LOCK_INTRO_BASE_DELAY_MS
    + ((targets.length - 1) * PORTAL_LOCK_INTRO_DELAY_STEP_MS)
    + PORTAL_LOCK_INTRO_DURATION_MS
    + 120;

  window.setTimeout(() => {
    cleanupPortalLockIntro(overlay, targets);
  }, cleanupDelay);
}

function getVisiblePortalUnlockTargets(selector) {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return [...document.querySelectorAll(selector)].filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0
      && rect.height > 0
      && rect.top < viewportHeight + PORTAL_UNLOCK_REVEAL_VIEWPORT_PADDING_PX
      && rect.bottom > -40;
  });
}

function getPortalUnlockTargets() {
  const structuralTargets = [
    document.querySelector(".top-rail"),
    ...getVisiblePortalUnlockTargets(".portal-sidebar > .panel"),
    ...getVisiblePortalUnlockTargets(".portal-content > .content-strip")
  ].filter(Boolean);

  const overviewTargets = [
    ...getVisiblePortalUnlockTargets("#overview .dashboard-title-block"),
    ...getVisiblePortalUnlockTargets("#overview .dashboard-status-card"),
    ...getVisiblePortalUnlockTargets("#overview .dashboard-head-market-section"),
    ...getVisiblePortalUnlockTargets("#overview .overview-card")
  ];

  const panelFallbackTargets = getVisiblePortalUnlockTargets(".page-content > .panel")
    .filter((panel) => !overviewTargets.length || panel.id !== "overview");

  return [...new Set([
    ...structuralTargets,
    ...(overviewTargets.length ? overviewTargets : panelFallbackTargets)
  ])]
    .sort((left, right) => {
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const topDifference = leftRect.top - rightRect.top;

      if (Math.abs(topDifference) > 4) {
        return topDifference;
      }

      return leftRect.left - rightRect.left;
    })
    .slice(0, PORTAL_UNLOCK_REVEAL_LIMIT);
}

function cleanupPortalUnlockTransition(targets = [...document.querySelectorAll(".portal-unlock-target")]) {
  [...targets].forEach((target) => {
    target.classList.remove("portal-unlock-target", "is-portal-unlock-visible");
    target.style.removeProperty("--portal-unlock-delay");
  });

  document.body.classList.remove("portal-unlock-transition", "portal-unlock-active");
}

function startPortalRevealTransition(targets = getPortalUnlockTargets()) {
  if (prefersReducedMotion()) {
    cleanupPortalUnlockTransition(targets);
    document.body.classList.remove("portal-protected");
    return 0;
  }

  if (!targets.length) {
    cleanupPortalUnlockTransition(targets);
    document.body.classList.remove("portal-protected");
    return 0;
  }

  targets.forEach((target) => {
    target.classList.add("portal-unlock-target");
    target.style.removeProperty("--portal-unlock-delay");
  });

  document.body.classList.add("portal-unlock-transition");
  document.body.classList.remove("portal-protected");

  requestAnimationFrame(() => {
    targets.forEach((target, index) => {
      target.style.setProperty(
        "--portal-unlock-delay",
        `${PORTAL_UNLOCK_REVEAL_BASE_DELAY_MS + (index * PORTAL_UNLOCK_REVEAL_DELAY_STEP_MS)}ms`
      );
      target.classList.add("is-portal-unlock-visible");
    });

    document.body.classList.add("portal-unlock-active");
  });

  const cleanupDelay = (targets.length
    ? PORTAL_UNLOCK_REVEAL_BASE_DELAY_MS + ((targets.length - 1) * PORTAL_UNLOCK_REVEAL_DELAY_STEP_MS)
    : 0) + PORTAL_UNLOCK_REVEAL_DURATION_MS + 120;

  window.setTimeout(() => {
    cleanupPortalUnlockTransition(targets);
  }, cleanupDelay);

  return cleanupDelay;
}

function startPortalUnlockTransition(overlay) {
  if (!overlay || prefersReducedMotion()) {
    removePortalGate();
    return;
  }
 
  startPortalRevealTransition(getPortalUnlockTargets());
  overlay.setAttribute("aria-hidden", "true");
  overlay.classList.add("is-unlocking");

  window.setTimeout(() => {
    overlay.remove();
  }, PORTAL_UNLOCK_OVERLAY_FADE_MS);
}

function createPortalLockLeadershipMarkup() {
  const leaders = [
    {
      role: "Operating Principal",
      name: "Lou Barrows",
      photo: "team/lou-barrows.jpg",
      email: "louisbarrows@kw.com",
      phoneHref: "tel:+14016403520",
      phoneLabel: "401-640-3520"
    },
    {
      role: "Market Center Operations",
      name: "Kim Barrows",
      photo: "team/kim-barrows.jpg",
      email: "klrw715@kw.com",
      phoneHref: "tel:+14013334900",
      phoneLabel: "401-333-4900"
    },
    {
      role: "Team Leader",
      name: "Matt Brown",
      photo: "team/matt-brown.png",
      email: "mbrown715@kw.com",
      phoneHref: "tel:+14014992978",
      phoneLabel: "401-499-2978"
    }
  ];

  return leaders
    .map((leader) => {
      return `
        <article class="leader-card">
          <img src="${leader.photo}" alt="${leader.name}" class="leader-photo">
          <div class="leader-copy">
            <span class="leader-role">${leader.role}</span>
            <h3>${leader.name}</h3>
            <div class="leader-contact-list">
              <a href="mailto:${leader.email}" class="leader-contact-link">${leader.email}</a>
              <a href="${leader.phoneHref}" class="leader-contact-link">${leader.phoneLabel}</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function createPortalGateMarkup() {
  const pageLabel = document.body.dataset.portalLockLabel || "Portal";
  const overlay = document.createElement("div");
  overlay.className = "portal-lock";
  overlay.innerHTML = `
    <div class="portal-lock-panel" role="dialog" aria-modal="true" aria-labelledby="portalLockTitle">
      <div class="portal-lock-top">
        <section class="portal-lock-hero" aria-label="Portal introduction">
          <img src="brand/kw-leading-edge-logo-white.png" alt="Keller Williams Realty Leading Edge" class="portal-lock-logo">
          <div class="portal-lock-copy">
            <p class="eyebrow small">Agent Portal</p>
            <h1 id="portalLockTitle">WHERE ENTREPRENEURS THRIVE!</h1>
            <p class="portal-lock-summary">The Keller Williams Leading Edge Agent Portal is a central hub for office resources, training, leadership support, trusted vendors, and the everyday tools our agents and office staff rely on to keep business moving forward.</p>
          </div>
        </section>

        <section class="portal-lock-access-card" aria-label="Portal access">
          <div class="portal-lock-access-head">
            <h2>AUTHORIZED ACCESS</h2>
            <p>For Keller Williams Leading Edge agents and office staff.</p>
          </div>
          <form class="portal-lock-form" autocomplete="off" data-form-type="other">
            <input class="portal-lock-input" name="portal-access-code" type="text" inputmode="numeric" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" placeholder="Passcode" aria-label="Passcode">
            <button class="button primary portal-lock-button" type="submit">Enter Portal</button>
            <p class="portal-lock-error" aria-live="polite"></p>
            <div class="portal-lock-help" hidden>
              <a class="button secondary portal-lock-help-button" href="${PORTAL_ACCESS_SUPPORT_MAILTO}">Email Matt Brown for access</a>
            </div>
          </form>
        </section>
      </div>

      <section class="portal-lock-directory" aria-label="Leadership team">
        <div class="portal-lock-directory-head">
          <h2>Leadership Team</h2>
          <p>Meet the leadership team that supports Keller Williams Leading Edge agents and helps keep the office moving forward.</p>
        </div>
        <div class="leadership-grid portal-lock-leadership-grid">
          ${createPortalLockLeadershipMarkup()}
        </div>
        <div class="portal-lock-office-bar" aria-label="Office information">
          <span class="portal-lock-office-name">Keller Williams Leading Edge</span>
          <a class="portal-lock-office-link" href="https://maps.google.com/?q=28+Thurber+Boulevard+Smithfield+RI+02917" target="_blank" rel="noreferrer">28 Thurber Boulevard, Smithfield, RI 02917</a>
          <a class="portal-lock-office-link" href="tel:+14013334900">401-333-4900</a>
          <a class="portal-lock-office-link" href="${PUBLIC_WEBSITE_URL}" target="_blank" rel="noreferrer">www.kwleadingedge.com</a>
        </div>
      </section>
    </div>
  `;
  return overlay;
}

async function ensurePortalAccess() {
  if (!FORCE_PORTAL_LOCK && isPortalUnlocked()) {
    startPortalRevealTransition();
    return;
  }

  const overlay = createPortalGateMarkup();
  document.body.append(overlay);
  const introTargets = preparePortalLockIntro(overlay);

  const form = overlay.querySelector(".portal-lock-form");
  const input = overlay.querySelector(".portal-lock-input");
  const error = overlay.querySelector(".portal-lock-error");
  const help = overlay.querySelector(".portal-lock-help");
  const submitButton = overlay.querySelector(".portal-lock-button");
  let failedAttempts = 0;
  let isUnlocking = false;

  if (help) {
    help.hidden = true;
  }

  requestAnimationFrame(() => {
    input?.focus();
    startPortalLockIntro(overlay, introTargets);
  });

  input?.addEventListener("animationend", () => {
    input.classList.remove("is-error-bounce");
  });

  await new Promise((resolve) => {
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isUnlocking) {
        return;
      }

      const attemptedPasscode = input?.value.trim() || "";
      const attemptedHash = await hashPasscode(attemptedPasscode);

      if (attemptedHash === PORTAL_PASSCODE_HASH || attemptedPasscode === "0715") {
        isUnlocking = true;
        form?.setAttribute("aria-busy", "true");
        if (input) {
          input.disabled = true;
        }
        if (submitButton) {
          submitButton.disabled = true;
        }
        if (error) {
          error.textContent = "";
        }
        storePortalAccess();
        startPortalUnlockTransition(overlay);
        resolve();
        return;
      }

      failedAttempts += 1;

      if (error) {
        error.textContent = failedAttempts >= 3
          ? "Incorrect passcode. Need access help?"
          : "Incorrect passcode. Try again.";
      }

      if (help && failedAttempts >= 3) {
        help.hidden = false;
      }

      if (input) {
        input.classList.remove("is-error-bounce");
        void input.offsetWidth;
        input.classList.add("is-error-bounce");
        input.value = "";
        input.focus();
      }
    });
  });
}

function updateDateTime() {
  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  });

  headerClockRefs.forEach((clockRef) => {
    clockRef.textContent = `${timeFormatter.format(now)} ET`;
  });

  headerDateRefs.forEach((dateRef) => {
    dateRef.textContent = dateFormatter.format(now);
  });

  if (currentYear) {
    currentYear.textContent = String(now.getFullYear());
  }
}

function usesInternalSectionScroll() {
  if (!scrollContainer) {
    return false;
  }

  const { overflowY } = window.getComputedStyle(scrollContainer);
  return (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay")
    && scrollContainer.clientHeight > 0;
}

function resolveSectionScrollOffset() {
  if (usesInternalSectionScroll()) {
    return PORTAL_SECTION_SCROLL_GAP_PX;
  }

  const mobileMenusAreVisible = mobileSidebarMenus
    && window.getComputedStyle(mobileSidebarMenus).display !== "none";
  const mobileMenuOffset = mobileMenusAreVisible
    ? Math.ceil(mobileSidebarMenus.getBoundingClientRect().height) + PORTAL_SECTION_SCROLL_GAP_PX
    : 0;

  return mobileMenuOffset || PORTAL_SECTION_SCROLL_FALLBACK_PX;
}

function syncSectionScrollOffset() {
  const nextOffset = resolveSectionScrollOffset();
  document.documentElement.style.setProperty("--portal-section-scroll-offset", `${nextOffset}px`);
}

function setActiveSection(id) {
  sectionLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveSectionFromScroll() {
  if (!sections.length) {
    return;
  }

  const internalScrollViewport = usesInternalSectionScroll() ? scrollContainer : null;
  const sectionOffset = resolveSectionScrollOffset();
  const viewportTop = internalScrollViewport
    ? internalScrollViewport.getBoundingClientRect().top + 16
    : sectionOffset + 16;
  const viewportBottom = internalScrollViewport
    ? internalScrollViewport.getBoundingClientRect().bottom - 16
    : window.innerHeight - 16;
  const viewportCenter = viewportTop + ((viewportBottom - viewportTop) / 2);
  let activeId = sections[0].id;
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + (rect.height / 2);
    const distanceToCenter = Math.abs(sectionCenter - viewportCenter);
    const containsViewportCenter = rect.top <= viewportCenter && rect.bottom >= viewportCenter;

    if (containsViewportCenter) {
      activeId = section.id;
      bestDistance = -1;
      return;
    }

    if (bestDistance >= 0 && distanceToCenter < bestDistance) {
      activeId = section.id;
      bestDistance = distanceToCenter;
    }
  });

  setActiveSection(activeId);
}

function readScrollTop() {
  if (usesInternalSectionScroll()) {
    return scrollContainer.scrollTop;
  }

  return window.scrollY || document.documentElement.scrollTop || 0;
}

function syncContentStripVisibility() {
  if (!contentStrip) {
    return;
  }

  const isCollapsed = readScrollTop() > 24;
  contentStrip.classList.toggle("is-market-collapsed", isCollapsed);
}

function requestActiveSectionUpdate() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    syncContentStripVisibility();
    updateActiveSectionFromScroll();
    scrollTicking = false;
  });
}

function closeMobileMenus(exceptPanel = null) {
  mobileMenuPanels.forEach((panel) => {
    if (panel !== exceptPanel) {
      panel.open = false;
    }
  });
}

function initializeMobileMenus() {
  if (!mobileSidebarMenus || !mobileMenuPanels.length) {
    return;
  }

  mobileMenuPanels.forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (panel.open) {
        closeMobileMenus(panel);
      }

      syncSectionScrollOffset();
      requestActiveSectionUpdate();
    });

    panel.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenus();
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (!mobileMenuPanels.some((panel) => panel.open)) {
      return;
    }

    const target = event.target;
    const targetElement = target instanceof Element ? target : target?.parentElement;

    if (!targetElement?.closest(".mobile-menu-panel[open]")) {
      closeMobileMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenus();
    }
  });
}

function ensureCalendarModalContent() {
  if (!calendarModalShell || hasLoadedCalendarModalContent) {
    return;
  }

  calendarModalShell.innerHTML = `
    <iframe
      class="calendar-modal__iframe"
      src="${TRAINING_CALENDAR_URL}"
      title="KW Leading Edge full training calendar"
      loading="lazy"
      scrolling="yes"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  `;

  hasLoadedCalendarModalContent = true;
}

function closeCalendarModal() {
  if (!calendarModal || calendarModal.hidden) {
    return;
  }

  calendarModal.classList.remove("is-open");
  document.body.classList.remove("has-calendar-modal");

  const returnFocusTarget = calendarModalLastTrigger;

  window.clearTimeout(calendarModalCloseTimer);
  calendarModalCloseTimer = window.setTimeout(() => {
    if (!calendarModal.classList.contains("is-open")) {
      calendarModal.hidden = true;
    }

    if (returnFocusTarget instanceof HTMLElement) {
      returnFocusTarget.focus();
    }
  }, 180);
}

function openCalendarModal(trigger = null) {
  if (!calendarModal) {
    return;
  }

  calendarModalLastTrigger = trigger instanceof HTMLElement
    ? trigger
    : (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  window.clearTimeout(calendarModalCloseTimer);
  calendarModal.hidden = false;
  document.body.classList.add("has-calendar-modal");

  requestAnimationFrame(() => {
    calendarModal.classList.add("is-open");
    ensureCalendarModalContent();
    (calendarModalCloseButton || calendarModal)?.focus?.();
  });
}

function initializeCalendarModal() {
  if (!calendarModal || !calendarModalTriggers.length) {
    return;
  }

  calendarModalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openCalendarModal(trigger);
    });
  });

  calendarModal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("[data-calendar-modal-close]")) {
      closeCalendarModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !calendarModal.hidden) {
      event.preventDefault();
      closeCalendarModal();
    }
  });
}

function createRoomBookingModal() {
  const modal = document.createElement("div");
  modal.className = "room-booking-modal";
  modal.setAttribute("hidden", "");
  modal.innerHTML = `
    <div class="room-booking-dialog" role="dialog" aria-modal="true" aria-labelledby="roomBookingTitle">
      <div class="room-booking-header">
        <div class="room-booking-copy">
          <p class="eyebrow small">Conference Room Booking</p>
          <h2 class="room-booking-title" id="roomBookingTitle">Book a Room</h2>
          <p class="room-booking-summary">Choose an available time and complete the reservation without leaving the portal.</p>
        </div>
        <button type="button" class="button secondary compact room-booking-close">Close</button>
      </div>
      <div class="room-booking-frame-shell">
        <iframe class="room-booking-frame" title="Conference room booking" src="about:blank" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
    </div>
  `;
  return modal;
}

function initializeRoomBookingModal() {
  const triggers = [...document.querySelectorAll(".room-booking-trigger[data-room-booking-url]")];
  if (!triggers.length) {
    return;
  }

  const modal = createRoomBookingModal();
  document.body.append(modal);

  const title = modal.querySelector(".room-booking-title");
  const summary = modal.querySelector(".room-booking-summary");
  const closeButton = modal.querySelector(".room-booking-close");
  const iframe = modal.querySelector(".room-booking-frame");
  let lastTrigger = null;
  let closeTimer = 0;

  const closeModal = () => {
    if (modal.hasAttribute("hidden")) {
      return;
    }

    modal.classList.remove("is-open");
    document.body.classList.remove("has-room-booking-modal");

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      modal.setAttribute("hidden", "");
      iframe?.setAttribute("src", "about:blank");
      lastTrigger?.focus();
    }, 180);
  };

  const openModal = (trigger) => {
    const bookingUrl = trigger.dataset.roomBookingUrl;
    const bookingLabel = trigger.dataset.roomBookingLabel || "Conference Room";

    if (!bookingUrl || !title || !summary || !iframe) {
      return;
    }

    window.clearTimeout(closeTimer);
    lastTrigger = trigger;
    title.textContent = bookingLabel;
    summary.textContent = `Complete the ${bookingLabel.toLowerCase()} reservation in Calendly.`;
    iframe.setAttribute("src", bookingUrl);
    modal.removeAttribute("hidden");
    document.body.classList.add("has-room-booking-modal");

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    closeButton?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger);
    });
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });
}

function loadStoredJoeAvailability() {
  try {
    const stored = window.localStorage.getItem(JOE_AVAILABILITY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveStoredJoeAvailability(state) {
  try {
    window.localStorage.setItem(JOE_AVAILABILITY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures in static/local contexts.
  }
}

function formatJoeAvailabilityTime(iso, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE) {
  const date = parseJoeAvailabilityDate(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }
}

function getJoeAvailabilityLocalDateKey(date, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value || "";
    const month = parts.find((part) => part.type === "month")?.value || "";
    const day = parts.find((part) => part.type === "day")?.value || "";

    return `${year}-${month}-${day}`;
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

function formatJoeAvailabilityNextSlotLabel(iso, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE, referenceDate = new Date()) {
  const date = parseJoeAvailabilityDate(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timeLabel = formatJoeAvailabilityTime(date.toISOString(), timezone);
  if (!timeLabel) {
    return "";
  }

  const targetDateKey = getJoeAvailabilityLocalDateKey(date, timezone);
  const referenceDateKey = getJoeAvailabilityLocalDateKey(referenceDate, timezone);
  if (targetDateKey && targetDateKey === referenceDateKey) {
    return timeLabel;
  }

  try {
    const dayLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long"
    }).format(date);
    return `${dayLabel} at ${timeLabel}`;
  } catch {
    const fallbackDayLabel = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${fallbackDayLabel} at ${timeLabel}`;
  }
}

function getJoeAvailabilityLocalYear(date, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric"
    }).format(date);
  } catch {
    return String(date.getFullYear());
  }
}

function formatJoeAvailabilityUntilLabel(iso, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE, referenceDate = new Date()) {
  const date = parseJoeAvailabilityDate(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timeLabel = formatJoeAvailabilityTime(date.toISOString(), timezone);
  if (!timeLabel) {
    return "";
  }

  const targetDateKey = getJoeAvailabilityLocalDateKey(date, timezone);
  const referenceDateKey = getJoeAvailabilityLocalDateKey(referenceDate, timezone);
  if (targetDateKey && targetDateKey === referenceDateKey) {
    return `today at ${timeLabel}`;
  }

  const targetYear = getJoeAvailabilityLocalYear(date, timezone);
  const referenceYear = getJoeAvailabilityLocalYear(referenceDate, timezone);
  const dateOptions = {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric"
  };

  if (targetYear && targetYear !== referenceYear) {
    dateOptions.year = "numeric";
  }

  try {
    const dateLabel = new Intl.DateTimeFormat("en-US", dateOptions).format(date);
    return `${dateLabel} at ${timeLabel}`;
  } catch {
    const fallbackDateLabel = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      ...(targetYear && targetYear !== referenceYear ? { year: "numeric" } : {})
    });
    return `${fallbackDateLabel} at ${timeLabel}`;
  }
}

function parseJoeAvailabilityDate(value) {
  if (value instanceof Date) {
    return value;
  }

  const normalizedValue = String(value || "").trim().replace(
    /\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})$/,
    ".$1$2"
  );

  return new Date(normalizedValue);
}

function parseJoeAvailabilityTimeToMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return Number.NaN;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return Number.NaN;
  }

  return (hours * 60) + minutes;
}

function normalizeJoeWorkingHours(rawHours = []) {
  const source = Array.isArray(rawHours) && rawHours.length
    ? rawHours
    : JOE_AVAILABILITY_DEFAULT_WORKING_HOURS;

  return source
    .map((entry) => {
      const dayKey = String(entry?.day || "").trim().toLowerCase();
      const dayIndex = JOE_AVAILABILITY_WEEKDAY_INDEX[dayKey];
      const startMinutes = parseJoeAvailabilityTimeToMinutes(entry?.start);
      const endMinutes = parseJoeAvailabilityTimeToMinutes(entry?.end);

      if (!Number.isInteger(dayIndex) || !Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
        return null;
      }

      return {
        dayIndex,
        startMinutes,
        endMinutes
      };
    })
    .filter(Boolean);
}

function getJoeAvailabilityLocalTimeParts(date, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((part) => part.type === "weekday")?.value?.toLowerCase() || "";
    const hour = Number.parseInt(parts.find((part) => part.type === "hour")?.value || "", 10);
    const minute = Number.parseInt(parts.find((part) => part.type === "minute")?.value || "", 10);
    const dayIndex = JOE_AVAILABILITY_WEEKDAY_INDEX[weekday];

    if (!Number.isInteger(dayIndex) || !Number.isInteger(hour) || !Number.isInteger(minute)) {
      return null;
    }

    return {
      dayIndex,
      minutes: (hour * 60) + minute
    };
  } catch {
    return {
      dayIndex: date.getDay(),
      minutes: (date.getHours() * 60) + date.getMinutes()
    };
  }
}

function isWithinJoeWorkingHours(date, timezone, workingHours, durationMinutes = 0) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }

  if (!workingHours.length) {
    return true;
  }

  const startParts = getJoeAvailabilityLocalTimeParts(date, timezone);
  if (!startParts) {
    return false;
  }

  const rule = workingHours.find((entry) => entry.dayIndex === startParts.dayIndex);
  if (!rule) {
    return false;
  }

  if (durationMinutes <= 0) {
    return startParts.minutes >= rule.startMinutes && startParts.minutes < rule.endMinutes;
  }

  const endDate = new Date(date.getTime() + (durationMinutes * 60 * 1000));
  const endParts = getJoeAvailabilityLocalTimeParts(endDate, timezone);
  if (!endParts || endParts.dayIndex !== startParts.dayIndex) {
    return false;
  }

  return startParts.minutes >= rule.startMinutes && endParts.minutes <= rule.endMinutes;
}

function normalizeJoeAvailabilityState(rawState = {}) {
  const timezone = typeof rawState?.timezone === "string" && rawState.timezone.trim()
    ? rawState.timezone.trim()
    : JOE_AVAILABILITY_FALLBACK_TIMEZONE;
  const parsedDuration = Number.parseInt(rawState?.eventDurationMinutes, 10);
  const eventDurationMinutes = Number.isFinite(parsedDuration) && parsedDuration > 0
    ? parsedDuration
    : JOE_AVAILABILITY_DEFAULT_DURATION_MINUTES;
  const availableNowEndIso = typeof rawState?.availableNowEndIso === "string"
    ? rawState.availableNowEndIso
    : "";
  const availableNowEndDate = availableNowEndIso ? parseJoeAvailabilityDate(availableNowEndIso) : null;
  const availableNowEndMs = availableNowEndDate && !Number.isNaN(availableNowEndDate.getTime())
    ? availableNowEndDate.getTime()
    : Number.NaN;
  const nextOpenSlotIso = typeof rawState?.nextOpenSlotIso === "string"
    ? rawState.nextOpenSlotIso
    : "";
  const nextOpenSlotDate = nextOpenSlotIso ? parseJoeAvailabilityDate(nextOpenSlotIso) : null;
  const nextOpenSlotMs = nextOpenSlotDate && !Number.isNaN(nextOpenSlotDate.getTime())
    ? nextOpenSlotDate.getTime()
    : Number.NaN;
  const nextOpenSlotEndMs = Number.isFinite(nextOpenSlotMs)
    ? nextOpenSlotMs + (eventDurationMinutes * 60 * 1000)
    : Number.NaN;
  const nowMs = Date.now();
  const workingHours = normalizeJoeWorkingHours(rawState?.workingHours);
  const isWithinWorkingHoursNow = isWithinJoeWorkingHours(new Date(nowMs), timezone, workingHours);
  const isNextSlotWithinWorkingHours = Number.isFinite(nextOpenSlotMs)
    && isWithinJoeWorkingHours(nextOpenSlotDate, timezone, workingHours, eventDurationMinutes);
  const availableNowLabel = rawState?.availableNowLabel || "Joe is available to chat";
  const unavailableLabel = rawState?.unavailableLabel || "Joe is unavailable";
  const baseStatus = [
    "available",
    "available_now",
    "unavailable"
  ].includes(rawState?.status)
    ? rawState.status
    : "unavailable";
  let status = baseStatus === "available" ? "unavailable" : baseStatus;

  if (baseStatus === "available_now" && Number.isFinite(availableNowEndMs) && isWithinWorkingHoursNow && nowMs < availableNowEndMs) {
    status = "available_now";
  } else if (Number.isFinite(nextOpenSlotMs) && Number.isFinite(nextOpenSlotEndMs) && isNextSlotWithinWorkingHours) {
    if (isWithinWorkingHoursNow && nowMs >= nextOpenSlotMs && nowMs < nextOpenSlotEndMs) {
      status = "available_now";
    } else if (nowMs < nextOpenSlotMs) {
      status = "unavailable";
    } else {
      status = "unavailable";
    }
  }

  if (status === "available_now") {
    const effectiveAvailableNowEndMs = Number.isFinite(availableNowEndMs) ? availableNowEndMs : nextOpenSlotEndMs;
    const endLabel = Number.isFinite(effectiveAvailableNowEndMs)
      ? formatJoeAvailabilityTime(new Date(effectiveAvailableNowEndMs).toISOString(), timezone)
      : "";

    return {
      status,
      label: availableNowLabel,
      summary: rawState?.availableNowSummary || (endLabel
        ? `Feel free to book a private meeting or call Joe to sit with him. Current availability runs until ${endLabel}.`
        : "Feel free to book a private meeting or call Joe to sit with him.")
    };
  }

  if (status === "unavailable") {
    const nextLabel = Number.isFinite(nextOpenSlotMs) && nextOpenSlotMs > nowMs && isNextSlotWithinWorkingHours
      ? formatJoeAvailabilityNextSlotLabel(nextOpenSlotIso, timezone, new Date(nowMs))
      : "";

    return {
      status,
      label: unavailableLabel,
      summary: nextLabel
        ? `Next open slot is ${nextLabel}.`
        : (rawState?.noSlotsSummary || "No open tech-help slots are listed right now.")
    };
  }

  return {
    status: "unavailable",
    label: unavailableLabel,
    summary: rawState?.noSlotsSummary || "No open tech-help slots are listed right now."
  };
}

function getCompactJoeAvailabilityState(rawState = {}, normalizedState = {}) {
  const timezone = typeof rawState?.timezone === "string" && rawState.timezone.trim()
    ? rawState.timezone.trim()
    : JOE_AVAILABILITY_FALLBACK_TIMEZONE;
  const parsedDuration = Number.parseInt(rawState?.eventDurationMinutes, 10);
  const eventDurationMinutes = Number.isFinite(parsedDuration) && parsedDuration > 0
    ? parsedDuration
    : JOE_AVAILABILITY_DEFAULT_DURATION_MINUTES;
  const availableNowEndIso = typeof rawState?.availableNowEndIso === "string"
    ? rawState.availableNowEndIso
    : "";
  const availableNowEndDate = availableNowEndIso ? parseJoeAvailabilityDate(availableNowEndIso) : null;
  const availableNowEndMs = availableNowEndDate && !Number.isNaN(availableNowEndDate.getTime())
    ? availableNowEndDate.getTime()
    : Number.NaN;
  const nextOpenSlotIso = typeof rawState?.nextOpenSlotIso === "string"
    ? rawState.nextOpenSlotIso
    : "";
  const nextOpenSlotDate = nextOpenSlotIso ? parseJoeAvailabilityDate(nextOpenSlotIso) : null;
  const nextOpenSlotMs = nextOpenSlotDate && !Number.isNaN(nextOpenSlotDate.getTime())
    ? nextOpenSlotDate.getTime()
    : Number.NaN;
  const nextOpenSlotEndMs = Number.isFinite(nextOpenSlotMs)
    ? nextOpenSlotMs + (eventDurationMinutes * 60 * 1000)
    : Number.NaN;
  const nowMs = Date.now();

  if (normalizedState.status === "available_now") {
    const effectiveAvailableNowEndMs = Number.isFinite(availableNowEndMs) ? availableNowEndMs : nextOpenSlotEndMs;
    const endLabel = Number.isFinite(effectiveAvailableNowEndMs)
      ? formatJoeAvailabilityTime(new Date(effectiveAvailableNowEndMs).toISOString(), timezone)
      : "";

    return {
      label: "Tech Help Available",
      summary: endLabel ? `Available until ${endLabel}.` : "Available right now."
    };
  }

  if (normalizedState.status === "unavailable") {
    const untilLabel = Number.isFinite(nextOpenSlotMs) && nextOpenSlotMs > nowMs
      ? formatJoeAvailabilityUntilLabel(nextOpenSlotIso, timezone, new Date(nowMs))
      : "";

    return {
      label: "Joe Pine is unavailable",
      summary: untilLabel ? `Until ${untilLabel}.` : "No open tech-help slots listed."
    };
  }

  return {
    label: normalizedState.label || "Joe Pine is unavailable",
    summary: normalizedState.summary || "No open tech-help slots listed."
  };
}

function writeJoeAvailability(rawState = {}) {
  if (!hasJoeAvailabilityTargets) {
    return;
  }

  const state = normalizeJoeAvailabilityState(rawState);

  joeAvailabilityRefs.forEach((ref) => {
    const isCompactHeaderWidget = ref.panel.classList.contains("joe-availability-panel--compact");
    const compactState = isCompactHeaderWidget ? getCompactJoeAvailabilityState(rawState, state) : null;

    ref.panel.dataset.status = state.status;
    ref.panel.hidden = false;
    ref.label.textContent = compactState ? compactState.label : state.label;
    const summaryText = compactState ? compactState.summary : state.summary;
    ref.summary.textContent = summaryText;
    ref.summary.hidden = false;
  });
}

async function refreshJoeAvailability() {
  if (!hasJoeAvailabilityTargets || joeAvailabilityRefreshInFlight) {
    return;
  }

  joeAvailabilityRefreshInFlight = true;

  try {
    const cacheBust = Math.floor(Date.now() / JOE_AVAILABILITY_CACHE_BUST_WINDOW_MS);
    const separator = joeAvailabilitySourceUrl.includes("?") ? "&" : "?";
    const response = await fetch(`${joeAvailabilitySourceUrl}${separator}v=${cacheBust}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Request failed for ${joeAvailabilitySourceUrl}`);
    }

    const nextState = await response.json();
    writeJoeAvailability(nextState);
    saveStoredJoeAvailability(nextState);
  } catch {
    const storedState = loadStoredJoeAvailability();
    if (storedState) {
      writeJoeAvailability(storedState);
    } else {
      writeJoeAvailability({});
    }
  } finally {
    joeAvailabilityRefreshInFlight = false;
  }
}

function loadStoredRates() {
  try {
    const stored = window.localStorage.getItem(RATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveStoredRates(state) {
  try {
    window.localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures in static/local contexts.
  }
}

function loadStoredRiMarket() {
  try {
    const stored = window.localStorage.getItem(RI_MARKET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveStoredRiMarket(state) {
  try {
    window.localStorage.setItem(RI_MARKET_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures in static/local contexts.
  }
}

function writeRates(state) {
  rateRefs.conventional.forEach((ref) => {
    ref.textContent = state.conventionalRate || "--";
  });
  rateRefs.fha.forEach((ref) => {
    ref.textContent = state.fhaRate || "--";
  });
  rateRefs.va.forEach((ref) => {
    ref.textContent = state.vaRate || "--";
  });
  rateRefs.jumbo.forEach((ref) => {
    ref.textContent = state.jumboRate || "--";
  });

  writeRateTrend("conventional", state.conventionalRateChange, state.conventionalRateDirection);
  writeRateTrend("fha", state.fhaRateChange, state.fhaRateDirection);
  writeRateTrend("va", state.vaRateChange, state.vaRateDirection);
  writeRateTrend("jumbo", state.jumboRateChange, state.jumboRateDirection);
  writeRateDetailState("conventional", state);
  writeRateDetailState("fha", state);
  writeRateDetailState("va", state);
  writeRateDetailState("jumbo", state);
}

function normalizeTextContent(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseRateNumber(value) {
  const match = normalizeTextContent(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : Number.NaN;
}

function parseSignedPercent(value) {
  const normalized = normalizeTextContent(value).replace(/\u2212/g, "-");
  const match = normalized.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
  return match ? Number.parseFloat(match[1]) : Number.NaN;
}

function roundRateChange(value) {
  if (!Number.isFinite(value)) {
    return Number.NaN;
  }

  const rounded = Number(value.toFixed(2));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function normalizeRateChangeValue(changeValue) {
  return changeValue === null || changeValue === undefined || changeValue === ""
    ? Number.NaN
    : Number(changeValue);
}

function resolveRateDirection(changeValue, fallbackDirection = "neutral") {
  if (Number.isFinite(changeValue)) {
    if (changeValue > 0) {
      return "up";
    }

    if (changeValue < 0) {
      return "down";
    }

    return "neutral";
  }

  return fallbackDirection;
}

function formatRateChange(changeValue) {
  if (!Number.isFinite(changeValue)) {
    return "--";
  }

  return `${Math.abs(changeValue).toFixed(2)}%`;
}

function writeRateTrend(programKey, changeValue, direction) {
  const refs = rateRefs.trends[programKey] || [];
  const numericChange = normalizeRateChangeValue(changeValue);
  const formattedValue = formatRateChange(numericChange);
  const tone = resolveRateDirection(numericChange, direction);

  refs.forEach((ref) => {
    ref.textContent = formattedValue;
    ref.dataset.tone = formattedValue === "--" ? "neutral" : tone;

    let label = "Day-over-day rate change unavailable";
    if (formattedValue !== "--") {
      if (tone === "down") {
        label = `Rate decreased ${formattedValue} from yesterday`;
      } else if (tone === "up") {
        label = `Rate increased ${formattedValue} from yesterday`;
      } else {
        label = `Rate unchanged from yesterday (${formattedValue})`;
      }
    }

    ref.setAttribute("aria-label", label);
    ref.removeAttribute("title");
  });
}

function buildRateComparisonSummary(periodLabel, comparison) {
  if (!comparison || comparison.formattedValue === "--") {
    return `${periodLabel} change unavailable.`;
  }

  const dateSummary = comparison.formattedDate ? ` versus ${comparison.formattedDate}` : "";
  if (comparison.tone === "down") {
    return `${periodLabel} decreased ${comparison.formattedValue}${dateSummary}.`;
  }

  if (comparison.tone === "up") {
    return `${periodLabel} increased ${comparison.formattedValue}${dateSummary}.`;
  }

  return `${periodLabel} unchanged at ${comparison.formattedValue}${dateSummary}.`;
}

function writeRateComparison(changeRefs, dateRefs, changeValue, direction, compareDate) {
  const numericChange = normalizeRateChangeValue(changeValue);
  const formattedValue = formatRateChange(numericChange);
  const tone = resolveRateDirection(numericChange, direction);
  const formattedDate = formatSourceDate(compareDate);
  const comparisonLabel = formattedDate ? `vs ${formattedDate}` : "Comparison unavailable";

  changeRefs.forEach((ref) => {
    ref.textContent = formattedValue;
    ref.dataset.tone = formattedValue === "--" ? "neutral" : tone;
  });

  dateRefs.forEach((ref) => {
    ref.textContent = comparisonLabel;
  });

  return {
    formattedValue,
    tone,
    formattedDate
  };
}

function setRatePillAriaLabel(programKey, currentRate, dayComparison, yearComparison) {
  const refs = rateRefs.pills[programKey] || [];
  if (!refs.length) {
    return;
  }

  const programLabel = RATE_PROGRAMS[programKey]?.label || programKey;
  const currentRateSummary = currentRate
    ? `${programLabel} mortgage rate ${currentRate}%.`
    : `${programLabel} mortgage rate unavailable.`;
  const label = [
    currentRateSummary,
    buildRateComparisonSummary("Day over day", dayComparison),
    buildRateComparisonSummary("Year over year", yearComparison)
  ].join(" ");

  refs.forEach((ref) => {
    ref.setAttribute("aria-label", label);
  });
}

function writeRateDetailState(programKey, state) {
  const dayComparison = writeRateComparison(
    rateRefs.dayChanges[programKey] || [],
    rateRefs.dayDates[programKey] || [],
    state[`${programKey}RateChange`],
    state[`${programKey}RateDirection`],
    state[`${programKey}RatePreviousDate`]
  );
  const yearComparison = writeRateComparison(
    rateRefs.yearChanges[programKey] || [],
    rateRefs.yearDates[programKey] || [],
    state[`${programKey}RateYearChange`],
    state[`${programKey}RateYearDirection`],
    state[`${programKey}RateYearAgoDate`]
  );

  setRatePillAriaLabel(programKey, state[`${programKey}Rate`], dayComparison, yearComparison);
}

function parseRateDateValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return null;
  }

  const directParsed = Date.parse(normalized);
  if (Number.isFinite(directParsed)) {
    return new Date(directParsed);
  }

  const fallbackParsed = Date.parse(`${normalized} 12:00:00`);
  return Number.isFinite(fallbackParsed) ? new Date(fallbackParsed) : null;
}

function formatSourceDate(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  const parsed = parseRateDateValue(normalized);
  if (!parsed) {
    return normalized;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(parsed);
}

function setRatesSourceDateLabel(state) {
  if (!rateRefs.sourceDateLabels.length) {
    return;
  }

  const surveyDates = [
    state.conventionalSurveyDate,
    state.fhaSurveyDate,
    state.vaSurveyDate,
    state.jumboSurveyDate
  ].filter(Boolean);

  if (!surveyDates.length) {
    rateRefs.sourceDateLabels.forEach((ref) => {
      ref.textContent = "date unavailable";
    });
    return;
  }

  const uniqueDates = [...new Set(surveyDates)];
  if (uniqueDates.length === 1) {
    const formattedDate = formatSourceDate(uniqueDates[0]);
    rateRefs.sourceDateLabels.forEach((ref) => {
      ref.textContent = formattedDate;
    });
    return;
  }

  rateRefs.sourceDateLabels.forEach((ref) => {
    ref.textContent = "date varies by product";
  });
}

function detectTrendTone(value) {
  const normalized = String(value || "").trim();
  if (normalized.startsWith("+") || normalized.startsWith("\u2191") || /^up\b/i.test(normalized)) {
    return "up";
  }

  if (normalized.startsWith("-") || normalized.startsWith("\u2193") || /^down\b/i.test(normalized)) {
    return "down";
  }

  return "neutral";
}

function normalizeRiComparison(value) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("\u2191")) {
    return `+${normalized.slice(1).trim()}`;
  }

  if (normalized.startsWith("\u2193")) {
    return `-${normalized.slice(1).trim()}`;
  }

  return normalized;
}

function writeRiMarketValue(metricKey, value) {
  const refs = riMarketRefs.values[metricKey] || [];
  refs.forEach((ref) => {
    ref.textContent = value || "--";
  });
}

function writeRiMarketTrend(metricKey, value) {
  const refs = riMarketRefs.trends[metricKey] || [];
  refs.forEach((ref) => {
    ref.textContent = value || "--";
    ref.dataset.tone = detectTrendTone(value);
  });
}

function writeRiMarket(state) {
  riMarketRefs.periodLabels.forEach((ref) => {
    ref.textContent = state.periodLabel || "Update unavailable";
  });

  writeRiMarketValue("median", state.medianSalesPrice);
  writeRiMarketTrend("median", state.medianSalesPriceTrend);
  writeRiMarketValue("sold", state.homesSold);
  writeRiMarketTrend("sold", state.homesSoldTrend);
  writeRiMarketValue("pending", state.pendingSales);
  writeRiMarketTrend("pending", state.pendingSalesTrend);
  writeRiMarketValue("inventory", state.activeInventory);
  writeRiMarketTrend("inventory", state.activeInventoryTrend);
}

function formatRiMarketPeriod(rawPeriod) {
  const normalized = String(rawPeriod || "").trim();
  if (!normalized) {
    return "";
  }

  const parts = normalized.split(/\s*-\s*/);
  const segment = parts.length > 1 ? parts.shift() : "";
  const periodPart = parts.length ? parts.join(" - ") : normalized;
  const parsed = Date.parse(`${periodPart} 12:00:00`);
  const formattedPeriod = Number.isFinite(parsed)
    ? new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "America/New_York"
    }).format(new Date(parsed))
    : periodPart;

  if (segment) {
    return `${segment} - ${formattedPeriod}`;
  }

  return formattedPeriod;
}

function buildRiStatValue(prefix, number, suffix) {
  const normalizedPrefix = String(prefix || "").trim();
  const normalizedNumber = String(number || "").trim();
  const normalizedSuffix = String(suffix || "").trim();

  let value = `${normalizedPrefix}${normalizedNumber}`.trim();
  if (normalizedSuffix) {
    value += `${normalizedPrefix ? "" : " "}${normalizedSuffix}`;
  }

  return value.trim();
}

function normalizeRiStatTitle(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseRiRealtorsMarketTrends(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const targetSection = [...doc.querySelectorAll(".quickStatsComponent")].find((section) => {
    return /Recent Market Trends/i.test(section.textContent || "");
  });

  if (!targetSection) {
    return null;
  }

  const periodRaw = targetSection.querySelector(".moduleHeader .eyebrow, .eyebrow")?.textContent.trim() || "";
  const metrics = {};

  [...targetSection.querySelectorAll(".quickStat")].forEach((statEl) => {
    const title = normalizeRiStatTitle(statEl.querySelector(".statTitle")?.textContent);
    const prefix = statEl.querySelector(".stat .prefix")?.textContent || "";
    const number = statEl.querySelector(".stat .number")?.textContent || "";
    const suffix = statEl.querySelector(".stat .suffix")?.textContent || "";
    const comparison = normalizeRiComparison(statEl.querySelector(".statComparison")?.textContent);

    metrics[title] = {
      value: buildRiStatValue(prefix, number, suffix),
      comparison
    };
  });

  const median = metrics["median sales price"];
  const sold = metrics["no. of homes sold"];
  const pending = metrics["no. of pending sales"];
  const inventory = metrics["active inventory"];

  if (!periodRaw || !median || !sold || !pending || !inventory) {
    return null;
  }

  return {
    periodLabel: formatRiMarketPeriod(periodRaw),
    medianSalesPrice: median.value,
    medianSalesPriceTrend: median.comparison,
    homesSold: sold.value,
    homesSoldTrend: sold.comparison,
    pendingSales: pending.value,
    pendingSalesTrend: pending.comparison,
    activeInventory: inventory.value,
    activeInventoryTrend: inventory.comparison,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchTextViaProxy(sourceUrl) {
  const proxyUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(sourceUrl)}`;
  const response = await fetch(proxyUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed for ${sourceUrl}`);
  }

  return response.text();
}

function parseMortgageSurveyRow(row) {
  const dateCell = row.querySelector("td.rate-date");
  const currentRateCell = row.querySelector("td.rate");
  const changeCell = row.querySelector("td.change");
  const hiddenDate = dateCell?.querySelector(".hidden-xs")?.textContent || "";
  const dateText = normalizeTextContent(hiddenDate || dateCell?.textContent || "");
  const rate = parseRateNumber(currentRateCell?.textContent || "");
  const change = roundRateChange(parseSignedPercent(changeCell?.textContent || ""));
  let direction = "neutral";

  if (changeCell?.querySelector(".rate-up, .fa-arrow-up")) {
    direction = "up";
  } else if (changeCell?.querySelector(".rate-down, .fa-arrow-down")) {
    direction = "down";
  }

  return {
    date: dateText,
    rate,
    change,
    direction
  };
}

function parseMortgageNewsDailySurvey(html, surveyName) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const sectionHeading = [...doc.querySelectorAll("th.rate-product")].find((heading) => {
    return normalizeTextContent(heading.textContent).startsWith(`MND's ${surveyName} (daily survey)`);
  });

  if (!sectionHeading) {
    return null;
  }

  const headingRow = sectionHeading.closest("tr");
  if (!headingRow) {
    return null;
  }

  const surveyRows = [];
  for (let row = headingRow.nextElementSibling; row; row = row.nextElementSibling) {
    if (row.querySelector("th.rate-product")) {
      break;
    }

    if (row.querySelector("td.rate-date") && row.querySelector("td.rate")) {
      surveyRows.push(row);
    }
  }

  if (!surveyRows.length) {
    return null;
  }

  const currentRow = parseMortgageSurveyRow(surveyRows[0]);
  const previousRow = surveyRows[1] ? parseMortgageSurveyRow(surveyRows[1]) : null;

  if (!Number.isFinite(currentRow.rate)) {
    return null;
  }

  const computedChange = previousRow && Number.isFinite(previousRow.rate)
    ? roundRateChange(currentRow.rate - previousRow.rate)
    : currentRow.change;
  const direction = resolveRateDirection(computedChange, currentRow.direction);

  return {
    date: currentRow.date,
    rate: currentRow.rate,
    previousRate: previousRow && Number.isFinite(previousRow.rate) ? previousRow.rate : null,
    previousDate: previousRow ? previousRow.date : "",
    change: computedChange,
    direction
  };
}

function parseLatestMortgageNewsDailyRate(html, surveyName) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (doc.body && doc.body.textContent ? doc.body.textContent : html).replace(/\s+/g, " ").trim();
  const escapedSurveyName = surveyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const datePattern = "([A-Z][a-z]{2}\\s\\d{1,2}\\s\\d{4})\\s+\\d{1,2}\\/\\d{1,2}\\/\\d{2}";
  const surveyPattern = new RegExp(`MND's ${escapedSurveyName} \\(daily survey\\)\\s+${datePattern}\\s+([0-9.]+)%`, "i");
  const surveyMatch = text.match(surveyPattern);

  if (surveyMatch) {
    return {
      date: surveyMatch[1].trim(),
      rate: Number.parseFloat(surveyMatch[2]),
      previousRate: null,
      previousDate: "",
      change: Number.NaN,
      direction: "neutral"
    };
  }

  const currentRateMatch = text.match(new RegExp(`${escapedSurveyName}[\\s\\S]*?([0-9.]+)%`, "i"));
  if (currentRateMatch) {
    return {
      date: "",
      rate: Number.parseFloat(currentRateMatch[1]),
      previousRate: null,
      previousDate: "",
      change: Number.NaN,
      direction: "neutral"
    };
  }

  return null;
}

function parseRateChartPayload(html) {
  const match = String(html || "").match(/var chartData = (\{[\s\S]*?\});/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function normalizeRateChartPoint(point) {
  const date = typeof point?.d === "string" ? point.d : "";
  const parsedDate = parseRateDateValue(date);
  const rate = Number(point?.v);
  const change = roundRateChange(Number(point?.DataChange));

  return {
    date,
    timestamp: parsedDate ? parsedDate.getTime() : Number.NaN,
    rate,
    change,
    direction: resolveRateDirection(change, "neutral")
  };
}

function findNearestHistoricalRatePoint(points, targetTimestamp) {
  if (!Number.isFinite(targetTimestamp)) {
    return null;
  }

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    if (Number.isFinite(point.timestamp) && point.timestamp <= targetTimestamp) {
      return point;
    }
  }

  return null;
}

function buildRateFromChartData(chartData) {
  const rawPoints = Array.isArray(chartData?.chartSeries?.[0]?.data)
    ? chartData.chartSeries[0].data
    : [];
  const points = rawPoints
    .map(normalizeRateChartPoint)
    .filter((point) => Number.isFinite(point.rate) && Number.isFinite(point.timestamp));

  if (!points.length) {
    return null;
  }

  const currentPoint = points[points.length - 1];
  const previousPoint = points.length > 1 ? points[points.length - 2] : null;
  const yearAgoTarget = new Date(currentPoint.timestamp);
  yearAgoTarget.setUTCFullYear(yearAgoTarget.getUTCFullYear() - 1);
  const yearAgoPoint = findNearestHistoricalRatePoint(points, yearAgoTarget.getTime());
  const dayChange = previousPoint
    ? roundRateChange(currentPoint.rate - previousPoint.rate)
    : currentPoint.change;
  const yearChange = yearAgoPoint
    ? roundRateChange(currentPoint.rate - yearAgoPoint.rate)
    : Number.NaN;

  return {
    date: currentPoint.date,
    rate: currentPoint.rate,
    previousRate: previousPoint ? previousPoint.rate : null,
    previousDate: previousPoint ? previousPoint.date : "",
    change: dayChange,
    direction: resolveRateDirection(dayChange, currentPoint.direction),
    yearAgoRate: yearAgoPoint ? yearAgoPoint.rate : null,
    yearAgoDate: yearAgoPoint ? yearAgoPoint.date : "",
    yearChange,
    yearDirection: resolveRateDirection(yearChange, "neutral")
  };
}

async function fetchRateHistory(programKey) {
  const program = RATE_PROGRAMS[programKey];
  if (!program?.chartCode) {
    throw new Error(`Missing chart code for ${programKey}`);
  }

  const chartUrl = `https://www.mortgagenewsdaily.com/charts/embed/${program.chartCode}`;
  const html = await fetchTextViaProxy(chartUrl);
  const chartData = parseRateChartPayload(html);
  const latestRate = buildRateFromChartData(chartData);
  if (!latestRate || !Number.isFinite(latestRate.rate)) {
    throw new Error(`Could not parse ${program.label} history`);
  }

  return latestRate;
}

async function fetchRate(programKey) {
  const program = RATE_PROGRAMS[programKey];
  if (program?.chartCode) {
    try {
      return await fetchRateHistory(programKey);
    } catch {
      // Fall back to the product page parser if the chart payload is unavailable.
    }
  }

  const html = await fetchTextViaProxy(program.sourceUrl);
  const latestRate = parseMortgageNewsDailySurvey(html, program.surveyName)
    || parseLatestMortgageNewsDailyRate(html, program.surveyName);

  if (!latestRate || !Number.isFinite(latestRate.rate)) {
    throw new Error(`Could not parse ${program.label} rate`);
  }

  return latestRate;
}

async function refreshRates() {
  if (!hasRateTargets) {
    return;
  }

  if (ratesRefreshInFlight) {
    return;
  }

  ratesRefreshInFlight = true;

  try {
    const [conventional, fha, va, jumbo] = await Promise.all([
      fetchRate("conventional"),
      fetchRate("fha"),
      fetchRate("va"),
      fetchRate("jumbo")
    ]);

    const nextState = {
      conventionalRate: conventional.rate.toFixed(2),
      fhaRate: fha.rate.toFixed(2),
      vaRate: va.rate.toFixed(2),
      jumboRate: jumbo.rate.toFixed(2),
      conventionalRateChange: Number.isFinite(conventional.change) ? conventional.change : null,
      fhaRateChange: Number.isFinite(fha.change) ? fha.change : null,
      vaRateChange: Number.isFinite(va.change) ? va.change : null,
      jumboRateChange: Number.isFinite(jumbo.change) ? jumbo.change : null,
      conventionalRateDirection: conventional.direction || "neutral",
      fhaRateDirection: fha.direction || "neutral",
      vaRateDirection: va.direction || "neutral",
      jumboRateDirection: jumbo.direction || "neutral",
      conventionalRatePreviousDate: conventional.previousDate || "",
      fhaRatePreviousDate: fha.previousDate || "",
      vaRatePreviousDate: va.previousDate || "",
      jumboRatePreviousDate: jumbo.previousDate || "",
      conventionalRateYearChange: Number.isFinite(conventional.yearChange) ? conventional.yearChange : null,
      fhaRateYearChange: Number.isFinite(fha.yearChange) ? fha.yearChange : null,
      vaRateYearChange: Number.isFinite(va.yearChange) ? va.yearChange : null,
      jumboRateYearChange: Number.isFinite(jumbo.yearChange) ? jumbo.yearChange : null,
      conventionalRateYearDirection: conventional.yearDirection || "neutral",
      fhaRateYearDirection: fha.yearDirection || "neutral",
      vaRateYearDirection: va.yearDirection || "neutral",
      jumboRateYearDirection: jumbo.yearDirection || "neutral",
      conventionalRateYearAgoDate: conventional.yearAgoDate || "",
      fhaRateYearAgoDate: fha.yearAgoDate || "",
      vaRateYearAgoDate: va.yearAgoDate || "",
      jumboRateYearAgoDate: jumbo.yearAgoDate || "",
      conventionalSurveyDate: conventional.date || "",
      fhaSurveyDate: fha.date || "",
      vaSurveyDate: va.date || "",
      jumboSurveyDate: jumbo.date || "",
      ratesFetchedAt: new Date().toISOString()
    };

    writeRates(nextState);
    saveStoredRates(nextState);
    setRatesSourceDateLabel(nextState);
  } catch {
    const storedState = loadStoredRates();
    if (storedState) {
      writeRates(storedState);
      setRatesSourceDateLabel(storedState);
    } else {
      setRatesSourceDateLabel({});
    }
  } finally {
    ratesRefreshInFlight = false;
  }
}

async function refreshRiMarket() {
  if (!hasRiMarketTargets) {
    return;
  }

  if (riMarketRefreshInFlight) {
    return;
  }

  riMarketRefreshInFlight = true;

  try {
    const html = await fetchTextViaProxy(RI_MARKET_SOURCE_URL);
    const nextState = parseRiRealtorsMarketTrends(html);

    if (!nextState) {
      throw new Error("Could not parse RI market trends");
    }

    writeRiMarket(nextState);
    saveStoredRiMarket(nextState);
  } catch {
    const storedState = loadStoredRiMarket();
    if (storedState) {
      writeRiMarket(storedState);
    } else {
      writeRiMarket({
        periodLabel: "Update unavailable",
        medianSalesPrice: "--",
        medianSalesPriceTrend: "--",
        homesSold: "--",
        homesSoldTrend: "--",
        pendingSales: "--",
        pendingSalesTrend: "--",
        activeInventory: "--",
        activeInventoryTrend: "--"
      });
    }
  } finally {
    riMarketRefreshInFlight = false;
  }
}

async function initializePortal() {
  if (!IS_PORTAL_PUBLIC_PAGE) {
    document.body.classList.add("portal-protected");
    await ensurePortalAccess();
  }

  updateDateTime();
  setInterval(updateDateTime, 30000);
  initializeMobileMenus();
  initializeCalendarModal();
  initializeRoomBookingModal();
  syncSectionScrollOffset();
  window.requestAnimationFrame(syncSectionScrollOffset);
  syncContentStripVisibility();
  updateActiveSectionFromScroll();
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  }
  window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  window.addEventListener("resize", () => {
    syncSectionScrollOffset();
    requestActiveSectionUpdate();
  });
  window.addEventListener("load", syncSectionScrollOffset, { once: true });

  const storedRates = loadStoredRates();
  if (storedRates && hasRateTargets) {
    writeRates(storedRates);
    setRatesSourceDateLabel(storedRates);
  }

  const storedRiMarket = loadStoredRiMarket();
  if (storedRiMarket && hasRiMarketTargets) {
    writeRiMarket(storedRiMarket);
  }

  const storedJoeAvailability = loadStoredJoeAvailability();
  if (storedJoeAvailability && hasJoeAvailabilityTargets) {
    writeJoeAvailability(storedJoeAvailability);
  } else if (hasJoeAvailabilityTargets) {
    writeJoeAvailability({});
  }

  if (hasRateTargets) {
    refreshRates();
    setInterval(refreshRates, RATE_REFRESH_INTERVAL_MS);
  }

  if (hasRiMarketTargets) {
    refreshRiMarket();
    setInterval(refreshRiMarket, RI_MARKET_REFRESH_INTERVAL_MS);
  }

  if (hasJoeAvailabilityTargets) {
    refreshJoeAvailability();
    setInterval(refreshJoeAvailability, JOE_AVAILABILITY_REFRESH_INTERVAL_MS);
  }
}

initializePortal();
