/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let ariaLabel = '';
    if (api.state.heading.label) {
        const {
            actionStateLabel,
            actionTypeLabel,
        } = api.context.props.customExpProps;
        ariaLabel = `The Recommended action is ${api.state.heading.label}. It is a ${actionStateLabel} ${actionTypeLabel}`;
        ariaLabel = helpers.translateSync(ariaLabel);
    }
    return {
        "role": "group",
        "aria-label": ariaLabel
    };
}
