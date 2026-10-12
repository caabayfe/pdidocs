var FluentApplicationList = Class.create();
FluentApplicationList.prototype = {
    initialize: function() {},
    type: 'FluentApplicationList'
};
FluentApplicationList.getApplications = function() {
    const gr = new GlideRecord("sys_app");
    const condition = gr.addNotNullQuery("package_json");
    condition.addOrCondition("ide_created", "IDE");
    gr.addNotNullQuery("sys_modules");
    gr.addActiveQuery();
    gr.query();

    const apps = [];

    while (gr.next()) {
        if (!gr.canRead()) continue;
        const sysAppId = gr.getValue("sys_id") + '';
        const buildSupport = new sn_glider.IDEBuildSupport();
        const sourceFileCount = buildSupport.getAppSourceFileCount(sysAppId, []);
        apps.push({
            sysAppName: gr.getValue("name"),
            sysAppScope: gr.getValue("scope"),
            sysAppId,
            sourceFileCount
        });
    }

    // if user is maint then fetch list of store apps as well and user can deply store apps then only create this curated list
    if (gs.getUser().hasRole('maint') && gs.getProperty('sn_glider.force_deploy_store_app', false) === "true") {
        const storeapps = new GlideRecord('sys_store_app');
        storeapps.addNotNullQuery("package_json");
        storeapps.addNotNullQuery("sys_modules");
        storeapps.addActiveQuery();

        storeapps.query();

        while (storeapps.next()) {
            const sysAppId = storeapps.getValue("sys_id") + '';
            const buildSupport = new sn_glider.IDEBuildSupport();
            const sourceFileCount = buildSupport.getAppSourceFileCount(sysAppId, []);
            apps.push({
                sysAppName: storeapps.getValue("name"),
                sysAppScope: storeapps.getValue("scope"),
                sysAppId,
                sourceFileCount
            });
        }
    }
    return apps;
};
