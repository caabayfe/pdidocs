/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const value = Number(api.state.findingConfigurationMap?.minRatio?.value);

    if (value < 1)
        return helpers.translateSync('Minimum ratio cannot be less than 1');

    if (value > 1000)
        return helpers.translateSync('Minimum ratio cannot be more than 1000');

    if (!Number.isInteger(value))
        return helpers.translateSync('Minimum ratio must be an integer');

    return helpers.translateSync('Minimum ratio cannot be empty');
}
