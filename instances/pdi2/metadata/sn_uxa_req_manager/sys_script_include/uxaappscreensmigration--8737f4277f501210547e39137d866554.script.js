var UXAAppScreensMigration = Class.create();
UXAAppScreensMigration.prototype = {
    initialize: function() {
        this.config = {
            app_table_name: "AppScreenMigration",
            app_record_id: "rec_id"
        };
    },
    getApiResponse: function(url, params) {
        this.config.endpoint = url;
        var client = new AppseeServiceHttpClient(this.config, params);
        var response = client.doPost(params);
        return response;
    },
    migratePages: function() {
        try {
            var existingAppScreens = this.getExistingAppScreens();
            var pagesData = this.getPagesData();
            var complete = this.insertPagesData(pagesData, existingAppScreens);
            var migrationComplete = complete ? 'complete' : 'in-progress';
            gs.info('UXA Migration job for AppScreen ran completely, current status - ' + migrationComplete);
            return complete;
        } catch (ex) {
            gs.error('UXA Migration job for AppScreen failed - ' + JSON.stringify(ex));
            throw new Error("UXAAppScreensMigration job error.", ex);
        }
    },

    getPagesData: function() {
        try {
            var pagesData = this.getApiResponse('/instance/screens/metadata/get-all-instance-renamed-screens', {});
            return pagesData;
        } catch (ex) {
            gs.error('Failed to get app screen details from API + ' + JSON.stringify(ex));
            throw new Error('Failed to get app screen details from API', ex);
        }
    },
    insertPagesData: function(responseData, existingAppScreenNames) {
        var screenGR = new GlideRecord("sys_uxa_screen_display_name");
        let recordsMigrated = existingAppScreenNames.length || 0;
        responseData?.forEach(function data(page) {
            if (!existingAppScreenNames.includes(page["Name"])) {
                screenGR.initialize();
                screenGR.setValue("name", page["Name"]);
                screenGR.setValue("display_name", page["DisplayName"]);
                screenGR.setValue("app_sys_id", page["AppSysId"]);
                screenGR.insert();
                recordsMigrated++;
            }
        });

        return true;
    },
    getExistingAppScreens: function() {
        var pagesGR = new GlideRecord("sys_uxa_screen_display_name");
        var pageNames = [];
        pagesGR.query();
        while (pagesGR.next()) {
            pageNames.push(pagesGR.getValue("name"));
        }
        return pageNames;
    },
    type: 'UXAAppScreensMigration'
};
