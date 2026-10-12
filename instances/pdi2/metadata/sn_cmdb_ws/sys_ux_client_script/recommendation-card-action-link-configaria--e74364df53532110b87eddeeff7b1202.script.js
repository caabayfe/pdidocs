/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.item && api.item.value)
    return {"aria-label":api.item.value.actionLink.text};
  else
    return {"aria-label": ""};
}
