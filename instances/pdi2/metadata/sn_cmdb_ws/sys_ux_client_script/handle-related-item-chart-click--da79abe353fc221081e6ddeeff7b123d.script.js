/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 const {
    name,
    tableName,
    fields,
    view,
    encodedQuery
 } = event.context.item.value;
 const {
    query,
    url
 } = event.payload.params;

 const modalListMetadata = {
    table : tableName,
    filter : query || encodedQuery,
    title: name,
    fields: fields,
    listId: 'related_items_list',
    url: url
 };

 api.setState('modalListMetadata', modalListMetadata);
 helpers.modal.open('list_modal');
}
