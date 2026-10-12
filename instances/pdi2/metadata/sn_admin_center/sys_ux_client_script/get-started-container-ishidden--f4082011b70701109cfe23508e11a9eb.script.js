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
        showGetStartedBlock
    } = api.context.props.applicationDetails;

    return !showGetStartedBlock;
}
