/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
    if(api.context.app.record_secondary_values_location !== 'sidebar'
    && api.data.gform && api.data.gform.nowRecordCommonHeader
    && api.data.gform.nowRecordCommonHeader.secondaryItems){

    return api.data.gform.nowRecordCommonHeader.secondaryItems;
  }
	return [];
}
