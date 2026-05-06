import { boot } from "quasar/wrappers";

import auth from "src/api/auth";
import { useDataStore } from "stores/DataStore";

export default boot(async ({ app, router, store }) => {
  const DataStore = useDataStore();
  const isLogin = auth.authenticated();

  if (isLogin) {
    console.log("user is login");
  }
});
