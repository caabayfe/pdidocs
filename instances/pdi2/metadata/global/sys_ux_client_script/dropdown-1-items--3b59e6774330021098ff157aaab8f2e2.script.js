/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var hermesServices = api.data.gethermesservices.output;
    let hermesServiceJson = [];
    
    let serviceIds = hermesServices["distinctValues"];
    for (let serviceId of serviceIds) {
      hermesServiceJson.push({
        id: serviceId.displayValue,
        label: serviceId.displayValue,
      });
    }
    return hermesServiceJson;
}
