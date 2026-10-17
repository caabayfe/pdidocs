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
        buttonLabel
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
            label = 'Installed';
            break;
        case 'updated':
            label = 'Updated';
            break;
        default:
            label = buttonLabel;
    }
    return label;

}
