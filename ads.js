const AD_CONFIG = {
  mode: "random-per-visit",
  houseRotationMs: 45000,
  providers: {
    aads: {
      units: {
        // 桌面左右共用一組 160 x 600 單元；手機上下共用一組 320 x 50 單元。
        desktop: "",
        mobile: ""
      }
    },
    adsterra: {
      units: {
        // 填入 Adsterra 桌面廣告單元的 key 與 scriptUrl。
        desktop: { key: "", scriptUrl: "", width: 160, height: 600 },
        // 填入 Adsterra 手機廣告單元的 key 與 scriptUrl。
        mobile: { key: "", scriptUrl: "", width: 320, height: 50 }
      }
    },
    house: {
      ads: [
        // { title: "廣告標題", text: "簡短說明", href: "https://example.com", image: "https://example.com/ad.jpg" }
      ]
    }
  }
};

const AD_SESSION_KEY = "knovatrix-ad-provider-v1";
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
  if (AD_CONFIG.providers.house.ads.length) providers.push("house");
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
    selected[placement] = available[Math.floor(Math.random() * available.length)];
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

function renderAads(slot, placement) {
  const unitId = AD_CONFIG.providers.aads.units[placementGroup(placement)];
  const frame = makeFrame("A-ADS 廣告");
  frame.dataset.aa = unitId;
  frame.src = `https://acceptable.a-ads.com/${unitId}/?size=Adaptive`;
  slot.append(frame);
}

function renderAdsterra(slot, placement) {
  const unit = AD_CONFIG.providers.adsterra.units[placementGroup(placement)];
  const frame = makeFrame("Adsterra 廣告");
  frame.width = unit.width;
  frame.height = unit.height;
  const options = JSON.stringify({ key: unit.key, format: "iframe", height: unit.height, width: unit.width, params: {} });
  frame.srcdoc = `<!doctype html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh;overflow:hidden"><script>atOptions=${options}<\/script><script src="${unit.scriptUrl}"><\/script></body></html>`;
  slot.append(frame);
}

function renderHouse(slot, index = 0) {
  const ads = AD_CONFIG.providers.house.ads;
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
    const timer = window.setTimeout(() => renderHouse(slot, index + 1), AD_CONFIG.houseRotationMs);
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
    if (provider === "house") renderHouse(slot);
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(mountAds, 160);
});
window.addEventListener("DOMContentLoaded", mountAds);
window.KnovatrixAds = { config: AD_CONFIG, mount: mountAds };