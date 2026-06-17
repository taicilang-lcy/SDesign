// 把生成的单文件 HTML 幻灯片变成"可打印成 PDF"的文档：
// 注入 @media print 把每个 .slide 变成一页 16:9，强制显示所有 slide + 强制打印背景色，
// 再自动调起浏览器打印对话框（用户选"另存为 PDF"）。纯浏览器、零依赖、矢量输出（中文字体完美）。
// 移植自 OD 的浏览器打印降级方案。

const DECK_PRINT_STYLE = `<style id="sdesign-print-style">
@media print {
  @page { size: 1920px 1080px; margin: 0; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body {
    width: 1920px !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body { display: block !important; scroll-snap-type: none !important; transform: none !important; }
  .slide, section.slide, .deck-slide, .ppt-slide, [data-slide], [data-screen-label] {
    width: 1920px !important;
    height: 1080px !important;
    min-height: 1080px !important;
    max-height: 1080px !important;
    page-break-after: always;
    break-after: page;
    page-break-inside: avoid;
    break-inside: avoid;
    transform: none !important;
    position: relative !important;
    inset: auto !important;
    left: 0 !important;
    top: 0 !important;
    opacity: 1 !important;
    visibility: visible !important;
    overflow: hidden !important;
    scroll-snap-align: none !important;
    margin: 0 !important;
    flex: none !important;
  }
  .slide:last-child, section.slide:last-child { page-break-after: auto; break-after: auto; }
  .deck-counter, .deck-hint, .deck-nav, .nav-dots, .progress, .progress-bar,
  [aria-label="Previous slide"], [aria-label="Next slide"] { display: none !important; }
}
</style>`;

const FORCE_SHOW_AND_PRINT = `<script>
(function () {
  function showAll() {
    var sel = ".slide, section.slide, .deck-slide, .ppt-slide, [data-slide], [data-screen-label]";
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.classList.add("active", "current", "is-active", "visible", "show");
      el.style.opacity = "1";
      el.style.visibility = "visible";
    }
  }
  function go() {
    showAll();
    setTimeout(function () {
      try { window.focus(); window.print(); } catch (e) {}
    }, 800);
  }
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go);
})();
</script>`;

export function buildPrintableDeck(html: string): string {
  let doc = html;
  doc = /<\/head>/i.test(doc)
    ? doc.replace(/<\/head>/i, DECK_PRINT_STYLE + "</head>")
    : DECK_PRINT_STYLE + doc;
  doc = /<\/body>/i.test(doc)
    ? doc.replace(/<\/body>/i, FORCE_SHOW_AND_PRINT + "</body>")
    : doc + FORCE_SHOW_AND_PRINT;
  return doc;
}
