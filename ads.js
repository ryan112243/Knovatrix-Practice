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

const AD_SESSION_KEY = "knovatrix-ad-provider-v2";
const houseTimers = new WeakMap();

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

function providerFor(placement) {
  const available = configuredProviders(placement);
  if (!available.length) return "";
  const selected = readSessionSelections();
  if (!available.includes(selected[placement])) {
    const weighted = available.flatMap(provider => provider === "aads" ? [provider, provider, provider] : [provider]);
    selected[placement] = weighted[Math.floor(Math.random() * weighted.length)];
    try { sessionStorage.setItem(AD_SESSION_KEY, JSON.stringify(selected)); } catch {}
  }
  return selected[placement];
}

function makeFrame(title) {
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.loading = "lazy";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin");
  return frame;
}

function mountExternalFrame(slot, frame, placement) {
  let settled = false;
  let fallbackTimer;
  const fallback = () => {
    if (settled) return;
    settled = true;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    renderHouse(slot, placement);
  };
  frame.addEventListener("error", fallback, { once: true });
  frame.addEventListener("load", () => {
    window.setTimeout(() => {
      try {
        const body = frame.contentDocument?.body;
        const hasAdContent = !body || body.querySelector("iframe, img, video, object, embed, a") || body.children.length > 2;
        if (hasAdContent) {
          settled = true;
          if (fallbackTimer) window.clearTimeout(fallbackTimer);
        } else {
          fallback();
        }
      } catch {
        settled = true;
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      }
    }, 1800);
  }, { once: true });
  fallbackTimer = window.setTimeout(fallback, 6000);
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
  mountExternalFrame(slot, frame, placement);
}


function renderAdsterra(slot, placement) {
  const unit = AD_CONFIG.providers.adsterra.units[placementGroup(placement)];
  const frame = makeFrame("Adsterra ???");
  frame.width = unit.width;
  frame.height = unit.height;
  const options = JSON.stringify({ key: unit.key, format: "iframe", height: unit.height, width: unit.width, params: {} });
  frame.srcdoc = `<!doctype html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh;overflow:hidden"><script>atOptions=${options}<\/script><script src="${unit.scriptUrl}"><\/script></body></html>`;
  mountExternalFrame(slot, frame, placement);
}

function renderHouse(slot, placement, index = 0) {
  const group = placementGroup(placement);
  const ads = group === "mobile" ? AD_CONFIG.providers.house.mobileAds : AD_CONFIG.providers.house.ads;
  if (!ads.length) return;
  const ad = ads[index % ads.length];
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
  slot.classList.add("has-ad");
  const oldTimer = houseTimers.get(slot);
  if (oldTimer) window.clearTimeout(oldTimer);
  if (ads.length > 1 && AD_CONFIG.houseRotationMs >= 15000) {
    const timer = window.setTimeout(() => renderHouse(slot, placement, index + 1), AD_CONFIG.houseRotationMs);
    houseTimers.set(slot, timer);
  }
}


function mountAds() {
  document.querySelectorAll("[data-ad-slot]").forEach(slot => {
    const placement = slot.dataset.adSlot;
    const provider = placementIsVisible(placement) ? providerFor(placement) : "";
    const oldTimer = houseTimers.get(slot);
    if (oldTimer) window.clearTimeout(oldTimer);
    slot.replaceChildren();
    slot.classList.toggle("has-ad", Boolean(provider));
    slot.dataset.adProvider = provider;
    if (provider === "aads") renderAads(slot, placement);
    if (provider === "adsterra") renderAdsterra(slot, placement);
    if (provider === "house") renderHouse(slot, placement);
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(mountAds, 160);
});
window.addEventListener("DOMContentLoaded", mountAds);
window.KnovatrixAds = { config: AD_CONFIG, mount: mountAds };
