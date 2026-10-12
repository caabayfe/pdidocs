function updateAssetsOnCategory() {
	var checkValidModelCategory = function(catId) {
		if (AssetUtils.isValidSysID(catId)) {
			var modelCategoryGr = new GlideRecord('cmdb_model_category');
			return modelCategoryGr.get(catId);
		}
		return false;
	};

	var categories = (current.cmdb_model_category + '').split(',');
	var old = (previous.cmdb_model_category + '');
	for (var check in categories) {
		if (old.indexOf(categories[check]) < 0) {
			if (!checkValidModelCategory(categories[check])) { continue; }
			var script;
			if (gs.getProperty(AssetandCI.ASSET_ASYNC_PROPERTY) === 'true') {
				script = "var ci = new AssetandCI(); ci.createAssetQueueForModel('"
					+ current.getUniqueValue() + "', '" + categories[check] + "');";
			} else {
				script = "var ci = new AssetandCI(); ci.createMultipleAssets('"
					+ categories[check] + "', '" + current.getUniqueValue() + "');";
			}
			var label = 'Generate Assets: ' + current.name;
			var assetMgmBaseJob = new AssetManagementBaseJob();
			assetMgmBaseJob.runScriptByJob(script, new GlideDateTime(), label);
		}
	}
}

updateAssetsOnCategory();
