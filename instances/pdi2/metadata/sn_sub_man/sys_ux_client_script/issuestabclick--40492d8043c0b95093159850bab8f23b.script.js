/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    /**
     * Event handler for clicking any of the 
     * child tabs (unconfirmedgroups, customtables, customapps) of isuues tab 
     * and adding optional params (menu) to the URL based on its tab index.
     */
    const issuesChildTab = api.state.issuesTabID;
    const params = {};
        const tabs = {
        t0 : 'unconfirmedgroups',
        t1 : 'customtables',
        t2 : 'customapps',
        t3 : 'incompatibleusers'
        };
        params['menu'] = tabs[issuesChildTab];
        api.emit("CONTENT_UPDATED", {
            params
        });
}
