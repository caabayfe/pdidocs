var AssetandCIRelatedListHelper = Class.create();
AssetandCIRelatedListHelper.prototype = {
	initialize: function() {},

	type: 'AssetandCIRelatedListHelper',
};
AssetandCIRelatedListHelper.valuesToJson = function(obj) {
	var values = {};
	for (var fieldName in obj) {
		values[fieldName] = obj[fieldName] + '';
	}
	return values;
};

AssetandCIRelatedListHelper.itemsToJson = function(objs, table) {
	var items = [];
	objs.forEach(function(o) {
		if (JSUtil.nil(o)) {
			return;
		}
		items.push({
			className: table,
			values: AssetandCIRelatedListHelper.valuesToJson(o),
		});
	});
	return items;
};

AssetandCIRelatedListHelper.isActiveLookupRule = function(className, lookupTable) {
	var lookUps = j2js(AssetandCIRelatedListHelper.cmdbApi.getLookupRuleTablesForClass(className));
	if (lookUps.indexOf(lookupTable) !== -1) { return true; }
	return false;
};

AssetandCIRelatedListHelper.getCIobject = function() {
	// eslint-disable-next-line
  return new CIData();
};

AssetandCIRelatedListHelper.getRelatedListobject = function(relatedList, parent) {
	// eslint-disable-next-line
  return new CIRelatedList(relatedList, parent);
};

AssetandCIRelatedListHelper.cmdbApi = SNC.IdentificationEngineScriptableApi;
