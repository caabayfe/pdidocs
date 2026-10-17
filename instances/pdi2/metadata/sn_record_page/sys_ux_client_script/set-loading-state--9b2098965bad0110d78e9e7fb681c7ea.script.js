/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
function setLoadingStatus({ api, event, helpers, imports }) {
	api.setState('isLoading', event.payload.loading, false);
}
