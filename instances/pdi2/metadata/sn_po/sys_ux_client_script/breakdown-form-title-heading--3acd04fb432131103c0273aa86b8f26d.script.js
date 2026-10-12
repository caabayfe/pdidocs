/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        params
    } = api.state.currentView;

    let label = helpers.translateSync('New breakdown definition');

    if (params.mode === 'EDIT') {
        label = helpers.translateSync('Edit breakdown definition');
    }
    return {
        label: label,
        size: 'md',
    };
}
