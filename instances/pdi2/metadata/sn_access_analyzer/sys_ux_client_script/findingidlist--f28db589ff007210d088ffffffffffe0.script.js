/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var muteReasonSelected = api.state.selectedMuteReason;
    var findingIdList = [];
    findingIdList.push(api.context.props.sysId);
    api.setState("findingId", findingIdList);
    api.setState("muteReasonTemp", muteReasonSelected);
}
