/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const {result} = api.data.look_up_enable_legacy_query_builder_prop;
  if (result && result.value && result.value.value === 'true') {
    return false;
  }
	return true;
}
