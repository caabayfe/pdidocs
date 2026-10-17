/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    return true; // To be decided
	  return !(api?.item?.value?.selectionType == 'oobSkillGroup' && api?.item?.value?.selectedProvider )
}
