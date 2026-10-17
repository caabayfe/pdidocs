/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var maxJobDuration = api.state.jobProcessingTimeJSON.max;
  maxJobDuration = Number(Math.round((maxJobDuration/60)  + "e+2") + "e-2");
  if(isNaN(maxJobDuration))
    maxJobDuration = 0;
	return maxJobDuration;
}
