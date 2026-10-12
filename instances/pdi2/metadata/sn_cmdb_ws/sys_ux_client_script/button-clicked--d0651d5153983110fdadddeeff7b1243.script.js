function handler({ api, event, helpers, imports }) {
    const { 
    DM_PAGE_TABS
} = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    if (event.payload.id === 'policies_create_new_policy_button') {
            helpers.navigate.to('data-manager-policy-form',
                   {
                           "policySysId": -1,
                           "ts": Date.now()
                   },
                    null, null, null, 'current');
    } else if (event.payload.id === 'policies_manage_retirement_defs_button') {
             helpers.navigate.to('data-manager',
                    null,
                    {
                            "selectedTabIndex": DM_PAGE_TABS.SETTINGS,
                            "ts": Date.now()
                    },
                    null, null, 'current');
    }
}
