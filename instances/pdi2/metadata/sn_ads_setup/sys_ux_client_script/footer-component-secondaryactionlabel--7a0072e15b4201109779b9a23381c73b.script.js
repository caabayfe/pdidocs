/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.selectedTaskStep != 1 ? helpers.translateSync('Previous') : '';
}
