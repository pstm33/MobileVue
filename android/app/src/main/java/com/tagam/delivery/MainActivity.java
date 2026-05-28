package com.tagam.delivery;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;

import ee.forgr.capacitor.social.login.GoogleProvider;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = getBridge().getWebView();
    if (webView != null) {
      webView.getSettings().setTextZoom(100);
    }
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);

    if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
      PluginHandle pluginHandle = getBridge().getPlugin("SocialLogin");
      if (pluginHandle == null) {
        Log.i("Google Activity Result", "SocialLogin plugin handle is null");
        return;
      }

      Plugin plugin = pluginHandle.getInstance();
      if (!(plugin instanceof SocialLoginPlugin)) {
        Log.i("Google Activity Result", "SocialLogin plugin instance is not SocialLoginPlugin");
        return;
      }

      ((SocialLoginPlugin) plugin).handleGoogleLoginIntent(requestCode, data);
    }
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    routeSocialLoginIntent(intent);
  }

  private void routeSocialLoginIntent(Intent intent) {
    if (intent == null || intent.getData() == null) return;

    String url = intent.getData().toString();
    boolean isAppleLoginCallback =
      url.startsWith("com.tagam.delivery://apple-login") ||
      url.startsWith("https://tagam.delivery/interface/app_apple_callback") ||
      url.startsWith("https://tagam.delivery/interface/apple_callback");
    if (!isAppleLoginCallback) return;

    PluginHandle pluginHandle = getBridge().getPlugin("SocialLogin");
    if (pluginHandle == null) {
      Log.i("Apple Login Intent", "SocialLogin plugin handle is null");
      return;
    }

    Plugin plugin = pluginHandle.getInstance();
    if (!(plugin instanceof SocialLoginPlugin)) {
      Log.i("Apple Login Intent", "SocialLogin plugin instance is not SocialLoginPlugin");
      return;
    }

    ((SocialLoginPlugin) plugin).handleAppleLoginIntent(intent);
  }

  public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
}
