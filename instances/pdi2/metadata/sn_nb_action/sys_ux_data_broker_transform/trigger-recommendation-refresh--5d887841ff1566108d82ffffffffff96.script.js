function transform(input) {
	return new sn_nb_action.NextBestActionService().forceRefreshRecommendations(input.ruleContextSysIds, input.currentRecordSysId, input.refreshAllUsers);
}
