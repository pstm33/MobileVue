import { useDataStore } from "stores/DataStore";

function loadGoogleSDK() {
  return new Promise((r, j) => {
    if (window.google?.accounts?.oauth2) return r();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = r;
    s.onerror = j;
    document.head.appendChild(s);
  });
}

function loadFacebookSDK(appId) {
  return new Promise((r) => {
    if (window.FB) return r();
    window.fbAsyncInit = () => {
      FB.init({ appId, cookie: true, xfbml: false, version: "v19.0" });
      r();
    };
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    document.head.appendChild(s);
  });
}

function loadAppleSDK(clientId, redirectURI, scope = "name email") {
  return new Promise((r, j) => {
    if (window.AppleID?.auth) {
      AppleID.auth.init({
        clientId,
        redirectURI,
        scope,
        usePopup: true,
        responseMode: "web_message",
      });
      return r();
    }
    const s = document.createElement("script");
    s.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    s.async = true;
    s.onload = () => {
      AppleID.auth.init({
        clientId,
        redirectURI,
        scope,
        usePopup: true,
        responseMode: "web_message",
      });
      r();
    };
    s.onerror = j;
    document.body.appendChild(s);
  });
}

export function useSocialAuth() {
  const DataStore = useDataStore();

  const facebookAppId = DataStore?.attributes_data?.app_facebook_id;
  const appleClientId = DataStore?.attributes_data?.app_apple_app_id;
  const appleRedirectURI = DataStore?.attributes_data?.apple_web_redirect_uri;

  const loginWithGoogle = async () => {
    const googleClientId =
      DataStore?.attributes_data?.app_google_client_id || "";
    if (!googleClientId) {
      throw new Error("Google client ID is not configured");
    }

    await loadGoogleSDK();
    return new Promise((r, j) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "email profile",
        callback: (t) => (t.error ? j(t) : r(t)),
      });
      client.requestAccessToken();
    });
  };

  const loginWithFacebook = async () => {
    await loadFacebookSDK(facebookAppId);
    return new Promise((r, j) => {
      FB.login(
        (resp) =>
          resp.authResponse
            ? r(resp.authResponse)
            : j(new Error("FB login failed")),
        { scope: "email,public_profile" }
      );
    });
  };

  const loginWithApple = async () => {
    await loadAppleSDK(appleClientId, appleRedirectURI);
    return new Promise((r, j) => {
      const successHandler = (evt) => {
        cleanup();
        r(evt.detail.authorization);
      };
      const errorHandler = (evt) => {
        cleanup();
        j(evt.detail || new Error("Apple login failed"));
      };
      const cleanup = () => {
        document.removeEventListener("AppleIDSignInOnSuccess", successHandler);
        document.removeEventListener("AppleIDSignInOnFailure", errorHandler);
      };
      document.addEventListener("AppleIDSignInOnSuccess", successHandler);
      document.addEventListener("AppleIDSignInOnFailure", errorHandler);
      AppleID.auth.signIn();
    });
  };

  return {
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
  };
}
