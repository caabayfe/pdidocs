/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
   const menuItems = api.data.ace_fetch_menu_items.output || {};
    const { modules = [], isSearchConfigured} = menuItems;
    const hasModules = modules.some(mod => !mod.props_details.isHidden);
    return !(hasModules || isSearchConfigured); 
}
