/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("uSelectedRecords", []);
    api.setState("uExceptedRecords", []);
    api.setState('isRemoveDisabled', true);
    api.setState("timeStampForUpgradeTest", new Date().getMilliseconds());
    api.setState("clearUpgradeSuite", false);
}
