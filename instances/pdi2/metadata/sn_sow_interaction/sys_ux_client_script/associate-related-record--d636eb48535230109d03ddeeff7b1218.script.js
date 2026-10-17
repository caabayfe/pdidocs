/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    api.data.associate_to_interaction_transform.execute({
        'interactionSysId': api.context.props.recordSysId,
        'recordType': event.payload.table,
        'recordSysId': event.payload.sysId
    });
    api.emit("RELOAD_GFORM");
}
