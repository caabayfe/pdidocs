/**
     * @param {params} params
     * @param {api} params.api
     * @param {any} params.event
     * @param {any} params.imports
     * @param {ApiHelpers} params.helpers
     */
     function handler({api, event, helpers, imports}) {    
        const history = api.data.landing_page_favorites_getter_1.output.result.find(({ id }) =>  id === 'c51543a5c3133010cbd77096e940dd43');
    
        if (history && history.subItems && history.subItems.length > 0) { 
            api.setState('historyListEmpty', false); 
        }
}
