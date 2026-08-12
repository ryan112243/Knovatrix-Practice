/* Paste the four A-ADS ad-unit IDs here after creating them in A-ADS. */
const AADS_UNITS = { "desktop-left": "", "desktop-right": "", "mobile-top": "", "mobile-bottom": "" };

function adIsDesktop() { return window.matchMedia("(min-width: 1181px)").matches; }

function mountAds() {
  document.querySelectorAll("[data-ad-slot]").forEach(slot => {
    const placement = slot.dataset.adSlot;
    const shouldMount = adIsDesktop()
      ? placement === "desktop-left" || placement === "desktop-right"
      : placement === "mobile-top" || placement === "mobile-bottom";
    const unitId = AADS_UNITS[placement];
    slot.replaceChildren();
    slot.classList.toggle("has-ad", Boolean(shouldMount && unitId));
    if (!shouldMount || !unitId) return;
    const frame = document.createElement("iframe");
    frame.dataset.aa = unitId;
    frame.src = `https://acceptable.a-ads.com/${unitId}/?size=Adaptive`;
    frame.title = "Advertisement";
    frame.loading = "lazy";
    frame.setAttribute("scrolling", "no");
    slot.append(frame);
  });
}

window.addEventListener("resize", mountAds);
window.addEventListener("DOMContentLoaded", mountAds);
window.KnovatrixAds = { mount: mountAds, units: AADS_UNITS };
