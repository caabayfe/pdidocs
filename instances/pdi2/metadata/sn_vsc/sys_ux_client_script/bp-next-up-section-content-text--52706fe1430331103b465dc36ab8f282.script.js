/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.data.sc_get_best_practices_progress_level_information && api.data.sc_get_best_practices_progress_level_information.output) {
    const {isNew, most_recentlyUpdated_bpName, most_recentlyUpdated_bpSysId, outstandingSteps} = api.state;
    if (isNew) {
      return helpers.translateSync("First-time users can follow the “Build a foundation” maturity track to discover which Best Practices to start with.");
    } else {
      let numberToWordsMap = {
        "0" : helpers.translateSync("Zero"),
        "1" : helpers.translateSync("One"),
        "2" : helpers.translateSync("Two"),
        "3" : helpers.translateSync("Three"),
        "4" : helpers.translateSync("Four"),
        "5" : helpers.translateSync("Five"),
        "6" : helpers.translateSync("Six"),
        "7" : helpers.translateSync("Seven"),
        "8" : helpers.translateSync("Eight"),
        "9" : helpers.translateSync("Nine"),
        "10" : helpers.translateSync("Ten"), 
      }; 
      const progressInfoText = helpers.translateSync("Most recent progress was made in the \"{0}\". {1} step(s) remain until completion.", most_recentlyUpdated_bpName, numberToWordsMap[outstandingSteps]);
      return progressInfoText;
    }
  }
}
