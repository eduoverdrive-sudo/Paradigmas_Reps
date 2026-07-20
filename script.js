// ============================================================================
// Comparativo Giannini — logica de selecao e renderizacao
// ============================================================================
const SPEC_FIELDS = [
  ["nivel", "Nível"],
  ["preco", "Preço Médio", "currency"],
  ["subcategoria", "Formato"],
  ["tampo", "Tampo"],
  ["fundoLateral", "Fundo/Laterais"],
  ["acabamento", "Acabamento"],
  ["caseIncluso", "Case/Bag"],
  ["garantia", "Garantia"],
  ["tipoCorda", "Tipo de Corda"],
  ["ncordas", "Nº de Cordas"],
  ["diferencial", "Diferencial"],
  ["nota", "Nota", "rating"],
];

const MAX_COMPETITORS = 5;
let PRODUCTS = [];
let competitorCount = 0;

const el = (id) => document.getElementById(id);

function formatValue(product, key, type) {
  const v = product[key];
  if (v === "" || v === null || v === undefined) return "—";
  if (type === "currency") return "R$ " + Number(v).toLocaleString("pt-BR");
  if (type === "rating") return Number(v).toFixed(1) + " / 5";
  return v;
}

function groupByCategoria(products) {
  const map = new Map();
  products.forEach((p) => {
    if (!map.has(p.categoria)) map.set(p.categoria, []);
    map.get(p.categoria).push(p);
  });
  return map;
}

function populateSelect(select, products, { placeholder }) {
  select.innerHTML = "";
  const optNone = document.createElement("option");
  optNone.value = "";
  optNone.textContent = placeholder;
  select.appendChild(optNone);

  const grouped = groupByCategoria(products);
  grouped.forEach((items, categoria) => {
    const group = document.createElement("optgroup");
    group.label = categoria;
    items.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.rotulo;
      opt.textContent = `${p.marca} — ${p.modelo}`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
}

function currentCategoriaFilter() {
  return el("categoria-filter").value;
}

function filteredProducts() {
  const cat = currentCategoriaFilter();
  if (!cat || cat === "Todas") return PRODUCTS;
  return PRODUCTS.filter((p) => p.categoria === cat);
}

function refreshSelectOptions() {
  const products = filteredProducts();
  const gianniniSelect = el("giannini-select");
  const prevGiannini = gianniniSelect.value;
  populateSelect(gianniniSelect, products.filter((p) => p.marca === "Giannini"), {
    placeholder: "Selecione um modelo Giannini…",
  });
  if ([...gianniniSelect.options].some((o) => o.value === prevGiannini)) gianniniSelect.value = prevGiannini;
  document.querySelectorAll(".competitor-select").forEach((sel) => {
    const prev = sel.value;
    populateSelect(sel, products.filter((p) => p.marca !== "Giannini"), {
      placeholder: "Selecione um concorrente…",
    });
    if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
  });
}

function addCompetitorSlot() {
  if (competitorCount >= MAX_COMPETITORS) return;
  competitorCount += 1;
  const container = el("competitor-controls");
  const idx = container.children.length + 1;

  const group = document.createElement("div");
  group.className = "control-group";
  group.innerHTML = `
    <label>Concorrente ${idx}</label>
    <select class="competitor-select"></select>
    ${idx > 1 ? '<button type="button" class="remove-competitor">remover</button>' : ""}
  `;
  container.appendChild(group);

  const select = group.querySelector("select");
  select.addEventListener("change", render);
  const removeBtn = group.querySelector(".remove-competitor");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      group.remove();
      competitorCount -= 1;
      relabelCompetitors();
      updateAddButtonState();
      render();
    });
  }

  refreshSelectOptions();
  updateAddButtonState();
}

function relabelCompetitors() {
  const groups = el("competitor-controls").querySelectorAll(".control-group");
  groups.forEach((g, i) => {
    g.querySelector("label").textContent = `Concorrente ${i + 1}`;
  });
}

function updateAddButtonState() {
  const btn = el("add-competitor");
  const atMax = competitorCount >= MAX_COMPETITORS;
  btn.disabled = atMax;
  el("add-hint").textContent = atMax
    ? `Máximo de ${MAX_COMPETITORS} concorrentes por comparação.`
    : `${competitorCount} de ${MAX_COMPETITORS} concorrentes selecionados.`;
}

function findByRotulo(rotulo) {
  return PRODUCTS.find((p) => p.rotulo === rotulo);
}

function buildCard(product, referenceProduct) {
  const card = document.createElement("article");
  card.className = "card" + (product === referenceProduct ? " is-reference" : "");

  const photo = document.createElement("div");
  photo.className = "card-photo";
  const img = document.createElement("img");
  img.src = product.imagem;
  img.alt = `${product.marca} ${product.modelo}`;
  img.loading = "lazy";
  img.onerror = () => { img.style.display = "none"; };
  photo.appendChild(img);
  card.appendChild(photo);

  const head = document.createElement("div");
  head.className = "card-head";
  head.innerHTML = `
    <span class="card-tag">${product === referenceProduct ? "Referência Giannini" : "Concorrente"}</span>
    <h3>${product.modelo}</h3>
    <div class="modelo-marca">${product.marca} · ${product.categoria}</div>
  `;
  card.appendChild(head);

  SPEC_FIELDS.forEach(([key, label, type]) => {
    const row = document.createElement("div");
    row.className = "spec-row";
    const refVal = referenceProduct ? referenceProduct[key] : null;
    const isDiff =
      referenceProduct &&
      product !== referenceProduct &&
      refVal !== "" &&
      refVal !== undefined &&
      String(product[key]) !== String(refVal);
    row.innerHTML = `
      <span class="spec-label">${label}</span>
      <span class="spec-value${isDiff ? " diff" : ""}">${formatValue(product, key, type)}</span>
    `;
    card.appendChild(row);
  });

  if (product.link) {
    const a = document.createElement("a");
    a.className = "card-link";
    a.href = product.link;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Ver produto ↗";
    card.appendChild(a);
  }

  return card;
}

function render() {
  const comparisonEl = el("comparison");
  comparisonEl.innerHTML = "";

  const giannini = findByRotulo(el("giannini-select").value);
  const competitorSelects = [...document.querySelectorAll(".competitor-select")];
  const competitors = competitorSelects
    .map((s) => findByRotulo(s.value))
    .filter(Boolean);

  el("empty-state").classList.toggle("hidden", !!giannini);
  if (!giannini) return;

  comparisonEl.appendChild(buildCard(giannini, giannini));
  competitors.forEach((c) => comparisonEl.appendChild(buildCard(c, giannini)));
}

async function init() {
  const res = await fetch("data.json");
  PRODUCTS = await res.json();

  const categorias = [...new Set(PRODUCTS.map((p) => p.categoria))].sort();
  const catSelect = el("categoria-filter");
  catSelect.innerHTML = '<option value="Todas">Todas as categorias</option>';
  categorias.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });

  addCompetitorSlot(); // primeiro slot de concorrente
  refreshSelectOptions();
  updateAddButtonState();

  const dates = PRODUCTS.map((p) => p.atualizado).filter(Boolean).sort();
  if (dates.length) el("last-updated").textContent = dates[dates.length - 1];

  catSelect.addEventListener("change", () => { refreshSelectOptions(); render(); });
  el("giannini-select").addEventListener("change", render);
  el("add-competitor").addEventListener("click", addCompetitorSlot);

  render();
}

init();
