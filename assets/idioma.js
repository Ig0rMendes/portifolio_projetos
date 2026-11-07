// Troca o idioma da página (português ⇄ inglês) na hora, sem recarregar.
//
// Como funciona:
// - O index.html continua todo em português.
// - assets/i18n-en.js guarda a tradução de cada texto, usando o próprio texto em português como chave.
// - Ao escolher EN, cada bloco de texto é trocado pela tradução; ao voltar para PT, o original é restaurado.
// - A escolha fica salva no navegador e vai para o endereço (?lang=en), então dá para mandar o link já em inglês.
// - Elementos com translate="no" nunca são traduzidos.
// - Para ver no console quais textos estão sem tradução, abra a página com ?lang=en&i18n-debug.
(() => {
  const EN = window.I18N_EN || {};
  const INLINE = new Set(["STRONG", "EM", "B", "I", "BR", "SMALL", "SUP", "SUB"]);
  const PULAR = 'script, style, svg, [translate="no"]';
  const ATRIBUTOS = ["alt", "title", "aria-label"];
  const METAS = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]'];
  const traduzivel = /\p{L}|\d,\d/u;            // tem letras, ou um número com vírgula decimal
  const normalizar = (t) => t.replace(/\s+/g, " ").trim();

  const originais = new Map();                  // elemento ou nó de texto -> conteúdo em português
  const atributosOriginais = new Map();         // elemento -> { alt/title/aria-label em português }
  let atual = "pt";

  // Um "bloco" é o menor elemento que contém uma frase inteira: só tem texto e formatação (negrito, itálico...).
  // Assim a frase é traduzida de uma vez e a ordem das palavras fica natural em inglês.
  const ehBloco = (el) => el && el !== document.body && !el.closest(PULAR) &&
    traduzivel.test(el.textContent) && [...el.children].every((c) => INLINE.has(c.tagName));

  function alvos() {
    const blocos = [...document.body.querySelectorAll("*")].filter((el) => ehBloco(el) && !ehBloco(el.parentElement));
    const dentroDeBloco = (no) => {
      for (let e = no.parentElement; e && e !== document.body; e = e.parentElement) if (ehBloco(e)) return true;
      return false;
    };
    // Textos soltos (ex.: o texto ao lado de um ícone), que não estão dentro de nenhum bloco
    const soltos = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let no; (no = walker.nextNode());) {
      if (traduzivel.test(no.nodeValue) && !no.parentElement.closest(PULAR) && !dentroDeBloco(no)) soltos.push(no);
    }
    return { blocos, soltos };
  }

  const faltando = new Set();
  function traduzir(pt) {
    if (atual === "pt") return pt;
    const chave = normalizar(pt);
    if (chave in EN) return EN[chave];
    faltando.add(chave);
    return pt;                                  // sem tradução: fica como está (nomes de ferramentas, empresas...)
  }

  // Calculado uma vez, com a página ainda em português (depois de traduzido, "53.5%" já não parece texto a traduzir)
  let cache = null;

  function aplicar() {
    cache ??= alvos();
    const { blocos, soltos } = cache;
    for (const el of blocos) {
      if (!originais.has(el)) originais.set(el, el.innerHTML);
      el.innerHTML = traduzir(originais.get(el));
    }
    for (const no of soltos) {
      if (!originais.has(no)) originais.set(no, no.nodeValue);
      const pt = originais.get(no);
      const [, antes, , depois] = pt.match(/^(\s*)([\s\S]*?)(\s*)$/);
      no.nodeValue = atual === "pt" ? pt : antes + traduzir(pt) + depois;
    }
    for (const el of document.querySelectorAll(ATRIBUTOS.map((a) => `[${a}]`).join(","))) {
      if (el.closest('[translate="no"]')) continue;
      if (!atributosOriginais.has(el)) {
        atributosOriginais.set(el, Object.fromEntries(ATRIBUTOS.filter((a) => el.hasAttribute(a)).map((a) => [a, el.getAttribute(a)])));
      }
      for (const [a, pt] of Object.entries(atributosOriginais.get(el))) el.setAttribute(a, traduzir(pt));
    }
    for (const meta of document.querySelectorAll(METAS.join(","))) {
      if (!originais.has(meta)) originais.set(meta, meta.content);
      meta.content = traduzir(originais.get(meta));
    }
    if (!originais.has(document)) originais.set(document, document.title);
    document.title = traduzir(originais.get(document));

    // Links que têm versão em inglês (ex.: currículo): data-href-en no próprio link
    for (const a of document.querySelectorAll("a[data-href-en]")) {
      if (!a.dataset.hrefPt) a.dataset.hrefPt = a.getAttribute("href");
      a.setAttribute("href", atual === "en" ? a.dataset.hrefEn : a.dataset.hrefPt);
    }

    document.documentElement.lang = atual === "en" ? "en" : "pt-BR";
    for (const b of document.querySelectorAll(".lang-switch [data-lang]")) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === atual));
    }
    if (faltando.size && new URLSearchParams(location.search).has("i18n-debug")) {
      console.info(`[idioma] ${faltando.size} texto(s) sem tradução (ficaram iguais):`, [...faltando]);
    }
  }

  function trocar(idioma, { salvar = true } = {}) {
    atual = idioma === "en" ? "en" : "pt";
    aplicar();
    document.documentElement.classList.remove("i18n-loading");
    if (!salvar) return;
    try { localStorage.setItem("idioma", atual); } catch { /* navegador sem armazenamento: só não lembra a escolha */ }
    const url = new URL(location.href);
    if (atual === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
    history.replaceState(null, "", url);
  }

  for (const botao of document.querySelectorAll(".lang-switch [data-lang]")) {
    botao.addEventListener("click", () => { if (botao.dataset.lang !== atual) trocar(botao.dataset.lang); });
  }

  let inicial = "pt";
  try { inicial = new URLSearchParams(location.search).get("lang") || localStorage.getItem("idioma") || "pt"; } catch { /* fica em português */ }
  if (inicial === "en") trocar("en", { salvar: false });
  document.documentElement.classList.remove("i18n-loading");
})();
