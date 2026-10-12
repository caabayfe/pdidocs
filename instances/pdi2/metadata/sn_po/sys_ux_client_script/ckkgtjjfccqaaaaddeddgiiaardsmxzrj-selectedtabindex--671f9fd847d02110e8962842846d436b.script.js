/**
	* @param {params} params
	* @param {api} params.api
	* @param {TransformApiHelpers} params.helpers
	*/
  function evaluateProperty({api, helpers}) {
	  return api.context.props.selectedTabIndex || 0;
  }
