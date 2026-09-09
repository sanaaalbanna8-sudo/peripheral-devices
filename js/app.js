const $app = document.getElementById("app");

const ICONS = {
  keyboard: "⌨️", touchscreen: "📲", pointing: "🖱️", touchpad: "💻",
  "graphics-tablet": "🖊️", microphone: "🎤", scanner: "📠", camera: "📷",
  sensors: "📡", webcam: "🎥", monitor: "🖥️", projector: "📽️",
  "printer-2d": "🖨️", "printer-3d": "🧊", speakers: "🔊", actuators: "🎥",
  motors: "⚙️", "usb-drive": "💾", "memory-card": "🃏", hdd: "💽",
  optical: "💿", tape: "📼", usb: "🔌", wifi: "📶", bluetooth: "🔵",
  dongle: "🧷", radio: "📻", serial: "🖇️", speech: "🗣️",
  "screen-reader": "🎧", "large-keys": "🔠", ergonomic: "🖱️",
  magnifier: "🔍", overlay: "🎨", adaptive: "👁️", braille: "⠿", keyless: "🚗",
};

let voicesReady = [];
function loadVoices() {
  voicesReady = window.speechSynthesis ? speechSynthesis.getVoices() : [];
}
if (window.speechSynthesis) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

const state = {
  filter: "all",
  search: "",
  seen: JSON.parse(localStorage.getItem("pd-seen") || "[]"),
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function catOf(id) {
  return CATEGORIES.find((c) => c.id === id);
}

function countLabel(n) {
  if (n === 1) return "جهاز واحد";
  if (n === 2) return "جهازان";
  if (n >= 3 && n <= 10) return n + " أجهزة";
  return n + " جهازًا";
}

function speak(text) {
  if (!window.speechSynthesis) return;
  const phrase = String(text || "").trim();
  if (!phrase) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(phrase);
  u.lang = "en-US";
  u.rate = 0.88;
  u.pitch = 1;
  const en = voicesReady.find((v) => /^en(-|_)/i.test(v.lang) && /US|UK|GB|AU/i.test(v.lang))
    || voicesReady.find((v) => /^en/i.test(v.lang));
  if (en) u.voice = en;
  speechSynthesis.speak(u);
}

function speakBtn(label, phrase) {
  return `<button class="speak" type="button" data-speak="${esc(phrase)}" aria-label="اسمع نطق: ${esc(label)}">
    <span class="speak-ico" aria-hidden="true">🔊</span>
    <span class="speak-en">${esc(label)}</span>
  </button>`;
}

function bindSpeak(root) {
  root.querySelectorAll("[data-speak]").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      speak(btn.dataset.speak);
      btn.classList.add("playing");
      setTimeout(() => btn.classList.remove("playing"), 900);
    };
  });
}

function bindBrokenImages(root) {
  root.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
      const fb = img.parentElement.querySelector(".fallback");
      if (fb) fb.hidden = false;
    });
  });
}

function markSeen(id) {
  if (!state.seen.includes(id)) {
    state.seen.push(id);
    localStorage.setItem("pd-seen", JSON.stringify(state.seen));
  }
}

function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  document.querySelectorAll(".nav a").forEach((a) => {
    const key = a.dataset.nav;
    const here = parts[0] || "home";
    const on = key === "catalog"
      ? here === "catalog" || here === "device" || here === "category"
      : here === key;
    a.classList.toggle("active", on);
  });
  if (!parts.length) return renderHome();
  if (parts[0] === "catalog") return renderCatalog();
  if (parts[0] === "category") return renderCategory(parts[1]);
  if (parts[0] === "device") return renderDevice(parts[1]);
  if (parts[0] === "glossary") return renderGlossary();
  renderHome();
}

