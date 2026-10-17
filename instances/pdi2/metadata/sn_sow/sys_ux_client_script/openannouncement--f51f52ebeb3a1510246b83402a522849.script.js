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
    let model = event.context.item.value.propValues.model;
    if (model.table == "sys_ux_banner_announcement") {
        return;  
    } else {
        const id = model.sysId;
        const table = model.table;
        if (id) {
            const navigationPayload = {
                route: 'record',
                fields: {
                    table: table,
                    sysId: id
                }
            };

            const {
                emit
            } = api;
            emit('NAV_ITEM_SELECTED', navigationPayload);
        }
    }
}
