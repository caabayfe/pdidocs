/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    try {
        const screenName = api.context.props.payload.children[2].subtitle;
        const goto = api.data.ci_admin_console__translations.output.go_to;
        if (screenName && goto) {
            return {
                "aria-label": `${goto} ${screenName}`
            };
        }
        return {
            "aria-label": 'Go to slide 3'
        };
    } catch (e) {}
}
