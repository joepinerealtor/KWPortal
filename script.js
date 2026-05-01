const headerClockRefs = [...document.querySelectorAll("[data-header-clock]")];
const headerDateRefs = [...document.querySelectorAll("[data-header-date]")];
const currentYear = document.getElementById("currentYear");
const scrollContainer = document.querySelector(".page-content");
const contentStrip = document.querySelector(".content-strip--sticky");
const contentStripLinksRow = document.querySelector(".content-strip-row--links");
const contentStripHeadingLinks = document.querySelector(".content-strip-heading--links");
const contentStripHeaderLinks = document.querySelector(".content-strip-links");
const contentStripTechSupport = document.querySelector(".content-strip-tech-support");
const leadershipAvailabilityPanel = document.querySelector("#leadership-support .joe-availability-panel");
const calendarModal = document.querySelector("[data-calendar-modal]");
const calendarModalShell = calendarModal?.querySelector("[data-calendar-modal-shell]");
const calendarModalCloseButton = calendarModal?.querySelector(".calendar-modal__close");
const calendarModalTriggers = [...document.querySelectorAll("[data-calendar-modal-trigger]")];
const handbookModal = document.querySelector("[data-handbook-modal]");
const handbookModalShell = handbookModal?.querySelector("[data-handbook-modal-shell]");
const handbookModalCloseButton = handbookModal?.querySelector(".calendar-modal__close");
const handbookModalTriggers = [...document.querySelectorAll("[data-handbook-modal-trigger]")];
const mobileSidebarMenus = document.querySelector(".mobile-sidebar-menus");
const mobileMenuPanels = [...document.querySelectorAll(".mobile-menu-panel")];
const leadershipGrid = document.querySelector("[data-leadership-grid]");
const alcGrid = document.querySelector("[data-alc-grid]");
const vendorGrids = {
  core: document.querySelector('[data-vendor-grid="core"]'),
  services: document.querySelector('[data-vendor-grid="services"]')
};
const portalLogoutButton = document.querySelector("[data-portal-logout]");
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
function getJoeAvailabilityRef(card) {
  if (!card) {
    return null;
  }

  const ref = {
    card,
    panel: card.querySelector(".joe-availability-panel"),
    light: card.querySelector("[data-joe-availability-light]"),
    label: card.querySelector("[data-joe-availability-label]"),
    summary: card.querySelector("[data-joe-availability-summary]"),
    primaryAction: card.matches("[data-joe-primary-action]")
      ? card
      : card.querySelector("[data-joe-primary-action]")
  };

  return ref.panel && ref.light && ref.label && ref.summary ? ref : null;
}

const joeAvailabilityRefs = [...document.querySelectorAll("[data-joe-availability-card]")]
  .map(getJoeAvailabilityRef)
  .filter(Boolean);
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
let currentJoeAvailabilityRawState = {};
let currentJoeAvailabilityState = { status: "unavailable" };
let calendarModalLastTrigger = null;
let calendarModalCloseTimer = 0;
let hasLoadedCalendarModalContent = false;
let handbookModalLastTrigger = null;
let handbookModalCloseTimer = 0;
let hasLoadedHandbookModalContent = false;

const PORTAL_SECTION_SCROLL_GAP_PX = 22;
const PORTAL_SECTION_SCROLL_FALLBACK_PX = 32;
const PORTAL_ACCESS_STORAGE_KEY = "kw-leading-edge-portal.access.v1";
const PORTAL_ACCESS_COOKIE_NAME = "kw-leading-edge-portal-access";
const PORTAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const PORTAL_COOKIE_NAMES = [
  PORTAL_ACCESS_COOKIE_NAME,
  "portal-access"
];
const PORTAL_CONTENT_URL = "data/portal-content.json";
const PORTAL_PASSCODE_HASH = "4030C42B313A82B953D14F04A85FF9DD9739E49A97D90631B7FB3029CCA1D6E1";
const IS_PORTAL_PUBLIC_PAGE = document.body?.dataset.portalPublic === "true";
const PUBLIC_WEBSITE_URL = "https://www.kwleadingedge.com/";
const TRAINING_CALENDAR_URL = "https://agent.kwleadingedge.com/training-calendar/";
const AGENT_HANDBOOK_URL = "downloads/kwle-agent-handbook-march-2026.pdf";
const JOE_TECH_BOOKING_URL = "https://calendly.com/joepinerealtor/tech-meeting-with-joe";
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
const JOE_AVAILABILITY_WEEKDAY_LABELS = Object.freeze([
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
]);
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

let portalContent = {
  settings: {
    viewerPasscode: "0715"
  },
  leadership: [],
  vendors: []
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `tel:+1${digits.length === 10 ? digits : digits.replace(/^1/, "")}` : "";
}

