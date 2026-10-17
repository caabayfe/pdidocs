function transform(input) {

    var apiUtils = new sn_upgrade_mgmt.StoreAppsFlowUtils();
    Object.keys(input.applistobj).forEach(function(key) {
        var appDetails = input.applistobj[key].cells;
        var name = appDetails.app_name.label;
        var scope = appDetails.scope.value;
        var to_version = appDetails.upgrade_version.componentProps.selectedItems[0];
        var current_version = appDetails.current_version.value;
        var true_up_version = appDetails.true_up_version.value;
        var sys_code = appDetails.sys_code.value;

        var upgrade_plan_sysid = input.upgrade_plan_sysid;
        apiUtils.setAppInUpgradePlan(scope, sys_code, name, upgrade_plan_sysid, to_version, current_version, true_up_version);
    });
}
