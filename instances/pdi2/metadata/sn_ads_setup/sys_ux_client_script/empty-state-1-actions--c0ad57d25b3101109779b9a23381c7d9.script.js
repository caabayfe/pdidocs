/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [
    {
      "label": helpers.translateSync("Add category"),
      "icon": "plus-outline",
      "variant": "primary"
    }
  ];
}
