/* Modern template interactions (no libraries) */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

/* Year */
$("#year").textContent = new Date().getFullYear();

/* Hero photoshow (crossfade + slow zoom) */
const heroImgs = [
  "https://images.unsplash.com/photo-1504306665018-3b7c44cc8b1c?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=70",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=70",
];
const bgA = $("#heroBgA");
const bgB = $("#heroBgB");
let bgIdx = 0;
let bgOnA = true;

function setBg(el, url){
  if(!el) return;
  el.style.backgroundImage = `url('${url}')`;
}

function cycleBg(){
  if(!bgA || !bgB) return;
  const next = heroImgs[bgIdx % heroImgs.length];
  const a = bgOnA ? bgA : bgB;
  const b = bgOnA ? bgB : bgA;

  setBg(b, next);
  b.classList.add("is-on");
  a.classList.remove("is-on");

  bgOnA = !bgOnA;
  bgIdx++;
}

(function initBg(){
  if(!bgA || !bgB) return;
  setBg(bgA, heroImgs[0]);
  bgA.classList.add("is-on");
  bgIdx = 1;
  setInterval(cycleBg, 5200);
})();


/* Smooth scroll */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", (e)=>{
    const id = a.getAttribute("href");
    if(!id || id === "#") return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:"smooth", block:"start"});
    closeDrawer();
  });
});

/* Drawer */
const drawer = $("#drawer");
const hamburger = $("#hamburger");
const closeDrawerBtn = $("#closeDrawer");

function openDrawer(){
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
hamburger?.addEventListener("click", openDrawer);
closeDrawerBtn?.addEventListener("click", closeDrawer);
drawer?.addEventListener("click", (e)=>{
  if(e.target === drawer) closeDrawer();
});

/* Reveal on scroll (repeat up & down) */
const revealEls = $$(".reveal");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    const el = ent.target;
    const delay = Number(el.dataset.delay || 0);

    if(ent.isIntersecting){
      clearTimeout(el.__revealTO);
      el.__revealTO = setTimeout(()=> {
        el.classList.add("is-in");
        if(el.classList.contains('wipe')) el.classList.add('is-wipe');
      }, delay);
    } else {
      clearTimeout(el.__revealTO);
      el.classList.remove("is-in");
      el.classList.remove("is-wipe");
    }
  });
},{threshold:0.12, rootMargin:"0px 0px -10% 0px"});

revealEls.forEach(el=> io.observe(el));

/* Animated counters */
function animateCounter(el){
  const end = Number(el.dataset.counter || "0");
  const start = 0;
  const dur = 1000 + Math.min(end, 200) * 8;
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0)/dur);
    // easeOutCubic
    const eased = 1 - Math.pow(1-p, 3);
    const val = Math.round(start + (end-start)*eased);
    el.textContent = val.toLocaleString("cs-CZ");
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statNums = $$(".stat__num");
const statIO = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){
      animateCounter(ent.target);
      statIO.unobserve(ent.target);
    }
  })
},{threshold:0.45});
statNums.forEach(el=> statIO.observe(el));


/* Tile countups (01,02,03...) */
function pad2(n){ return String(n).padStart(2,"0"); }

function animatePadCounter(el){
  const end = Number(el.dataset.countup || "0");
  const dur = 650 + end * 120;
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1-p, 3);
    const val = Math.max(0, Math.round(end * eased));
    el.textContent = pad2(val);
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countupEls = $$("[data-countup]");
const countupIO = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){
      animatePadCounter(ent.target);
      countupIO.unobserve(ent.target);
    }
  });
},{threshold:0.55});
countupEls.forEach(el=> countupIO.observe(el));


/* Parallax tilt on hero card */
const tilt = $("#parallaxCard");
let tiltRect = null;
function updateTiltRect(){ tiltRect = tilt?.getBoundingClientRect() || null; }
window.addEventListener("resize", updateTiltRect, {passive:true});
updateTiltRect();

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

