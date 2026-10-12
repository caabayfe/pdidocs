/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
   var changePercent = api.data.data_visualization_api_for_vsc_score.output.result[0];
    var arrow_value = changePercent.response.metadata.changeArrow;
    if (arrow_value == "up") {
      return "Arrow Up Fill";
    } else if (arrow_value == "down") {
      return "Arrow Down Fill";
    }else{
      return "";
    }
}
