var RequestAssetLifecycleExtPoint = Class.create();
RequestAssetLifecycleExtPoint.prototype = {
	initialize: function() {
	},
	hasAccess: function(table) {
		return new GlideRecordSecure(table).canRead();
	},
	getAssetCI: function(table, assetId) {
		var assetCI = new global.GlideQuery(table).where('sys_id', assetId).selectOne('ci').get();
		return assetCI.ci;
	},
	getAssetCIandRITM: function(assetTable, assetId, ritmTable) {
		var assetGQ = new global.GlideQuery(assetTable).where('sys_id', assetId).selectOne('ci', 'request_line').get();
		var assetRITM = null;
		if (assetGQ.request_line) {
			var assetRITMGQ = new global.GlideQuery(ritmTable)
				.where('sys_id', assetGQ.request_line)
				.selectOne('number')
				.get();
			assetRITM = assetRITMGQ.number;
		}
		var assetDetails = { ci: assetGQ.ci, assetRITM: assetRITM };
		return assetDetails;
	},
	getJSON: function(assetTable, assetId) {
		var tableName = 'sc_req_item';
		var attrName = 'configuration_item';
		var assetDetails = this.getAssetCIandRITM(assetTable, assetId, tableName);
		var ci = assetDetails.ci;
		var assetRITM = assetDetails.assetRITM;
		if (ci === null) {
			return null;
		}
		// Find all RITMs where either CI is currCI and the RITM which itself is stamped on the asset
		var requestCountGQ = new global.GlideQuery(tableName).where(attrName, ci);
		if (assetRITM) {
			requestCountGQ = requestCountGQ.orWhere('number', assetRITM);
		}
		var requestCount = requestCountGQ.count();
		var disableButton = !this.hasAccess(tableName) || requestCount === 0;
		var query = 'configuration_item.sys_id=' + ci;
		if (assetRITM) {
			query += '^ORnumber=' + assetRITM;
		}
		return {
			table: tableName,
			title: gs.getMessage('Request'),
			count: requestCount,
			query: query,
			order: 100,
			disable: disableButton,
		};
	},

	type: 'RequestAssetLifecycleExtPoint',
};
