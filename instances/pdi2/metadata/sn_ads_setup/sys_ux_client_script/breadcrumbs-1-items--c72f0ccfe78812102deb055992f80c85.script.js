/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const result = api.data.look_up_a_single_record_1.result;

    const setupName = (result && result.name.displayValue) || '';
    return [
        {
            "label": helpers.translateSync("Guided Setup Player"),
            "href": "now/adoptionservices/home/params/selectedTabIndex/1"
        },
        {
            "label": setupName,
            "href": "#"
        },
    ];
}
