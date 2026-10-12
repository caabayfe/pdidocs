/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var selectedGroup = api.item.value || [];
    var result;    
    if (api.item.value.selectionType == 'oobSkillGroup' && selectedGroup?.providers?.length > 0 ) {
       result = selectedGroup.providers;
    } else {
        result = api.state?.aictApprovedProviders || [];
    }

    return result.sort((firstSkill, secondSkill) => firstSkill.label.localeCompare(secondSkill.label));

}
