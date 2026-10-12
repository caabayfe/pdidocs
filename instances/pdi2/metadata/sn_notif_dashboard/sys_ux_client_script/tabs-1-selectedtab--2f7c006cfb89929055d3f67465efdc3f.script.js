/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var tab = api.context.props.tabname;
  return tab ? "id="+tab : "";
}
