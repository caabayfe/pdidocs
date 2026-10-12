/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    switch (api.state.selectedType) {
        case 'group':
            return api.state.hideGroupEmptyState;
        case 'service':
            return api.state.hideServiceEmptyState;
    }
    return true;
}
