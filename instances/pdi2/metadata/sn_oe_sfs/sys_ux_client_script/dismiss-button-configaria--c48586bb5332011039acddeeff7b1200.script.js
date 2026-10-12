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
        const cardName = api.context.props.payload.name;
        const dismiss = api.data.ci_admin_console__translations.output.dismiss;
        if (cardName && dismiss) {
            return {
                "aria-label": `${dismiss} ${cardName}`
            };
        }
        return {
            "aria-label": 'Dismiss Card'
        };
    } catch (e) {}
}
