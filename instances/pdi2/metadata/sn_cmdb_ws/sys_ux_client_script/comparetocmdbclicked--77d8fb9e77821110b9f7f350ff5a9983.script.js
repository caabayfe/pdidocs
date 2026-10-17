/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    if(event.payload.value) {
        query.query_json.diff.type = "goldenVsSource";
    } else {
        query.query_json.diff.type = "sourceVsSource";;
    }
    api.setState('query', query);
    api.setState('isDirty', true);
    api.emit('CHECK_FORM_STATUS');
}
