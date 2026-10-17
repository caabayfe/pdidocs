/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const upgradeDetails = JSON.parse(decodeURIComponent(api.context.props.experienceProperties.upgrade_details.value));
    api.setState('upgradeDetails', upgradeDetails);

    const upgradeMonitorStatusProviderDetails = upgradeDetails?.upgradeMonitorStatusProviderDetails || {};
    const upgradeHistoryDetails = upgradeMonitorStatusProviderDetails?.upgradeHistoryDetails?.[0] || {};

    api.setState('upgradeHistorySysID', upgradeHistoryDetails?.sys_id);
}
