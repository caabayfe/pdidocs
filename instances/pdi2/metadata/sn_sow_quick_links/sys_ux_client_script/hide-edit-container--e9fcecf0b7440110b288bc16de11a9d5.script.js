/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemIndex = api.state.currentEditableItemIndex;
    var links = api.state.quickLinks;
    links[itemIndex].editContainerHidden = true;
    api.setState('quickLinks', [...links]);
    api.setState('currentEditableItemIndex', -1);
    api.setState('currentEditableItemURL', '');
    api.setState('currentEditableItemDisplayText', '');
    api.setState('editContainerIsOpened', false);
}