async function loadPortalContent() {
  try {
    const response = await fetch(`${PORTAL_CONTENT_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Portal content unavailable");
    }
    portalContent = await response.json();
  } catch {
    // Keep the built-in defaults when the content file is not reachable.
  }
}

function getActiveLeadership(group) {
  return (portalContent.leadership || [])
    .filter((person) => person.active !== false && person.group === group);
}

function getActiveVendors(section) {
  return (portalContent.vendors || [])
    .filter((vendor) => vendor.active !== false && vendor.section === section);
}

function createLeaderCard(person) {
  const email = person.email
    ? `<a href="mailto:${escapeHtml(person.email)}" class="leader-contact-link">${escapeHtml(person.email)}</a>`
    : "";
  const phoneHref = toPhoneHref(person.phone);
  const phone = person.phone && phoneHref
    ? `<a href="${phoneHref}" class="leader-contact-link">${escapeHtml(person.phone)}</a>`
    : "";
  const notes = person.notes
    ? `<p class="leader-notes">${escapeHtml(person.notes)}</p>`
    : "";

  return `
    <article class="leader-card${person.featured ? " leader-card-highlight" : ""}">
      <img src="${escapeHtml(person.photo)}" alt="${escapeHtml(person.name)}" class="leader-photo">
      <div class="leader-copy">
        <span class="leader-role">${escapeHtml(person.role)}</span>
        <h3>${escapeHtml(person.name)}</h3>
        ${notes}
        <div class="leader-contact-list">
          ${email}
          ${phone}
        </div>
      </div>
    </article>
  `;
}

function createAlcCard(person) {
  return `
    <a class="alc-poster-card" href="${escapeHtml(person.photo)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(person.name)} ${escapeHtml(person.role)} ALC poster">
      <img src="${escapeHtml(person.photo)}" alt="${escapeHtml(person.name)} ${escapeHtml(person.role)} poster" loading="lazy" decoding="async">
      <span class="alc-poster-copy">
        <strong>${escapeHtml(person.name)}</strong>
        <span>${escapeHtml(person.role || person.notes)}</span>
      </span>
    </a>
  `;
}

function createVendorCard(vendor) {
  const phoneHref = toPhoneHref(vendor.phone);
  const phone = vendor.phone && phoneHref
    ? `<a href="${phoneHref}">${escapeHtml(vendor.phone)}</a>`
    : escapeHtml(vendor.phone || "");
  const email = vendor.email
    ? `<a href="mailto:${escapeHtml(vendor.email)}">${escapeHtml(vendor.email)}</a>`
    : "";
  const featuredClass = vendor.section === "core" ? " vendor-card-featured" : "";

  return `
    <article class="vendor-card${featuredClass}">
      <div class="vendor-brand">
        <img class="vendor-logo" src="${escapeHtml(vendor.logo)}" alt="${escapeHtml(vendor.business || vendor.name)} logo">
      </div>
      <dl class="vendor-details">
        <div><dt>Business</dt><dd>${escapeHtml(vendor.business || "")}</dd></div>
        <div><dt>Name</dt><dd>${escapeHtml(vendor.name || "")}</dd></div>
        <div><dt>Phone</dt><dd>${phone}</dd></div>
        <div><dt>E-mail</dt><dd>${email}</dd></div>
        <div><dt>Notes</dt><dd>${escapeHtml(vendor.notes || "")}</dd></div>
      </dl>
    </article>
  `;
}

function renderPortalContent() {
  if (leadershipGrid) {
    leadershipGrid.innerHTML = getActiveLeadership("office").map(createLeaderCard).join("");
  }

  if (alcGrid) {
    alcGrid.innerHTML = getActiveLeadership("alc").map(createAlcCard).join("");
  }

  Object.entries(vendorGrids).forEach(([section, grid]) => {
    if (grid) {
      grid.innerHTML = getActiveVendors(section).map(createVendorCard).join("");
    }
  });
}

function getPortalCookie(name) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
}

function setPortalCookie(name, value) {
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  const expires = new Date(Date.now() + (PORTAL_COOKIE_MAX_AGE_SECONDS * 1000)).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${PORTAL_COOKIE_MAX_AGE_SECONDS}; Expires=${expires}; path=/; SameSite=Lax${secureFlag}`;
}

function clearPortalLockUrlFlag() {
  const url = new URL(window.location.href);

  if (!url.searchParams.has("portalLock")) {
    return;
  }

  url.searchParams.delete("portalLock");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function getCookiePathVariants() {
  const paths = new Set(["/"]);
  const parts = window.location.pathname.split("/").filter(Boolean);

  parts.forEach((part, index) => {
    if (index === parts.length - 1 && part.includes(".")) {
      return;
    }

    const path = `/${parts.slice(0, index + 1).join("/")}`;
    paths.add(path);
    paths.add(`${path}/`);
  });

  return [...paths];
}

function getCookieDomainVariants() {
  const hostname = window.location.hostname;
  const domains = [""];

  if (!hostname || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return domains;
  }

  const rootDomain = hostname.replace(/^www\./, "");
  domains.push(`; domain=${hostname}`);
  domains.push(`; domain=.${rootDomain}`);

  if (rootDomain !== hostname) {
    domains.push(`; domain=${rootDomain}`);
  }

  return [...new Set(domains)];
}

function clearPortalCookie(name) {
  getCookiePathVariants().forEach((path) => {
    getCookieDomainVariants().forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=${path}${domain}`;
      document.cookie = `${name}=; Max-Age=0; path=${path}; SameSite=Lax${domain}`;
    });
  });
}

function clearPortalCookies() {
  PORTAL_COOKIE_NAMES.forEach(clearPortalCookie);
}

function clearAllAccessibleCookies() {
  const cookieNames = new Set(PORTAL_COOKIE_NAMES);
  document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter(Boolean)
    .forEach((name) => cookieNames.add(name));

  cookieNames.forEach(clearPortalCookie);
}

function logoutPortal() {
  try {
    window.localStorage.removeItem(PORTAL_ACCESS_STORAGE_KEY);
    window.sessionStorage.clear();
  } catch {
    // Ignore storage failures while still returning to the lock screen.
  }

  clearAllAccessibleCookies();
  window.location.href = `${window.location.pathname}?portalLock=1`;
}

function removePortalGate() {
  cleanupPortalUnlockTransition();
  document.querySelector(".portal-lock")?.remove();
  document.body.classList.remove("portal-protected");
}

function isPortalUnlocked() {
  const hasAccessCookie = getPortalCookie(PORTAL_ACCESS_COOKIE_NAME) === PORTAL_PASSCODE_HASH;

  try {
    return window.localStorage.getItem(PORTAL_ACCESS_STORAGE_KEY) === PORTAL_PASSCODE_HASH || hasAccessCookie;
  } catch {
    return hasAccessCookie;
  }
}

function storePortalAccess() {
  try {
    window.localStorage.setItem(PORTAL_ACCESS_STORAGE_KEY, PORTAL_PASSCODE_HASH);
  } catch {
    // Ignore storage failures and keep access for this page load only.
  }
  setPortalCookie(PORTAL_ACCESS_COOKIE_NAME, PORTAL_PASSCODE_HASH);
  clearPortalLockUrlFlag();
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
  const leaders = getActiveLeadership("office");

  return leaders
    .map((leader) => {
      const phoneHref = toPhoneHref(leader.phone);
      return `
        <article class="leader-card">
          <img src="${escapeHtml(leader.photo)}" alt="${escapeHtml(leader.name)}" class="leader-photo">
          <div class="leader-copy">
            <span class="leader-role">${escapeHtml(leader.role)}</span>
            <h3>${escapeHtml(leader.name)}</h3>
            <div class="leader-contact-list">
              ${leader.email ? `<a href="mailto:${escapeHtml(leader.email)}" class="leader-contact-link">${escapeHtml(leader.email)}</a>` : ""}
              ${leader.phone && phoneHref ? `<a href="${phoneHref}" class="leader-contact-link">${escapeHtml(leader.phone)}</a>` : ""}
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
  if (isPortalUnlocked()) {
    clearPortalLockUrlFlag();
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

      const viewerPasscode = String(portalContent.settings?.viewerPasscode || "0715").trim();
      const isViewerCode = attemptedHash === PORTAL_PASSCODE_HASH || attemptedPasscode === viewerPasscode;

      if (isViewerCode) {
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

function initializePortalControls() {
  portalLogoutButton?.addEventListener("click", logoutPortal);
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

function isElementVisibleInActiveViewport(element, minVisiblePx = 24) {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  const viewport = usesInternalSectionScroll() && scrollContainer
    ? scrollContainer.getBoundingClientRect()
    : {
        top: 0,
        right: window.innerWidth || document.documentElement.clientWidth || 0,
        bottom: window.innerHeight || document.documentElement.clientHeight || 0,
        left: 0
      };
  const visibleWidth = Math.min(rect.right, viewport.right) - Math.max(rect.left, viewport.left);
  const visibleHeight = Math.min(rect.bottom, viewport.bottom) - Math.max(rect.top, viewport.top);

  return visibleWidth > 0 && visibleHeight >= Math.min(minVisiblePx, rect.height);
}

function syncLeadershipTechHelpVisibility() {
  const isLeadershipTechVisible = isElementVisibleInActiveViewport(leadershipAvailabilityPanel);
  contentStrip?.classList.toggle("is-leadership-tech-visible", isLeadershipTechVisible);
  document.body.classList.toggle("is-leadership-tech-visible", isLeadershipTechVisible);
}

function syncHeaderTechHelpPlacement() {
  if (!contentStrip || !contentStripLinksRow || !contentStripHeaderLinks || !contentStripTechSupport) {
    return;
  }

  contentStrip.classList.remove("is-header-tech-floating");
  document.body.classList.remove("is-header-tech-floating");

  const mobileMenusAreVisible = mobileSidebarMenus
    && window.getComputedStyle(mobileSidebarMenus).display !== "none";
  const stripRect = contentStrip.getBoundingClientRect();
  const stripIsVisible = stripRect.width > 0
    && stripRect.height > 0
    && window.getComputedStyle(contentStrip).display !== "none";

  if (!stripIsVisible || mobileMenusAreVisible || contentStrip.classList.contains("is-leadership-tech-visible")) {
    return;
  }

  const supportRect = contentStripTechSupport.getBoundingClientRect();
  const linksRect = contentStripHeaderLinks.getBoundingClientRect();
  const headingRect = contentStripHeadingLinks?.getBoundingClientRect();

  if (supportRect.width <= 0 || supportRect.height <= 0 || linksRect.width <= 0 || linksRect.height <= 0) {
    return;
  }

  const inlineReferenceRects = [linksRect, headingRect].filter(Boolean);
  const firstLineTop = Math.min(...inlineReferenceRects.map((rect) => rect.top));
  const firstLineBottom = Math.max(...inlineReferenceRects.map((rect) => rect.bottom));
  const firstLineCenter = firstLineTop + ((firstLineBottom - firstLineTop) / 2);
  const supportCenter = supportRect.top + (supportRect.height / 2);
  const rowGap = parseFloat(window.getComputedStyle(contentStripLinksRow).rowGap) || 0;
  const quickLinkRects = [...contentStripHeaderLinks.children]
    .map((child) => child.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
  const tallestQuickLink = quickLinkRects.length
    ? Math.max(...quickLinkRects.map((rect) => rect.height))
    : linksRect.height;
  const quickLinksWrapped = linksRect.height > tallestQuickLink + Math.max(5, rowGap / 2);
  const supportDroppedBelowLinks = supportRect.top > firstLineBottom + Math.max(3, rowGap / 2);
  const supportCenterDrift = Math.abs(supportCenter - firstLineCenter);
  const supportIsOnDifferentLine = supportCenterDrift > Math.max(12, Math.min(26, supportRect.height * 0.45));
  const supportOverflowsStrip = supportRect.right > stripRect.right + 1 || supportRect.left < stripRect.left - 1;
  const shouldFloatHeaderTech = quickLinksWrapped
    || supportDroppedBelowLinks
    || supportIsOnDifferentLine
    || supportOverflowsStrip;

  contentStrip.classList.toggle("is-header-tech-floating", shouldFloatHeaderTech);
  document.body.classList.toggle("is-header-tech-floating", shouldFloatHeaderTech);
}

function queueHeaderTechHelpPlacementSync() {
  window.requestAnimationFrame(syncHeaderTechHelpPlacement);
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
  if (contentStrip) {
    const isCollapsed = readScrollTop() > 24;
    contentStrip.classList.toggle("is-market-collapsed", isCollapsed);
  }

  syncLeadershipTechHelpVisibility();
  syncHeaderTechHelpPlacement();
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

function ensureHandbookModalContent() {
  if (!handbookModalShell || hasLoadedHandbookModalContent) {
    return;
  }

  handbookModalShell.innerHTML = `
    <iframe
      class="calendar-modal__iframe"
      src="${AGENT_HANDBOOK_URL}#toolbar=1&navpanes=0"
      title="KW Leading Edge Agent Handbook"
      loading="lazy"
    ></iframe>
  `;

  hasLoadedHandbookModalContent = true;
}

function closeHandbookModal() {
  if (!handbookModal || handbookModal.hidden) {
    return;
  }

  handbookModal.classList.remove("is-open");
  document.body.classList.remove("has-handbook-modal");

  const returnFocusTarget = handbookModalLastTrigger;

  window.clearTimeout(handbookModalCloseTimer);
  handbookModalCloseTimer = window.setTimeout(() => {
    if (!handbookModal.classList.contains("is-open")) {
      handbookModal.hidden = true;
    }

    if (returnFocusTarget instanceof HTMLElement) {
      returnFocusTarget.focus();
    }
  }, 180);
}

function openHandbookModal(trigger = null) {
  if (!handbookModal) {
    return;
  }

  handbookModalLastTrigger = trigger instanceof HTMLElement
    ? trigger
    : (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  window.clearTimeout(handbookModalCloseTimer);
  handbookModal.hidden = false;
  document.body.classList.add("has-handbook-modal");

  requestAnimationFrame(() => {
    handbookModal.classList.add("is-open");
    ensureHandbookModalContent();
    (handbookModalCloseButton || handbookModal)?.focus?.();
  });
}

function initializeHandbookModal() {
  if (!handbookModal || !handbookModalTriggers.length) {
    return;
  }

  handbookModalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openHandbookModal(trigger);
    });
  });

  handbookModal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("[data-handbook-modal-close]")) {
      closeHandbookModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !handbookModal.hidden) {
      event.preventDefault();
      closeHandbookModal();
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
          <p class="eyebrow small room-booking-eyebrow">Conference Room Booking</p>
          <h2 class="room-booking-title" id="roomBookingTitle">Book a Room</h2>
          <p class="room-booking-summary">Choose an available time and complete the reservation without leaving the portal.</p>
        </div>
        <div class="room-booking-availability" data-room-booking-availability data-joe-availability-card data-joe-availability-src="data/joe-tech-status.json" hidden>
          <div class="joe-availability-panel joe-availability-panel--modal" data-status="unavailable" aria-live="polite">
            <span class="joe-availability-light" data-joe-availability-light aria-hidden="true"></span>
            <div class="joe-availability-copy">
              <p class="joe-availability-label" data-joe-availability-label>Joe is unavailable</p>
              <p class="joe-availability-summary" data-joe-availability-summary>No open tech-help slots are listed right now.</p>
            </div>
          </div>
        </div>
        <button type="button" class="button secondary compact room-booking-close">Close</button>
      </div>
      <div class="room-booking-quick-actions" data-room-booking-quick-actions hidden></div>
      <div class="room-booking-frame-shell">
        <iframe class="room-booking-frame" title="Booking calendar" src="about:blank" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
    </div>
  `;
  return modal;
}

function getCalendlyEmbedUrl(url) {
  if (!url || !url.includes("calendly.com")) {
    return url;
  }

  try {
    const calendlyUrl = new URL(url, window.location.href);
    calendlyUrl.searchParams.set("embed_domain", "agent.kwleadingedge.com");
    calendlyUrl.searchParams.set("embed_type", "Inline");
    calendlyUrl.searchParams.set("back", "1");
    return calendlyUrl.toString();
  } catch {
    return url;
  }
}

function registerJoeAvailabilityCard(card) {
  if (!hasJoeAvailabilityTargets || !card || joeAvailabilityRefs.some((ref) => ref.card === card)) {
    return;
  }

  const ref = getJoeAvailabilityRef(card);
  if (!ref) {
    return;
  }

  joeAvailabilityRefs.push(ref);
  writeJoeAvailability(currentJoeAvailabilityRawState);
}

function initializeRoomBookingModal() {
  const triggers = [
    ...document.querySelectorAll(".room-booking-trigger[data-room-booking-url]"),
    ...document.querySelectorAll('a[href*="calendly.com/joepinerealtor/tech-meeting-with-joe"]')
  ];
  if (!triggers.length) {
    return;
  }

  const modal = createRoomBookingModal();
  document.body.append(modal);
  registerJoeAvailabilityCard(modal.querySelector("[data-room-booking-availability]"));

  const title = modal.querySelector(".room-booking-title");
  const summary = modal.querySelector(".room-booking-summary");
  const eyebrow = modal.querySelector(".room-booking-eyebrow");
  const availability = modal.querySelector("[data-room-booking-availability]");
  const quickActions = modal.querySelector("[data-room-booking-quick-actions]");
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

  const renderJoeBookingActions = (isJoeBooking) => {
    if (!quickActions) {
      return;
    }

    quickActions.replaceChildren();
    quickActions.hidden = true;
  };

  const openModal = (trigger) => {
    const href = trigger.getAttribute("href") || "";
    const isJoeBooking = href.includes("calendly.com/joepinerealtor/tech-meeting-with-joe");
    const bookingUrl = getCalendlyEmbedUrl(trigger.dataset.roomBookingUrl || href);
    const bookingLabel = trigger.dataset.roomBookingLabel || (isJoeBooking ? "Schedule a Time with Joe" : "Conference Room");
    const bookingEyebrow = trigger.dataset.roomBookingEyebrow || (isJoeBooking ? "Tech Help Scheduling" : "Conference Room Booking");
    const bookingSummary = trigger.dataset.roomBookingSummary || (isJoeBooking
      ? "Choose an available tech-help time with Joe in Calendly."
      : `Complete the ${bookingLabel.toLowerCase()} reservation in Calendly.`);

    if (!bookingUrl || !title || !summary || !eyebrow || !iframe) {
      return;
    }

    window.clearTimeout(closeTimer);
    lastTrigger = trigger;
    eyebrow.textContent = bookingEyebrow;
    title.textContent = bookingLabel;
    summary.textContent = bookingSummary;
    if (availability) {
      availability.hidden = !isJoeBooking;
    }
    renderJoeBookingActions(isJoeBooking);
    iframe.hidden = false;
    iframe.setAttribute("title", bookingLabel);
    iframe.setAttribute("src", bookingUrl);
    modal.removeAttribute("hidden");
    document.body.classList.add("has-room-booking-modal");

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    closeButton?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const bookingSource = trigger.dataset.roomBookingUrl || trigger.getAttribute("href") || "";
      if (!bookingSource.includes("calendly.com")) {
        return;
      }

      event.preventDefault();
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
    return `${timeLabel} today`;
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

function formatJoeAvailabilityCompactUntilLabel(iso, timezone = JOE_AVAILABILITY_FALLBACK_TIMEZONE, referenceDate = new Date()) {
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
    return `${timeLabel} today`;
  }

  const targetYear = getJoeAvailabilityLocalYear(date, timezone);
  const referenceYear = getJoeAvailabilityLocalYear(referenceDate, timezone);
  const dateOptions = {
    timeZone: timezone,
    weekday: "short",
    month: "short",
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
      weekday: "short",
      month: "short",
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

function getJoeAvailabilityIsoMs(value) {
  const date = value ? parseJoeAvailabilityDate(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.getTime()
    : Number.NaN;
}

function getJoeAvailabilityEffectiveAvailableEndMs(availableNowEndMs, nextBusyStartMs, workingWindowEndMs, fallbackEndMs, nowMs) {
  if (Number.isFinite(availableNowEndMs) && availableNowEndMs > nowMs) {
    return availableNowEndMs;
  }

  const endCandidates = [nextBusyStartMs, workingWindowEndMs]
    .filter((value) => Number.isFinite(value) && value > nowMs);

  return endCandidates.length
    ? Math.min(...endCandidates)
    : fallbackEndMs;
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

function formatJoeAvailabilityMinutes(minutes) {
  if (!Number.isFinite(minutes)) {
    return "";
  }

  const normalizedMinutes = Math.max(0, Math.min(1439, Math.round(minutes)));
  const hours24 = Math.floor(normalizedMinutes / 60);
  const minuteValue = normalizedMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const minuteLabel = minuteValue ? `:${String(minuteValue).padStart(2, "0")}` : "";
  return `${hours12}${minuteLabel} ${period}`;
}

function formatJoeAvailabilityOfficeHours(rawHours = []) {
  const workingHours = normalizeJoeWorkingHours(rawHours);
  if (!workingHours.length) {
    return "Office hours available by appointment";
  }

  const orderedHours = [...workingHours].sort((left, right) => left.dayIndex - right.dayIndex);
  const ranges = [];
  let currentRange = null;

  orderedHours.forEach((entry) => {
    const matchesCurrentRange = currentRange
      && entry.dayIndex === currentRange.endDayIndex + 1
      && entry.startMinutes === currentRange.startMinutes
      && entry.endMinutes === currentRange.endMinutes;

    if (matchesCurrentRange) {
      currentRange.endDayIndex = entry.dayIndex;
      return;
    }

    currentRange = {
      startDayIndex: entry.dayIndex,
      endDayIndex: entry.dayIndex,
      startMinutes: entry.startMinutes,
      endMinutes: entry.endMinutes
    };
    ranges.push(currentRange);
  });

  const rangeLabels = ranges
    .map((range) => {
      const startDay = JOE_AVAILABILITY_WEEKDAY_LABELS[range.startDayIndex] || "";
      const endDay = JOE_AVAILABILITY_WEEKDAY_LABELS[range.endDayIndex] || "";
      const dayLabel = range.startDayIndex === range.endDayIndex ? startDay : `${startDay}-${endDay}`;
      const startTime = formatJoeAvailabilityMinutes(range.startMinutes);
      const endTime = formatJoeAvailabilityMinutes(range.endMinutes);
      return dayLabel && startTime && endTime ? `${dayLabel} ${startTime}-${endTime}` : "";
    })
    .filter(Boolean);

  return rangeLabels.length
    ? `Hours ${rangeLabels.join("; ")}`
    : "Office hours available by appointment";
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
  const availableNowEndMs = getJoeAvailabilityIsoMs(availableNowEndIso);
  const busyNowStartIso = typeof rawState?.busyNowStartIso === "string"
    ? rawState.busyNowStartIso
    : "";
  const busyNowStartMs = getJoeAvailabilityIsoMs(busyNowStartIso);
  const busyNowEndIso = typeof rawState?.busyNowEndIso === "string"
    ? rawState.busyNowEndIso
    : "";
  const busyNowEndMs = getJoeAvailabilityIsoMs(busyNowEndIso);
  const nextBusyStartIso = typeof rawState?.nextBusyStartIso === "string"
    ? rawState.nextBusyStartIso
    : "";
  const nextBusyStartMs = getJoeAvailabilityIsoMs(nextBusyStartIso);
  const nextAppointmentAvailableIso = typeof rawState?.nextAppointmentAvailableIso === "string"
    ? rawState.nextAppointmentAvailableIso
    : "";
  const nextAppointmentAvailableMs = getJoeAvailabilityIsoMs(nextAppointmentAvailableIso);
  const nextOpenSlotWorkingWindowEndIso = typeof rawState?.nextOpenSlotWorkingWindowEndIso === "string"
    ? rawState.nextOpenSlotWorkingWindowEndIso
    : "";
  const nextOpenSlotWorkingWindowEndMs = getJoeAvailabilityIsoMs(nextOpenSlotWorkingWindowEndIso);
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
  const isBusyNow = Number.isFinite(busyNowEndMs)
    && busyNowEndMs > nowMs
    && (!Number.isFinite(busyNowStartMs) || busyNowStartMs <= nowMs);
  const availableNowLabel = rawState?.availableNowLabel || "Joe is available to chat";
  const busyNowLabel = rawState?.busyNowLabel || "Joe is in another appointment";
  const unavailableLabel = rawState?.unavailableLabel || "Joe is unavailable";
  const baseStatus = [
    "available",
    "available_now",
    "unavailable"
  ].includes(rawState?.status)
    ? rawState.status
    : "unavailable";
  let status = "unavailable";

  if (isBusyNow) {
    status = "unavailable";
  } else if (baseStatus === "available_now" && Number.isFinite(availableNowEndMs) && isWithinWorkingHoursNow && nowMs < availableNowEndMs) {
    status = "available_now";
  }

  if (status === "available_now") {
    const effectiveAvailableNowEndMs = getJoeAvailabilityEffectiveAvailableEndMs(
      availableNowEndMs,
      nextBusyStartMs,
      nextOpenSlotWorkingWindowEndMs,
      nextOpenSlotEndMs,
      nowMs
    );
    const endLabel = Number.isFinite(effectiveAvailableNowEndMs)
      ? formatJoeAvailabilityTime(new Date(effectiveAvailableNowEndMs).toISOString(), timezone)
      : "";
    const nextAppointmentLabel = Number.isFinite(nextAppointmentAvailableMs) && nextAppointmentAvailableMs > nowMs
      ? formatJoeAvailabilityUntilLabel(nextAppointmentAvailableIso, timezone, new Date(nowMs))
      : "";

    return {
      status,
      label: availableNowLabel,
      summary: nextAppointmentLabel && endLabel
        ? `Current availability runs until ${endLabel}. Next appointment available at ${nextAppointmentLabel}.`
        : (nextAppointmentLabel
        ? `Next appointment available at ${nextAppointmentLabel}.`
        : (rawState?.availableNowSummary || (endLabel
        ? `Schedule an appointment with Joe. Current availability runs until ${endLabel}.`
        : "Schedule an appointment with Joe.")))
    };
  }

  if (status === "unavailable") {
    const busyUntilLabel = isBusyNow
      ? formatJoeAvailabilityUntilLabel(busyNowEndIso, timezone, new Date(nowMs))
      : "";
    const nextAppointmentLabel = Number.isFinite(nextAppointmentAvailableMs) && nextAppointmentAvailableMs > nowMs
      ? formatJoeAvailabilityNextSlotLabel(nextAppointmentAvailableIso, timezone, new Date(nowMs))
      : "";
    const nextSlotLabel = Number.isFinite(nextOpenSlotMs) && nextOpenSlotMs > nowMs && isNextSlotWithinWorkingHours
      ? formatJoeAvailabilityNextSlotLabel(nextOpenSlotIso, timezone, new Date(nowMs))
      : "";
    const nextLabel = nextAppointmentLabel || nextSlotLabel;

    return {
      status,
      label: isBusyNow ? busyNowLabel : unavailableLabel,
      summary: busyUntilLabel
        ? `Next available time is ${busyUntilLabel}.`
        : (nextLabel
        ? `Next available time is ${nextLabel}.`
        : (rawState?.noSlotsSummary || "No open tech-help slots are listed right now."))
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
  const officeHoursLabel = formatJoeAvailabilityOfficeHours(rawState?.workingHours);
  const parsedDuration = Number.parseInt(rawState?.eventDurationMinutes, 10);
  const eventDurationMinutes = Number.isFinite(parsedDuration) && parsedDuration > 0
    ? parsedDuration
    : JOE_AVAILABILITY_DEFAULT_DURATION_MINUTES;
  const availableNowEndIso = typeof rawState?.availableNowEndIso === "string"
    ? rawState.availableNowEndIso
    : "";
  const availableNowEndMs = getJoeAvailabilityIsoMs(availableNowEndIso);
  const busyNowStartIso = typeof rawState?.busyNowStartIso === "string"
    ? rawState.busyNowStartIso
    : "";
  const busyNowStartMs = getJoeAvailabilityIsoMs(busyNowStartIso);
  const busyNowEndIso = typeof rawState?.busyNowEndIso === "string"
    ? rawState.busyNowEndIso
    : "";
  const busyNowEndMs = getJoeAvailabilityIsoMs(busyNowEndIso);
  const nextBusyStartIso = typeof rawState?.nextBusyStartIso === "string"
    ? rawState.nextBusyStartIso
    : "";
  const nextBusyStartMs = getJoeAvailabilityIsoMs(nextBusyStartIso);
  const nextAppointmentAvailableIso = typeof rawState?.nextAppointmentAvailableIso === "string"
    ? rawState.nextAppointmentAvailableIso
    : "";
  const nextAppointmentAvailableMs = getJoeAvailabilityIsoMs(nextAppointmentAvailableIso);
  const nextOpenSlotWorkingWindowEndIso = typeof rawState?.nextOpenSlotWorkingWindowEndIso === "string"
    ? rawState.nextOpenSlotWorkingWindowEndIso
    : "";
  const nextOpenSlotWorkingWindowEndMs = getJoeAvailabilityIsoMs(nextOpenSlotWorkingWindowEndIso);
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
  const isBusyNow = Number.isFinite(busyNowEndMs)
    && busyNowEndMs > nowMs
    && (!Number.isFinite(busyNowStartMs) || busyNowStartMs <= nowMs);

  if (normalizedState.status === "available_now") {
    const effectiveAvailableNowEndMs = getJoeAvailabilityEffectiveAvailableEndMs(
      availableNowEndMs,
      nextBusyStartMs,
      nextOpenSlotWorkingWindowEndMs,
      nextOpenSlotEndMs,
      nowMs
    );
    const endLabel = Number.isFinite(effectiveAvailableNowEndMs)
      ? formatJoeAvailabilityCompactUntilLabel(new Date(effectiveAvailableNowEndMs).toISOString(), timezone, new Date(nowMs))
      : "";
    const nextAppointmentLabel = Number.isFinite(nextAppointmentAvailableMs) && nextAppointmentAvailableMs > nowMs
      ? formatJoeAvailabilityCompactUntilLabel(nextAppointmentAvailableIso, timezone, new Date(nowMs))
      : "";

    return {
      label: endLabel ? `Available until ${endLabel}` : "Joe is available now",
      summary: nextAppointmentLabel
        ? `Next appointment available at ${nextAppointmentLabel}`
        : officeHoursLabel
    };
  }

  if (normalizedState.status === "unavailable") {
    const busyUntilLabel = isBusyNow
      ? formatJoeAvailabilityCompactUntilLabel(busyNowEndIso, timezone, new Date(nowMs))
      : "";
    const nextAppointmentLabel = Number.isFinite(nextAppointmentAvailableMs) && nextAppointmentAvailableMs > nowMs
      ? formatJoeAvailabilityCompactUntilLabel(nextAppointmentAvailableIso, timezone, new Date(nowMs))
      : "";
    const nextSlotLabel = Number.isFinite(nextOpenSlotMs) && nextOpenSlotMs > nowMs
      ? formatJoeAvailabilityCompactUntilLabel(nextOpenSlotIso, timezone, new Date(nowMs))
      : "";
    const untilLabel = nextAppointmentLabel || nextSlotLabel;

    return {
      label: busyUntilLabel
        ? `Unavailable until ${busyUntilLabel}`
        : (untilLabel ? `Unavailable until ${untilLabel}` : "Joe is unavailable"),
      summary: officeHoursLabel
    };
  }

  return {
    label: normalizedState.label || "Joe is unavailable",
    summary: officeHoursLabel
  };
}

function getMobileBubbleJoeAvailabilityState(normalizedState = {}) {
  if (normalizedState.status === "available_now") {
    return {
      label: "Joe is available now",
      summary: "Tap to schedule an appointment"
    };
  }

  return {
    label: "Schedule an appointment",
    summary: "Tap to schedule an appointment"
  };
}

function updateJoeAvailabilityAction(action) {
  if (!action) {
    return;
  }

  const isMobileBubbleAction = action.classList.contains("mobile-tech-help-bubble");
  action.href = JOE_TECH_BOOKING_URL;

  if (!isMobileBubbleAction) {
    action.textContent = "Schedule an appointment";
  }

  action.setAttribute("target", "_blank");
  action.setAttribute("rel", "noreferrer");

  if (isMobileBubbleAction) {
    action.setAttribute("aria-label", "Schedule tech help with Joe");
  }
}

function syncJoeAvailabilityActions(ref, state) {
  updateJoeAvailabilityAction(ref.primaryAction);
}

function writeJoeAvailability(rawState = {}) {
  if (!hasJoeAvailabilityTargets) {
    return;
  }

  currentJoeAvailabilityRawState = rawState;
  const state = normalizeJoeAvailabilityState(rawState);
  currentJoeAvailabilityState = state;

  joeAvailabilityRefs.forEach((ref) => {
    const isCompactHeaderWidget = ref.panel.classList.contains("joe-availability-panel--compact");
    const isLeadershipSupportWidget = ref.card.classList.contains("leadership-support-card");
    const isModalHeaderWidget = ref.panel.classList.contains("joe-availability-panel--modal");
    const isMobileBubbleWidget = ref.card.classList.contains("mobile-tech-help-bubble");
    const ctaState = isCompactHeaderWidget || isLeadershipSupportWidget || isModalHeaderWidget
      ? getCompactJoeAvailabilityState(rawState, state)
      : null;
    const bubbleState = isMobileBubbleWidget ? getMobileBubbleJoeAvailabilityState(state) : null;
    const displayState = bubbleState || ctaState;

    ref.panel.dataset.status = state.status;
    ref.panel.hidden = false;
    ref.label.textContent = displayState ? displayState.label : state.label;
    const summaryText = displayState ? displayState.summary : state.summary;
    ref.summary.textContent = summaryText;
    ref.summary.hidden = false;
    syncJoeAvailabilityActions(ref, state);
  });

  window.requestAnimationFrame(syncHeaderTechHelpPlacement);
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
  await loadPortalContent();
  renderPortalContent();
  initializePortalControls();

  if (!IS_PORTAL_PUBLIC_PAGE) {
    document.body.classList.add("portal-protected");
    await ensurePortalAccess();
  }

  updateDateTime();
  setInterval(updateDateTime, 30000);
  initializeMobileMenus();
  initializeCalendarModal();
  initializeHandbookModal();
  initializeRoomBookingModal();
  syncSectionScrollOffset();
  window.requestAnimationFrame(syncSectionScrollOffset);
  syncContentStripVisibility();
  queueHeaderTechHelpPlacementSync();
  window.requestAnimationFrame(queueHeaderTechHelpPlacementSync);
  updateActiveSectionFromScroll();
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  }
  window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  window.addEventListener("resize", () => {
    syncSectionScrollOffset();
    requestActiveSectionUpdate();
  });
  window.addEventListener("load", () => {
    syncSectionScrollOffset();
    syncContentStripVisibility();
  }, { once: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(queueHeaderTechHelpPlacementSync).catch(() => {});
  }

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
