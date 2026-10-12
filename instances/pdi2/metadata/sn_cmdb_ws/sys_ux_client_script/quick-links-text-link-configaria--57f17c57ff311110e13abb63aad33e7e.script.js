/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.item && api.item.value) {
    if (api.item.value.open_new_window)
      return {"aria-label": helpers.translateSync("{0} - Link opens in a new tab.", api.item.value.title)};
    
    return {"aria-label":api.item.value.title};
  }
  else
    return {"aria-label": ""};
}
