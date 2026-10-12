function include({imports}, api, helpers) {
    class MIDataBroker {

        constructor(dbName) {
            this.dbName = dbName || 'mi_data_broker';
        }

        exec(action, params) {
            api.data[this.dbName].execute({
                action: action,
                params: params
            });
        }
    }

    function navigateToExternal(url) {
        helpers.navigate.to(null, null, null, true, null, null, {
            url: url
        });
    }

    function isApplicationEnabled() {
        var jsonConfig = JSON.parse(api.context.app.app_config);
        return jsonConfig?.app_enabled ?? true;
    }

    function isDormantCategoryEnabled() {
        var jsonConfig = JSON.parse(api.context.app.app_config);
        return jsonConfig?.dormant_category_enabled ?? true;
    }

    function redirectToHomePage() {
        helpers.navigate.to("home");
    }

   function navigateToUserRecord(userSysId) {
        navigateToExternal("/sys_user.do?sys_id=" + userSysId);
    }
    return {
        newMIDataBroker: (dbName) => new MIDataBroker(dbName),
        isApplicationEnabled,
        isDormantCategoryEnabled,
        redirectToHomePage,
        navigateToExternal,
        navigateToUserRecord
    };
}
