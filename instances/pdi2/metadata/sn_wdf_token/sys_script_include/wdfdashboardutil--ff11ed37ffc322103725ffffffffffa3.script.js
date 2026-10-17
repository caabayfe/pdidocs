var WdfDashboardUtil = Class.create();
WdfDashboardUtil.prototype = {
    initialize: function() {
        this.logger = new WdfLogger();
        this.wdfUtil = new WdfUtil();
    },

    _getEntitlements: function() {
        var LicensingStoreAPI = new sn_wdf_token.LicensingStore();
        var entitlements = {};

        try {
            entitlements = LicensingStoreAPI.getValidEntitlements();
        } catch (err) {
            this.logger.debug("WdfDashboardUtil._getEntitlements error: " + err);
        }

        return entitlements;
    },

    _getSkuMetadata: function() {
        var LicensingStoreAPI = new sn_wdf_token.LicensingStore();
        var skuMetadata = [];

        try {
            skuMetadata = LicensingStoreAPI.getSkuMetadata();
        } catch (err) {
            this.logger.debug("WdfDashboardUtil._getSkuMetadata error: " + err);
        }

        return skuMetadata;
    },

    instanceHasWdfEntitlement: function() {
        var entitlements = this._getSkuMetadata();
        if (entitlements.length > 0)
            return true;
        else
            return false;
    },

    getTotalTokensUsed: function() {
		
        var tokenUsageCompositionGA = new GlideAggregate("sn_wdf_token_usage_composition");
        tokenUsageCompositionGA.addAggregate("SUM", "token_amount");
        tokenUsageCompositionGA.setGroup(false);
        tokenUsageCompositionGA.query();

        if (tokenUsageCompositionGA.next()) {
            var tokenConsumption = Number(tokenUsageCompositionGA.getAggregate("SUM", "token_amount"));
            return isNaN(tokenConsumption) ? 0 : tokenConsumption;
        }
        return 0;
    },

    getTotalEntitlementPurchaseQuantities: function() {
        var entitlements = this._getEntitlements();
        var total = 0;
        for (var key in entitlements) {
            var n = parseInt(entitlements[key]?.purchased_count);
            if (!isNaN(n)) total += n;
        }
        return total;
    },


    getEarliestStartDate: function() {
        var entitlements = this._getEntitlements();
        if (entitlements == null || Object.keys(entitlements).length == 0) return;

        return Object.keys(entitlements)
            .map(key => this.wdfUtil.getJsonPathValue(entitlements[key], "$.start_date"))
            .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
            .map(d => {
                var gd = new GlideDate();
                gd.setValue(d);
                return gd;
            })
            .reduce((earliest, current) => {
                if (earliest == undefined) return current;
                return earliest.compareTo(current) < 0 ? earliest : current;
            }, undefined);
    },

    getDailyAverageUsage: function() {
        var entitlementStartDate = this.getEarliestStartDate();
        return this.getDailyAverageUsageWithPayload(entitlementStartDate);
    },

    getDailyAverageUsageWithPayload: function(entitlementStartDate) {
        var lastYearDate = new GlideDate();
        lastYearDate.addDaysUTC(-367);

        var dailySumGA = new GlideAggregate("sn_wdf_token_usage_composition");

        var startDate;

        //Pick the later of earliest entitlement date and 1 year (367 days) ago
        if (entitlementStartDate == null || lastYearDate.compareTo(entitlementStartDate) > 0) {
            startDate = lastYearDate;
        } else {
            startDate = entitlementStartDate;
        }

        dailySumGA.addEncodedQuery("result=success^datestampBETWEEN" + startDate + "@javascript:gs.endOfToday()");
        dailySumGA.addAggregate('SUM', 'token_amount');
        dailySumGA.setGroup(false);
        this.logger.debug("GlideAggregate query: " + dailySumGA.getEncodedQuery());
        dailySumGA.query();

        if (dailySumGA.next()) {
            var endDate = new GlideDate();
            endDate.addDaysUTC(-2);

            var daysSinceStartDate = GlideDate.subtract(startDate, endDate).getDayPart();
            daysSinceStartDate = Math.max(daysSinceStartDate, 1);
            var totalTokenConsumption = Number(dailySumGA.getAggregate('SUM', 'token_amount'));

            this.logger.debug("Total days: " + daysSinceStartDate + ". Total tokens: " + totalTokenConsumption + ".");

            totalTokenConsumption = isNaN(totalTokenConsumption) ? 0 : totalTokenConsumption;
            return parseFloat(totalTokenConsumption / daysSinceStartDate);
        }

        return 0;
    },

    type: 'WdfDashboardUtil'
};
