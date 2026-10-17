/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Event gets triggered multiple times. Only update when change is detected.
    if (api.state.singleClassSelectedCondition != event.payload.value) {
        // Update query and temp variables
        let query = JSON.parse(JSON.stringify(api.state.query));
        query.query_json.class_conditions[0].condition = event.payload.value;
        api.setState('query', query);
        api.setState('singleClassSelectedCondition', event.payload.value);
        api.setState('isDirty',true);
    }
}
