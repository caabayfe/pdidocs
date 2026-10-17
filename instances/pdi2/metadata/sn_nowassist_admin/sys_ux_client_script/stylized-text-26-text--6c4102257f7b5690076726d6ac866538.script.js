/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  //TODO:
  //rich text alignment needs to be figured out. 
  //depricate regex to remove html tags

	var desc = api?.item?.value?.description?.label?.replace(/<[^>]*>/g, '');
	return desc;
}
