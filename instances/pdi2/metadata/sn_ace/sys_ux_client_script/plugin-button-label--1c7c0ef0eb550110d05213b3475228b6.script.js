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
        buttonLabel,
        postActionLabel
    } = api.context.props.payload;
    const {
        progressText,
        status
    } = api.state;

    let label = buttonLabel;
    switch (status) {
        case 'installing':
            label = progressText;
            break;
        case 'updating':
            label = progressText;
            break;
        case 'installed':
            label = postActionLabel || 'Installed';
            break;
        case 'updated':
            label = postActionLabel || 'Updated';
            break;
        case '':
            label = 'Install';
            break;
        default:
            label = buttonLabel;
    }
    return api.state.translations[label] || label;

}
