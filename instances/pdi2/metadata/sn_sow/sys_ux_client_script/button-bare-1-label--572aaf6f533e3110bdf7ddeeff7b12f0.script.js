/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.item.value.members.length < 3)
    return "";

  var count = api.item.value.members.members.length - 2;
	return "+" + count.toString();
}
