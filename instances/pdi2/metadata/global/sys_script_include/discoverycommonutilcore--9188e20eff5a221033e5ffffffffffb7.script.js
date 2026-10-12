var DiscoveryCommonUtilCore = Class.create();
DiscoveryCommonUtilCore.prototype = {
    initialize: function() {},
    /**
     * Property to suppress the Y features in X release.
     * return true if feature is supported for the release version
     */
    isDiscoveryFeatureSupportedForRelease: function() {
        return (GlidePluginManager.isActive("com.glide.data_privacy_core") ||
            gs.getProperty('privacy_features_showcase', false));
    },
    type: 'DiscoveryCommonUtilCore'
};
