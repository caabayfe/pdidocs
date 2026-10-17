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

    /**
     * for syncing value of params and client state parameters for selected module on browser's back button click 
     */

    const menuVal = api.context.props.menu;
    const parentTabVal = api.context.props.sm;
    if (parentTabVal == 'issues' || 'subscriptions') {
        const issuesTabs = {
            'unconfirmedgroups': 't0',
            'incompatibleusers': 't3',
            'customtables': 't1',
            'customapps': 't2'
        };
        const subscriptionsTabs = {
            'all': 'p1c1',
            'cloud': 'p2c1',
            'nowassists': 'p2c2',
            'creator': 'p2c3'
        };
        if (menuVal) {
            switch (parentTabVal) {
                case 'subscriptions':
                    api.setState('subscriptionsTabId', subscriptionsTabs[menuVal]);
                    break;
                case 'issues':
                    api.setState('issuesTabID', issuesTabs[menuVal]);
                    break;
            }


        }
    }


}
