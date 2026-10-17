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
        actionTooltip,
        postActionTooltip
    } = api.context.props.payload;
    const {
        progressText,
        status
    } = api.state;

    let tooltip = actionTooltip;
    switch (status) {
        case 'installing':
            tooltip = progressText;
            break;
        case 'updating':
            tooltip = progressText;
            break;
        case 'installed':
            tooltip = postActionTooltip|| 'Installed';
            break;
        case 'updated':
            tooltip = postActionTooltip || 'Updated';
            break;
        case '':
            tooltip = 'Install';
            break;
        default:
            tooltip = actionTooltip;
    }
    return api.state.translations[tooltip] || tooltip;

}
