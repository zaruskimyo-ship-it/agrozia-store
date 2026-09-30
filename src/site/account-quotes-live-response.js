const COPY = {
  en:{portal:"CUSTOMER PORTAL",title:"Quotes",account:"Account",rfqs:"RFQs",quotes:"Quotes",orders:"Orders",loading:"Loading quotations…",checking:"Checking your authenticated customer quotes.",auth:"Customer authentication is required.",back:"Return to account",empty:"No quotations yet.",emptyText:"Supplier quotations will appear here when available.",submit:"Submit an RFQ",supplier:"Supplier",accept:"Accept Quote",create:"Create B2B Order",converted:"Converted to order",validity:"Validity",unspecified:"Not specified",incoterm:"Incoterm",created:"B2B order created.",order:"Order",status:"Status",openOrders:"Open Orders",acceptError:"Unable to accept quote",orderError:"Unable to create B2B order",serviceError:"Quote service is unavailable. Please try again later."},
  fa:{portal:"پنل مشتری",title:"پیش‌فاکتورها",account:"حساب کاربری",rfqs:"درخواست‌های قیمت",quotes:"پیش‌فاکتورها",orders:"سفارش‌ها",loading:"در حال بارگذاری پیش‌فاکتورها…",checking:"در حال بررسی پیش‌فاکتورهای حساب مشتری احراز هویت‌شده.",auth:"احراز هویت مشتری الزامی است.",back:"بازگشت به حساب کاربری",empty:"هنوز پیش‌فاکتوری وجود ندارد.",emptyText:"پیش‌فاکتورهای تأمین‌کنندگان پس از آماده شدن در اینجا نمایش داده می‌شوند.",submit:"ثبت درخواست قیمت",supplier:"تأمین‌کننده",accept:"پذیرش پیش‌فاکتور",create:"ایجاد سفارش B2B",converted:"به سفارش تبدیل شده است",validity:"اعتبار",unspecified:"مشخص نشده",incoterm:"اینکوترمز",created:"سفارش B2B ایجاد شد.",order:"سفارش",status:"وضعیت",openOrders:"مشاهده سفارش‌ها",acceptError:"پذیرش پیش‌فاکتور انجام نشد",orderError:"ایجاد سفارش B2B انجام نشد",serviceError:"سرویس پیش‌فاکتورها موقتاً در دسترس نیست. لطفاً بعداً دوباره تلاش کنید."},
  ar:{portal:"بوابة العميل",title:"عروض الأسعار",account:"الحساب",rfqs:"طلبات عروض الأسعار",quotes:"عروض الأسعار",orders:"الطلبات",loading:"جارٍ تحميل عروض الأسعار…",checking:"جارٍ التحقق من عروض أسعار حساب العميل المصادق عليه.",auth:"مصادقة العميل مطلوبة.",back:"العودة إلى الحساب",empty:"لا توجد عروض أسعار بعد.",emptyText:"ستظهر عروض أسعار الموردين هنا عند توفرها.",submit:"إرسال طلب عرض سعر",supplier:"المورد",accept:"قبول العرض",create:"إنشاء طلب B2B",converted:"تم التحويل إلى طلب",validity:"الصلاحية",unspecified:"غير محدد",incoterm:"إنكوترمز",created:"تم إنشاء طلب B2B.",order:"الطلب",status:"الحالة",openOrders:"فتح الطلبات",acceptError:"تعذر قبول العرض",orderError:"تعذر إنشاء طلب B2B",serviceError:"خدمة عروض الأسعار غير متاحة مؤقتًا. يرجى المحاولة لاحقًا."},
  tr:{portal:"MÜŞTERİ PORTALI",title:"Teklifler",account:"Hesap",rfqs:"RFQ Talepleri",quotes:"Teklifler",orders:"Siparişler",loading:"Teklifler yükleniyor…",checking:"Kimliği doğrulanmış müşteri hesabının teklifleri kontrol ediliyor.",auth:"Müşteri kimlik doğrulaması gerekli.",back:"Hesaba dön",empty:"Henüz teklif yok.",emptyText:"Tedarikçi teklifleri hazır olduğunda burada görünecektir.",submit:"RFQ Gönder",supplier:"Tedarikçi",accept:"Teklifi Kabul Et",create:"B2B Siparişi Oluştur",converted:"Siparişe dönüştürüldü",validity:"Geçerlilik",unspecified:"Belirtilmedi",incoterm:"Incoterm",created:"B2B siparişi oluşturuldu.",order:"Sipariş",status:"Durum",openOrders:"Siparişleri Aç",acceptError:"Teklif kabul edilemedi",orderError:"B2B siparişi oluşturulamadı",serviceError:"Teklif hizmeti geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin."},
  ru:{portal:"ПОРТАЛ КЛИЕНТА",title:"Котировки",account:"Аккаунт",rfqs:"RFQ",quotes:"Котировки",orders:"Заказы",loading:"Загрузка котировок…",checking:"Проверка котировок авторизованного аккаунта клиента.",auth:"Требуется аутентификация клиента.",back:"Вернуться в аккаунт",empty:"Котировок пока нет.",emptyText:"Котировки поставщиков появятся здесь после их поступления.",submit:"Отправить RFQ",supplier:"Поставщик",accept:"Принять котировку",create:"Создать B2B-заказ",converted:"Преобразовано в заказ",validity:"Срок действия",unspecified:"Не указано",incoterm:"Инкотермс",created:"B2B-заказ создан.",order:"Заказ",status:"Статус",openOrders:"Открыть заказы",acceptError:"Не удалось принять котировку",orderError:"Не удалось создать B2B-заказ",serviceError:"Сервис котировок временно недоступен. Повторите попытку позже."},
  uz:{portal:"MIJOZ PORTALI",title:"Takliflar",account:"Hisob",rfqs:"RFQ so‘rovlari",quotes:"Takliflar",orders:"Buyurtmalar",loading:"Takliflar yuklanmoqda…",checking:"Tasdiqlangan mijoz hisobining takliflari tekshirilmoqda.",auth:"Mijozni autentifikatsiya qilish talab etiladi.",back:"Hisobga qaytish",empty:"Hali takliflar yo‘q.",emptyText:"Yetkazib beruvchilar takliflari mavjud bo‘lganda shu yerda ko‘rsatiladi.",submit:"RFQ yuborish",supplier:"Yetkazib beruvchi",accept:"Taklifni qabul qilish",create:"B2B buyurtma yaratish",converted:"Buyurtmaga aylantirildi",validity:"Amal qilish muddati",unspecified:"Ko‘rsatilmagan",incoterm:"Incoterm",created:"B2B buyurtma yaratildi.",order:"Buyurtma",status:"Holat",openOrders:"Buyurtmalarni ochish",acceptError:"Taklifni qabul qilib bo‘lmadi",orderError:"B2B buyurtmasini yaratib bo‘lmadi",serviceError:"Takliflar xizmati vaqtincha mavjud emas. Keyinroq qayta urinib ko‘ring."},
  ckb:{portal:"پۆرتاڵی کڕیار",title:"نرخەکان",account:"هەژمار",rfqs:"داواکارییەکانی نرخ",quotes:"نرخەکان",orders:"داواکارییەکان",loading:"نرخەکان بار دەکرێن…",checking:"نرخەکانی هەژماری کڕیاری پشتڕاستکراوە پشکنین دەکرێن.",auth:"پشتڕاستکردنەوەی کڕیار پێویستە.",back:"گەڕانەوە بۆ هەژمار",empty:"هێشتا هیچ نرخێک نییە.",emptyText:"نرخەکانی دابینکەران کاتێک بەردەست بن لێرە پیشان دەدرێن.",submit:"ناردنی داواکاریی نرخ",supplier:"دابینکەر",accept:"قبوڵکردنی نرخ",create:"دروستکردنی داواکاری B2B",converted:"گۆڕدرا بۆ داواکاری",validity:"ماوەی بەکاربوون",unspecified:"دیاری نەکراوە",incoterm:"Incoterm",created:"داواکاری B2B دروستکرا.",order:"داواکاری",status:"دۆخ",openOrders:"کردنەوەی داواکارییەکان",acceptError:"نەتوانرا نرخ قبوڵ بکرێت",orderError:"نەتوانرا داواکاری B2B دروست بکرێت",serviceError:"خزمەتگوزاری نرخەکان کاتییە بەردەست نییە. تکایە دواتر هەوڵ بدەرەوە."}
};

