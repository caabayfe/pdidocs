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
        actionAriaLabel,
        ariaProperties
    } = api.context.props.payload;
    const {
        progressText,
        status
    } = api.state;

    let aria_properties = actionAriaLabel;
    switch (status) {
        case 'installing':
            aria_properties = progressText;
            break;
        case 'updating':
            aria_properties = progressText;
            break;
        case 'installed':
            aria_properties = ariaProperties|| 'Installed';
            break;
        case 'updated':
            aria_properties = ariaProperties || 'Updated';
            break;
        case '':
            aria_properties = 'Install';
            break;
        default:
            aria_properties = actionAriaLabel;
    }
    return api.state.translations[aria_properties] || aria_properties;

}
