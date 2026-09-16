export function toast(text) {
  let el = document.getElementById("xim-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "xim-toast";
    (document.body || document.documentElement).appendChild(el);
  }
  el.textContent = text;
  el.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("on"), 1400);
}
