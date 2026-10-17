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
    const response = api.data.upgrade_management___overview_page_apis_1.output || {};
    const upgradeMonitorStatusProviderDetails = response?.upgradeMonitorStatusProviderDetails || {};
    const upgradeHistoryDetails = upgradeMonitorStatusProviderDetails?.upgradeHistoryDetails?.[0] || {};
    const upgradePlanHistoryInfo = upgradeMonitorStatusProviderDetails?.upgradePlanHistoryInfo || {};

    // bulk-app-update bypass: trust synthesized response regardless of target_patch_id match
    const isBulkMode = response?.upgradeOverviewDetails?.sessionType === 'bulk_app_update';

    // case: our target matches the toVersion from API and upgrade state is set
    if (isBulkMode
        || (api.context.props.experienceProperties.target_patch_id.value === upgradeMonitorStatusProviderDetails.toVersion
        && upgradeMonitorStatusProviderDetails.state != 'none'
        && Object.keys(upgradeHistoryDetails))) {
        // update upgrade history sys_id
        api.setState('upgradeHistorySysId', upgradeHistoryDetails?.sys_id);

        const totalSkippedRecords = parseInt(upgradeHistoryDetails?.changes_skipped || 0);
        api.setState('totalRecordsChanged', upgradeHistoryDetails?.changes_processed || 0);
        api.setState('totalSkippedRecords', totalSkippedRecords);
        api.setState('skippedNeedsReview', upgradeHistoryDetails?.changes_not_reviewed || 0);
        api.setState('skippedReviewed', upgradeHistoryDetails?.changes_reviewed || 0);
        api.setState('skippedResolved', upgradePlanHistoryInfo?.skippedRecords?.resolved || 0);
        // Bulk-update: synthesized response carries the without-tests count directly
        if (isBulkMode && typeof upgradeHistoryDetails?.changes_skipped_without_tests !== 'undefined') {
            api.setState('skippedRecordsWithoutTests', upgradeHistoryDetails.changes_skipped_without_tests);
        }
        api.setState('loadingSkippedRecordsCount', false);

        api.setState('summaryStatus', upgradeMonitorStatusProviderDetails?.summaryStatus || '');
        api.setState('summaryCompleteLabel', upgradeMonitorStatusProviderDetails?.summaryCompleteLabel || '');

        if (totalSkippedRecords === 0
            && totalSkippedRecords !== parseInt(upgradePlanHistoryInfo?.skippedRecords?.total || 0)) {
                api.setState('totalSkippedRecords', parseInt(upgradePlanHistoryInfo?.skippedRecords?.total || 0));
        }

        // api.data.look_up_multiple_records_2.refresh();
        api.data.upgrade_management___get_skipped_records_1.refresh();
        api.data.aggregation_query_1.refresh();
        // Skip look_up_multiple_records_3 + the chained 58d2eb89 broker in bulk mode —
        // they query upgrade_mgmt_skipped_record_owner (empty for bulk) and would
        // overwrite skippedRecordsWithoutTests back to 0.
        if (!isBulkMode) {
            api.data.look_up_multiple_records_3.refresh();
        }
        api.data.get_number_of_rules_applied.refresh();

        if (!api.state.ranUpdateRetainedSkippedRecords) {
            api.data.upgrade_management___updateRetainedSkippedRecords.refresh();
        }
    }
}
