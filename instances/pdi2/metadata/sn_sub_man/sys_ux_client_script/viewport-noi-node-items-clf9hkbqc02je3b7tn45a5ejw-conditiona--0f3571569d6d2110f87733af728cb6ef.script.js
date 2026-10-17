/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var resultArr = api.data.sku_metadata.output.data.GlideRecord_Query.sku_metadata._results;
	if (api.data.sku_metadata.output.data.GlideRecord_Query.sku_metadata._rowCount <= 0)
    return true;
  var arrLength = resultArr.length;
  for (var i = 0; i < arrLength; i++) {
    if (resultArr[i].schema.value == 'ih_protocol')
      return false;
  }
  return true;
}
