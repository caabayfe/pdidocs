/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (
        // If NOT PC Viewport (PC of component "Viewport Modal" or type "viewport") page
        (api.context.props.mode === "pc" &&
            !api.context.props.isHeadlessViewport) ||
        // If Viewport Tabs subpage
        (api.context.props.parentScreenId &&
            api.context.props.parentElementId &&
            !api.context.props.isHeadlessViewport)
    ) {
        return "tab";
    } else {
        return "page";
    }
}
