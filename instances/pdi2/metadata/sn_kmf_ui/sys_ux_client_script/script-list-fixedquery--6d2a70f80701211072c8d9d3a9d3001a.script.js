/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const SCRIPT = '1';

  var specId = api.state.cryptoSpecId;
  var moduleId = api.context.props.cryptoModuleId;

  // if we have a crypto spec selected, only show MAPs for that crypto spec  
  if (specId && !Object.values(specId).includes(null))
    return 'type=' + SCRIPT + '^crypto_module=' + moduleId + '^crypto_spec=' + specId;

  // otherwise show all MAPs for the crypto module
	return 'type=' + SCRIPT + '^crypto_module=' + moduleId;
}
