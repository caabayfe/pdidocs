/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  const isOOBPolicy = api?.data?.get_policy_summary?.output?.isOOBPolicy;
  if (isOOBPolicy == true) {
    api.setState("isOOBPolicy", true);
  } else {
    api.setState("isOOBPolicy", false);
  }
}
