/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { name: propName, value } = event.payload;
    const {
        excludeUnauthorizedFields,
        getEmptyStateForSection
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    if (propName !== "formData")
        return;
        
    const {fields, sections} = value;
    const [summarySection, ...remainingSections] = sections;
    const emptyState = await getEmptyStateForSection(excludeUnauthorizedFields(fields, summarySection));
    if (!emptyState || !Object.keys(emptyState).length)
        return;
        
    api.setState('emptyStateProps', { ...emptyState, hideEmptyState: false });
    api.setState('disableExpandCollapseButton', true);
}
