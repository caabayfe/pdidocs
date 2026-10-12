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
    api.setState('loadingSkippedRecordsCount', true);
    var upgradeDetails;
    try {
        upgradeDetails = JSON.parse(decodeURIComponent(api.context.props.experienceProperties.upgrade_details.value));
    } catch (e) {
        // Refresh broker so FromAPI fires and clears loading
        api.data.upgrade_management___overview_page_apis_1.refresh();
        api.data.get_number_of_rules_applied.refresh();
        return;
    }
    api.setState('upgradeDetails', upgradeDetails);

    // bulk-app-update: prop is captured at preview time (pre-install) so it's stale.
    // Always refresh the broker so updateSkippedRecordsFromAPI sees current post-install data.
    if (upgradeDetails && upgradeDetails.upgradeOverviewDetails && upgradeDetails.upgradeOverviewDetails.sessionType === 'bulk_app_update') {
        api.data.upgrade_management___overview_page_apis_1.refresh();
        api.data.get_number_of_rules_applied.refresh();
        return;
    }

    // case: in case of incorrect prop value, fetch using api
    if (!upgradeDetails || !Object.keys(upgradeDetails)) {
        api.data.upgrade_management___overview_page_apis_1.refresh();
    } else {
        const upgradeMonitorStatusProviderDetails = upgradeDetails?.upgradeMonitorStatusProviderDetails || {};
        const upgradeHistoryDetails = upgradeMonitorStatusProviderDetails?.upgradeHistoryDetails?.[0] || {};
        const upgradePlanHistoryInfo = upgradeMonitorStatusProviderDetails?.upgradePlanHistoryInfo || {};

        // case: our target matches the toVersion from API and upgrade state is set
        if (api.context.props.experienceProperties.target_patch_id.value === upgradeMonitorStatusProviderDetails.toVersion &&
            upgradeMonitorStatusProviderDetails.state != 'none' &&
            Object.keys(upgradeHistoryDetails)) {
            // update upgrade history sys_id
            api.setState('upgradeHistorySysId', upgradeHistoryDetails?.sys_id);

            const totalSkippedRecords = parseInt(upgradeHistoryDetails?.changes_skipped || 0);
            api.setState('totalRecordsChanged', upgradeHistoryDetails?.changes_processed || 0);
            api.setState('totalSkippedRecords', totalSkippedRecords);
            api.setState('skippedNeedsReview', upgradeHistoryDetails?.changes_not_reviewed || 0);
            api.setState('skippedReviewed', upgradeHistoryDetails?.changes_reviewed || 0);
            api.setState('skippedResolved', upgradePlanHistoryInfo?.skippedRecords?.resolved || 0);
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
            api.data.look_up_multiple_records_3.refresh();
            api.data.get_number_of_rules_applied.refresh();
            api.data.upgrade_management___updateRetainedSkippedRecords.refresh();
        }
    }
    api.data.get_number_of_rules_applied.refresh();
}
