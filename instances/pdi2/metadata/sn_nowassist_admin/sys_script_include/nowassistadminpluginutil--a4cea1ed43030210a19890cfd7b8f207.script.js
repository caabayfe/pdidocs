var NowAssistAdminPluginUtil = Class.create();
NowAssistAdminPluginUtil.prototype = {
    initialize: function() {
        this.TRUE_ONE = '1';
        this.TRUE = 'true';
    },

    _isPropertyTrue: function(propValue) {
        return propValue === this.TRUE_ONE || propValue === this.TRUE;
    },

    isRegulatedInstance: function() {
        return this._isPropertyTrue(gs.getProperty("glide.regulated_instance", false));
    },

    isSelfHostedInstance: function() {
        return this._isPropertyTrue(gs.getProperty("glide.installation.self_hosted", false));
    },

    isGccInstance: function() {
        return this._isPropertyTrue(gs.getProperty("sn_appclient.is_gcc_instance", false));
    },

    isRegulatedOrSelfHostedInstance: function() {
        return this.isRegulatedInstance() || this.isSelfHostedInstance() || this.isGccInstance() || this.getStoreBaseUrl() != 'https://store.servicenow.com/';
    },

    getStoreBaseUrl: function() {
        var storeBaseUrl = gs.getProperty("sn_appclient.repository_base_url", "https://store.servicenow.com/");
        if (storeBaseUrl === "https://apprepo.service-now.com/") {
            return "https://store.servicenow.com/";
        }
        return storeBaseUrl;
    },

    getCustomDCUrl: function() {
        return gs.getProperty("glide.customurl.datacenter.instance.url", "");
    },

    /**
     * Determines if the instance is regulated instance based on Store Url.
     * 
     * @param {String} instanceType - The type of regulated instance to check for.
     *                               Valid values are: "NSC", "GCC", "SPP-SG", "SPP-AU".
     * @returns {Boolean} True if the instance matches the specified regulated type, false otherwise.
     *                    Returns false for null, undefined, or unrecognized instance types.
     * @throws {Error} Logs error and returns false if an exception occurs during evaluation.
     */
    isRegulatedInstanceType: function(instanceType) {
        try {
            switch (instanceType) {
                case "NSC":
                    return this.getStoreBaseUrl().startsWith("https://appstorefive.servicenowcloud.mil") && this.getCustomDCUrl().startsWith("https://dcil5.servicenowcloud.mil");

                case "GCC":
                    return this.getStoreBaseUrl().startsWith("https://fedappstore.servicenowservices.com");

                case "SPP-SG":
                    return this.getStoreBaseUrl().startsWith("https://appstoresg.servicenowcloud.com.sg");

                case "SPP-AU":
                    return this.getStoreBaseUrl().startsWith("https://appstoreapc.servicenowcloud.com.au");

                default:
                    return false;
            }
        } catch (e) {
            gs.error("NowAssistAdminPluginUtil : isRegulatedInstanceType - " + JSON.stringify(e));
            return false;
        }
    },

    type: 'NowAssistAdminPluginUtil'
};
