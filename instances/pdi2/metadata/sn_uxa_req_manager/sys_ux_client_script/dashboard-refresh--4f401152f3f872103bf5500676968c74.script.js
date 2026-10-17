/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  const route = 'dashboard-overview';
  const title = 'Dashboards';
  
  // Build complete search params matching your navigation pattern
  const searchParams = [
    'title=' + encodeURIComponent(title),
    'applicationId=all',
    'applicationLabel=' + encodeURIComponent('All Applications'),
    'channel=all',
    'menuId=' + route,
    'pageDisplayName=',
    'hashedUserId=',
    'sessionId=',
    'vid=' + Date.now()
  ].join('&');
  
  // Dispatch navigation event with reload flag
  api.emit('NAV_ITEM_SELECTED', {
    route: route,
    fields: {},
    title: title,
    reload: true,
    search: '?' + searchParams
  });
}
