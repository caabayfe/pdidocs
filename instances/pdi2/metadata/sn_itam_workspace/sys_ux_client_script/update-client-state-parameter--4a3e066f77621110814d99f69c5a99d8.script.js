/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var timestamp = api.context.props.timestamp;
    var oldTimestamp = api.data.timestamp;
    var table = api.context.props.table;
    // DEF0286200 - Update the timestamp state variable to new value if table is sc_request
    if (table == 'sc_request' && timestamp != null && timestamp != '' && timestamp!=oldTimestamp){
        api.setState('timestamp', timestamp);
    }
}
