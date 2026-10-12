/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var hermesServices = api.data.gethermesservices.output;
    let hermesServiceJson = [];
    
    let serviceIds = hermesServices["distinctValues"];
    for (let serviceId of serviceIds) {
      var serviceItem = {
        id: serviceId.displayValue,
        label: serviceId.displayValue,
      };
      hermesServiceJson.push(serviceItem);
      if(serviceId.displayValue === "hermes-internal" ){
        api.setState("defaultService", serviceItem);
        api.setState("selectedTestHermesService", serviceItem);
        api.setState("selectedServiceForTopic", serviceItem);
      }
    }
    api.setState("hermesServices", hermesServiceJson);
}
