/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return 'https://' + api.item.value.instance_name.value + ".service-now.com/now/clone/ui/clone-request/-1";
}
