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
    const {
        table,
        sys_id
    } = event.payload;

    const recordUrl = `/now/nav/ui/classic/params/target/${table}_list.do%3Fsysparm_query%3Dsys_id%253D${sys_id}`;

    api.emit("NAV_ITEM_SELECTED", {
        "external": {
            "url": recordUrl,
            "target": "_blank"
        }
    });
}
