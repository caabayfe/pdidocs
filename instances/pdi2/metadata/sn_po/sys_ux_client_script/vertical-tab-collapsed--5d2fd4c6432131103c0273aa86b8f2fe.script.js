/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  if (event.payload.collapsed) {
      api.setState('resizablePanesDividerPosition', '-48px');
  } else {
      api.setState('resizablePanesDividerPosition', '75px');
  }
}