const RTL = new Set(["fa","ar","ckb"]);

function shell(body, language) {
  const l = COPY[language] || COPY.en;
  const dir = RTL.has(language) ? "rtl" : "ltr";

  return `<!doctype html><html lang="${language}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${l.title} | AGRO-ZIA</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f6f9f7;color:#17352d}
.wrap{max-width:1100px;margin:auto;padding:35px 20px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:25px}
.brand{font-weight:800;letter-spacing:.08em}
.card{background:#fff;border:1px solid #dce8e2;border-radius:14px;padding:20px;margin-bottom:16px}
.muted{color:#62756e}
.row{display:flex;justify-content:space-between;gap:20px;align-items:center}
.pill{display:inline-block;padding:5px 9px;border-radius:999px;background:#e7f0eb}
.btn{border:0;border-radius:9px;padding:9px 13px;cursor:pointer}
.error{background:#fff1f1;border:1px solid #efcccc;border-radius:12px;padding:16px}
.success{background:#eff9f1;border:1px solid #cfe8d3;border-radius:12px;padding:16px}
a{color:inherit}
.nav{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:25px}
</style>
</head>
<body>
<main class="wrap">
<div class="top">
<div><div class="brand">AGRO-ZIA</div><div class="muted">${l.portal}</div></div>
<a href="/account">${l.account}</a>
</div>
<nav class="nav">
<a href="/account">${l.account}</a>
<a href="/account/rfqs">${l.rfqs}</a>
<a href="/account/quotes">${l.quotes}</a>
<a href="/account/orders">${l.orders}</a>
</nav>
${body}
</main>
</body>
</html>`;
}

