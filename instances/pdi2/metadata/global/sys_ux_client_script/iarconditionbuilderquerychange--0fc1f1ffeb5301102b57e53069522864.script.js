/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const payload = JSON.parse(api.context.props.field.value);
    const val = JSON.stringify({
        tableName: payload.tableName,
        query: event.payload.value,
        targetTableName: payload.targetTableName,
        displayQuery: event.payload.value,
    });
    if(event.payload.value != payload.query) {
        api.emit('MACROPONENT_VALUE_CHANGED', {
            value: val
        });
    }
}
