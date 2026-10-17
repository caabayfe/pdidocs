var SubscriptionUsageUtils = Class.create();
SubscriptionUsageUtils.prototype = {
    initialize: function() {
        const cachingEnabled = gs.getProperty("sn_entitlement.subscription_detail_calculations_cache.enabled", "true") == "true";

        if (!cachingEnabled) {
            this._calculations = new sn_entitlement.SubscriptionDetailCalculatedFields();
        } else {
            const obj = new sn_entitlement.SubscriptionDetailCalculatedFields();
            this._calculations = new sn_entitlement.PassThroughScopedCache(obj, 'subscription_detail_calculations_cache');

            const isCacheRecordFunc = (current) => {
                return (current.is_latest === true || current.is_latest.toString() === 'true') && obj.isPerUserSubscriptionDetailRecord(current);
            };

            const keyFunc = (funcName, current) => {
                return `${funcName}-${current.sys_id.toString()}`;
            };

            const registerCacheFunction = (funcName) => {
                this._calculations
                    .registerCacheFunction(funcName,
                        (current) => keyFunc(funcName, current),
                        isCacheRecordFunc,
                        isCacheRecordFunc);
            };

            registerCacheFunction('calculateStringAllocation');
            registerCacheFunction('calculateRealtimeAllocation');
            registerCacheFunction('calculateRealTimeGroupAllocation');
            registerCacheFunction('calculateRealTimeUnconfirmedGroups');
            registerCacheFunction('calculateRealTimeUnconfirmedUsers');
            registerCacheFunction('calculateRealTimeCustomTableAllocationCount');
        }
    },

    getQuotaDefinition: function(defId) {
        return this._calculations.getQuotaDefinition(defId);
    },

    calculateAllocation: function(defId, defConfigSysId) {
        return this._calculations.calculateAllocation(defId, defConfigSysId);
    },

    calculateStringAllocation: function(current) {
        return this._calculations.calculateStringAllocation(current);
    },

    calculateRealtimeAllocation: function(current) {
        return parseInt(this._calculations.calculateRealtimeAllocation(current));
    },

    calculateRealTimeGroupAllocation: function(current) {
        return parseInt(this._calculations.calculateRealTimeGroupAllocation(current));
    },

    calculateRealTimeUnconfirmedGroups: function(current) {
        return parseInt(this._calculations.calculateRealTimeUnconfirmedGroups(current));
    },

    calculateRealTimeUnconfirmedUsers: function(current, displayColumn) {
        return this._calculations.calculateRealTimeUnconfirmedUsers(current, displayColumn);
    },

    calculateRealTimeCustomTableAllocationCount: function(current) {
        return parseInt(this._calculations.calculateRealTimeCustomTableAllocationCount(current));
    },

    flushCache: function() {
        // Check if the flushCache() function exists on this._calculations. If it does, it is a PassThroughScopedCache
        // and can flush the cache. Otherwise it is the raw SubscriptionDetailCalculatedFields and there is nothing to do.
        if (this._calculations.flushCache)
            this._calculations.flushCache();
    },

    type: 'SubscriptionUsageUtils'
};
