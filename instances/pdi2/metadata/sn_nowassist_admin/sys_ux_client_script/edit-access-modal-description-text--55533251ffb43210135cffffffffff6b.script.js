/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.isSkillActive ? helpers.translateSync("Edit access for {skillName} in {product}. You can specify who has access to this skill and add further restrictions to prevent unauthorized data access.", {
            skillName: api.state.edit_access_skill_data.skillName,
            product: api.state.product
        }) :
        helpers.translateSync("Turn on {skillName} in {product}. You can specify who has access to this skill and add further restrictions to prevent unauthorized data access.", {
            skillName: api.state.edit_access_skill_data.skillName,
            product: api.state.product
        });
}
