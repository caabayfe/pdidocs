/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.lastCloneSummary.finished === true){
    return helpers.translateSync('{0}', api.state.lastCloneSummary.state);
  } else if (api.state.lastCloneSummary?.state?.trim().toLowerCase() === "no clone has been scheduled for this instance") {
    return helpers.translateSync('{0}', api.state.lastCloneSummary.state);
  } else if ((api.state.lastCloneSummary?.state?.trim().toLowerCase().indexOf('fail') !== -1) || ((api.state.lastCloneSummary?.state?.trim().toLowerCase().indexOf('error') !== -1))) {
    return helpers.translateSync('{0}', api.state.lastCloneSummary.state);
  } 
  else {
    return helpers.translateSync('Running ({0})', api.state.lastCloneSummary.state);
  }
}
