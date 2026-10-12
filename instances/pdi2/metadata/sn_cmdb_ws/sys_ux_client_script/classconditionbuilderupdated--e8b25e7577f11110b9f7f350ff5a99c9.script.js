/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    // Event gets triggered multiple times. Only update when change is detected.
    if (query.query_json.class_conditions[event.context.item.index].condition != event.payload.value) {
        query.query_json.class_conditions[event.context.item.index].condition = event.payload.value;
        api.setState('query', query);
        api.setState('isDirty', true);
    }
}