function renderHome() {
  $app.innerHTML = `
    <section class="hero">
      <div>
        <p class="kicker">${esc(APP.outcome)}</p>
        <h1>${esc(APP.title)}</h1>
        <p class="lead">
          الجهاز الطرفي جهاز إضافي تكميلي للحاسوب. إن أمكنك لمسه فهو جهاز — ليس برنامجًا —
          وقد يحتوي برامج أو برامج ثابتة. مع الوسائط (أقراص، بطاقات، أشرطة) يشكّل جزءًا من نظام تكنولوجيا المعلومات.
        </p>
      </div>
      <aside class="hero-art">
        <p class="kicker" style="color:#f0c36a">من اللمس إلى النظام</p>
        <h2>5 وحدات دراسية</h2>
        <p>تعريف كل تصنيف، ثم أجهزته بالعربي والإنجليزي مع صورة وقرار شراء للمؤسسة.</p>
        <div class="stat-grid">
          <div class="stat"><b>${CATEGORIES.length}</b> تصنيفات</div>
          <div class="stat"><b>${DEVICES.length}</b> جهازًا</div>
          <div class="stat"><b>${state.seen.length}</b> تعرّفت عليها</div>
        </div>
      </aside>
    </section>

    <article class="panel define">
      <h2>ما الجهاز الطرفي؟</h2>
      <p>إذا لمسته فهو عتاد. لوحة المفاتيح شاشة الماوس الطابعة الفلاش الراوتر: كلها طرفية. البرنامج لا يُلمس. أما البرامج الثابتة Firmware فهي تعليمات منخفضة المستوى مضمّنة داخل الجهاز نفسه — مثل جهاز التحكم عن بعد الذي يحتاجها لرفع الإضاءة أو خفضها.</p>
      ${speakBtn("Firmware", "Firmware")}
    </article>

    <h2 class="section-title">كيف يكتمل نظام IT؟</h2>
    <div class="flow">
      <div class="flow-box in">إدخال<br /><small>بيانات وتعليمات</small></div>
      <span class="flow-arrow" aria-hidden="true">◀</span>
      <div class="flow-box core">الجهاز الرقمي<br /><small>معالجة</small></div>
      <span class="flow-arrow" aria-hidden="true">◀</span>
      <div class="flow-box out">إخراج<br /><small>صورة · صوت · ورق · حركة</small></div>
    </div>
    <div class="flow side">
      <div class="flow-box store">تخزين ووسائط<br /><small>حفظ · نقل · نسخ احتياطي</small></div>
      <div class="flow-box net">اتصال<br /><small>واي فاي · بلوتوث · USB</small></div>
      <div class="flow-box acc">إمكانية وصول<br /><small>طرق بديلة عادلة</small></div>
    </div>

    <h2 class="section-title">وحدات التصنيف — ابدأ من هنا</h2>
    <p class="progress-note">كل وحدة: تعريفها أولًا، ثم الأجهزة التي تندرج تحتها من نص الكتاب.</p>
    <div class="cat-grid">
      ${CATEGORIES.map((c) => {
        const n = DEVICES.filter((d) => d.category === c.id).length;
        return `
          <article class="cat-card tone-${c.tone}">
            <a class="cat-link" href="#/category/${c.id}">
              <span class="cat-ico">${c.icon}</span>
              <h3>${esc(c.name)}</h3>
            </a>
            ${speakBtn(c.nameEn, c.speak)}
            <p>${esc(c.def)}</p>
            <a class="cat-more" href="#/category/${c.id}">${n} أجهزة · ${esc(c.role)}</a>
          </article>`;
      }).join("")}
    </div>

    <div class="grid-2" style="margin-top:28px">
      <a class="outcome" href="#/catalog" style="text-decoration:none">
        <h3>معرض كل الأجهزة</h3>
        <p>بطاقات مصوّرة مع الاسم باللغتين. اضغط السماعة لتسمع اللفظ الإنجليزي.</p>
      </a>
      <a class="outcome" href="#/glossary" style="text-decoration:none">
        <h3>المصطلحات الرئيسة</h3>
        <p>Firmware، النص البديل، RSI، الوسائط، Blu-ray وغيرها كما في الكتاب.</p>
      </a>
    </div>
  `;
  bindSpeak($app);
}

function filteredDevices(catId) {
  const q = state.search.trim().toLowerCase();
  const cat = catId || state.filter;
  return DEVICES.filter((d) => {
    const catOk = cat === "all" || d.category === cat;
    const text = `${d.name} ${d.nameEn} ${d.short} ${d.need}`.toLowerCase().includes(q);
    return catOk && text;
  });
}

function renderCatalog() {
  const list = filteredDevices();
  $app.innerHTML = `
    <p class="kicker">معرض تفاعلي</p>
    <h1>الأجهزة الطرفية والوسائط</h1>
    <p class="lead">فلتر حسب التصنيف، ابحث بالعربي أو الإنجليزي، واضغط السماعة لتسمع اللفظ.</p>
    <div class="toolbar">
      <div class="chips">
        <button class="chip ${state.filter === "all" ? "active" : ""}" data-filter="all">الكل</button>
        ${CATEGORIES.map((c) => `<button class="chip ${state.filter === c.id ? "active" : ""}" data-filter="${c.id}">${esc(c.name)}</button>`).join("")}
      </div>
      <input class="search" id="q" type="search" placeholder="ابحث عن جهاز…" value="${esc(state.search)}" />
    </div>
    <p class="progress-note">${countLabel(list.length)} · تعرّفت على ${state.seen.length} من ${DEVICES.length}</p>
    <div class="cards">
      ${list.map(deviceCard).join("")}
    </div>
  `;
  bindCatalogEvents();
}

function deviceCard(d) {
  const cat = catOf(d.category);
  return `
    <article class="device-card">
      <button class="card-hit" data-go="${d.id}" type="button">
        <div class="thumb">
          <img src="${esc(d.image)}" alt="${esc(d.imageAlt)}" loading="lazy" referrerpolicy="no-referrer" />
          <div class="fallback" hidden aria-hidden="true">${ICONS[d.id] || "•"}</div>
          <span class="code">${d.code} ${state.seen.includes(d.id) ? "✓" : ""}</span>
        </div>
        <div class="card-body">
          <small>${esc(cat ? cat.name : "")}</small>
          <h3>${esc(d.name)}</h3>
          <p>${esc(d.short)}</p>
        </div>
      </button>
      ${speakBtn(d.nameEn, d.speak)}
    </article>`;
}

