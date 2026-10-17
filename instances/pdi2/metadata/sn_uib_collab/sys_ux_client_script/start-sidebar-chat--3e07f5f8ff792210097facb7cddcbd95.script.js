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
    api.emit('RECORD#OPEN_COLLAB_CHAT', {
        fields: {
            "parentTable": api.context.props.table,
            "parentSysId": api.context.props.sysId,
            "config": {
                'participants': [event.context.item.value.id],
                'prefill': false,
                'isPermissionCheckNeeded': true
            }
        }
    });
}
