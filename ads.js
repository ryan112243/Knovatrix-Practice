const AD_CONFIG = {
  mode: "random-per-visit",
  houseRotationMs: 45000,
  providers: {
    aads: {
      units: {
        desktop: "2451882",
        mobile: "2451883"
      }
    },
    adsterra: {
      units: {
        desktop: { key: "a49d8a3918b8e39eccff0d57a4cb8f06", scriptUrl: "https://www.highperformanceformat.com/a49d8a3918b8e39eccff0d57a4cb8f06/invoke.js", width: 160, height: 600 },
        mobile: { key: "ae80e9de9d4329b9b6d0a17ac3308aaf", scriptUrl: "https://www.highperformanceformat.com/ae80e9de9d4329b9b6d0a17ac3308aaf/invoke.js", width: 320, height: 50 }
      }
    },
    house: {
      ads: [
        { title: "RollerCoin", text: "", href: "https://rollercoin.com/?r=mn67zsfp", image: "https://static.rollercoin.com/static/img/ref/gen3/w160h600.gif" },
        { title: "RollerCoin", text: "", href: "https://rollercoin.com/?r=mn67zsfp", image: "https://static.rollercoin.com/static/img/ref/gen2/w160h600.gif" }
      ],
      mobileAds: [
        { title: "RollerCoin", text: "", href: "https://rollercoin.com/?r=mn67zsfp", image: "https://static.rollercoin.com/static/img/ref/gen3/w320h50.gif" }
      ]
    }
  }
};

const AD_SESSION_KEY = "knovatrix-ad-provider-v4";
const refreshTimers = new WeakMap();

function adIsDesktop() {
  return window.matchMedia("(min-width: 1181px)").matches;
}

function placementGroup(placement) {
  return placement === "desktop-left" || placement === "desktop-right" ? "desktop" : "mobile";
}

function placementIsVisible(placement) {
  return adIsDesktop()
    ? placementGroup(placement) === "desktop"
    : placementGroup(placement) === "mobile";
}

function configuredProviders(placement) {
  const group = placementGroup(placement);
  const providers = [];
  if (AD_CONFIG.providers.aads.units[group]) providers.push("aads");
  const adsterra = AD_CONFIG.providers.adsterra.units[group];
  if (adsterra && adsterra.key && adsterra.scriptUrl) providers.push("adsterra");
  if ((group === "desktop" && AD_CONFIG.providers.house.ads.length) || (group === "mobile" && AD_CONFIG.providers.house.mobileAds.length)) providers.push("house");
  return providers;
}

function readSessionSelections() {
  try {
    return JSON.parse(sessionStorage.getItem(AD_SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

function providerFor(placement, excluded = "") {
  const available = configuredProviders(placement);
  if (!available.length) return "";
  const selected = readSessionSelections();
  let candidates = available.filter(provider => provider !== excluded);
  if (!candidates.length) candidates = available;
  const weights = { aads: 2, adsterra: 2, house: 1 };
  const weighted = candidates.flatMap(provider => Array(weights[provider] || 1).fill(provider));
  const provider = excluded || !available.includes(selected[placement])
    ? weighted[Math.floor(Math.random() * weighted.length)]
    : selected[placement];
  selected[placement] = provider;
  try { sessionStorage.setItem(AD_SESSION_KEY, JSON.stringify(selected)); } catch {}
  return provider;
}


function makeFrame(title) {
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.loading = "lazy";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin");
  return frame;
}

function mountExternalFrame(slot, frame) {
  slot.append(frame);
}


function renderAads(slot, placement) {
  const group = placementGroup(placement);
  const unitId = AD_CONFIG.providers.aads.units[group];
  const size = group === "desktop" ? "160x600" : "320x50";
  const frame = makeFrame("A-ADS ???");
  frame.dataset.aa = unitId;
  frame.width = group === "desktop" ? 160 : 320;
  frame.height = group === "desktop" ? 600 : 50;
  frame.src = `https://ad.a-ads.com/${unitId}/?size=${size}`;
  mountExternalFrame(slot, frame);
}


function renderAdsterra(slot, placement) {
  const unit = AD_CONFIG.providers.adsterra.units[placementGroup(placement)];
  const frame = makeFrame("Adsterra ???");
  frame.width = unit.width;
  frame.height = unit.height;
  const options = JSON.stringify({ key: unit.key, format: "iframe", height: unit.height, width: unit.width, params: {} });
  frame.srcdoc = `<!doctype html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh;overflow:hidden"><script>atOptions=${options}<\/script><script src="${unit.scriptUrl}"><\/script></body></html>`;
  mountExternalFrame(slot, frame);
}

function renderHouse(slot, placement) {
  const group = placementGroup(placement);
  const ads = group === "mobile" ? AD_CONFIG.providers.house.mobileAds : AD_CONFIG.providers.house.ads;
  if (!ads.length) return;
  const ad = ads[Math.floor(Math.random() * ads.length)];
  const link = document.createElement("a");
  link.className = "house-ad";
  link.href = ad.href;
  link.target = "_blank";
  link.rel = "sponsored noopener noreferrer";
  if (ad.image) {
    const img = document.createElement("img");
    img.src = ad.image;
    img.alt = "";
    img.loading = "lazy";
    link.append(img);
  }
  const copy = document.createElement("span");
  const title = document.createElement("b");
  title.textContent = ad.title;
  const description = document.createElement("small");
  description.textContent = ad.text || "";
  copy.append(title, description);
  link.append(copy);
  slot.replaceChildren(link);
}


function renderProvider(slot, placement, provider) {
  slot.replaceChildren();
  slot.classList.toggle("has-ad", Boolean(provider));
  slot.dataset.adProvider = provider;
  if (provider === "aads") renderAads(slot, placement);
  if (provider === "adsterra") renderAdsterra(slot, placement);
  if (provider === "house") renderHouse(slot, placement);
}


function scheduleRefresh(slot, placement, provider) {
  const oldTimer = refreshTimers.get(slot);
  if (oldTimer) window.clearTimeout(oldTimer);
  const timer = window.setTimeout(() => {
    if (!slot.isConnected || !placementIsVisible(placement)) return;
    const nextProvider = providerFor(placement, provider);
    renderProvider(slot, placement, nextProvider);
    scheduleRefresh(slot, placement, nextProvider);
  }, 40000);
  refreshTimers.set(slot, timer);
}


function mountAds() {
  document.querySelectorAll("[data-ad-slot]").forEach(slot => {
    const placement = slot.dataset.adSlot;
    const oldTimer = refreshTimers.get(slot);
    if (oldTimer) window.clearTimeout(oldTimer);
    if (!placementIsVisible(placement)) {
      slot.replaceChildren();
      slot.classList.remove("has-ad");
      slot.dataset.adProvider = "";
      return;
    }
    const provider = providerFor(placement);
    renderProvider(slot, placement, provider);
    scheduleRefresh(slot, placement, provider);
  });
}


let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(mountAds, 160);
});
window.addEventListener("DOMContentLoaded", mountAds);
window.KnovatrixAds = { config: AD_CONFIG, mount: mountAds };
