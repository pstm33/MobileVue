import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "stores/DataStore";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    //scrollBehavior: () => ({ left: 0, top: 0 }),
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        // Return to the saved scroll position
        return savedPosition;
      } else {
        // Scroll to the top for new pages
        return { left: 0, top: 0 };
      }
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    //history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    //const intro = APIinterface.getStorage("intro");
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    const intro = DataStorePersisted.intro;

    const searchMode = DataStore.attributes_data?.search_mode || null;
    const locationData = DataStorePersisted.location_data;

    if (to.meta.checkAuth) {
      console.log("intro", intro);
      if (APIinterface.empty(intro)) {
        next();
      } else {
        if (auth.authenticated()) {
          const hasAddress =
            searchMode == "location"
              ? locationData
              : DataStorePersisted.hasCoordinates;
          if (!hasAddress) {
            const nextUrl =
              searchMode == "location"
                ? "/location/add-location"
                : "/location/map";
            next({ path: nextUrl });
          } else {
            next({ path: "/home" });
          }
        } else next({ path: "/home" });
      }
    } else if (to.meta.checkPlaceID) {
      const hasAddress =
        searchMode == "location"
          ? locationData
          : DataStorePersisted.hasCoordinates;
      if (!hasAddress) {
        const nextUrl =
          searchMode == "location" ? "/location/add-location" : "/location/map";
        next({ path: nextUrl });
      } else {
        next();
      }
    } else if (to.meta.checkAuthLogin) {
      if (auth.authenticated()) {
        next({ path: "/home" });
      } else {
        next();
      }
    } else if (to.meta.SignupPage) {
      const signup_type = DataStore.attributes_data?.signup_type || "standard";
      if (signup_type == "mobile_phone") {
        next({ path: "/user/signup-mobile", query: { redirect: to.fullPath } });
      } else {
        next();
      }
    } else if (!to.meta.requiresAuth || auth.authenticated()) {
      next();
    } else {
      if (DataStore.login_method == "otp") {
        next({ path: "/user/login-otp", query: { redirect: to.fullPath } });
      } else {
        next({ path: "/user/login", query: { redirect: to.fullPath } });
      }
    }
  });

  return Router;
});
