/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('isMoveDisabled', true);
    api.setState("aSelectedRecords", []);
    api.setState("aExceptedRecords", []);
    api.setState("refreshTimeStamp", new Date().getMilliseconds());
    api.setState("clearAvailableSuite", false);
    api.setState("timeStampForUpgradeTest", new Date().getMilliseconds());
}
