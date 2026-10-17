/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var callerId = api.context.props.userSysId;
    var recordId = api.context.props.recordSysId;
    var parentTable = api.context.props.parentTable;
    var table = api.context.props.table;
    const SC_REQUEST = "sc_request";
    var recentQuery = api.state.recentQuery;
    var callerField = (table == SC_REQUEST) ? "requested_for" : "assigned_to";
    var reqQuery = `${callerField}=${callerId}^${recentQuery}`;

    const TABLE_QUERY_MAP = {
       "sc_request": reqQuery,
    };

    api.emit('NAV_ITEM_SELECTED', {
        "route": "simplelist",
        "targetRoute": "current",
        "fields": {
            "table": api.context.props.table,
        },
        "params" : {
            "query": TABLE_QUERY_MAP[api.context.props.table],
            "listTitle": api.context.props.subTitle,
            "listView": "sow",
            "recordId": recordId,
            "subNavRoute": "current"
        }
    });
}
