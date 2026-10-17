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
        const {sys_id, table, old_value, field_name} = api.context.props.controlProps.record_data;
        api.emit('ACE_PROPS_CHANGED', {
            sys_id,
            table,
            field_name,
            old_value: old_value,
            new_value: event.payload.value
        });
    }catch(e){

    }
}
