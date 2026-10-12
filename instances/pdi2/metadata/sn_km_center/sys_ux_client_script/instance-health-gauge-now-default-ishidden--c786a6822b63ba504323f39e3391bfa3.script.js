/**
 * Determines if the instance health gauge should be hidden.
 * The gauge is hidden when the article optimization skill is not active.
 * @param {Object} params - The parameters object
 * @param {Object} params.api - API object containing data and state
 * @param {TransformApiHelpers} params.helpers - Helper utilities for transforms
 * @returns {boolean} True if gauge should be hidden (skill not active), false otherwise
 */
function evaluateProperty({api, helpers}) {
	  var skill = api.data.identify_article_optimization_skill_is_enabled &&
                api.data.identify_article_optimization_skill_is_enabled.results;

    // -1 here is used as a flag to indicate that the data was not found
    var isSkillActive = -1;

    if (skill && skill[0] && typeof skill[0].active !== 'undefined') {
        isSkillActive = skill[0].active.value ? 1 : 0; // 1 = active, 0 = inactive
    }
    return isSkillActive !== 1;
    // TBD: Need to add conditions on basis of the calculated knowledge base health score for a user.
}
