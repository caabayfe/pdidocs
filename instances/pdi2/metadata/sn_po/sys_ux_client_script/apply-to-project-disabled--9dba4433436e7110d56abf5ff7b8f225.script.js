/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.ismining || api.data.get_process_definition?.results?.length == 0 || api.data.process_configuration_automated_findings?.results?.length==0 && api.data.process_configuration_rule_based_findings?.results?.length == 0;
}
