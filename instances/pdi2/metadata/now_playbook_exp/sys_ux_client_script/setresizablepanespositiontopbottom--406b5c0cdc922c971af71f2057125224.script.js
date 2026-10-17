/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api }) {
	if ((api.data.playbookContextIdsInOrder || []).length === 0) return "bottom";
    if (!api.data.compactMode) return "both";
    return (api.data.selectedItem || {}).stageContextId ? "bottom" : "top";
}
