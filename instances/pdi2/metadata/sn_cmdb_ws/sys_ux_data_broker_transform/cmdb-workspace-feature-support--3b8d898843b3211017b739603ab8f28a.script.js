function transform(input) {
	var featureSupportUtil = new sn_cmdb_ws.CMDBWsFeatureSupportUtil();
	var result = {};

	if (input && input.featureId && input.featureId.length > 0) {
		var featureIds = input.featureId.split(",");
		featureIds.forEach(function (featureId) {
			result[featureId] = {};
			result[featureId].supported = featureSupportUtil.supportsFeature(featureId);
			if (!result[featureId].supported)
				result[featureId].message = featureSupportUtil.getUnsupportedFeatureMessage(featureId);
		});
		result.complete = true;
	}
	return result;
}
