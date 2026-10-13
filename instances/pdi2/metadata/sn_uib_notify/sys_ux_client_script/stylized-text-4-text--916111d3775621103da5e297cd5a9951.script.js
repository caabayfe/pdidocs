/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let result = "";
  if (api.state.selectedParticipantsAndGroups.length >= 5){
    result = helpers.translateSync(`${api.state.selectedParticipantsAndGroups.length} Participants`);
  }
	return result;
}
