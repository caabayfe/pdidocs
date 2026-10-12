/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, imports }) {

	const results = api.data.fetch_not_message_type_actions?.results || [];

	if (!Array.isArray(results) || results.length === 0) {
		api.setState('context_actions_list', []);
		api.setState('error_actions_list', []);
		return;
	}

	const { ERROR_SOURCE_APP } = imports["global.EFClientUtils"]();

	const contextActions = [];
	const errorActions = [];

	results.forEach(item => {
		if (!item?.action?.value || !item?.action?.displayValue)
			return;

		const action = {
			id: item.action.value,
			label: item.action.displayValue
		};

		if (item?.source_application?.value === ERROR_SOURCE_APP)
			errorActions.push(action);
		else
			contextActions.push(action);
	});

	contextActions.sort((a, b) => a.label.localeCompare(b.label));
	errorActions.sort((a, b) => a.label.localeCompare(b.label));

	api.setState('context_actions_list', contextActions);
	api.setState('error_actions_list', errorActions);
}