tilt?.addEventListener("mousemove", (e)=>{
  if(!tiltRect) return;
  const x = (e.clientX - tiltRect.left) / tiltRect.width;
  const y = (e.clientY - tiltRect.top) / tiltRect.height;
  const rx = clamp((0.5 - y) * 10, -10, 10);
  const ry = clamp((x - 0.5) * 12, -12, 12);
  tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
});
tilt?.addEventListener("mouseleave", ()=>{
  tilt.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
});

/* Modal */
const modal = $("#modal");
const modalClose = $("#modalClose");
const modalTitle = $("#modalTitle");
const modalKicker = $("#modalKicker");
const modalBody = $("#modalBody");

function openModal({title, kicker="Detail", bodyHTML=""}){
  modalTitle.textContent = title || "Detail";
  modalKicker.textContent = kicker;
  modalBody.innerHTML = bodyHTML;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e)=>{
  const close = e.target?.dataset?.close;
  if(close) closeModal();
});
window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

/* Quick inquiry buttons */
function quickInquiry(){
  openModal({
    title: "Rychlá poptávka",
    kicker: "Kontakt během 30 sekund",
    bodyHTML: `
      <div class="grid2">
        <div class="kv">
          <div class="kv__row"><span class="kv__k">Služba</span><span class="kv__v">Stavby / Reality / Pronájmy</span></div>
          <div class="kv__row"><span class="kv__k">Doba odpovědi</span><span class="kv__v">do 24 hodin</span></div>
          <div class="kv__row"><span class="kv__k">Forma</span><span class="kv__v">telefon / e-mail</span></div>
          <div class="note">Tip: klikni na <b>Chci nabídku</b> a skočíš dolů na formulář.</div>
        </div>
        <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=70')"></div>
      </div>
    `
  });
}
$("#openQuick")?.addEventListener("click", quickInquiry);
$("#openQuick2")?.addEventListener("click", quickInquiry);

/* Service modal */
$$("[data-modal='service']").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const title = btn.dataset.title || "Služba";
    openModal({
      title,
      kicker: "Služba",
      bodyHTML: `
        <div class="grid2">
          <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1504306665018-3b7c44cc8b1c?auto=format&fit=crop&w=1400&q=70')"></div>
          <div class="kv">
            <div class="kv__row"><span class="kv__k">Rozsah</span><span class="kv__v">end-to-end</span></div>
            <div class="kv__row"><span class="kv__k">Kvalita</span><span class="kv__v">kontrola detailu</span></div>
            <div class="kv__row"><span class="kv__k">Doklady</span><span class="kv__v">smlouva & rozpočet</span></div>
            <div class="note">Tento blok je jen demo text — uprav si ho podle firmy.</div>
          </div>
        </div>
      `
    });
  });
});

/* Gallery / Detail buttons on hero card */
$("#openGallery")?.addEventListener("click", ()=>{
  openModal({
    title:"Galerie (demo)",
    kicker:"Vizualizace",
    bodyHTML: `
      <div class="grid2">
        <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=70')"></div>
        <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70')"></div>
      </div>
      <div class="note">Pro „opravdovou“ galerii sem můžeš přidat slider nebo lightbox.</div>
    `
  });
});
$("#openDetail")?.addEventListener("click", ()=>{
  openModal({
    title:"Rezidence Červená linie",
    kicker:"Projekt",
    bodyHTML: listingDetailHTML({
      title:"Rezidence Červená linie",
      location:"Praha – okraj",
      price:"od 4 990 000 Kč",
      type:"Rodinný dům",
      tag:"novostavba",
      img:"https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=70",
      area:"124 m²",
      rooms:"4+kk",
      status:"k dispozici"
    })
  });
});

