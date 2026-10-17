var DataDiscoveryCommonsUtilCore = Class.create();
DataDiscoveryCommonsUtilCore.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * Property to suppress the Y features in X release.
     * return true if feature is supported for the release version
     */
    isDiscoveryFeatureSupportedForRelease: function() {
        return new DiscoveryCommonUtilCore().isDiscoveryFeatureSupportedForRelease();
    },


    type: 'DataDiscoveryCommonsUtilCore'
});
