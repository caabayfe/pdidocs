function transform(input) {
    var result = {
        totalRecordsChanged: 0,
        totalSkippedRecords: 0,
        skippedResolved: 0,
        skippedNeedsReview: 0,
        skippedReviewed: 0,
        skippedRecordsWithoutTests: 0
    };

    var gr = new GlideRecordSecure('upgrade_preview_log');
	var versionCondition = `preview.sys_id=${input.previewSysId}`;

    gr.addEncodedQuery(versionCondition, true);
    gr.query();
    result.totalRecordsChanged = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^disposition=4^ORdisposition=10^ORdisposition=5`, true);
    gr.query();
    result.totalSkippedRecords = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^resolution=auto_resolved`, true);
    gr.query();
    result.skippedResolved = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^disposition=4^ORdisposition=10^resolution=not_reviewed`, true);
    gr.query();
    result.skippedNeedsReview = gr.getRowCount();

    gr.initialize();
    gr.addEncodedQuery(`${versionCondition}^resolution=reviewed^ORresolution=reverted^ORresolution=retained`, true);
    gr.query();
    result.skippedReviewed = gr.getRowCount();

    return result;
}
