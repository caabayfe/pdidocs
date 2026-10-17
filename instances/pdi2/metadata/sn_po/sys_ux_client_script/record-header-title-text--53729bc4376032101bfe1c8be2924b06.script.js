/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const projectName = api.state?.projectDetails?.name?.value;
  
  if (projectName)
    return helpers.translateSync('{0} - scope your analysis', projectName);

	return '';
}
