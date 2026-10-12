/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.modal.close('modal_multitask_selector');
    api.setState('telemetryPayload', {
        event_key: 'isGenAiMultiTaskCancelled',
        targetTableSysId: api.data.record.sysId
    });
    api.setState('isTelemetryExecuting', true);
}
