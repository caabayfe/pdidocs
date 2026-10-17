/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.state.retryingUpgradePreview) {
        api.setState('retryingUpgradePreview', true);
        api.data.trigger_upgrade_preview_1.refresh();

        api.setState('loadingSkippedCount', true);
        api.setState('loadingSkippedTable', true);
        api.setState('loadingSkippedRecordsWOTestsCount', true);
    }
}
