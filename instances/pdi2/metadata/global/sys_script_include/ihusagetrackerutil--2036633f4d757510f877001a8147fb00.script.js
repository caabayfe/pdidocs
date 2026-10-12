var IHUsageTrackerUtil = Class.create();
IHUsageTrackerUtil.prototype = {
    initialize: function() {
        this.INTEGRATION_HUB_POOL = "IntegrationHubPool";
        this.LIC_MONTHLY_DEFN_ID = "LICIHM";
        this.IH_ROLLING_BORROWED = "IH rolling borrowed";
        this.IH_ROLLING_CONTRIBUTED = "IH rolling contributed";
        this.IH_ROLLING_USAGE = "IH rolling usage";
        this.BORROWED = "borrowed";
        this.CONTRIBUTED = "contributed";
        this.USAGE = "Usage";

        this.USAGEANALYTICS_COUNT = "usageanalytics_count";
        this.UA_IH_USAGE = "ua_ih_usage";
        this.UA_IH = "ua_ih";
        this.KEY_DEFINITION_ID = "definition_id";
        this.KEY_TIMESTAMP = "time_stamp";
        this.KEY_TIMESTAMP = "time_stamp";
        this.LICENSE_ID = "license_id";
        this.PURCHASED = "purchased";
        this.SUM = "SUM";
        this.COUNT = "count";
        this.USE_COUNT = "use_count";
    },

    /**
     * To be used only with SMv2 and IHv2 data to calculate and track IH usage
     */
    generateIHUsageCount: function() {
        return this._createIhUsageInfo();
    },

    _createIhUsageInfo: function() {
        var totalBorrowedFromPool = 0;
        var totalBorrowedFromPoolCumulative = 0;
        var retJsonObj = {};
        retJsonObj[this.COUNT] = 0;

        var last12Month = SNC.UsageAnalyticsScriptUtils.getLast12MonthAccrualTimeStamp();
        var last11Month = last12Month.substring(0, last12Month.lastIndexOf(','));

        var genericSku; // no longer supported
        var poolSku = this._getIHPoolSubscriptionDetails(); //get from cache

        var self = this;

        genericSku.forEach(function(ihBuSkuItem) {
            var genericSkuObjDetails = {};

            var licId = ihBuSkuItem.subscription_identifier; //data from cache
            var purchased = ihBuSkuItem.purchased_count; //data from cache

            try {
                genericSkuObjDetails[self.LICENSE_ID] = licId;
                genericSkuObjDetails[self.PURCHASED] = Number(purchased);

                var monthDefn = self.LIC_MONTHLY_DEFN_ID + licId;

                var totalUsage = self.getLicenseTotalUsageCurrentMonth(licId) + self.getIHTotalUseInRollingPeriod(monthDefn, last11Month);

                var borrowed = 0;
                if (purchased < totalUsage)
                    borrowed = Math.abs(totalUsage - purchased);

                totalBorrowedFromPool += borrowed;

                var total12MonthUsage = self.getIHTotalUseInRollingPeriod(monthDefn, last12Month);
                var borrowedCumulative = 0;

                if (purchased < total12MonthUsage)
                    borrowedCumulative = Math.abs(total12MonthUsage - purchased);

                totalBorrowedFromPoolCumulative += borrowedCumulative;

                genericSkuObjDetails[self.IH_ROLLING_BORROWED] = borrowedCumulative;
                genericSkuObjDetails[self.IH_ROLLING_USAGE] = total12MonthUsage;
                genericSkuObjDetails[self.BORROWED] = borrowed;
                genericSkuObjDetails[self.USAGE] = totalUsage;

                retJsonObj[licId] = genericSkuObjDetails;
            } catch (error) {
                gs.error("UA IH defn failed for : " + licId);
            }
        });

        poolSku.forEach(function(poolSkuItem) {
            var poolSkuObjDetails = {};

            var licId = poolSkuItem.subscription_identifier;
            var purchased = poolSkuItem.purchased_count;

            try {
                poolSkuObjDetails[self.LICENSE_ID] = licId;
                poolSkuObjDetails[self.PURCHASED] = Number(purchased);

                var monthDefn = self.LIC_MONTHLY_DEFN_ID + licId;
                var totalUsage = self.getLicenseTotalUsageCurrentMonth(licId) + self.getIHTotalUseInRollingPeriod(monthDefn, last11Month);
                var total12MonthUsage = self.getIHTotalUseInRollingPeriod(monthDefn, last12Month);

                poolSkuObjDetails[self.IH_ROLLING_CONTRIBUTED] = totalBorrowedFromPoolCumulative;
                poolSkuObjDetails[self.IH_ROLLING_USAGE] = total12MonthUsage;
                poolSkuObjDetails[self.CONTRIBUTED] = totalBorrowedFromPool;
                poolSkuObjDetails[self.USAGE] = totalUsage;

                retJsonObj[licId] = poolSkuObjDetails;
            } catch (error) {
                gs.error("UA IH defn failed for : " + licId);
            }
        });
        return JSON.stringify(retJsonObj);
    },

    _getIHPoolSubscriptionDetails: function() {
        var entitlementService = new sn_entitlement.SubscriptionEntitlementsService();
        var IhPoolSubscriptions = entitlementService.getEntitlementDetails(this.INTEGRATION_HUB_POOL);
        return IhPoolSubscriptions;
    },

    getLicenseTotalUsageCurrentMonth: function(licId) {
        return this.getIHTotalUseInMonth(licId, SNC.UsageAnalyticsScriptUtils.getAccrualTimeStamp(this.UA_IH));
    },

    getIHTotalUseInMonth: function(licId, accrualPeriod) {
        var gr = new GlideAggregate(this.UA_IH_USAGE);
        gr.addQuery(this.LICENSE_ID, licId);
        gr.addQuery(this.KEY_TIMESTAMP, accrualPeriod);
        gr.addAggregate(this.SUM, this.USE_COUNT);
        gr.groupBy(this.LICENSE_ID);
        gr.query();

        var totalCount = 0;
        if (gr.next())
            totalCount = Number(gr.getAggregate(this.SUM, this.USE_COUNT));

        return totalCount;
    },

    getIHTotalUseInRollingPeriod: function(defID, accrualPeriods) {
        var grCount = new GlideAggregate(this.USAGEANALYTICS_COUNT);
        grCount.addQuery(this.KEY_TIMESTAMP, 'IN', accrualPeriods);
        grCount.addQuery(this.KEY_DEFINITION_ID, defID);
        grCount.addAggregate(this.SUM, this.COUNT);
        grCount.query();

        var totalLastYear = 0;
        while (grCount.next())
            totalLastYear += Number(grCount.getAggregate(this.SUM, this.COUNT));

        return totalLastYear;
    },

    type: 'IHUsageTrackerUtil'
};
