/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(!api.data.gform.nowRecordFormBlob) 
    return;
  const {tabRoutes} = api.data.gform.nowRecordFormBlob;
	return tabRoutes.length > 1 ? [tabRoutes[0]] : tabRoutes;
}
