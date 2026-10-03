import { getStoreDirection, t } from "./store-i18n.js";

const esc = (value = "") => String(value).replace(/[&<>"]/g, (c) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"
}[c]));

export function renderCommerceClock(language = "en") {
  const lang = String(language || "en").toLowerCase();
  const localeMap = { en:"en-US", fa:"fa-IR-u-ca-persian", ar:"ar", tr:"tr-TR", ru:"ru-RU", uz:"uz-UZ", ckb:"ckb-IQ" };
  const locale = localeMap[lang] || "en-US";
  return '<div class="store-clock" aria-live="polite" data-store-commerce-clock><span class="store-clock-time"></span><span class="store-clock-date"></span></div><script>(() => { const root=document.querySelector("[data-store-commerce-clock]"); if(!root)return; const time=root.querySelector(".store-clock-time"), date=root.querySelector(".store-clock-date"), locale=' + JSON.stringify(locale) + '; const update=()=>{const now=new Date(); time.textContent=new Intl.DateTimeFormat(locale,{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(now); date.textContent=new Intl.DateTimeFormat(locale,{weekday:"short",year:"numeric",month:"short",day:"numeric"}).format(now)}; update(); window.setInterval(update,1000); })();</script>';
}

export function renderCommerceFloatMenu(language = "en", direction = getStoreDirection(language)) {
  const items = [["/products","▦",t("nav.products",{},language)],["/rfq","↗",t("nav.rfq",{},language)],["/cart","🛒",t("nav.cart",{},language)],["/account","◯",t("nav.account",{},language)],["/orders","≡",t("nav.orders",{},language)]];
  return '<aside class="store-commerce-float" data-store-commerce-float dir="' + esc(direction) + '" aria-label="Commerce shortcuts">' + items.map(([href,icon,label]) => '<a href="' + href + '" aria-label="' + esc(label) + '"><span aria-hidden="true">' + icon + '</span><span>' + esc(label) + '</span></a>').join("") + "</aside>";
}

export function renderCommerceUi(language = "en", direction = getStoreDirection(language)) {
  return '<style>.store-clock{position:fixed;inset-block-start:82px;inset-inline-end:18px;z-index:25;display:flex;flex-direction:column;justify-content:center;min-width:118px;padding:7px 10px;border:1px solid #d7e2da;border-radius:10px;background:rgba(255,255,255,.96);box-shadow:0 8px 24px rgba(23,58,44,.10);backdrop-filter:blur(8px);line-height:1.2;text-align:center;white-space:nowrap}.store-clock-time{font-size:13px;font-weight:800;color:#174d37;font-variant-numeric:tabular-nums}.store-clock-date{font-size:10px;color:#718078;margin-top:3px}.store-commerce-float{position:fixed;inset-inline-end:18px;inset-block-end:18px;z-index:30;display:flex;flex-direction:column;gap:7px;padding:8px;border:1px solid #d7e2da;border-radius:14px;background:rgba(255,255,255,.96);box-shadow:0 12px 32px rgba(23,58,44,.16);backdrop-filter:blur(8px)}.store-commerce-float a{display:flex;align-items:center;gap:8px;min-width:92px;padding:8px 10px;border-radius:9px;color:#174d37;font-size:12px;font-weight:800;text-decoration:none;transition:.15s}.store-commerce-float a:hover,.store-commerce-float a:focus-visible{background:#eef4ee;outline:none}.store-commerce-float a span:first-child{width:18px;text-align:center;font-size:15px}.store-commerce-float a:focus-visible{box-shadow:0 0 0 2px #a9c75b}@media(max-width:760px){.store-clock{inset-block-start:74px;inset-inline-end:12px;min-width:0;padding:6px 8px}.store-clock-date{font-size:9px}.store-clock-time{font-size:12px}.store-commerce-float{inset-inline-end:12px;inset-block-end:12px;padding:6px;gap:5px}.store-commerce-float a{min-width:0;width:44px;height:40px;justify-content:center;padding:7px}.store-commerce-float a span:last-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.store-commerce-float a span:first-child{width:auto;font-size:16px}}</style>' + renderCommerceClock(language) + renderCommerceFloatMenu(language,direction);
}