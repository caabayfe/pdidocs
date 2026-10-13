/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.context.item && event.context.item.value && event.context.item.value.category && event.context.item.value.category.source && event.context.item.value.category.source == "INCIDENT_TASK") {
        api.emit("NAV_ITEM_SELECTED", {
            "route": "record",
            "targetRoute": {
                "route": "record",
                "fields": {
                    sysId: api.context.props.sysId,
                    "table": "incident",
                },
                "params": {}
            },
            "fields": {
                "sysId":  event.context.item.value.category.sysId,
                "table": "incident_task"
            },
            "params": {},
            "redirect": false,
            "passiveNavigation": "",
            "title": "",
            "multiInstField": "",
            "external": ""
        });
    }

}
