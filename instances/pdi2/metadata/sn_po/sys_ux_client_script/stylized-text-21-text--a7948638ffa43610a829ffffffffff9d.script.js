/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.outOfScopeFindings > 0){
    	return helpers.translateSync('Finding definition(s) did not generate improvement opportunities because activities did not match or certain metrics weren\'t enabled');
  }
	return helpers.translateSync('Finding definition(s) did not generate improvement opportunities because activities did not match');
}
