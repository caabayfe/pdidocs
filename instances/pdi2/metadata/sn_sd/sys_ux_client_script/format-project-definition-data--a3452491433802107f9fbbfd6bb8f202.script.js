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
    let tmpPOProjectArr = [];
    let outputPOProject = api.data.look_up_multiple_records_project_definition.results;

    for (let item of outputPOProject) {
        tmpPOProjectArr.push({
            "id": item._row_data.uniqueValue,
            "label": item._row_data.displayValue
        });
    }

    api.setState("allPOProjectList", tmpPOProjectArr);
}
