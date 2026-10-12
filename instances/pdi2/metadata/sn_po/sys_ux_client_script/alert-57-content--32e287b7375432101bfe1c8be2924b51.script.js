/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const value = Number(api.state.findingConfigurationMap?.minRecordNumber?.value);

  if (value < 100)
    return helpers.translateSync('This value cannot be less than 100');

  if (!Number.isInteger(val))
    return helpers.translateSync('This value must be an integer');

	return helpers.translateSync('This value cannot be empty');
}
