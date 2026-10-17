function onDisplay(current, g_scratchpad) {
    g_scratchpad.subscriptionAllotmentType = getSubscriptionAllotmentType(current);
	g_scratchpad.viewSubscriptionHistory = gs.getMessage('Subscription History');
 	g_scratchpad.dashboard_id = current.dashboard_id;
	getDashboardLink();
}

function getDashboardLink() {
    var dashboard_id = current.dashboard_id;
    var allotGR = new GlideRecord('license_dashboard_inventory');
    allotGR.addQuery('dashboard_id', dashboard_id);
    allotGR.query();

    if (allotGR.next()) {
        var dashboard_link = allotGR.getValue('dashboard_link');
        if (dashboard_link) {            
            g_scratchpad.dashboard_link = dashboard_link;
        }
    }
}

function getSubscriptionAllotmentType(current) {
    const entitlementEngineUtils = new sn_lef.EntitlementEngineUtils();
    let ctiSubscriptionReference = 'license';
    if (entitlementEngineUtils.canRouteToEMS())
        ctiSubscriptionReference = 'subscription_entitlement';

    const allotGR = new GlideRecord('license_cust_table_allotment');
    allotGR.addQuery(ctiSubscriptionReference, current.getUniqueValue());
    allotGR.query();
    let allotmentType = "-1";
    if (allotGR.next())
        allotmentType = allotGR.getValue('allotment_type');

    if (allotmentType == '3') // TableBundle
        gs.addInfoMessage(gs.getMessage('Custom tables associated to this subscription are managed through the "Manage Your Tables" link.'));
    else if (allotmentType == '2') // Grandfather
        gs.addInfoMessage(gs.getMessage('Please note: Once added, tables cannot be removed from this subscription'));
    else if (allotmentType == '1') { // AppEngine/PlatformOnly
        const tableCount = entitlementEngineUtils.getTableCount(allotmentType, current.getUniqueValue());

        if (tableCount > 0) {
            const params = [current.purchased_count, tableCount];
            gs.addInfoMessage(gs.getMessage('{0} users may access up to {1} custom tables from given Custom Tables list', params));
        }
    }

    return allotmentType;
}
