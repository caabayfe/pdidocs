/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var choicesData = api?.data?.bp_details_form?.form?.fields?.priority?.choices || [];
    let map = [];
    for (const priority of choicesData) {
        map.push({
            id: priority.value,
            label: priority.displayValue
        });
    }
    return map;
}
