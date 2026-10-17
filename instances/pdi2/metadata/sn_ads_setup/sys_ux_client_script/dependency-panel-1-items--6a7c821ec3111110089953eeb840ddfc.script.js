/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    if (api.state.dependencyPanel.selectedConfig == '1')
        return api.state.dependencyPanel.taskItems;
    else
        return api.state.dependencyPanel.catItems;
}
