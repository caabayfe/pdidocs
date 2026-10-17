/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var avgJobDuration = api.state.jobProcessingTimeJSON.avg;
  avgJobDuration = Number(Math.round((avgJobDuration/60)  + "e+2") + "e-2");
  if(isNaN(avgJobDuration))
    avgJobDuration = 0;
	return avgJobDuration;
}
