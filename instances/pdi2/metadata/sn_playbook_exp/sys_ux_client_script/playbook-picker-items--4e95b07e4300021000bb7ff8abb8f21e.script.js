/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api }) {
	const playbooksByContextId = api.data.playbook_custom_layout.playbooksByContextId;

	if (!playbooksByContextId || !Object.keys(playbooksByContextId).length)
		return;

	const playbookItems = Object.values(playbooksByContextId).map(
		({ sysId, title }) => {
			if (!sysId || !title) return;

			return {
				id: sysId,
				label: title
			};
		}
	);

	return playbookItems;
}
