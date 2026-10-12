/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    var resultTabContent = {
  ...api.state.relatedTabContent,
  ...event.payload.relatedTabContent,
};
    api.setState('relatedTabContent', resultTabContent);
}