export function accountQuotesLiveResponse(language = "en") {
  const lang = COPY[language] ? language : "en";
  const l = COPY[lang];

  const body = `<section id="app">
<div class="card"><strong>${l.loading}</strong><p class="muted">${l.checking}</p></div>
</section>
<script>
(async()=>{
const app=document.getElementById("app");

const copy=${JSON.stringify(l)};

const esc=(v="")=>String(v).replace(/[&<>"]/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;"
}[c]));

try{
const r=await fetch("/api/customer/quotes",{credentials:'same-origin',cache:"no-store"});

if(r.status===401){
app.innerHTML="<div class='error'>"+copy.auth+" <a href='/account'>"+copy.back+"</a>.</div>";
return;
}

if(!r.ok)throw new Error("service");

const d=await r.json();
const qs=Array.isArray(d.quotes)?d.quotes:[];

if(!qs.length){
app.innerHTML="<div class='card'><strong>"+copy.empty+"</strong><p class='muted'>"+copy.emptyText+"</p><a href='/rfq'>"+copy.submit+"</a></div>";
return;
}

app.innerHTML=qs.map(q=>{
let action="";

if(q.status==="sent"){
action="<button class='btn' data-accept='"+encodeURIComponent(q.id)+"'>"+copy.accept+"</button>";
}else if(q.status==="accepted"){
action="<button class='btn' data-order='"+encodeURIComponent(q.id)+"'>"+copy.create+"</button>";
}else if(q.status==="converted"){
action="<span class='pill'>"+copy.converted+"</span>";
}

return "<article class='card'>"+
"<div class='row'><div><strong>"+esc(q.quote_number||"RFQ")+
"</strong><div class='muted'>"+copy.supplier+": "+esc(q.supplier_name||q.supplier_id||"—")+
"</div></div><span class='pill'>"+esc(q.status||"unknown")+
"</span></div>"+
"<p>"+esc(q.product_name||"—")+" · "+esc(q.quantity||"—")+"</p>"+
"<div class='row'><div class='price'>"+esc(q.total_amount_minor||"—")+" "+esc(q.currency||"")+
"</div><div>"+action+"</div></div>"+
"<p class='muted'>"+copy.validity+": "+esc(q.validity_until||copy.unspecified)+
" · "+copy.incoterm+": "+esc(q.incoterm||"—")+"</p>"+
"</article>";
}).join("");

document.querySelectorAll("[data-accept]").forEach(b=>b.onclick=async()=>{
b.disabled=true;

const r=await fetch("/api/customer/quotes/"+b.dataset.accept+"/accept",{
method:"POST",
credentials:'same-origin'
});

if(r.ok){
location.reload();
return;
}

const d=await r.json().catch(()=>({}));
alert(d.error||copy.acceptError);
b.disabled=false;
});

document.querySelectorAll("[data-order]").forEach(b=>b.onclick=async()=>{
b.disabled=true;

const r=await fetch("/api/b2b-orders/from-quote/"+b.dataset.order,{
method:"POST",
credentials:'same-origin'
});

const d=await r.json().catch(()=>({}));

if(r.ok&&d.order){
app.innerHTML="<div class='success'><strong>"+copy.created+
"</strong><p>"+copy.order+": "+esc(d.order.order_number||d.order.id)+
"</p><p>"+copy.status+": "+esc(d.order.status)+
"</p><a href='/orders'>"+copy.openOrders+"</a></div>";
return;
}

alert(d.error||copy.orderError);
b.disabled=false;
});

}catch(e){
app.innerHTML="<div class='error'>"+copy.serviceError+"</div>";
}
})();
</script>`;

  return new Response(shell(body, lang), {
    status:200,
    headers:{
      "content-type":"text/html; charset=utf-8",
      "cache-control":"private, no-store"
    }
  });
}