/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var isSkillActive = api?.item?.value?.action?.type != 'activate';
    var noFallbackText = helpers.translateSync("The skill is disabled as it is not compliant per your model provider policy. Please review policy for details");
    var withFallbackText = helpers.translateSync("The skill is using an non-compliant model provider. Review policy to see list of approved providers");
	return api.state.isFallbackEnabled ? withFallbackText : (isSkillActive ? withFallbackText : noFallbackText);
}