/* Listings data */
const listings = [
  { id:"l1", title:"Rodinný dům 4+kk", location:"Praha 9 • Klánovice", price:"8 490 000 Kč", type:"prodej", tag:"novostavba", area:"138 m²", rooms:"4+kk", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=70" },
  { id:"l2", title:"Byt 2+kk s terasou", location:"Brno • Královo Pole", price:"22 900 Kč / měs.", type:"pronajem", tag:"pronajem", area:"58 m²", rooms:"2+kk", status:"volné od 1. 3.",
    img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70" },
  { id:"l3", title:"Loft po rekonstrukci", location:"Ostrava • centrum", price:"5 990 000 Kč", type:"prodej", tag:"prodej", area:"92 m²", rooms:"3+kk", status:"rezervace",
    img:"https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=70" },
  { id:"l4", title:"Novostavba 5+kk", location:"Zlín • Paseky", price:"9 990 000 Kč", type:"prodej", tag:"novostavba", area:"164 m²", rooms:"5+kk", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1572120360610-d971b9b78825?auto=format&fit=crop&w=1400&q=70" },
  { id:"l5", title:"Byt 1+kk (modern)", location:"Praha 7 • Holešovice", price:"18 500 Kč / měs.", type:"pronajem", tag:"pronajem", area:"34 m²", rooms:"1+kk", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70" },
  { id:"l6", title:"Dům se zahradou", location:"Plzeň • Litice", price:"7 750 000 Kč", type:"prodej", tag:"prodej", area:"121 m²", rooms:"4+1", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=70" },
];

function listingCardHTML(item){
  return `
  <article class="listing reveal" data-reveal="up" data-id="${item.id}" tabindex="0" role="button" aria-label="Otevřít ${item.title}">
    <div class="listing__img" style="background-image:url('${item.img}')"></div>
    <div class="listing__body">
      <div class="listing__title">${item.title}</div>
      <div class="listing__sub">${item.location} • <b>${item.price}</b></div>
      <div class="listing__row">
        <span class="pillmini">${item.area}</span>
        <span class="pillmini">${item.rooms}</span>
        <span class="pillmini">${item.status}</span>
      </div>
    </div>
  </article>`;
}

function listingDetailHTML(item){
  return `
    <div class="grid2">
      <div class="bigimg" style="background-image:url('${item.img}')"></div>
      <div class="kv">
        <div class="kv__row"><span class="kv__k">Lokalita</span><span class="kv__v">${item.location}</span></div>
        <div class="kv__row"><span class="kv__k">Cena</span><span class="kv__v">${item.price}</span></div>
        <div class="kv__row"><span class="kv__k">Plocha</span><span class="kv__v">${item.area}</span></div>
        <div class="kv__row"><span class="kv__k">Dispozice</span><span class="kv__v">${item.rooms}</span></div>
        <div class="kv__row"><span class="kv__k">Stav</span><span class="kv__v">${item.status}</span></div>
        <div class="note">Tip: přidej napojení na backend (API) a vykrm to reálnými daty.</div>
      </div>
    </div>
  `;
}

/* Render listings + filter */
const listingsEl = $("#listings");
let currentFilter = "all";

function randomizeListingReveal(el, i){
  const modes = ["fly-left","pop","fly-right"];
  if(!el.dataset.reveal) el.dataset.reveal = modes[i % modes.length];
  if(!el.dataset.delay) el.dataset.delay = String(60 * (i % 6));
  el.classList.add("wipe");
}

function renderListings(){
  const filtered = listings.filter(it=>{
    if(currentFilter === "all") return true;
    if(currentFilter === "novostavba") return it.tag === "novostavba";
    return it.type === currentFilter || it.tag === currentFilter;
  });

  listingsEl.innerHTML = filtered.map(listingCardHTML).join("");

  // observe reveals for new elements
  $$(".listing.reveal", listingsEl).forEach((el,i)=>{ randomizeListingReveal(el,i); io.observe(el); });

  // click handlers
  $$(".listing", listingsEl).forEach(card=>{
    const open = ()=>{
      const id = card.dataset.id;
      const item = listings.find(x=>x.id === id);
      if(!item) return;
      openModal({title:item.title, kicker:"Nabídka", bodyHTML: listingDetailHTML(item)});
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault(); open();
      }
    });
  });
}
renderListings();

$$(".chipbtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".chipbtn").forEach(b=> b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter || "all";
    animateOutAndRerender();
    toast(`Filtr: ${btn.textContent.trim()}`);
  });
});

