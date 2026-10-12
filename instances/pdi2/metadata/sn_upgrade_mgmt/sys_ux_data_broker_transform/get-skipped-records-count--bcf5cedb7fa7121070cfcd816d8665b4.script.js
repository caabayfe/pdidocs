function transform(input) {
    var result = {
        totalRecordsChanged: 0,
        totalSkippedRecords: 0,
        skippedResolved: 0,
        skippedNeedsReview: 0,
        skippedReviewed: 0,
        skippedRecordsWithoutTests: 0
    };

    var grUpgradeHistory = new GlideRecordSecure('sys_upgrade_history');
    grUpgradeHistory.get(input.previewSysId);
    result.totalRecordsChanged = grUpgradeHistory.getValue('changes_processed');

    var gr = new GlideRecordSecure('sys_upgrade_history_log');
    var versionCondition = `upgrade_history.sys_id=${input.previewSysId}`;

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9^NQdisposition=2^resolution_status=reviewed_reverted^changed=true`, true);
    gr.query();
    result.totalSkippedRecords = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^resolution=auto_resolved`, true);
    gr.query();
    result.skippedResolved = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9^resolution_status=not_reviewed^ORresolution_status=`, true);
    gr.query();
    result.skippedNeedsReview = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^dispositionIN4,5,104,105,9,10^changed=true^ORdisposition=9^resolution_status!=not_reviewed^resolution_status!=`, true);
    gr.query();
    result.skippedReviewed = gr.getRowCount();

    // TODO: skippedRecordsWithoutTests

    return result;
}
