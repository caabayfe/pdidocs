var MDMProductDataDAO = Class.create();
MDMProductDataDAO.prototype = {
    initialize: function() {
        this.TABLE_NAME = 'mdm_product_data';
        this.CONFIG_TYPE = 'config_type';
        this.PRODUCT_CODE = 'product_code';
        this.DATA = 'data';
        this._cacheManager = new LicensingCacheManager();
        this._cacheDataHandler = new CacheDataHandler();
        // Contains the list of columns that are part of cache object.
        this._cacheColumnList = [
            this.PRODUCT_CODE,
            this.DATA
        ];
        this._cacheRefColumnList = [];
        this.logger = new LoggingUtil();
    },

    insertOrUpdateRecord: function(configData) {
        const configType = configData.config_type;
        const productCode = configData.product_code;
        const data = JSON.stringify(configData.data);

        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery(this.PRODUCT_CODE, productCode);
        gr.query();
        if (gr.next()) {
            gr.setValue(this.DATA, data);
            gr.setValue(this.CONFIG_TYPE, configType);
            return gr.update();
        } else {
            gr.initialize();
            gr.setValue(this.DATA, data);
            gr.setValue(this.CONFIG_TYPE, configType);
            gr.setValue(this.PRODUCT_CODE, productCode);
            return gr.insert();
        }
    },

    loadGlobalConfigDataIntoCache: function() {
        let globalConfigDataObj = this._loadGlobalConfigData();
        this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.GLOBAL_CONFIG_DATA_CACHE, globalConfigDataObj);
    },

    /**
     * Internal method to load global config data from database
     * @returns {Map} Map of config type to global config data objects
     */
    _loadGlobalConfigData: function() {
        let globalConfigDataObj = new Map();
        const gr = new GlideRecord(this.TABLE_NAME);
        gr.query();
        globalConfigDataObj = this._cacheDataHandler.prepareCacheData(gr, globalConfigDataObj, this.CONFIG_TYPE, this._cacheColumnList, this._cacheRefColumnList);
        return globalConfigDataObj;
    },

    loadAllDataIntoCache: function() {
        this.loadGlobalConfigDataIntoCache();
    },

    /**
     * Returns the map of config type to global config data object
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of config types to global config data objects
     */
    getGlobalConfigData: function() {
        var data = this._cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.GLOBAL_CONFIG_DATA_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadGlobalConfigData();
            // Cache for other threads
            this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.GLOBAL_CONFIG_DATA_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    /**
     * Deletes products from mdm_product_table which are not part of the payload
     */
    cleanOrphanMDMProducts: function(productsReceived) {
        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery(this.PRODUCT_CODE, 'NOT IN', productsReceived);
        gr.query();

        while (gr.next()) {
            if (gr.deleteRecord())
                this.logger.logInfo(this.type, "cleanOrphanMDMProducts", "Deleted Record from MDM product data table since " + gr.product_code + " was removed.");
        }
    },

    type: 'MDMProductDataDAO'
};
