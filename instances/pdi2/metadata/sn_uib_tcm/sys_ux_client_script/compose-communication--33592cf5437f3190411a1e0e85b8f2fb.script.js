/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.emit('NAV_ITEM_SELECTED', {
        "route": "task-comm",
        "targetRoute": "current",
        "title": await helpers.translate("New Communication"),
        "fields": {
            "table": api.context.props.parentTable,
            "sysId": event.context.item.value.sys_id.value,
            "commTaskTable": event.context.item.value.sys_class_name.value
        }
    });
}
