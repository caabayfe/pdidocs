/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        getEmptyStateForSection
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const emptyState = await getEmptyStateForSection(api.context.props.section);
    if(!emptyState || Object.keys(emptyState).length==0)
        return ;

    api.setState('emptyStateProps', {
        ...emptyState, 
        hideEmptyState: false}
    );
}
