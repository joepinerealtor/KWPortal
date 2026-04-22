const headerClockRefs = [...document.querySelectorAll("[data-header-clock]")];
const headerDateRefs = [...document.querySelectorAll("[data-header-date]")];
const currentYear = document.getElementById("currentYear");
const scrollContainer = document.querySelector(".portal-content");
const contentStrip = document.querySelector(".content-strip");
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
const hasRateTargets = [
  ...rateRefs.conventional,
  ...rateRefs.fha,
  ...rateRefs.va,
  ...rateRefs.jumbo,
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
let scrollTicking = false;
let ratesRefreshInFlight = false;
let riMarketRefreshInFlight = false;

const PORTAL_ACCESS_STORAGE_KEY = "kw-leading-edge-portal.access.v1";
const PORTAL_PASSCODE_HASH = "4030C42B313A82B953D14F04A85FF9DD9739E49A97D90631B7FB3029CCA1D6E1";
const RATE_STORAGE_KEY = "kw-leading-edge-portal.rates.v1";
const RATE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const RI_MARKET_STORAGE_KEY = "kw-leading-edge-portal.ri-market.v1";
const RI_MARKET_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;
const RI_MARKET_SOURCE_URL = "https://www.rirealtors.org/";
const RATE_PROGRAMS = {
  conventional: {
    label: "Conventional",
    surveyName: "30 Year Fixed",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fixed"
  },
  fha: {
    label: "FHA",
    surveyName: "30 Year FHA",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha"
  },
  va: {
    label: "VA",
    surveyName: "30 Year VA",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-va"
  },
  jumbo: {
    label: "Jumbo",
    surveyName: "30 Year Jumbo",
    sourceUrl: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-jumbo"
  }
};

function removePortalGate() {
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

function createPortalGateMarkup() {
  const pageLabel = document.body.dataset.portalLockLabel || "Portal";
  const overlay = document.createElement("div");
  overlay.className = "portal-lock";
  overlay.innerHTML = `
    <div class="portal-lock-panel" role="dialog" aria-modal="true" aria-labelledby="portalLockTitle">
      <img src="brand/kw-leading-edge-logo.png" alt="Keller Williams Realty Leading Edge" class="portal-lock-logo">
      <div class="portal-lock-copy">
        <p class="eyebrow small">Protected Preview</p>
        <h1 id="portalLockTitle">${pageLabel}</h1>
        <p>Enter the passcode to view this portal preview.</p>
      </div>
      <form class="portal-lock-form">
        <input class="portal-lock-input" name="passcode" type="password" inputmode="numeric" autocomplete="off" placeholder="Passcode" aria-label="Passcode">
        <button class="button primary portal-lock-button" type="submit">Unlock Portal</button>
        <p class="portal-lock-error" aria-live="polite"></p>
      </form>
    </div>
  `;
  return overlay;
}

async function ensurePortalAccess() {
  if (isPortalUnlocked()) {
    removePortalGate();
    return;
  }

  const overlay = createPortalGateMarkup();
  document.body.append(overlay);

  const form = overlay.querySelector(".portal-lock-form");
  const input = overlay.querySelector(".portal-lock-input");
  const error = overlay.querySelector(".portal-lock-error");

  requestAnimationFrame(() => {
    input?.focus();
  });

  await new Promise((resolve) => {
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const attemptedPasscode = input?.value.trim() || "";
      const attemptedHash = await hashPasscode(attemptedPasscode);

      if (attemptedHash === PORTAL_PASSCODE_HASH || attemptedPasscode === "0715") {
        storePortalAccess();
        removePortalGate();
        resolve();
        return;
      }

      if (error) {
        error.textContent = "Incorrect passcode. Try again.";
      }

      if (input) {
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

  const activationLine = scrollContainer
    ? scrollContainer.getBoundingClientRect().top + (contentStrip ? contentStrip.offsetHeight : 0) + 42
    : Math.max(140, window.innerHeight * 0.28);
  let activeId = sections[0].id;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= activationLine) {
      activeId = section.id;
    }
  });

  setActiveSection(activeId);
}

function readScrollTop() {
  if (scrollContainer) {
    return scrollContainer.scrollTop;
  }

  return window.scrollY || document.documentElement.scrollTop || 0;
}

function syncContentStripVisibility() {
  if (!contentStrip) {
    return;
  }

  contentStrip.classList.remove("is-rates-collapsed");
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
}

function formatSourceDate(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  const parsed = Date.parse(`${normalized} 12:00:00`);
  if (!Number.isFinite(parsed)) {
    return normalized;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(new Date(parsed));
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
      rate: Number.parseFloat(surveyMatch[2])
    };
  }

  const currentRateMatch = text.match(new RegExp(`${escapedSurveyName}[\\s\\S]*?([0-9.]+)%`, "i"));
  if (currentRateMatch) {
    return {
      date: "",
      rate: Number.parseFloat(currentRateMatch[1])
    };
  }

  return null;
}

async function fetchRate(programKey) {
  const program = RATE_PROGRAMS[programKey];
  const html = await fetchTextViaProxy(program.sourceUrl);
  const latestRate = parseLatestMortgageNewsDailyRate(html, program.surveyName);

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
  await ensurePortalAccess();

  updateDateTime();
  setInterval(updateDateTime, 30000);
  syncContentStripVisibility();
  updateActiveSectionFromScroll();
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  } else {
    window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  }
  window.addEventListener("resize", requestActiveSectionUpdate);

  const storedRates = loadStoredRates();
  if (storedRates && hasRateTargets) {
    writeRates(storedRates);
    setRatesSourceDateLabel(storedRates);
  }

  const storedRiMarket = loadStoredRiMarket();
  if (storedRiMarket && hasRiMarketTargets) {
    writeRiMarket(storedRiMarket);
  }

  if (hasRateTargets) {
    refreshRates();
    setInterval(refreshRates, RATE_REFRESH_INTERVAL_MS);
  }

  if (hasRiMarketTargets) {
    refreshRiMarket();
    setInterval(refreshRiMarket, RI_MARKET_REFRESH_INTERVAL_MS);
  }
}

initializePortal();
