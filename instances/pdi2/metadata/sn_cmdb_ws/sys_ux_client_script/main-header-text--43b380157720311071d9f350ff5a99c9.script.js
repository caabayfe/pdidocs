/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

    if(!api.state.isNew && api.state.template.name.length === 0)
      return helpers.translateSync("Enter name");

  if(!api.state.isNew)
    return api.state.template.name;

	return helpers.translateSync('New template');
}
