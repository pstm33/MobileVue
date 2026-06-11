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

export function useSocialAuth() {
  const DataStore = useDataStore();

  const loginWithGoogle = async () => {
    const googleClientId = DataStore?.attributes_data?.app_google_client_id;
    if (!googleClientId) {
      throw new Error("Google client id is not configured");
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
    const facebookAppId = DataStore?.attributes_data?.app_facebook_id;
    if (!facebookAppId) {
      throw new Error("Facebook app id is not configured");
    }

    return new Promise((r, j) => {
      let settled = false;
      let popup = null;
      let popupWatch = null;
      const state = Math.random().toString(36).slice(2);
      const redirectUri = `${window.location.origin}/`;
      const params = new URLSearchParams({
        client_id: facebookAppId,
        redirect_uri: redirectUri,
        response_type: "token",
        scope: "email,public_profile",
        display: "popup",
        state,
      });
      const popupWidth = 540;
      const popupHeight = 720;
      const popupLeft =
        window.screenX + Math.max(0, (window.outerWidth - popupWidth) / 2);
      const popupTop =
        window.screenY + Math.max(0, (window.outerHeight - popupHeight) / 2);
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;

      const cleanup = () => {
        if (popupWatch) {
          clearInterval(popupWatch);
        }
        if (popup && !popup.closed) {
          popup.close();
        }
      };

      const finish = (payload) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (payload.error || payload.error_code) {
          j(new Error(payload.error_message || payload.error || "Facebook login failed"));
          return;
        }
        if (payload.state && payload.state !== state) {
          j(new Error("Facebook login state mismatch"));
          return;
        }
        if (payload.access_token) {
          r({ accessToken: payload.access_token });
          return;
        }
        j(new Error("Facebook login failed"));
      };

      popup = window.open(
        authUrl,
        "Facebook Sign In",
        `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},popup=1`
      );

      if (!popup) {
        cleanup();
        j(new Error("Failed to open Facebook login popup"));
        return;
      }

      popupWatch = setInterval(() => {
        if (popup.closed) {
          finish({ error: "Facebook login cancelled" });
          return;
        }
        try {
          if (popup.location.origin !== window.location.origin) return;
          let raw = popup.location.hash
            ? popup.location.hash.slice(1)
            : popup.location.search.slice(1);
          if (!raw) return;
          raw = raw.replace(/^\/+/, "");
          const payload = Object.fromEntries(new URLSearchParams(raw));
          finish(payload);
        } catch (e) {
          // Cross-origin while the user is still inside Facebook.
        }
      }, 400);
    });
  };

  const loginWithApple = async () => {
    const appleClientId = DataStore?.attributes_data?.app_apple_app_id;
    const appleRedirectURI = DataStore?.attributes_data?.apple_web_redirect_uri;
    if (!appleClientId || !appleRedirectURI) {
      throw new Error("Apple login is not configured");
    }

    return new Promise((r, j) => {
      let settled = false;
      let popup = null;
      let popupWatch = null;
      const state = Math.random().toString(36).slice(2);
      const params = new URLSearchParams({
        response_type: "code id_token",
        client_id: appleClientId,
        redirect_uri: appleRedirectURI,
        scope: "name email",
        state,
        response_mode: "form_post",
      });
      const popupWidth = 520;
      const popupHeight = 720;
      const popupLeft =
        window.screenX + Math.max(0, (window.outerWidth - popupWidth) / 2);
      const popupTop =
        window.screenY + Math.max(0, (window.outerHeight - popupHeight) / 2);
      const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;

      const messageHandler = (evt) => {
        const data = evt?.data || null;
        if (!data || data.source !== "apple-login") return;
        if (settled) return;
        settled = true;
        cleanup();
        const payload = data.payload || {};
        if (payload.id_token) {
          r({
            id_token: payload.id_token,
            code: payload.code,
            user: payload.user,
          });
        } else {
          j(new Error("Apple login failed"));
        }
      };
      const cleanup = () => {
        window.removeEventListener("message", messageHandler);
        if (popupWatch) {
          clearInterval(popupWatch);
        }
        if (popup && !popup.closed) {
          popup.close();
        }
      };
      window.addEventListener("message", messageHandler);

      popup = window.open(
        authUrl,
        "Apple Sign In",
        `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop},popup=1`
      );

      if (!popup) {
        cleanup();
        j(new Error("Failed to open Apple login popup"));
        return;
      }

      popupWatch = setInterval(() => {
        if (popup.closed) {
          if (settled) return;
          settled = true;
          cleanup();
          j(new Error("Apple login cancelled"));
        }
      }, 800);
    });
  };

  return {
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
  };
}



