/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var arConfig = api.state.arConfig;
    var recordSet = api.state.recordSet;
    var name = api.state.name;
    if (name !== null)
        var nameNoSpace = name.replace(/ /g, ''); //remove all the spaces from the string

    if (name === null || nameNoSpace === "" || arConfig == null || arConfig === "" || recordSet == null || recordSet == "") {
        api.setState('hideAlert', false);
    }

    else {
        api.emit('NAV_ITEM_SELECTED', {
            'route': 'simulation',
            'fields': {
                'simPage': 'home',
            },
            'params': {
                'newRecord': 'true'
            },
        });
    }
}
