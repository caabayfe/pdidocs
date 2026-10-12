/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var ariaLabel = `The recommendation is ${api.state.heading.label}.`;
    var customExpProps = api.state.customExpProps;
    if (customExpProps) {
        ariaLabel += ` It is a ${customExpProps.actionStateLabel} ${customExpProps.actionTypeLabel}.`;
    }
    ariaLabel = helpers.translateSync(ariaLabel);
    return {
        "role": "group",
        "aria-label": ariaLabel
    };
}
