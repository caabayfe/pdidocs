/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    let result = [{
        id: "1",
        label: helpers.translateSync("Completion of one or more tasks")
    }, {
        id: "2",
        label: helpers.translateSync("Completion of one or more categories")
    }];
    if (api.state.dependencyPanel.isFirstCategory)
        return [result[0]];
    else
        return result;
}
