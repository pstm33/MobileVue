import { register } from "register-service-worker";

const reloadOnUpdateKey = "tagam-sw-reload-on-update";

function reloadOnceForFreshBuild() {
  if (sessionStorage.getItem(reloadOnUpdateKey) === "1") {
    return;
  }

  sessionStorage.setItem(reloadOnUpdateKey, "1");
  window.location.reload();
}

register(process.env.SERVICE_WORKER_FILE, {
  ready(registration) {
    registration.update();
  },

  registered(registration) {
    setInterval(() => registration.update(), 60 * 60 * 1000);
  },

  cached() {},

  updatefound() {},

  updated(registration) {
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    reloadOnceForFreshBuild();
  },

  offline() {},

  error() {},
});
