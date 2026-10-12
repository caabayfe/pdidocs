/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.elements.builder_core.filteredEventHandlers.filter(({
        category
    }) => category.type === 'DATABROKER_OP');
}
