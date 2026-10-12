/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var value = null;
    let {
       userPayload, 
      mainTable
    } = api.state;

    let additionalFields = userPayload.attributes[mainTable]?.additionalFields || null;
    if (additionalFields == null) 
          return value;
    
    if (Object.keys(additionalFields).length == 0 || !additionalFields.hasOwnProperty(api.item.value?.element))
           return value;

  return {
    value: additionalFields[api.item.value?.element]?.value || null,
    displayValue: additionalFields[api.item.value?.element]?.displayValue || null
  };
}
