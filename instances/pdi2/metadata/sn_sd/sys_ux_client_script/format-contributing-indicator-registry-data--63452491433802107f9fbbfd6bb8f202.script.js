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
    let tmpCIRArr = [];
    let outputCIR = api.data.look_up_multiple_records_contributing_indicator_registry.results;

    for (let item of outputCIR) {
        tmpCIRArr.push({
            "id": item._row_data.uniqueValue,
            "label": item._row_data.displayValue
        });
    }

    api.setState("allContributingIndicatorList", tmpCIRArr);
}
