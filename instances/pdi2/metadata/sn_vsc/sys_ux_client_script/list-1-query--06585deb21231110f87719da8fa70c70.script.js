/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.props.suite) { 
    return "ORDERBYDESCsys_created_on^suite=" + api.context.props.suite;
  }
	return 'ORDERBYDESCsys_created_on';
}
