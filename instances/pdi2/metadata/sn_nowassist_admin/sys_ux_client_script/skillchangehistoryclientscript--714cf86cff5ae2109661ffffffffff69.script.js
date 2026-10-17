/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  var fallback_visible = api.data.fetch_filters_for_skill_change_history_1.output.fallBackNotVisible;
  api.setState('fallBackVisible', fallback_visible);
}
