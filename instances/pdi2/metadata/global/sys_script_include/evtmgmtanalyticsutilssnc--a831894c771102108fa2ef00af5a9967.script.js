var EvtMgmtAnalyticsUtilsSNC = Class.create();
EvtMgmtAnalyticsUtilsSNC.prototype = {
    initialize: function() {
        this.serviceAnalyticsProcessor = new SNC.ServiceAnalyticsProcessor();
    },
    getRelatedCIsMap: function(inputCiSysIdList, groupCis) {
        return this.serviceAnalyticsProcessor.getRelatedCIsMap(inputCiSysIdList, groupCis);
    },
	isNetworkTrafficCorrelationFeatureEnabled: function(){
		return this.serviceAnalyticsProcessor.isNetworkTrafficCorrelationFeatureEnabled();
	},
    getRelatedCIs: function(inputCiSysIdList) {
        return this.serviceAnalyticsProcessor.getRelatedCIs(inputCiSysIdList);
    },
    getRelatedCIsPretty: function(inputCiSysIdList) {
        return this.serviceAnalyticsProcessor.getRelatedCIsPretty(inputCiSysIdList);
    },
    getPossibleRootCausesForAlert: function(alertSysId) {
        return this.serviceAnalyticsProcessor.getPossibleRootCausesForAlert(alertSysId);
    },
    getAffectedCIs: function(incidentSysId) {
        return this.serviceAnalyticsProcessor.getAffectedCIs(incidentSysId);
    },
    getRootCauseCis: function(inputCiSysIdList) {
        return this.serviceAnalyticsProcessor.getRootCauseCis(inputCiSysIdList);
    },
    getRelatedCisPerLevel: function(inputCiSysIdList, level, maxCisFetchByCMDBWalker, maxCisThresholdPercentByCMDBWalker, applicative) {
        return this.serviceAnalyticsProcessor.getRelatedCisPerLevel(inputCiSysIdList, level, maxCisFetchByCMDBWalker, maxCisThresholdPercentByCMDBWalker, applicative);
    },
    shouldCreateHlaHostAlerts: function() {
        return this.serviceAnalyticsProcessor.shouldCreateHlaHostAlerts();
    },
    shouldCreateHlaIncidentAlert: function() {
        return this.serviceAnalyticsProcessor.shouldCreateHlaIncidentAlert();
    },
    type: 'EvtMgmtAnalyticsUtilsSNC'
};
