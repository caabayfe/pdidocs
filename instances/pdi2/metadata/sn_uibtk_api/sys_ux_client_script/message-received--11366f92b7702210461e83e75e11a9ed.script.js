/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const error = event.payload.data.error;

    if (error) {
        console.error(error);
        api.setState('result', { error, status: "error" });

        return;
    }

    const features = event.payload.data.features || {};
    const featureData = Object.values(features).find(
        (feature) => feature.result.capabilityId === api.context.props.oneExtendCapabilityId
    ) || {};

    const result = featureData.result;

    api.setState('result', result);
    api.emit('SKILL_CONTROLLER#EXECUTION_COMPLETED', { result });
}
