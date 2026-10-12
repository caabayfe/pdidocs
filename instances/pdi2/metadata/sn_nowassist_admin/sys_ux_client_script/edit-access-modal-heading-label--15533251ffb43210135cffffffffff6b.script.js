/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.isSkillActive ? helpers.translateSync("Edit access for {skillName}", {
        skillName: api.state.edit_access_skill_data.skillName
    }) : helpers.translateSync("Turn on {skillName}", {
        skillName: api.state.edit_access_skill_data.skillName
    });
}
