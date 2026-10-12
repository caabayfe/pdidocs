/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const currentView = { ...api.state.currentView };

    let headingText = helpers.translateSync('New activity');

    if (currentView.params.mode === 'EDIT') {
        headingText = helpers.translateSync('Edit activity');
    }

    return {
        "label": headingText,
        "size": "md",
        "variant": "primary"
    };
}
