/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.optOutFeedback == "4478025eb3303200715ca943c6a8dc64") {
        if (api.state.optOutReason.length)
            return 'false';
        else
            return 'true';
    }


    if (api.state.optOutFeedback.length > 0)
        return 'false';

    return 'true';

}
