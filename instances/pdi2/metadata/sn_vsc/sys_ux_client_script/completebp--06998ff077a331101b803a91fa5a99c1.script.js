/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var bpId = api.context.props.sysId;
    var res = api.data.sc_complete_best_practice_1.refresh({
        bp_id : bpId
    });
    console.log('res', res);
    api.data.get_bp_steps_completed_1.refresh({
        sys_id : bpId
    });
    api.setState('hideAlert', false);
}
