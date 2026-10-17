/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const {tinyId, listId} = event.payload;

    if (tinyId) {
			api.setState('tinyId', tinyId);
    }
    if (listId) {
			api.setState('listId', listId);
    }
}
