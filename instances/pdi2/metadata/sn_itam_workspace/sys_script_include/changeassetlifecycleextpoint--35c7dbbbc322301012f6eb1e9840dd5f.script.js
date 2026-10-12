var ChangeAssetLifecycleExtPoint = Class.create();
ChangeAssetLifecycleExtPoint.prototype = {
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
		var tableName = 'change_request';
		var attrName = 'cmdb_ci';
		var attrSysId = ci;
		var recordCount = new global.GlideQuery(tableName).where(attrName, attrSysId).count();
		var disableButton = !this.hasAccess(tableName) || recordCount === 0;
		return {
			table: tableName,
			title: gs.getMessage('Change'),
			count: recordCount,
			query: 'cmdb_ci.sys_id=' + ci,
			order: 300,
			disable: disableButton,
		};
	},

	type: 'ChangeAssetLifecycleExtPoint',
};
