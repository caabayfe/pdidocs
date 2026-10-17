/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const value = Number(api.state.findingConfigurationMap?.minLength?.value);

  if (value < 3)
    return helpers.translateSync('This value cannot be less than 3');

  if (!Number.isInteger(value))
    return helpers.translateSync('This value must be an integer');

  return helpers.translateSync('This value cannot be empty');
}
