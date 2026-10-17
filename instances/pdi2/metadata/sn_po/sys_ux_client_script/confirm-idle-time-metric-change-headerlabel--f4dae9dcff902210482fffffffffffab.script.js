/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const {
        entityCardRepeaterData,
        selectedActivityID,
        projectIdleTimeEnabled
    } = api.state;
    if (api.state.projectIdleTimeEnabled && selectedActivityID) {
      let activity = entityCardRepeaterData[0].activities.find(i => i.id == selectedActivityID);
      if (!activity) {
        activity = entityCardRepeaterData[0].activitiesOfInterest.find(i => i.id == selectedActivityID);
      }
      return helpers.translateSync("Change {0}?", activity.label);
    }

    return helpers.translateSync("Confirm change Activity field?");
}
