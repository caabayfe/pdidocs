/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    var tableName = api.context.props.table;
    var id = api.context.props.sysId;

    var payload = {
        "previousPage": "kb_view",
        "fields": {
            "table": tableName,
            "sysId": id
        }
    };

    if (api.context.props.overridePageEvents) {
        console.log("Reshu from events");
        api.emit("SN_KNOWLEDGE_VIEW#BACK_BUTTON_CLICKED", payload);
        return;
    }
}
