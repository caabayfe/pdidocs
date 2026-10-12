/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const value = Number(api.state.findingConfigurationMap?.minRepetitions?.value);

  if (value < 1)
    return helpers.translateSync('This value cannot be less than 1');

  if (!Number.isInteger(value))
    return helpers.translateSync('This value must be an integer');

  return helpers.translateSync('This value cannot be empty');
}
