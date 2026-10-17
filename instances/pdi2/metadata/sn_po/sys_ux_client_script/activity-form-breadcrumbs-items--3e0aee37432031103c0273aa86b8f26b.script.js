/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let childLabel = helpers.translateSync('New activity');

    const currentView = { ...api.state.currentView };

    if (currentView.params.mode === 'EDIT') {
        childLabel = helpers.translateSync('Edit activity');
    }

    return [{
        id: 'activity-definitions',
        label: helpers.translateSync('Activities')
    }, {
        id: childLabel,
        label: childLabel,
    }];
}
