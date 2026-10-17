/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    "label": helpers.translateSync("default SLA period"),
    "href": "/contract_sla.do?sys_id=" + api.state.internalProperties.title
  };
}