function bindCatalogEvents() {
  bindBrokenImages($app);
  bindSpeak($app);
  $app.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.onclick = () => { state.filter = btn.dataset.filter; renderCatalog(); };
  });
  $app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.onclick = () => { location.hash = `#/device/${btn.dataset.go}`; };
  });
  const q = $app.querySelector("#q");
  if (!q) return;
  q.addEventListener("input", () => {
    state.search = q.value;
    const caret = q.selectionStart;
    renderCatalog();
    const el = document.getElementById("q");
    if (el) {
      el.focus();
      try { el.setSelectionRange(caret, caret); } catch (_) {}
    }
  });
}

function renderCategory(id) {
  const c = catOf(id);
  if (!c) return renderCatalog();
  const list = DEVICES.filter((d) => d.category === id);
  $app.innerHTML = `
    <a class="back" href="#/">← رجوع للوحدات</a>
    <p class="kicker">وحدة دراسية</p>
    <div class="cat-head tone-${c.tone}">
      <span class="cat-ico">${c.icon}</span>
      <div>
        <h1>${esc(c.name)}</h1>
        ${speakBtn(c.nameEn, c.speak)}
      </div>
    </div>
    <article class="panel define">
      <h2>تعريف الوحدة</h2>
      <p>${esc(c.def)}</p>
      <p><strong>دورها في النظام:</strong> ${esc(c.role)}</p>
    </article>
    <h2 class="section-title">الأجهزة التي تندرج تحت هذه الوحدة</h2>
    <p class="progress-note">${countLabel(list.length)} من نص الكتاب · اضغط البطاقة للتفاصيل أو السماعة للنطق</p>
    <div class="cards">
      ${list.map(deviceCard).join("")}
    </div>
  `;
  bindBrokenImages($app);
  bindSpeak($app);
  $app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.onclick = () => { location.hash = `#/device/${btn.dataset.go}`; };
  });
}

function renderDevice(id) {
  const d = DEVICES.find((x) => x.id === id);
  if (!d) return renderCatalog();
  markSeen(d.id);
  const cat = catOf(d.category);
  const family = DEVICES.filter((x) => x.category === d.category && x.id !== d.id);
  $app.innerHTML = `
    <a class="back" href="#/category/${d.category}">← رجوع لوحدة ${esc(cat.name)}</a>
    <section class="detail">
      <div class="detail-photo">
        <img src="${esc(d.image)}" alt="${esc(d.imageAlt)}" referrerpolicy="no-referrer" />
        <div class="fallback" hidden aria-hidden="true">${ICONS[d.id] || "•"}</div>
      </div>
      <div>
        <span class="badge">${esc(d.code)} · ${esc(cat.name)}</span>
        <h1 style="margin-top:8px">${esc(d.name)}</h1>
        ${speakBtn(d.nameEn, d.speak)}
        <p class="lead">${esc(d.short)}</p>
        <p class="connect">${esc(d.connect)}</p>
      </div>
    </section>
    <div class="lists">
      <article class="panel choose">
        <h3>لماذا نحتاجه؟</h3>
        <p>${esc(d.need)}</p>
      </article>
      <article class="panel buy">
        <h3>متى نشتريه للشركة؟</h3>
        <p>${esc(d.when)}</p>
      </article>
    </div>
    ${family.length ? `
      <h3 class="section-title">من الوحدة نفسها</h3>
      <div class="family-row">${family.map((f) => `<a href="#/device/${f.id}">${esc(f.name)}</a>`).join("")}</div>
    ` : ""}
  `;
  bindBrokenImages($app);
  bindSpeak($app);
}

function renderGlossary() {
  $app.innerHTML = `
    <p class="kicker">المصطلحات الرئيسة من النص</p>
    <h1>لغة الأجهزة الطرفية والوسائط</h1>
    <p class="lead">اضغط السماعة بجانب المصطلح الإنجليزي لتسمع اللفظ، ثم اربط التعريف بالجهاز في المعرض.</p>
    <div class="grid-2">
      ${GLOSSARY.map((g) => `
        <article class="term">
          <h3>${esc(g.term)}</h3>
          ${speakBtn(g.termEn, g.speak)}
          <p>${esc(g.def)}</p>
        </article>
      `).join("")}
    </div>
  `;
  bindSpeak($app);
}

window.addEventListener("hashchange", route);
document.getElementById("theme-btn").onclick = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "");
  localStorage.setItem("pd-theme", next);
  document.getElementById("theme-btn").textContent = next === "dark" ? "☀" : "☾";
};
(() => {
  const t = localStorage.getItem("pd-theme");
  if (t === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("theme-btn").textContent = "☀";
  }
})();
route();
