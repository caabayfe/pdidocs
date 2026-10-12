/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.data.check_record_access_for_context_action_1.output) {
        var recordAccessResult = { ...api.data.check_record_access_for_context_action_1.output
        };
        if (recordAccessResult.canAccess) {
            var contextActionObj = { ...api.state.contextActionObj
            };
            var SOWListContextActionHandler = imports['sn_sow.SOWListContextActionHandler'](api, event, helpers);
            SOWListContextActionHandler.invokeContextActionHandler(contextActionObj.sysId, contextActionObj.actionId);
        } else {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    type: 'error',
                    message: recordAccessResult.errorMessage
                }]
            });
        }
    }
}
