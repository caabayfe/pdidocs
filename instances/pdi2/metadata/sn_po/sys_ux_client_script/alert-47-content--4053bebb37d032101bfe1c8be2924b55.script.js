/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const value = Number(api.state.findingConfigurationMap?.maxFindings?.value);
  
  if (!Number.isInteger(value))
    return helpers.translateSync('This value must be an integer');

  if (value < 0)
    return helpers.translateSync('This value cannot be less than 0');

  if (value > 25)
    return helpers.translateSync('This value cannot be more than 25');

	return helpers.translateSync('This value cannot be empty');
}
