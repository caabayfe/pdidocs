/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {convertDateFormat} = imports['sn_upgrade_mgmt.UpgradeManagementUtils']();
    var createdDate = convertDateFormat(api.data.Test_Generator.output.created);
    api.setState('showTg', !api.state.showTg);
    api.setState('hideTg', !api.state.hideTg);
    api.setState('isTgInProgress', false);
    api.setState('isMoveDisabled', true);
    api.setState('isRemoveDisabled', true);
    api.setState('isCancelDisabled', false);
    
    api.setState('boqId', api.data.Test_Generator.output.boqId);
    api.setState('created', createdDate);
    api.setState('isMarkCompleteDisabled', true);
    api.setState('isSkipDisabled', true);
}
