var InstanceInfoUtil = Class.create();
InstanceInfoUtil.prototype = {
    initialize: function() {
        this.instStateDAO = new UAInstanceStateDAO();
        this.propDAO = new SysPropertiesDAO();
        this.cacheManager = new LicensingCacheManager();
    },

    isServiceNowInstance: function() {
        return this.instStateDAO.isServiceNowInstance();
    },

    /**
     * This looks at the instance info to see if central instance is reachable. If it is NOT reachable and the self hosted
     * property is set, it returns true, else it returns false
     *
     */
    isSelfHostedInstance: function() {
        if (!this.isSelfHostedPropertySet())
            return false;

        // central instance should always be marked self hosted
        var instanceName = this.propDAO.getInstanceName();
        if (LicensingEngineConstants.USAGEANALYTICS.equals(instanceName))
            return true;

        // if the central instance is https://disabled.service-now.com, then we are sure
        // that instance cannot communicate with the central instance. No reason to go further.
        var centralInstance = this.propDAO.getCentralInstance();
        if (!gs.nil(centralInstance) && centralInstance.indexOf(LicensingEngineConstants.DISABLED_SERVICENOW_COM) > -1)
            return true;

        // if central instance is reachable, then the instance is not really self-hosted
        var isCentralInstanceReachable = this.instStateDAO.isCommunicationAlive();
        if (isCentralInstanceReachable)
            return false;

        return true;
    },

    isOpenInstance: function() {

        if (this.isSelfHostedInstance())
            return true;

        // used to test enforcement and  entitlement APIs locally or on a dev instance
        if (this.isDeveloperInstance() && this.isDeveloperInstanceClosed())
            return false;

        return this.instStateDAO.isInstanceStateOpen();
    },

    isDeveloperInstance: function() {
        return this.isPropertyTrue(this.propDAO.getDeveloperInstanceProp());
    },

    isDeveloperInstanceClosed: function() {
        return this.isPropertyTrue(this.propDAO.getDeveloperInstanceClosedProp());
    },

    isSelfHostedPropertySet: function() {
        return this.isPropertyTrue(this.propDAO.getSelfHostedInstanceProp());
    },

    isPropertyTrue: function(propValue) {
        return propValue === LicensingEngineConstants.TRUE_ONE || propValue === LicensingEngineConstants.TRUE;
    },

    loadAllDataIntoCache: function() {
        this.loadInstanceInfoIntoCache();
    },

    loadInstanceInfoIntoCache: function() {
        let instanceInfoObject = this._loadInstanceInfoData();
        this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.INSTANCE_INFO_CACHE, instanceInfoObject);
    },

    /**
     * Internal method to load instance info data
     * @returns {Object} Instance info object with open_instance flag
     */
    _loadInstanceInfoData: function() {
        let instanceInfoObject = {};
        instanceInfoObject.open_instance = this.isOpenInstance();
        return instanceInfoObject;
    },

    /**
     * Returns the instance info object from cache
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Object} Instance info object with open_instance flag
     */
    getInstanceInfo: function() {
        var data = this.cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.INSTANCE_INFO_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadInstanceInfoData();
            // Cache for other threads
            this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.INSTANCE_INFO_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

	getInstanceName: function() {
		return this.propDAO.getInstanceName();
	},

	getInstanceId: function() {
		return this.propDAO.getInstanceId();
	},

	getInstanceReleaseName: function() {
		return this.propDAO.getProperty("glide.buildname");
	},

    type: 'InstanceInfoUtil'
};
