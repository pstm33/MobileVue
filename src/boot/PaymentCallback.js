import { boot } from "quasar/wrappers";
import { App } from "@capacitor/app";
import config from "src/api/config";

export default boot(async ({ app, router }) => {
  App.addListener("appUrlOpen", (data) => {
    const url = data.url;
    if (url.startsWith(config.app_android_scheme + "://payment-callback")) {
      const params = new URLSearchParams(url.split("?")[1]);
      const status = params.get("status");
      switch (status) {
        case "successful":
          const order_id = params.get("order_id");
          router.replace({
            path: "/account/trackorder",
            query: { order_uuid: order_id },
          });
          break;
        case "wallet_succesful":
          const transaction_id = params.get("transaction_id");
          router.replace({
            path: "/wallet/receipt",
            query: { transaction_id: transaction_id },
          });
          break;
        case "failed":
          const message = params.get("message");
          app.config.globalProperties.$q.notify({
            message: message,
            color: "dark",
            position: "top",
            timeout: 3000,
          });
          break;
        case "after_addfunds":
          const success_message = params.get("message");
          router.replace({
            path: "/checkout",
            query: {
              success_message: success_message,
              reload: Date.now(),
            },
          });
          break;
        case "apple_login":
          const id_token = params.get("id");
          const email = params.get("email");
          const first_name = params.get("first_name");
          const last_name = params.get("last_name");
          const social_strategy = params.get("social_strategy");
          const social_token = params.get("social_token");

          router.replace({
            path: "/user/apple_callback",
            query: {
              id: id_token,
              email: email,
              first_name: first_name,
              last_name: last_name,
              social_strategy: social_strategy,
              social_token: social_token,
            },
          });

          break;
        case "cancel":
          // do nothing
          break;
      }
    }
  });
});



