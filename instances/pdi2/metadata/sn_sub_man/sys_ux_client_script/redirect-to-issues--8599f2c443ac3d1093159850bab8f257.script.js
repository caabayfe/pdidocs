/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    /**
     * Redirect to issues tab on card clicks
     */
    const issuesTabs = {
        t0 : 'unconfirmedgroups',
        t1 : 'customtables',
        t2 : 'customapps',
        t3 : 'incompatibleusers'
        };    
    const params = {sm: 'issues', menu: issuesTabs[api.state.issuesTabID]};
        api.emit("CONTENT_UPDATED", {
            params
        });
}
