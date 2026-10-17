/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
  const newCount = api.state.attachmentCount - 1;
  api.setState('attachmentCount', newCount);
  api.setState('hasAttachments', newCount > 0);
}
