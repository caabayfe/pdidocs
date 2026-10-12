/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let formLabel = helpers.translateSync('New breakdown definition');

    const {
        params
    } = api.state.currentView;

    if (params.mode === 'EDIT') {
        formLabel = helpers.translateSync('Edit breakdown definition');
    }

    return [{
        id: 'breakdowns',
        label: helpers.translateSync('Breakdowns'),
    }, {
        id: formLabel,
        label: formLabel,
    }];
}
