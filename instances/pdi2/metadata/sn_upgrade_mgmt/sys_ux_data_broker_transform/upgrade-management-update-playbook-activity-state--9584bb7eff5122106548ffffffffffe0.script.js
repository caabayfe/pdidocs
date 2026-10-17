function transform(input) {
	var functionName = input.functionName;
    var apiUtil = new sn_upgrade_mgmt.UpgradeManagementUpdatePlaybookActivityState();

    if (apiUtil[functionName]) {
        return apiUtil[functionName]();
    }
    return apiUtil.completeReviewReleaseNotesActivity();
}
