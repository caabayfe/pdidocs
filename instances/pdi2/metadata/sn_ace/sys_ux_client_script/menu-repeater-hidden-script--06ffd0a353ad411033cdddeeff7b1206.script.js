/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({api}) {
    return !(api.data.ace_fetch_menu_items.output && api.data.ace_fetch_menu_items.output.modules);
}
