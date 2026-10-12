/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.context.props.isSrp) {
        api.emit("SOW_RECORD#ROUTE_REQUESTED", {
            route: "investigate",
            type: "record-tab"
        });
    }
    else {
        api.emit("VIEWPORT_ROUTE_REQUESTED", {
            "route": "investigate",
            "fields": {
                "show": true
            }
        });
    }
}
