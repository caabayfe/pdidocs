/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('kpiFilter', event.payload.item.id);
    switch(event.payload.item.id) {
    case 'all':
    case 'created_by_me':
    api.setState('showBookmarked', false);
    break;
    case 'bookmarked':
    api.setState('showBookmarked', true);
    break;
  }
}
