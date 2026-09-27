const SUPPORTED = new Set(["en", "fa", "ar", "tr", "ru", "uz", "ckb"]);
const RTL = new Set(["fa", "ar", "ckb"]);
const LANGUAGE_OPTIONS = [
  ["en", "English"], ["fa", "فارسی"], ["ar", "العربية"], ["tr", "Türkçe"],
  ["ru", "Русский"], ["uz", "O‘zbek"], ["ckb", "کوردی سۆرانی"]
];

const normalize = (value = "") => String(value).toLowerCase().split("-")[0];
const resolve = (value = "") => {
  const language = normalize(value);
  return SUPPORTED.has(language) ? language : "en";
};

function runtimeScript(language) {
  return `<script>(function(){try{var L=${JSON.stringify([...SUPPORTED])},R=${JSON.stringify([...RTL])},O=${JSON.stringify(LANGUAGE_OPTIONS)},d=${JSON.stringify(language)};function n(v){return String(v||"").toLowerCase().split("-")[0]}function r(v){v=n(v);return L.indexOf(v)>=0?v:"en"}var p=new URLSearchParams(location.search),u=r(p.get("lang")),c=document.cookie.match(/(?:^|; )agz-store-language=([^;]*)/),s=r(c?decodeURIComponent(c[1]):""),l=L.indexOf(u)>=0&&p.get("lang")?u:(L.indexOf(s)>=0?s:d);if(p.get("lang")&&L.indexOf(u)>=0){document.cookie="agz-store-language="+encodeURIComponent(u)+"; Path=/; Max-Age=31536000; SameSite=Lax";localStorage.setItem("agz-store-language",u)}else if(L.indexOf(s)<0){localStorage.setItem("agz-store-language",l)}var e=document.documentElement;e.lang=l;e.dir=R.indexOf(l)>=0?"rtl":"ltr";function q(v){var x=new URL(location.href);x.searchParams.set("lang",v);return x.toString()}document.querySelectorAll("a[href]").forEach(function(a){try{var h=a.getAttribute("href");if(!h||h.charAt(0)==="#"||h.indexOf("mailto:")===0||h.indexOf("javascript:")===0)return;var x=new URL(h,location.origin);if(x.origin!==location.origin||x.pathname.indexOf("/api/")===0)return;if(x.pathname==="/health")return;x.searchParams.set("lang",l);a.setAttribute("href",x.pathname+(x.search?x.search:"")+(x.hash||""))}catch(_){}});var select=document.querySelector("#store-language");if(!select){var host=document.querySelector(".actions")||document.querySelector(".topbar");if(host){var label=document.createElement("label");label.className="store-language-runtime";label.innerHTML='<span class="sr-only">Language</span><select id="store-language" aria-label="Language">'+O.map(function(v){return '<option value="'+v[0]+'"'+(v[0]===l?' selected':'')+'>'+v[1]+'</option>'}).join("")+"</select>";host.appendChild(label);select=label.querySelector("select")}}if(select){select.value=l;select.addEventListener("change",function(){var v=r(select.value);document.cookie="agz-store-language="+encodeURIComponent(v)+"; Path=/; Max-Age=31536000; SameSite=Lax";localStorage.setItem("agz-store-language",v);location.href=q(v)})}}catch(_){}})();</script>`;
}

export function withStoreLanguageRuntime(response, language = "en") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) return response;
  const lang = resolve(language);
  return response.text().then((html) => {
    const marker = "<body";
    const index = html.indexOf(marker);
    const end = index >= 0 ? html.indexOf(">", index) + 1 : -1;
    const script = runtimeScript(lang);
    const patched = end > 0 ? html.slice(0, end) + script + html.slice(end) : script + html;
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(patched, { status: response.status, statusText: response.statusText, headers });
  });
}
