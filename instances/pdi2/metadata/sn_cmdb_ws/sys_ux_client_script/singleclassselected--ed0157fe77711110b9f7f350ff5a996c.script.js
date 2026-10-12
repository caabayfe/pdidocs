/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    // Update query and temp variables 
    let query = JSON.parse(JSON.stringify(api.state.query));
    // Only one class allowed for single class query type
    query.query_json.class_conditions = [];
    query.query_json.class_conditions.push({"class_name": String(event.payload.value), "condition" : "", allClasses: false});
    api.setState('query', query);
    api.setState('singleClassSelected', String(event.payload.value));
    api.setState('singleClassSelectedCondition', "");
    api.setState('attributesToCompare', []);
    api.setState('isDirty',true);
    api.emit('CHECK_FORM_STATUS');
}
