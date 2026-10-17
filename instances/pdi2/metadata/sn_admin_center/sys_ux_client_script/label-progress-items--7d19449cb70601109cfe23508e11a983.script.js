/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"label":"Progress","value":{"type":"highlighted-value","label":`${api.context.props.progress}`}}];
}
