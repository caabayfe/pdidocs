/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        "id": "classic_kpis",
        "label": "Classic KPIs"
    }, {
        "id": "nam_kpis",
        "label": "New Analytical Model KPIs"
    }];
}
