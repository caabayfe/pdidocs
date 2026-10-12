/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({ api, event, helpers, imports }) {
	const searchTerm = event.payload.value ? event.payload.value : event.payload.fieldValue;
	const { enableAdvancedSearch, encodedQuery } = api.context.props;
	//no need to debounce managedSearchInput, as it need to be in sync with typing
	api.setState('managedSearchInput', searchTerm || "");

	if(searchTerm.length === 0){
		api.setState('totalResults', -1);
		api.setState('results', []);
		return;
	}

	let EMPTY_STATE_CONTENT_TRANSLATED = '';
	if (searchTerm.length < 3) {
		EMPTY_STATE_CONTENT_TRANSLATED = await helpers.translate('The length of search term should be at least 3');
		api.setState('emptyStateContent', EMPTY_STATE_CONTENT_TRANSLATED);

		//reset data resource input offset
		api.setState('offset', 0);

		//reset internal state parameters before search
		api.setState('totalResults', 0);
		api.setState('currentPage', 0);
		api.setState('hasNextPage', false);
		api.setState('results', []);
		return;
	}

	api.setState('debounce', ({ currentValue }) => {
		let { timeoutId = null } = currentValue;
		if (timeoutId) helpers.timing.clearTimeout(timeoutId);
		timeoutId = helpers.timing.setTimeout(() => {
			api.setState('debounce', ({ currentValue }) => {
				return {
					...currentValue,
					timeoutId: null
				};
			});

			if (enableAdvancedSearch) {
				api.setState('advancedSearchQuery', null);
				api.setState('advancedSearchQuery', searchTerm || '');
			} else {
				let query = `123TEXTQUERY321=${searchTerm}`;
				if (encodedQuery && encodedQuery.length != 0)
					query += `^${encodedQuery}`;

				api.setState('query', null);
				api.setState('query', query);
			}

			//reset data resource input offset
			api.setState('offset', 0);

			//reset internal state parameters before search
			api.setState('totalResults', -1);
			api.setState('currentPage', 0);
			api.setState('hasNextPage', false);
			api.setState('results', []);
		}, 300);
		return {
			...currentValue,
			timeoutId
		};
	});
}
