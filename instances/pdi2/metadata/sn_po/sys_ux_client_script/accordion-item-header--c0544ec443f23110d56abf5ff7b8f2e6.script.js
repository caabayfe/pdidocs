/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {
    label :  helpers.translateSync('Optionally, select to narrow your process scope'),
    "size": "md",
    variant:"primary",
    "weight": "normal"
  };
}
