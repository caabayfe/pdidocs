/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.showMandatoryError && 
    (api.state.selectedRESTEndpoint === null || api.state.selectedRESTEndpoint.length == 0);
}
