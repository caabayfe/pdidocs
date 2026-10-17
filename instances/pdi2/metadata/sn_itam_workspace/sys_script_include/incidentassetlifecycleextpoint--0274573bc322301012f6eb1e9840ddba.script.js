var IncidentAssetLifecycleExtPoint = Class.create();
IncidentAssetLifecycleExtPoint.prototype = {
	initialize: function() {
	},
	hasAccess: function(table) {
		return new GlideRecordSecure(table).canRead();
	},
	getAssetCI: function(table, assetId) {
		var assetCI = new global.GlideQuery(table).where('sys_id', assetId).selectOne('ci').get();
		return assetCI.ci;
	},
	getJSON: function(assetTable, assetId) {
		var ci = this.getAssetCI(assetTable, assetId);
		if (ci === null) {
			return null;
		}
		var tableName = 'incident';
		var attrName = 'cmdb_ci';
		var attrSysId = ci;
		// Since Incident table doesnt allow QUERY via a BR to users who dont have ITIL or sn_incident_read role
		// we are hiding the incident card for user without access
		if (!this.hasAccess(tableName)) {
			return null;
		}
		var incidentCount = new global.GlideQuery(tableName).where(attrName, attrSysId).count();
		var disableButton = !this.hasAccess(tableName) || incidentCount === 0;
		return {
			table: tableName,
			title: gs.getMessage('Incident'),
			count: incidentCount,
			query: 'cmdb_ci.sys_id=' + ci,
			order: 200,
			disable: disableButton,
		};
	},

	type: 'IncidentAssetLifecycleExtPoint',
};
