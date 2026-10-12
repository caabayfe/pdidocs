/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const version = api.state.available_versions.find(version => version.id == api.state.selected_version);
    return {
        'trigger': {
            'aria-label': helpers.translateSync(`Selected version: {0}`, version?.label)
        }
    };
}
