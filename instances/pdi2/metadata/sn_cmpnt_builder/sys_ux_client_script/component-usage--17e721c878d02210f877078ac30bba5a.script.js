/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('usageMap', ({currentValue}) => {
        const context = event.payload.context;
        const usageMap = {
            ...(currentValue || {}),
            [context]: event.payload.value || 0
        };
        return usageMap;
    });


    api.setState('componentHasUsage', ({api}) => {
        const usageMap = api.state.usageMap || {};
        const componentHasUsage =
			usageMap.pageDetailsTotalRecords > 0 ||
			usageMap.pageCollectionDetailsTotalRecords > 0 ||
			usageMap.componentDetailsTotalRecords > 0;
        return componentHasUsage;
    });
}
