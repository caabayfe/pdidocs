/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
     var invalidURLMessage = [];
    if (event.payload.value) {
        var contentText = await helpers.translate("The URL format is incorrect.");
        var invalidURLMessage = [{
            "status": "critical",
            "content": contentText,
            "icon": "circle-exclamation-outline"
        }];
    }
    var itemIndex = api.state.quickLinksCurrentEditableItemIndex;
    var links = api.state.quickLinks;
    links[itemIndex].invalidURLMessage = JSON.stringify(invalidURLMessage);
    api.setState('quickLinks', [...links]);
}
