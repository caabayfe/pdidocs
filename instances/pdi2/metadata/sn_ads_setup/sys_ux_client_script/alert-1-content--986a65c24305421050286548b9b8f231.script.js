/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { alertMsg } = api.state;
	if(alertMsg)
    return helpers.translateSync(alertMsg);
    
	return helpers.translateSync("This page doesn't exist. Please check your URL and try again!");
}
