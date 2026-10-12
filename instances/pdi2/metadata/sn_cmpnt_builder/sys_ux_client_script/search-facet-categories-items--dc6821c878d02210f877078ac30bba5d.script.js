/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.data.get_search_facet_categories.results ? api.data.get_search_facet_categories.results.map((result) => {
        return {
            id: result._row_data.uniqueValue,
            label: result.label.displayValue,
            sublabel: result.description.displayValue
        };
    }) : [];
}
