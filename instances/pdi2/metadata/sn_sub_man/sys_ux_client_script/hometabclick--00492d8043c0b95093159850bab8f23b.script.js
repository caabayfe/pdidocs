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
     * Event handler for clicking any of the homepage tab (Overview, Subscriptions, Issues, Insights, Settings) 
     * and adding optional params (SM) to the URL based on homepage tab index.
     */

    const homeTabIndexToName = {
        0: 'overview',
        1: 'subscriptions',
        2: 'issues',
        3: 'insights',
        4: 'settings'
    };

    const issuesTabID = api.state.issuesTabID;
    const selectedTabIndex = event.payload.selectedTabIndex;
    const selectedTab = homeTabIndexToName[selectedTabIndex];
    const sourceURLTab = api.context.props.sm;

    // If this script was triggered from a tab click, the existing URL will be pointing to
    // a different home tab than the selected tab. If they're the same, this came from a direct
    // URL navigation or page refresh and we don't want to run this script 
    if (selectedTab === sourceURLTab)
        return;

    const issuesTabs = {
        t0: 'unconfirmedgroups',
        t1: 'customtables',
        t2: 'customapps',
        t3: 'incompatibleusers'
    };

    const subscriptionTabs = {
        p1c1: 'all',
        p2c1: 'cloud',
        p2c2: 'nowassists',
        p2c3: 'creator'
    };

    const tabs = [{
            sm: 'overview',
            menu: ''
        },
        {
            sm: 'subscriptions',
            menu: subscriptionTabs[api.state.subscriptionsTabId]
        },
        {
            sm: 'issues',
            menu: issuesTabs[api.state.issuesTabID]
        },
        {
            sm: 'insights',
            menu: ''
        },
        {
            sm: 'settings',
            menu: ''
        }
    ];

    const params = tabs[selectedTabIndex];
    api.emit("CONTENT_UPDATED", {
        params
    });

    //Setting the display of total utilization chart to false, when switching between tabs
    api.setState('hideTotalUtilizationContainer', true);

    //Emit event to track tab clicks on overview page
    emitOverviewTabClickEvent(selectedTab);

    function emitOverviewTabClickEvent(menuName) {
        api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
            "event": "Overview page tab click",
            "value": {
                "Tab Id": menuName
            }
        });
    }
}