/* Projects -> open modal */
const projectData = [
  {
    title:"Rezidence Nord",
    kicker:"Projekt • dokončeno",
    img:"https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=70",
    text:"Komplex bytů s důrazem na čistý beton, sklo a červené akcenty. Optimalizace dispozic pro pronájem i prodej."
  },
  {
    title:"Červený loft",
    kicker:"Rekonstrukce • předáno",
    img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70",
    text:"Rekonstrukce loftu: nové rozvody, akustika, chytré osvětlení. Minimal, ale s výraznou identitou."
  },
  {
    title:"Rodinné domy Line",
    kicker:"Výstavba • probíhá",
    img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=70",
    text:"Série domů s jednotným systémem detailů. Rychlá výstavba, vysoký standard, připraveno pro market fit."
  }
];
$$(".project").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const idx = Number(btn.dataset.project || "0");
    const p = projectData[idx] || projectData[0];
    openModal({
      title: p.title,
      kicker: p.kicker,
      bodyHTML: `
        <div class="grid2">
          <div class="bigimg" style="background-image:url('${p.img}')"></div>
          <div class="kv">
            <div class="kv__row"><span class="kv__k">Model</span><span class="kv__v">Design → Stavba → Prodej</span></div>
            <div class="kv__row"><span class="kv__k">Akcent</span><span class="kv__v">Šedá + červená</span></div>
            <div class="kv__row"><span class="kv__k">Hodnota</span><span class="kv__v">rychlé rozhodnutí klienta</span></div>
            <div class="note">${p.text}</div>
          </div>
        </div>
      `
    });
  });
});

/* Testimonials carousel */
const testimonials = [
  { name:"P. Konečný", role:"Investor", text:"Rychlá domluva, jasné termíny a přístup k detailu. Dům i pronájem bez zbytečných průtahů." },
  { name:"M. Svobodová", role:"Majitelka bytu", text:"Profesionální prezentace nabídky a super komunikace. Vše šlo hladce, doporučuji." },
  { name:"J. Dvořák", role:"Klient rekonstrukce", text:"Stylové řešení interiéru, moderní materiály a čisté předání. Přesně to jsme chtěli." },
];

const tTrack = $("#tTrack");
const tBar = $("#tBar");
let tIndex = 0;
let tTimer = null;
const T_INTERVAL = 5200;

function renderTestimonials(){
  tTrack.innerHTML = testimonials.map(t=>{
    const initial = (t.name || "?").trim().charAt(0).toUpperCase();
    return `
      <article class="quote">
        <div class="quote__text">“${t.text}”</div>
        <div class="quote__who">
          <div class="avatar" aria-hidden="true">${initial}</div>
          <div>
            <div class="who__name">${t.name}</div>
            <div class="who__role">${t.role}</div>
          </div>
        </div>
      </article>
    `;
  }).join("");
  updateTestimonial();
}
function updateTestimonial(){
  tTrack.style.transform = `translateX(${-100 * tIndex}%)`;
  // progress width by scaling
  const p = (tIndex+1) / testimonials.length;
  tBar.style.transform = `scaleX(${p})`;
}

function nextT(){ tIndex = (tIndex+1) % testimonials.length; updateTestimonial(); restartAuto(); }
function prevT(){ tIndex = (tIndex-1+testimonials.length) % testimonials.length; updateTestimonial(); restartAuto(); }
$("#tNext")?.addEventListener("click", nextT);
$("#tPrev")?.addEventListener("click", prevT);

function restartAuto(){
  clearInterval(tTimer);
  tTimer = setInterval(nextT, T_INTERVAL);
}
renderTestimonials();
restartAuto();

/* Form demo + toast */
const toastEl = $("#toast");
let toastTO = null;
function toast(msg){
  toastEl.innerHTML = `<span class="t-dot" aria-hidden="true"></span><span class="t-msg">${msg}</span>`;
  toastEl.classList.add("is-show");
  clearTimeout(toastTO);
  toastTO = setTimeout(()=> toastEl.classList.remove("is-show"), 2500);
}

$("#prefill")?.addEventListener("click", ()=>{
  const f = $("#contactForm");
  if(!f) return;
  f.name.value = "Jan Novák";
  f.email.value = "jan@email.cz";
  f.topic.value = "Stavba / rekonstrukce";
  f.message.value = "Dobrý den, mám zájem o konzultaci a předběžný rozpočet. Lokalita: Praha, termín: jaro.";
  toast("Demo data doplněna ✨");
});

