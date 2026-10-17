/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var arr = api.item.value.imageArr;
	return !(arr && arr.length);
}
