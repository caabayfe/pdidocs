/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { tempSelectedNav } = api.state;
    if (tempSelectedNav.item) {
      api.setState('selectedNav', {...tempSelectedNav});
      api.setState('tempSelectedNav', {});
    }
}
