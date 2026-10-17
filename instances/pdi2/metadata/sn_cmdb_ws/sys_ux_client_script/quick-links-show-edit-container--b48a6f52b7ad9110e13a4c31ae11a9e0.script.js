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
    api.setState('quickLinksCurrentEditableItemIndex', itemIndex);
    api.setState('quickLinksCurrentEditableItemURL', links[itemIndex].url);
    api.setState('quickLinksCurrentEditableItemDisplayText', links[itemIndex].title);
    api.setState('quickLinksEditContainerIsOpened', true);
}
