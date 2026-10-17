/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const gFormHeader = api.data.gform.nowRecordCommonHeader;

  if (!api.state.isValidRecord || api.state.isNewRecord || !gFormHeader)
    return true;

  if(!gFormHeader.headerImageItem)
    return true;

  return !gFormHeader.headerImageItem.headerImage;
}
