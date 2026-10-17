/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return api.data.fetch_custom_events.output == null || 
  (api.data.fetch_custom_events.output && api.data.fetch_custom_events.output.length !== 0);
}
