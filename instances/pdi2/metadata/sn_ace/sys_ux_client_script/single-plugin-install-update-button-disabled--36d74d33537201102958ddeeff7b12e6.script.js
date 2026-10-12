/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const mode = api.context.props.payload.mode;
    const plugins = api.state.plugins || [];
    const {
        id,
        currentVersion,
        type
    } = plugins[0] || {};

    if (mode == 'install') {
        switch (type) {
            case 'application':
                return id && currentVersion;
            case 'plugin':
                return !Boolean(id);
            default:
                return false;
        }
    }
}
