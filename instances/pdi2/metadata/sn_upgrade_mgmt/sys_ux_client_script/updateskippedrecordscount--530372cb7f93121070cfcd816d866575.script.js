/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const response = api.data.get_predicted_skipped_records_count_1.output || {};

    api.setState('totalRecordsChanged', response.totalRecordsChanged);
    api.setState('totalSkippedRecords', response.totalSkippedRecords);
    api.setState('skippedResolved', response.skippedResolved);
    api.setState('skippedNeedsReview', response.skippedNeedsReview);
    api.setState('skippedReviewed', response.skippedReviewed);
}
