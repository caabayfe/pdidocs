/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const catItemDetails = event?.context?.item?.value;
    const { sys_id, page, type, sys_class_name, content_type, url, kb_article, dynamicContentItemConfig } = catItemDetails;
    const eventPayload = { sys_id, page, type, sys_class_name, content_type, url, kb_article };
    if(dynamicContentItemConfig) {
        eventPayload.dynamicContentItemDetails = {
            dynamicContentType : dynamicContentItemConfig.model,
            content: dynamicContentItemConfig.content
        };
    }
    api.emit("CATALOG_BROWSE#CATALOG_ITEM_SELECTED", {
        catalog_item_details: eventPayload
    });
}
