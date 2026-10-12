/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var itemIndex = api.state.quickLinksCurrentEditableItemIndex;
    var links = api.state.quickLinks;
    links[itemIndex].editContainerHidden = true;
    api.setState('quickLinks', [...links]);
    api.setState('quickLinksCurrentEditableItemIndex', -1);
    api.setState('quickLinksCurrentEditableItemURL', '');
    api.setState('quickLinksCurrentEditableItemDisplayText', '');
    api.setState('quickLinksEditContainerIsOpened', false);
}
