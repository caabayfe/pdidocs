/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var arr = [];

  var feedback = JSON.parse(api.data.fetch_optout_feedback_options_1.output["result"]);
  for(var i in feedback){
    arr.push({"id":feedback[i].sys_id,"label":feedback[i].description});
  }
	return arr;
}
