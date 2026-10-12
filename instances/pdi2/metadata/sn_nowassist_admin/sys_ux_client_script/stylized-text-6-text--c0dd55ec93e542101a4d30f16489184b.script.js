/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!!api.state.skillConfigData.skill_family_parent_name) {
      return helpers.translateSync("{0} is now active for {1}!", api.state.skillConfigData.name, api.state.skillConfigData.skill_family_parent_name); 
    }
    return helpers.translateSync("{0} is now active", api.state.skillConfigData.name);
}
