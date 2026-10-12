/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let topicsAclConfigCopy = JSON.parse(JSON.stringify(api.state.topicsAclConfig));
    topicsAclConfigCopy.readOnlyTopics = [];
    topicsAclConfigCopy.readwriteTopics = [];
    topicsAclConfigCopy.selectedTopics = [];
    api.setState('topicsAclConfig', topicsAclConfigCopy);
}
