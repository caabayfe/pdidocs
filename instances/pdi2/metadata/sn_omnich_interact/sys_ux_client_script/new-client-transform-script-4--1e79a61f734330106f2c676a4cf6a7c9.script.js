/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const gFormData = api.data.gform.nowRecordFormBlob;
  const gFormHeader = api.data.gform.nowRecordCommonHeader;
  if (!gFormData || !gFormHeader)
    return;

	return gFormData.isNewRecord || gFormHeader.hideTagsValue;
}
