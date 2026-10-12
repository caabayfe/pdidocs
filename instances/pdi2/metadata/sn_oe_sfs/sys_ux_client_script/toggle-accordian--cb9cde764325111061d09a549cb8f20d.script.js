/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('hideAccordian',!api.state.hideAccordian);
    if( api.state.buttonName=='Expand'){
        api.setState('buttonName','Collapse');
        api.setState('iconName','minus-fill');

    }
    else{
        api.setState('buttonName','Expand');
        api.setState('iconName','expand-outline');

    }
}
