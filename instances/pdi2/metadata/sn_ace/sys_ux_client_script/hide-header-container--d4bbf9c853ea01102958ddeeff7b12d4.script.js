/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const menuItems = api.data.ace_fetch_menu_items.output || {};
    const {
        modules = [], isSearchConfigured
    } = menuItems;
    return !(modules.length != 0 || isSearchConfigured);
}
