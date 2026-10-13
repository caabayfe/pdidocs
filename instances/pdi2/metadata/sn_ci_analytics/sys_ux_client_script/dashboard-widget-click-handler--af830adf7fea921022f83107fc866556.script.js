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
        payload = {}
    } = event;
    const {
        params: {
            dataSourceType,
            table,
            query
        } = {}
    } = payload;
    if (query == undefined || query == null)
        query = '';
    if (dataSourceType === 'table') {
        api.emit("NAV_ITEM_SELECTED", {
            route: null,
            fields: null,
            params: null,
            redirect: true,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: {
                url: '/' + table + '_list.do?sysparm_query=' + query
            }
        });
    }
}
