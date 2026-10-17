/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return !api.data.get_custom_event_properties.transformEventProperties || 
    api.data.get_custom_event_properties.transformEventProperties.length === 0;
}
