/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemIndex = event.context.item.index;
    var links = api.state.quickLinks;
    links[itemIndex].editContainerHidden = false;
    api.setState('quickLinks', [...links]);
    api.setState('currentEditableItemIndex', itemIndex);
    api.setState('currentEditableItemURL', links[itemIndex].url);
    api.setState('currentEditableItemDisplayText', links[itemIndex].title);
    api.setState('editContainerIsOpened', true);
}