$("#contactForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  toast("Odesláno (demo) ✅");
  e.target.reset();
});

/* Theme toggle (contrast) */
let hi = false;
$("#themeToggle")?.addEventListener("click", ()=>{
  hi = !hi;
  document.documentElement.style.setProperty("--panel", hi ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.06)");
  document.documentElement.style.setProperty("--panel2", hi ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.09)");
  document.documentElement.style.setProperty("--stroke", hi ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.12)");
  toast(hi ? "Kontrast: vyšší" : "Kontrast: standard");
});

/* little welcome toast */
setTimeout(()=> toast("Drak s.r.o: klikni na karty → efekty"), 900);


/* FAQ accordion */
$$(".faq__item").forEach(item=>{
  item.addEventListener("click", ()=>{
    const open = item.classList.toggle("is-open");
    const icon = $(".faq__icon", item);
    if(icon) icon.textContent = open ? "–" : "+";
  });
});

/* Modal close animation (fly out) */
function closeModalAnimated(){
  if(!modal.classList.contains("is-open")) return;
  modal.classList.add("is-closing");
  // wait for panel transition
  setTimeout(()=>{
    modal.classList.remove("is-closing");
    closeModal();
  }, 240);
}
// override close buttons to use animated close
modalClose?.removeEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModalAnimated);
modal?.addEventListener("click", (e)=>{
  const close = e.target?.dataset?.close;
  if(close) closeModalAnimated();
});
window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape" && modal.classList.contains("is-open")) closeModalAnimated();
});

/* Filter: animate old cards out to sides before rerender (odlet) */
function animateOutAndRerender(){
  const cards = $$(".listing", listingsEl);
  if(cards.length === 0){ renderListings(); return; }
  cards.forEach((c,i)=>{
    c.classList.add(i % 2 ? "is-out-right" : "is-out-left");
  });
  setTimeout(()=> renderListings(), 280);
}


/* Team profiles -> modal */
const teamProfiles = [
  {
    name: "Jan Novák",
    role: "Projektový manažer • Stavby & realizace",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=70",
    legend: "Drží harmonogram, rozpočet a kvalitu na stavbě. Koordinuje dodavatele a komunikuje s klientem tak, aby se věci hýbaly bez chaosu.",
    work: ["Plánování a rozpočet", "Kontrola kvality", "Koordinace týmu", "Předání stavby"]
  },
  {
    name: "Petra Konečná",
    role: "Realitní specialistka • Reality & pronájmy",
    img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1400&q=70",
    legend: "Stará se o prodej i pronájmy: prezentace, prohlídky, jednání, smlouvy. Umí nabídku zabalit tak, aby působila prémiově a prodala se rychle.",
    work: ["Marketing nabídky", "Prohlídky & jednání", "Smlouvy & předání", "Správa pronájmu"]
  },
  {
    name: "Marek Svoboda",
    role: "Architekt • Design & dokumentace",
    img: "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=1400&q=70",
    legend: "Vymýšlí dispozice, řeší detaily a připravuje dokumentaci. Minimalistický styl, funkční řešení a důraz na materiály.",
    work: ["Studie & koncept", "Projektová dokumentace", "Vizualizace", "Autorský dozor"]
  }
];

function teamModalHTML(p){
  const items = (p.work || []).map(x=>`<div class="kv__row"><span class="kv__k">•</span><span class="kv__v">${x}</span></div>`).join("");
  return `
    <div class="grid2">
      <div class="bigimg" style="background-image:url('${p.img}')"></div>
      <div class="kv">
        <div class="kv__row"><span class="kv__k">Role</span><span class="kv__v">${p.role}</span></div>
        <div class="note">${p.legend}</div>
        <div style="margin-top:10px; display:grid; gap:6px;">
          <div class="kv__row"><span class="kv__k">Co dělá</span><span class="kv__v"></span></div>
          ${items}
        </div>
      </div>
    </div>
  `;
}

$$(".person").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const idx = Number(btn.dataset.person || "0");
    const p = teamProfiles[idx] || teamProfiles[0];
    openModal({ title: p.name, kicker: "Profil", bodyHTML: teamModalHTML(p) });
  });
});
