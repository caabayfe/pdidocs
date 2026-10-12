/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const { glideInstanceReleaseName } = api.data.get_instance_release_name.output.data.GlidePromin_Query.configuration.sysProperties;
api.setState('releaseVersion', glideInstanceReleaseName);
}
