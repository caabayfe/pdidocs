/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED',{
        route: 'native-translation-languages',
        fields:{
            provider: api.state.selectedProvider
        }
    });

}
