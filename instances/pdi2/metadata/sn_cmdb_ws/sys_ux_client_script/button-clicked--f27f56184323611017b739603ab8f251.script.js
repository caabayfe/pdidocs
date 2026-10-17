async function handler({ api, event, helpers, imports }) {
    const { 
        DM_PAGE_TABS, DM_POLICIES_PAGE_SUBTABS, PAGE_ROUTES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
   if (event.payload.id === 'create_new_policy_button') {
           helpers.navigate.to('data-manager-policy-form',
                   {
                           "policySysId": -1,
                           "ts": Date.now()
                   },
                   null, null, null, 'current');
   } else if (event.payload.id === 'manage_retirement_defs_button') {
            helpers.navigate.to('data-manager',
                   null,
                   {
                           "selectedTabIndex": DM_PAGE_TABS.SETTINGS,
                           "ts": Date.now()
                   },
                   null, null, 'current');
   } else if (event.payload.id === 'import_into_draft_policies_button') {
        api.setState("importCertSchsModalState", "importInProgress");
        api.setState("importCertSchsModalHeading", await helpers.translate("Import in progress"));

        api.data.dm_create_progress_and_trigger_migration.execute();
   } else if (event.payload.id === 'view_draft_policies_button') {
        helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
        showNotification: '',
        selectedTabIndex: DM_PAGE_TABS.POLICIES,
        subSelectedTabIndex: DM_POLICIES_PAGE_SUBTABS.DRAFT_POLICIES,
        ts: Date.now()
        }, null, null, 'current');
   }
}
