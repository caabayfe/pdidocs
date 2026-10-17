/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let topicsAclConfigCopy = JSON.parse(JSON.stringify(api.state.topicsAclConfig));
    let readTopics = topicsAclConfigCopy.readOnlyTopics.map(element => element.value);
    let readwriteTopics = topicsAclConfigCopy.readwriteTopics.map(element => element.value);
    topicsAclConfigCopy.savedReadOnlyTopics = topicsAclConfigCopy.readOnlyTopics;
    topicsAclConfigCopy.savedReadwriteTopics = topicsAclConfigCopy.readwriteTopics;
    let topicsAcl = {};
    topicsAcl.read = readTopics;
    topicsAcl.readwrite = readwriteTopics;
    api.setState('topicsAcl', topicsAcl);

    topicsAclConfigCopy.selectedTopics = [];
    api.setState('topicsAclConfig', topicsAclConfigCopy);
}
