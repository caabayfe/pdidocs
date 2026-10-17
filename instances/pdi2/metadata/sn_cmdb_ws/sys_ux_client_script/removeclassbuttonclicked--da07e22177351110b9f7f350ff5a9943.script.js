/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    if(event.elementId === 'remove_all_class_button') {
        query.query_json.class_conditions = [];
    } else {
        query.query_json.class_conditions.splice(event.context.item.index,1);
    }
    api.setState('query', query);
    api.setState('isDirty', true);

    api.emit('CHECK_FORM_STATUS');
}
