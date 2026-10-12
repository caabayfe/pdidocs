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
    try{
        const {sys_id, name, table, field_name, value} = api.context.props.propertyPayload;
        api.emit('ACE_PROPS_CHANGED', {
            sys_id,
            name,
            table,
            field_name,
            old_value: value,
            new_value: event.payload.value
        });
    }catch(e){

    }
}
