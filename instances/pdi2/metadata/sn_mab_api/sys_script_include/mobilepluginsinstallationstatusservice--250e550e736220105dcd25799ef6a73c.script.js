// if the associated app passed into the `hasLicenseForApp` check does not exist, an error/
// exception is thrown (false is not returned, womp) - so we must keep track of license check for
// both ways that the MP app can be installed (side-loaded & installed through store/plugin list)

// if `com.snc.sn_mobile_whitelab` is the scoped app id, then app is installed through
// store / plugin

// if `sn_mobile_whitelab` is the scoped app id, then app has been side-loaded into the system (
// via the Install Application platform feature)
class MobilePluginsInstallationStatusService {
  constructor() {
    this.glidePluginManagerService = new GlidePluginManager();
    this.MOBILE_PUBLISHING_STORE_ID = 'com.snc.sn_mobile_whitelab';
    this.MOBILE_PUBLISHING_SIDELOAD_ID = 'sn_mobile_whitelab';
  }

  _checkIfEntitledToMobilePublishing() {
    var hasLicenseForApp = false;

    try {
      // checks if the user has a license for MP - installed via the app store / plugins list
      hasLicenseForApp = sn_lef.GlideEntitlement.hasLicenseForApp(
        this.MOBILE_PUBLISHING_STORE_ID
      );
    } catch (e) {
      hasLicenseForApp = false;
    }

    if (!hasLicenseForApp) {
      try {
        // checks if the user has a license for MP - installed via side-loading
        hasLicenseForApp = sn_lef.GlideEntitlement.hasLicenseForApp(
          this.MOBILE_PUBLISHING_SIDELOAD_ID
        );
      } catch (e) {
        hasLicenseForApp = false;
      }
    }

    return hasLicenseForApp;
  }

  getPluginsInstallationStatus() {
    // Plugin registry keys
    var MOBILE_CARD_BUILDER_KEY =
      'com.glide.servicenow_now_mobile_card_builder';
    var MOBILE_STUDIO_ITEM_VIEW_BUILDER_KEY =
      'com.sn_mobile_studio_itemview_builder';
    var MOBILE_CARD_BUI_KEY = 'sn_mobile_card_bui';
    var MOBILE_OFFLINE_KEY = 'com.glide.sg.offline';
    var MOBILE_LOCATION_TRACKING_ID = 'com.glide.sg.location.tracking';

    try {
      var installationStatus = {
        isMobileCardBuilderInstalled:
          this.glidePluginManagerService.isActive(MOBILE_CARD_BUILDER_KEY) ||
          this.glidePluginManagerService.isActive(
            MOBILE_STUDIO_ITEM_VIEW_BUILDER_KEY
          ) ||
          this.glidePluginManagerService.isActive(MOBILE_CARD_BUI_KEY),
        isMobileOfflineInstalled:
          this.glidePluginManagerService.isActive(MOBILE_OFFLINE_KEY),
        isMobileLocationTrackingInstalled:
          this.glidePluginManagerService.isActive(MOBILE_LOCATION_TRACKING_ID),
        isMobilePublishingInstalled:
          this.glidePluginManagerService.isActive(
            this.MOBILE_PUBLISHING_STORE_ID
          ) ||
          this.glidePluginManagerService.isActive(
            this.MOBILE_PUBLISHING_SIDELOAD_ID
          ),
        isMobilePublishingEntitled: this._checkIfEntitledToMobilePublishing(),
      };
      response.setStatus(200);
      response.setBody({
        result: installationStatus,
      });
    } catch (err) {
      response.setStatus(500);
      response.setBody({
        result: 'error: ' + new global.JSON().decode(err),
      });
    }
  }
}

module.exports = MobilePluginsInstallationStatusService;
