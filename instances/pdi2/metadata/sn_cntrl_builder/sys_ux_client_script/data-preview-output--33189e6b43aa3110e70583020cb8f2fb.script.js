/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.elements.builder_core.dataBrokerData || !api.elements.builder_core.mcpModel.macroponent) {
        return {};
    }
    const previewData = Object.values(api.elements.builder_core.dataBrokerData).reduce((acc, data) => {
        if (data && api.elements.builder_core.mcpModel.macroponent.data.find(({
                elementId
            }) => elementId === data.dataBrokerId)) {
            acc[data.dataBrokerId] = data?.errors?.length ?
                {
                    errors: data.errors,
                    aclViolation: data.aclViolation
                } :
                data?.result;
        }
        return acc;
    }, {});
    return previewData;
}
