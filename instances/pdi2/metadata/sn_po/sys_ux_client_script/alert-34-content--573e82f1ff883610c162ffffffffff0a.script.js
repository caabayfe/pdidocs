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
        findingConfigurationMap
    } = api.state;

    const value = findingConfigurationMap.minGroupDistance.value;

    if (!value) {
        return helpers.translateSync("This value cannot be empty");
    } else if (value < 5) {
        return helpers.translateSync("This value cannot be less than 5");
    }
}
