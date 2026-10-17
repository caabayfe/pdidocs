var AssetLifecycleExtPoint = Class.create();
AssetLifecycleExtPoint.prototype = {
    initialize: function() {
    },
    hasAccess: function(table) {
		return new GlideRecordSecure(table).canRead();
    },
	getAssetCI: function(table, assetId) {
		var assetCI= new global.GlideQuery(table).where('sys_id',assetId).selectOne('ci').get();
		return assetCI.ci;
	},
	getJSON: function(assetTable, assetId) {
		var tableName = ''; //table to search the relevant event from e.g. incident
		var attrName = ''; //name of attribute in table which refers to this asset or its CI
		var attrSysId = assetId; //sysId of attribute e.g. assetId OR this.getAssetCI(assetTable, assetId);
		var recordCount= new global.GlideQuery(tableName).where(attrName,attrSysId).count();
		var disableButton = !this.hasAccess(tableName) || recordCount === 0?true:false;
		return {
			table: tableName,
			title: gs.getMessage(),
			count: recordCount,
			query: '',
			order: 100,
			disable: disableButton,
		};
	},

    type: 'AssetLifecycleExtPoint'
};
