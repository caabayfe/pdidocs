/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var scheduleScope = api.data.look_up_scheduled_job.result.sys_scope._reference.name.displayValue;
    var userScope = api.data.look_up_scope_name.result.name.displayValue;

    if (scheduleScope !== userScope) {
        api.setState('wrongScope', true);
        api.setState('hideAlertModal', false);
        api.setState('modalAlertType', 'warning');
        api.setState('modalAlertIcon', 'circle-exclamation-outline');
        helpers.translate('Please change scope from {0} to {1} to edit this record.', userScope, scheduleScope).then((translatedText) => {
            api.setState('modalAlertMessage', translatedText);
        });
    }
}
