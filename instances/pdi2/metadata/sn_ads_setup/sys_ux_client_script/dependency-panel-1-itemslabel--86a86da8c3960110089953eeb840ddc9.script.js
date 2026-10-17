/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    if (api.state.dependencyPanel.selectedConfig == '1')
        return 'Select the task(s)';
    else
        return 'Select the category(s)';
}
