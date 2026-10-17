/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    if (event.name === 'NOW_RECORD_LIST_CONNECTED#DATA_FETCH_SUCCEEDED') {
        const currentCsId = api.state.conversationId;
        if (!currentCsId) {
            const layoutQuery = event.payload.model.layoutQuery;
            const firstCsId = layoutQuery.allSysIds ? layoutQuery.allSysIds[0] : '';
            api.setState('conversationId', firstCsId);
        }
        api.setState('conversationsListLoaded', true);
    }
}
