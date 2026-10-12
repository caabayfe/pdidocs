var AssistsProcessor = Class.create();
AssistsProcessor.prototype = {
    initialize: function() {
        this.ONE_YEAR_LOOKBACK = 365;
    },

    populateAssistAnalytics: function() {
        var assistDetails = new SubscriptionEntitlementsService().getNowAssistSKUUsageInfo();
        var totalPurchases = assistDetails[LicensingEngineConstants.TOTAL_ASSIST_PURCHASED_COUNT];
        var totalAssists = assistDetails[LicensingEngineConstants.TOTAL_ASSIST_USED_COUNT];
        var glideDateTime = new GlideDateTime();
        var currentDateTime = glideDateTime.getValue();
        var currentDate = glideDateTime.getDate().getValue();

        var assistAnalyticsGR = new GlideRecord(LicensingEngineDBConstants.SN_ENTITLEMENT_GENAI_ASSIST_ANALYTICS);
        assistAnalyticsGR.addQuery(LicensingEngineDBConstants.LAST_SYNC, LicensingEngineDBConstants.STARTSWITH, currentDate);
        assistAnalyticsGR.query();
        if (assistAnalyticsGR.next()) {
            assistAnalyticsGR.setValue(LicensingEngineDBConstants.LAST_SYNC, currentDateTime);
            assistAnalyticsGR.setValue(LicensingEngineDBConstants.TOTAL_ASSISTS, totalAssists);
            assistAnalyticsGR.setValue(LicensingEngineDBConstants.TOTAL_PURCHASE_COUNT, totalPurchases);
            assistAnalyticsGR.update();
        } else {
            assistAnalyticsGR.initialize();
            assistAnalyticsGR.setValue(LicensingEngineDBConstants.LAST_SYNC, currentDateTime);
            assistAnalyticsGR.setValue(LicensingEngineDBConstants.TOTAL_ASSISTS, totalAssists);
            assistAnalyticsGR.setValue(LicensingEngineDBConstants.TOTAL_PURCHASE_COUNT, totalPurchases);
            assistAnalyticsGR.insert();
        }
    },

    populateAssistCounts: function() {
        var assistDetailAgg = this._getAssistCountAgg();
        var assistCount = assistDetailAgg.assistCount;
        var accrualTime = assistDetailAgg.accrualTime;
        var instanceID = gs.getProperty(LicensingEngineDBConstants.INSTANCE_ID);
        var assistGR = new GlideRecord(LicensingEngineDBConstants.SN_ENTITLEMENT_GENAI_ASSIST_COUNTS);
        assistGR.addQuery(LicensingEngineDBConstants.INSTANCE_ID, instanceID);
        assistGR.query();
        if (assistGR.next()) {
            assistGR.setValue(LicensingEngineDBConstants.TOTAL_ASSISTS, assistCount);
            assistGR.setValue(LicensingEngineDBConstants.ACCRUAL_TIME, accrualTime);
            assistGR.update();
        } else {
            //instance ID field will be set by MIF BR
            assistGR.initialize();
            assistGR.setValue(LicensingEngineDBConstants.TOTAL_ASSISTS, assistCount);
            assistGR.setValue(LicensingEngineDBConstants.ACCRUAL_TIME, accrualTime);
            assistGR.insert();
        }

    },

    //get the last 365 days assist count aggregate for the latest date
    _getAssistCountAgg: function() {
        var assistCount;
        var accrualTime;

        const skillsGA = new GlideAggregate(LicensingEngineDBConstants.NOW_ASSISTS_SKILLS);
        skillsGA.addQuery(LicensingEngineDBConstants.LOOKBACK, this.ONE_YEAR_LOOKBACK);
        skillsGA.addAggregate(LicensingEngineDBConstants.SUM, LicensingEngineDBConstants.USED_ASSISTS);
        skillsGA.addAggregate(LicensingEngineDBConstants.MAX, LicensingEngineDBConstants.ACCRUAL_TIME);
        skillsGA.groupBy(LicensingEngineDBConstants.LOOKBACK);
        skillsGA.orderByDesc(LicensingEngineDBConstants.ACCRUAL_TIME);
        skillsGA.query();
        if (skillsGA.next()) {
            assistCount = skillsGA.getAggregate(LicensingEngineDBConstants.SUM, LicensingEngineDBConstants.USED_ASSISTS);
            accrualTime = skillsGA.getAggregate(LicensingEngineDBConstants.MAX, LicensingEngineDBConstants.ACCRUAL_TIME);
        }

        return {
            assistCount: assistCount,
            accrualTime: accrualTime
        };
    },

    type: 'AssistsProcessor'
};
