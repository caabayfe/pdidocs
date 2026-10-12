/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.context.props.setupId === '-1')
    return helpers.translateSync('Get started');

  return api.state.isSetupPublished ? 
        helpers.translateSync('Edit guided setup') :
        helpers.translateSync('Continue where you left'); 
}
