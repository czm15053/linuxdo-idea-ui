import { FAVICON_URI } from "../config/skins.js";

export function restyleSplash() {
  const splash = document.getElementById("d-splash");
  if (!splash) return;
  document.documentElement.style.setProperty(
    "--im-splash-logo",
    `url("${FAVICON_URI}")`
  );
}
