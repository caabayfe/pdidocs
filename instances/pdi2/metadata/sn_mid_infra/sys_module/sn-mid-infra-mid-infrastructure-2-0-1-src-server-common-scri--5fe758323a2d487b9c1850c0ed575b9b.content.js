var UrlService = Class.create();
UrlService.prototype = {
    initialize: function() {
        this.urlUtility = new UrlUtility();
    },

    /**
     * @param {string} midName
     * @param {string} midUserSysId
     * @param {string} midRegKey
     * @param {string} packageType    - 'rpm' | 'deb'
     * @param {string} useProxy       - 'Y' | 'N'
     * @param {string} proxyHost
     * @param {string} proxyPort
     * @param {string} serviceName    - optional
     * @returns {string}
     */
    getInstallCmdForIPKI: function(midName, midUserSysId, midRegKey, packageType,
                                   useProxy, proxyHost, proxyPort,
                                   serviceName) {
        return this.urlUtility.getInstallCmdForIPKI(midName, midUserSysId, midRegKey, packageType,
                                                    useProxy, proxyHost, proxyPort,
                                                    serviceName);
    },

    type: 'UrlService'
};
