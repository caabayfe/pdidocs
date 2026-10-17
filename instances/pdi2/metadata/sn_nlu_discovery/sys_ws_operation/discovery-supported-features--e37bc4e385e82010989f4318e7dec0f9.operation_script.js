(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var currentVersion = new sn_nlu_discovery.IntentDiscoveryConfigUtil();
	return {
		nlu_integration: currentVersion.glideVersionSupportsNLUFeatures(),
		classification_only: currentVersion.glideVersionSupportsAPI(),
	};
})(request, response);
