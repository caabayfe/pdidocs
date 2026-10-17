/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const stage = api.item.value.stage.value;
  if (stage == "paused") {
	  return "circle-pause-outline";
  };
}
