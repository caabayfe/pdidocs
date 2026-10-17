/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var result = api.data.data_visualization_api_for_vsc_score.output.result[0];
    if (result) {
        var scores = result.response.data[1];
        if (scores) {
            return Math.round(scores[0]) + "%";
        } else {
            return '';
        }
    }
}
