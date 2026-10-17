/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var redirectPayload = {
        "redirect": true,
        "route":"record",
        "targetRoute": "current",
        "fields": {
            "table": "cmdb_m2m_suite_model",
            "sysId": "-1"
        },
        "params": {
            "query": "suite_parent=" + api.context.props.sysId
        }
    };
    api.emit("NAV_ITEM_SELECTED", redirectPayload);
}
