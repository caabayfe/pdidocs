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
    const INCIDENT = "incident";
    const INTERACTION = "interaction";
    const ALM_ASSET = "alm_asset";
    const TASK = "task";
    var recentQuery = api.state.recentQuery;
    var callerField = (table == INCIDENT) ? "caller_id" : (table == INTERACTION) ? "opened_for" : "assigned_to";
    var addQuery = (table == ALM_ASSET) ? "sys_class_name=alm_hardware" : recentQuery;
    var addQueryTask = `sys_class_name=incident^ref_incident.caller_id=${callerId}^sys_created_onONLast 7 days@javascript:gs.beginningOfLast7Days()@javascript:gs.endOfLast7Days()^NQsys_class_name=problem^opened_by=${callerId}^sys_created_onONLast 7 days@javascript:gs.beginningOfLast7Days()@javascript:gs.endOfLast7Days()^NQsys_class_name=change_request^ref_change_request.requested_by=${callerId}^sys_created_onONLast 7 days@javascript:gs.beginningOfLast7Days()@javascript:gs.endOfLast7Days()^NQsys_class_name=sc_request^ref_sc_request.requested_for=${callerId}^sys_created_onONLast 7 days@javascript:gs.beginningOfLast7Days()@javascript:gs.endOfLast7Days()`;

    var assetIncIntQuery = `${callerField}=${callerId}^${addQuery}`;
    var taskQuery = `${addQueryTask}^ORDERBYDESCnumber`;

    const TABLE_QUERY_MAP = {
       "alm_asset": assetIncIntQuery,
       "incident": assetIncIntQuery,
       "interaction": assetIncIntQuery,
       "task": taskQuery
    };

    if (parentTable == INTERACTION && recordId && table == TASK) {
            api.emit('NAV_ITEM_SELECTED', {
                "route": "interaction-task-list-page",
                "title": api.context.props.subTitle,
                "targetRoute": "current",
                "fields" : {
                    "interactionId": recordId,
                },
                "params": {
                    "listQuery": TABLE_QUERY_MAP[api.context.props.table],
                    "listTitle": api.context.props.subTitle,
                    "subNavRoute": "current"
                }
            });
        return;
    }
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
