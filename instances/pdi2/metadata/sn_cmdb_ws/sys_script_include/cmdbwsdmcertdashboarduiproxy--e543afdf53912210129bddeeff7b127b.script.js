var CMDBWsDMCertDashboardUIProxy = Class.create();
CMDBWsDMCertDashboardUIProxy.prototype = {
	initialize: function() {
		this.certDashboardManager = new CMDBWsDMCertDashboardManager();
	},

	getCertInstanceAggData: function(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize) {
		return this.certDashboardManager.getCertInstanceAggData(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize);
	},

	getCertInstanceAggDataTotalCount: function(filters) {
		return this.certDashboardManager.getCertInstanceAggDataTotalCount(filters);
	},

	getCertInstanceAggByInstanceIds: function(instanceIds) {
		return this.certDashboardManager.getCertInstanceAggByInstanceIds(instanceIds);
	},

	getCertRecordsListDetails: function(instanceId) {
		return this.certDashboardManager.getCertRecordsListDetails(instanceId);
	},

	getCertInstanceTaskDetails: function(instanceId) {
		return this.certDashboardManager.getCertInstanceTaskDetails(instanceId);
	},

	type: 'CMDBWsDMCertDashboardUIProxy'
};
