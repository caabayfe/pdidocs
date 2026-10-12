(function executeRule(current, previous /* null when async */) {
	var validRequest = new AssetReclamationUtil().validateAssetReclamationRequest(current);
	if (!validRequest) {
		current.setAbortAction(true);
	}
}(current, previous));
