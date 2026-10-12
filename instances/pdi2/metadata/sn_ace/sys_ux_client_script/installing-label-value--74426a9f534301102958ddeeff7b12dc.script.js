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
        status
    } = api.state;
    let label = 'Installing';
    switch (status) {
        case 'installing':
            label = 'Installing';
            break;
        case 'updating':
            label = 'Updating';
            break;
        case 'installed':
        case 'updated':
            label = 'Completed';
            break;
        case '':
            label = 'Failed';
            break;
        default:
            label = 'Installing';
    }
    return (api.state.translations[label] || label);
}
