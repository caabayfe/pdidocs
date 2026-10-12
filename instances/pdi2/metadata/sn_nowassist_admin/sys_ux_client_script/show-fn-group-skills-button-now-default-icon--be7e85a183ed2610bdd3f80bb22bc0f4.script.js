/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return  api.item.value.showFnGroupSkillList ? 'chevron-up-outline': 'chevron-down-outline';
}
