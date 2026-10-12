/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.dependencyPanel.selectedConfig == '1')
        return helpers.translateSync('Select the task(s)');
    else
        return helpers.translateSync('Select the category(s)');
}
