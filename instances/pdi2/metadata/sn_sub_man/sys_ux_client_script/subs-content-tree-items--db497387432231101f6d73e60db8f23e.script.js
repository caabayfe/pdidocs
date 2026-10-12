/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const allEntitlement = helpers.translateSync('All entitlements');
    const instanceEntitlement = helpers.translateSync('Instance level entitlements');
    const cloudEntitlement = helpers.translateSync('Cloud capacity');
    const nowAssistUsage = helpers.translateSync('Now Assist usage');
    const creatorSubscriptions = helpers.translateSync('Now Assist creators');
    const shouldShowAssistUsageTab = api.state.shouldShowAssistUsageTab;
    const shouldShowCloudEntitlementTab = api.state.shouldShowCloudEntitlementTab;

    const tabs = [];
    tabs.push({
        "id": "p1",
        "label": instanceEntitlement,
        "children": [{
            "id": "p1c1",
            "label": allEntitlement,
            "isExpanded": true
        }]
    });

    const accountTabChildren = [];
    if (shouldShowCloudEntitlementTab) {
        accountTabChildren.push({
            "id": "p2c1",
            "label": cloudEntitlement,
            "isExpanded": true
        });
    } else {
        if (accountTabChildren.length > 0) {
            const index = accountTabChildren.findIndex(tab => tab.id = 'p2c1');
            if (index > -1) {
                accountTabChildren.splice(index, 1);
            }
        }
    }

    const shouldShowCreatorSubTab = api.data.nowassist_purchased_counts.output.creators;

    if (shouldShowCreatorSubTab) {
        accountTabChildren.push({
            "id": "p2c3",
            "label": creatorSubscriptions
        });
    }

    if (shouldShowAssistUsageTab) {
        accountTabChildren.push({
            "id": "p2c2",
            "label": nowAssistUsage
        });
    }

    /* Only show Account level entitlement tab if at least one child tab is also showing. 
    If both cloud entitlement and now assist tabs are hidden, then Account level entitlement tab should be hidden.
    Later when cloud entitlement tab is enabled, this condition should be updated to check if cloud entitlement 
    tab is also being displayed or not. 
    */
    if (shouldShowAssistUsageTab || shouldShowCreatorSubTab || shouldShowCloudEntitlementTab) {
        tabs.push({
            "id": "p2",
            "label": helpers.translateSync("Account level entitlements"),
            "children": accountTabChildren
        });
    }

    return tabs;
}
