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
    var selectedTopics = topicsAclConfigCopy.selectedTopics;
    const selectedNamespaces = topicsAclConfigCopy.selectedNamespaces;
    selectedTopics = selectedTopics.concat(selectedNamespaces);
    const readOnlyTopics = topicsAclConfigCopy.readOnlyTopics;
    const readwriteTopics = topicsAclConfigCopy.readwriteTopics;
    
    // This is not efficient way of finding intersection, but since we can have max 30 elements distributed
    // among two arrays - it shouldnt be any problem
    const selectedTopicsIds = selectedTopics.map(x => x.id);
    const readOnlyTopicsIds = readOnlyTopics.map(x => x.id);
    const readwriteTopicsIds = readwriteTopics.map(x => x.id);
    const readOnlyIntersectionTopics = selectedTopicsIds.filter(topic => readOnlyTopicsIds.includes(topic));
    const readwriteIntersectionTopics = selectedTopicsIds.filter(topic => readwriteTopicsIds.includes(topic));
    const canAddNewlySelectedTopics = readOnlyIntersectionTopics.length === 0 && readwriteIntersectionTopics.length === 0;
    if (!canAddNewlySelectedTopics) {
        const allTopicsNamesIds = readOnlyIntersectionTopics.concat(readwriteIntersectionTopics);
        const existingTopicsNames = selectedTopics.filter(topic => allTopicsNamesIds.includes(topic.id)).map(x => x.label).join(', ');
        topicsAclConfigCopy.errorMessage = 'Topics are already in ACL list: ' + existingTopicsNames;
    } else {
        if (topicsAclConfigCopy.permission == 'readOnly') {
            topicsAclConfigCopy.readOnlyTopics = readOnlyTopics.concat(selectedTopics);
        } else if (topicsAclConfigCopy.permission == 'readwrite') {
            topicsAclConfigCopy.readwriteTopics = readwriteTopics.concat(selectedTopics);
        }
    }

    api.setState('topicsAclConfig', topicsAclConfigCopy);
}
