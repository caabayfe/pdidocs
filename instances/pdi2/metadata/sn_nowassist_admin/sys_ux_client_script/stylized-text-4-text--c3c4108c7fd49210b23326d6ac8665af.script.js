/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var name = api.item.value.name;
  if(name.length > 50){
    name = name.substring(0,47)+"...";
  }
	return name;
}
