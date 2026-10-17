/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const value = Number(api.state.findingConfigurationMap?.maxRatio?.value);

    if (value < 1)
        return helpers.translateSync('Maximum ratio cannot be less than 1');

    if (value > 1000)
        return helpers.translateSync('Maximum ratio cannot be more than 1000');

    if (!Number.isInteger(value))
        return helpers.translateSync('Maximum ratio must be an integer');

    return helpers.translateSync('Maximum ratio cannot be empty');
}
