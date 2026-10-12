/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const supportUrl = api.data.support_url.results;
      const url = (supportUrl && supportUrl.length > 0) ?
          supportUrl[0].value.value :
          '';
      api.setState('supportUrl', url);
}
