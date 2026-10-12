var CacheDataHandler = Class.create();
CacheDataHandler.prototype = {
    initialize: function() {
        this._cacheManager = new LicensingCacheManager();
    },

    prepareDataWithColumn: function(gr, columnList, cacheObject) {
        if (!global.LicensingScriptUtil.nil(columnList))
            columnList.forEach(column => cacheObject[column] = gr.getValue(column));
        return cacheObject;
    },

    prepareDataWithCustomKey: function(gr, key, value, cacheObject) {
        cacheObject[key] = gr.getValue(value);
        return cacheObject;
    },

    prepareDataWithRefColumn: function(gr, refColumnList, cacheObject) {
        if (!global.LicensingScriptUtil.nil(refColumnList))
            refColumnList.forEach(refColumn => cacheObject[refColumn] = String(gr.getElement(refColumn)));
        return cacheObject;
    },

    /**
     * Prepares the cache based on the instance of GlideRecord passed in the parameter.
     * @param {GlideRecord} glide record
     * @param {Object} cached object
     * @param {string} unique key of the cached map object
     * @param {String} List of columns that needs to be stored in cache
     * @param {string} List of reference columns that needs to be stored in cache
     * @return {Object} Final map that contains the cached data.
     */
    prepareCacheData: function(gr, cachedMap, mapKey, columnList, refColumnList) {
        while (gr.next()) {
            let recordObject = {};
            let recordObjectSet = new Set();
            if (cachedMap.get(gr.getValue(mapKey)) != null)
                recordObjectSet = cachedMap.get(gr.getValue(mapKey));

            recordObject = this.prepareDataWithColumn(gr, columnList, recordObject);
            recordObject = this.prepareDataWithRefColumn(gr, refColumnList, recordObject);
            recordObjectSet.add(recordObject);
            cachedMap.set(gr.getValue(mapKey), recordObjectSet);
        }
        return cachedMap;
    },

    reloadAllCache: function() {
        new SkuMetadataDAO().loadAllDataIntoCache();
        new SubscriptionEntitlementDAO().loadAllDataIntoCache();
        new SubscriptionEntitlementItemDAO().loadAllDataIntoCache();
        new InstanceInfoUtil().loadAllDataIntoCache();
        new UAAppFamilyDAO().loadAllDataIntoCache();
        new SubscriptionHasAppDAO().loadAllDataIntoCache();
        new SubscriptionHasFamilyDAO().loadAllDataIntoCache();
        new MDMProductDataDAO().loadAllDataIntoCache();
        new LicenseFamilyDao().loadAllDataIntoCache();
        new UAAppInfoDAO().loadAllDataIntoCache();
    },

    flush: function(catalog) {
        this._cacheManager.flush(catalog);
    },

    flushAndReloadLicensingCacheCatalog: function() {
        this.flush(LicensingEngineConstants.LICENSING_CACHE_CATALOG);
        this.reloadAllCache();
    },

    type: 'CacheDataHandler'
};
