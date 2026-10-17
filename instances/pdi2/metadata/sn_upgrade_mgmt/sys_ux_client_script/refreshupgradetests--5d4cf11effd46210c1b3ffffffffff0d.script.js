/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("timeStampForUpgradeTest", new Date().getMilliseconds());
    api.setState('uSelectedRecords', []);
    api.setState('uExceptedRecords', []);
    api.setState("clearUpgradeSuite", false);
    api.setState('isRemoveDisabled', true);
}
